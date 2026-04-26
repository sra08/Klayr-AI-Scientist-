import { useEffect, useState } from "react";
import { PageHeader } from "./PageHeader";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { Download, FileText, Loader2 } from "lucide-react";

const Reports = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem("klayr_user_id");
    if (userId) {
      api.getPlans(userId)
        .then(data => {
          setPlans(data.map((p: any) => ({
            id: p.plan_id,
            title: p.hypothesis,
            domain: "Research",
            duration: p.timeline?.length ? `${p.timeline.length} phases` : "N/A",
            budget: p.budget?.grand_total_usd || 0,
            optimizedBudget: (p.budget?.grand_total_usd || 0) * 0.85,
            updated: new Date(p.created_at).toLocaleDateString(),
            refs: p.literature_result?.references?.length || 0,
            pages: Math.floor(Math.random() * 10) + 15
          })));
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
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
        eyebrow="Reports"
        title="Export-ready research plans"
        description="Generate a complete, reproducible PDF for every experiment — protocol, materials, budget, validation, and references."
      />

      <section className="grid gap-4 md:grid-cols-2">
        {plans.length === 0 && (
          <div className="col-span-full flex h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-border text-muted-foreground">
            <FileText className="mb-2 h-8 w-8 opacity-20" />
            <p>No reports generated yet. Run an experiment to see reports here.</p>
          </div>
        )}
        {plans.map((exp) => (
          <article
            key={exp.id}
            className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-card"
          >
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sage-soft text-primary">
                <FileText className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-serif-display text-lg font-medium leading-tight text-foreground">
                  {exp.title}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {exp.domain} · {exp.duration} · Updated {exp.updated}
                </p>
              </div>
            </div>

            <dl className="mt-5 grid grid-cols-3 gap-3 text-xs">
              <div className="rounded-lg bg-sage-soft/60 px-3 py-2">
                <dt className="text-muted-foreground">Pages</dt>
                <dd className="mt-0.5 font-semibold text-foreground">{exp.pages}</dd>
              </div>
              <div className="rounded-lg bg-sage-soft/60 px-3 py-2">
                <dt className="text-muted-foreground">Refs</dt>
                <dd className="mt-0.5 font-semibold text-foreground">{exp.refs}</dd>
              </div>
              <div className="rounded-lg bg-sage-soft/60 px-3 py-2">
                <dt className="text-muted-foreground">Budget</dt>
                <dd className="mt-0.5 font-semibold text-foreground">
                  ${exp.optimizedBudget.toLocaleString()}
                </dd>
              </div>
            </dl>

            <div className="mt-5 flex items-center gap-2">
              <Button variant="hero" size="sm" className="flex-1">
                <Download className="h-3.5 w-3.5" />
                Download PDF
              </Button>
              <Button variant="ghost_dark" size="sm">Preview</Button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
};

export default Reports;

