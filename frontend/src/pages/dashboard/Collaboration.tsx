import { useEffect, useState } from "react";
import { PageHeader } from "./PageHeader";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquare, UserPlus, Loader2, Users } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

const Collaboration = () => {
  const [researchers, setResearchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem("klayr_user_id");
    if (!userId) return;

    const loadResearchers = async () => {
      try {
        // First try to find based on latest plan, or just search general
        const plans = await api.getPlans(userId);
        let data;
        if (plans.length > 0) {
          data = await api.getSimilarResearchers(plans[0].plan_id, userId);
        } else {
          data = await api.searchResearchers("research");
        }

        setResearchers(data.map((r: any) => {
          const profile = r.profile || r;
          return {
            name: profile.name,
            initials: profile.name.split(" ").map((n: string) => n[0]).join(""),
            institution: profile.institution || "Independent Researcher",
            topic: r.matching_hypothesis || profile.bio || "Expert in various domains",
            match: r.similarity_score ? Math.round(r.similarity_score * 100) : 85
          };
        }));
      } catch (error) {
        console.error(error);
        toast.error("Failed to load collaborators");
      } finally {
        setLoading(false);
      }
    };

    loadResearchers();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  return (
    <div className="px-5 py-6 sm:px-8 sm:py-8">
      <PageHeader
        eyebrow="Collaboration Finder"
        title="Researchers working in your space"
        description="Matches are scored by topic overlap, methodology and recent publication activity."
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {researchers.length === 0 && (
          <div className="col-span-full flex h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-border text-muted-foreground">
            <Users className="mb-2 h-8 w-8 opacity-20" />
            <p>No similar researchers found in the database yet.</p>
          </div>
        )}
        {researchers.map((c) => (
          <article
            key={c.name}
            className="rounded-2xl border border-border bg-card p-6 shadow-card"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-green text-sm font-semibold text-primary-foreground">
                {c.initials}
              </div>
              <span className="badge-pill bg-sage-soft text-primary">{c.match}% match</span>
            </div>
            <h3 className="font-serif-display mt-4 text-lg font-medium text-foreground">
              {c.name}
            </h3>
            <p className="text-xs text-muted-foreground">{c.institution}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-3">{c.topic}</p>
            <div className="mt-5 flex items-center gap-2">
              <Button variant="hero" size="sm" className="flex-1">
                <UserPlus className="h-3.5 w-3.5" />
                Connect
              </Button>
              <Button variant="ghost_dark" size="icon" aria-label="Message">
                <MessageSquare className="h-4 w-4" />
              </Button>
              <Button variant="ghost_dark" size="icon" aria-label="Email">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Collaboration;

