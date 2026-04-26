import { PageHeader } from "./PageHeader";
import { Button } from "@/components/ui/button";
import { recentReviews } from "@/data/mockData";
import { Star } from "lucide-react";

const Reviews = () => {
  return (
    <div className="px-5 py-6 sm:px-8 sm:py-8">
      <PageHeader
        eyebrow="Reviews & Feedback"
        title="Expert input on your work"
        description="Aggregate scientist reviews across all your experiments and track improvements over time."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Average rating</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif-display text-3xl font-medium text-foreground">4.6</span>
            <Star className="h-4 w-4 fill-warning text-warning" />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Across 28 reviews</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Pending review</div>
          <div className="mt-2 font-serif-display text-3xl font-medium text-foreground">3</div>
          <p className="mt-1 text-xs text-muted-foreground">Experiments awaiting feedback</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Improvements applied</div>
          <div className="mt-2 font-serif-display text-3xl font-medium text-foreground">12</div>
          <p className="mt-1 text-xs text-muted-foreground">From scientist suggestions</p>
        </div>
      </div>

      <section className="rounded-2xl border border-border bg-card shadow-card">
        <div className="border-b border-border px-6 py-4">
          <h3 className="font-serif-display text-lg font-medium text-foreground">Recent reviews</h3>
        </div>
        <ul className="divide-y divide-border">
          {recentReviews.map((r, i) => (
            <li key={i} className="flex items-start gap-4 px-6 py-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage text-xs font-semibold text-primary">
                {r.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                  <span className="text-sm font-semibold text-foreground">{r.rating}</span>
                  <span className="text-xs text-muted-foreground">· Probiotic X experiment</span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{r.summary}</p>
              </div>
              <Button variant="ghost" size="sm">View</Button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default Reviews;
