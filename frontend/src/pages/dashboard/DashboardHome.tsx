import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScienceWave } from "@/components/ScienceWave";
import { StatusBadge } from "@/components/StatusBadge";
import { api } from "@/lib/api";
import {
  ArrowRight,
  FlaskConical,
  ClipboardList,
  BookOpen,
  Users,
  Activity,
  Loader2,
} from "lucide-react";

const quickActions = [
  {
    to: "/dashboard/new",
    icon: FlaskConical,
    title: "New Experiment",
    description: "Turn a hypothesis into a full plan.",
  },
  {
    to: "/dashboard/literature",
    icon: BookOpen,
    title: "Literature Search",
    description: "Find related work and references.",
  },
  {
    to: "/dashboard/collaboration",
    icon: Users,
    title: "Find Collaborators",
    description: "Match with researchers on similar topics.",
  },
];

const DashboardHome = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem("klayr_user_id");
    if (!userId) return;

    const loadData = async () => {
      try {
        const [plansData, profileData] = await Promise.all([
          api.getPlans(userId),
          api.getProfile(userId)
        ]);
        setPlans(plansData);
        setProfile(profileData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const inProgress = plans.length; // Simplified for demo
  const needsReview = plans.filter(p => p.status === "pending_review").length;
  const completed = plans.length > 0 ? 1 : 0;
  const recent = plans.slice(0, 3).map(p => ({
    id: p.plan_id,
    title: p.hypothesis,
    status: "Completed",
    domain: "Research",
    updated: new Date(p.created_at).toLocaleDateString(),
    plan: p
  }));

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="px-5 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Hero strip */}
        <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-hero p-8 shadow-card">
          <div className="absolute inset-0 hero-grid-bg opacity-40" aria-hidden />
          <div className="relative grid gap-6 md:grid-cols-[1.3fr_1fr] md:items-center">
            <div>
              <span className="badge-pill bg-card text-primary border border-border">
                Klayr · Today
              </span>
              <h1 className="font-serif-display mt-4 text-4xl font-medium leading-[1.05] text-foreground">
                Welcome back,
                <br />
                <span className="italic text-primary">{profile?.name || "Researcher"}</span>
              </h1>
              <p className="mt-4 max-w-md text-sm text-muted-foreground">
                Pick up where you left off, or start a new investigation.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button asChild variant="hero" size="lg">
                  <Link to="/dashboard/new">
                    Start New Experiment
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="ghost_dark" size="lg">
                  <Link to="/dashboard/experiments">View My Experiments</Link>
                </Button>
              </div>
            </div>
            <div className="hidden md:block">
              <ScienceWave className="h-48" showLabels={false} />
            </div>
          </div>
        </section>

        {/* At-a-glance stats */}
        <section className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "In Progress", value: inProgress, hint: "Active workflows" },
            { label: "Needs Review", value: needsReview, hint: "Awaiting feedback" },
            { label: "Completed", value: completed, hint: "Ready to export" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-border bg-card p-5 shadow-card"
            >
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                {s.label}
              </div>
              <div className="font-serif-display mt-2 text-3xl font-medium text-foreground">
                {s.value}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{s.hint}</div>
            </div>
          ))}
        </section>

        {/* Quick actions */}
        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="font-serif-display text-xl font-medium text-foreground">
                Quick actions
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Jump into the most common workflows.
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {quickActions.map((a) => (
              <Link
                key={a.to}
                to={a.to}
                className="group rounded-2xl border border-border bg-card p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-soft"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sage-soft text-primary">
                  <a.icon className="h-4 w-4" strokeWidth={1.7} />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">{a.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{a.description}</p>
                <div className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Open
                  <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent activity (slim) */}
        <section className="rounded-2xl border border-border bg-card shadow-card">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" strokeWidth={1.7} />
              <h3 className="font-serif-display text-lg font-medium text-foreground">
                Recent activity
              </h3>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard/experiments">
                View all
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          <ul className="divide-y divide-border">
            {recent.length === 0 && (
              <li className="px-6 py-8 text-center text-sm text-muted-foreground">
                No recent activity. Start an experiment to see it here!
              </li>
            )}
            {recent.map((exp) => (
              <li key={exp.id}>
                <Link
                  to={`/dashboard/experiments/${exp.id}`}
                  state={{ plan: exp.plan }}
                  className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-sage-soft/40"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sage-soft text-primary">
                      <ClipboardList className="h-4 w-4" strokeWidth={1.7} />
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-foreground">
                        {exp.title}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {exp.domain} · Updated {exp.updated}
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={exp.status} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default DashboardHome;

