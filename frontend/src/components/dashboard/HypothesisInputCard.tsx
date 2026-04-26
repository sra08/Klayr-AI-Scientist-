import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Lightbulb, Loader2, SearchCheck, History, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api } from "@/lib/api";

const DOMAINS = [
  { value: "research", label: "Academic Research" },
  { value: "development", label: "Product Development" },
  { value: "innovation", label: "Innovation & Design" },
  { value: "engineering", label: "Engineering" },
  { value: "data_science", label: "Data Science & AI" },
  { value: "biology", label: "Biological Sciences" },
  { value: "physics", label: "Physical Sciences" },
  { value: "chemistry", label: "Chemical Sciences" },
  { value: "social_science", label: "Social Sciences" },
];

export const HypothesisInputCard = () => {
  const [value, setValue] = useState("");
  const [domain, setDomain] = useState("research");
  const [isLoading, setIsLoading] = useState(false);
  const [novelty, setNovelty] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (value.trim().length > 15) {
        setIsChecking(true);
        try {
          const result = await api.checkNovelty(value);
          setNovelty(result);
        } catch (e) {
          console.error(e);
        } finally {
          setIsChecking(false);
        }
      } else {
        setNovelty(null);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [value]);

  const THINKING_MESSAGES = [
    "Initializing Klayr Multi-Agent Graph...",
    "Searching ArXiv & PubMed for similar studies...",
    "Refining hypothesis for scientific precision...",
    "Applying prior scientist corrections from your domain...",
    "Architecting laboratory protocol steps...",
    "Estimating material costs and sourcing suppliers...",
    "Calculating statistical power and validation metrics...",
    "Finalizing comprehensive research plan..."
  ];

  const [thinkingIndex, setThinkingIndex] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      interval = setInterval(() => {
        setThinkingIndex((prev) => (prev + 1) % THINKING_MESSAGES.length);
      }, 3500);
    } else {
      setThinkingIndex(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleAnalyze = async () => {
    if (!value.trim()) {
      toast.error("Please enter a hypothesis to analyze.");
      return;
    }

    const userId = localStorage.getItem("klayr_user_id");
    if (!userId) {
      toast.error("Please login first.");
      navigate("/login");
      return;
    }

    setIsLoading(true);
    try {
      const data = await api.runExperiment({
        hypothesis: value,
        domain: domain,
        user_id: userId
      });
      toast.success("Analysis complete!");
      navigate(`/dashboard/experiments/${data.plan_id}`, { state: { plan: data.plan } });
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sage-soft text-primary">
          <Lightbulb className="h-4 w-4" strokeWidth={1.7} />
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-serif-display text-2xl font-medium text-foreground">
              What is your hypothesis?
            </h2>
            {isChecking && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            {novelty && novelty.status !== "New" && (
              <span className={`badge-pill flex items-center gap-1.5 ${
                novelty.status === "Already Done" ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"
              }`}>
                {novelty.status === "Already Done" ? <AlertCircle className="h-3.5 w-3.5" /> : <History className="h-3.5 w-3.5" />}
                {novelty.status}
              </span>
            )}
            {novelty && novelty.status === "New" && (
              <span className="badge-pill flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                <SearchCheck className="h-3.5 w-3.5" />
                Original Idea
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Describe your research question or hypothesis in natural language.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-[2fr_1fr]">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={4}
          className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="E.g., Does probiotic X improve gut permeability in inflammatory conditions?"
          disabled={isLoading}
        />
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Research Domain
          </label>
          <select
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            disabled={isLoading}
          >
            {DOMAINS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          {isLoading ? (
            <div className="flex items-center gap-2.5 animate-pulse-gentle">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                <SearchCheck className="h-3 w-3" />
              </div>
              <p className="text-xs font-medium text-primary">
                {THINKING_MESSAGES[thinkingIndex]}
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Tip:</span> Be specific about population,
              intervention, and outcome for better results.
            </p>
          )}
        </div>
        <Button variant="hero" size="lg" onClick={handleAnalyze} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Co-Scientist Thinking...
            </>
          ) : (
            <>
              Analyze Hypothesis
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </section>
  );
};
