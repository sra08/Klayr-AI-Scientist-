import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "./PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import { api } from "@/lib/api";
import { Download, Eye, Filter, Plus, Search, Loader2 } from "lucide-react";

const Experiments = () => {
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
            status: "Completed",
            domain: "Research",
            duration: p.timeline?.length ? `${p.timeline.length} phases` : "N/A",
            budget: p.budget?.grand_total_usd || 0,
            optimizedBudget: (p.budget?.grand_total_usd || 0) * 0.85,
            updated: new Date(p.created_at).toLocaleDateString(),
            plan: p
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
        eyebrow="My Experiments"
        title="All research workflows"
        description="Browse, filter, and continue every experiment in your workspace."
      >
        <Button asChild variant="hero" size="sm">
          <Link to="/dashboard/new">
            <Plus className="h-4 w-4" />
            New Experiment
          </Link>
        </Button>
      </PageHeader>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search experiments..." className="pl-9" />
        </div>
        <Button variant="ghost_dark" size="sm">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-widest text-muted-foreground">
                <th className="px-6 py-3 font-medium">Experiment</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Domain</th>
                <th className="px-6 py-3 font-medium">Duration</th>
                <th className="px-6 py-3 font-medium">Budget</th>
                <th className="px-6 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((exp) => (
                <tr
                  key={exp.id}
                  className="border-b border-border last:border-b-0 transition-colors hover:bg-sage-soft/40"
                >
                  <td className="px-6 py-4">
                    <Link
                      to={`/dashboard/experiments/${exp.id}`}
                      state={{ plan: exp.plan }}
                      className="font-medium text-foreground hover:text-primary"
                    >
                      {exp.title}
                    </Link>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      Updated {exp.updated}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={exp.status} />
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{exp.domain}</td>
                  <td className="px-6 py-4 text-muted-foreground">{exp.duration}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">
                      ${exp.optimizedBudget.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground line-through">
                      ${exp.budget.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild variant="ghost" size="icon" aria-label="View">
                        <Link to={`/dashboard/experiments/${exp.id}`} state={{ plan: exp.plan }}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" aria-label="Download">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Experiments;

