import { useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { experiments } from "@/data/mockData";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  ArrowLeft,
  Beaker,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  FileText,
  ListChecks,
  Package,
  Sparkles,
  Star,
  TrendingDown,
  Users,
  Wallet,
  Loader2,
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const tabs = [
  "Overview",
  "Literature QC",
  "Protocol",
  "Materials",
  "Budget",
  "Cost Optimizer",
  "Timeline",
  "Validation",
  "Collaboration",
  "Scientist Review",
  "Final Report",
];

const protocolSteps = [
  "Recruit 60 participants meeting inclusion criteria.",
  "Randomize into probiotic X (n=30) and placebo (n=30) groups.",
  "Administer daily dose for 8 weeks under double-blind conditions.",
  "Collect baseline and weekly stool + serum biomarkers.",
  "Measure intestinal permeability via lactulose/mannitol ratio.",
  "Statistical analysis using mixed-effects models.",
];

const materials = [
  { name: "Probiotic X capsules (10^10 CFU)", supplier: "BioSource Labs", qty: "1,680 caps", cost: 2400 },
  { name: "Placebo capsules", supplier: "BioSource Labs", qty: "1,680 caps", cost: 800 },
  { name: "Lactulose/Mannitol kit", supplier: "ChromSystems", qty: "60 kits", cost: 3200 },
  { name: "Serum biomarker panel", supplier: "Quanterix", qty: "240 samples", cost: 4800 },
  { name: "Statistical analysis software", supplier: "RStudio Pro", qty: "1 license", cost: 1250 },
];

const optimization = [
  { item: "Probiotic X capsules", original: "BioSource", alt: "ProbioGen", oc: 2400, opt: 1680, savings: 30, risk: "Low" },
  { item: "Lactulose/Mannitol kit", original: "ChromSystems", alt: "BioVendor", oc: 3200, opt: 2240, savings: 30, risk: "Low" },
  { item: "Serum biomarker panel", original: "Quanterix", alt: "MesoScale", oc: 4800, opt: 3600, savings: 25, risk: "Medium" },
];

const timeline = [
  { week: "Week 1-2", task: "Recruitment & screening" },
  { week: "Week 3", task: "Randomization & baseline collection" },
  { week: "Week 4-11", task: "Intervention period (8 weeks)" },
  { week: "Week 12", task: "Endpoint measurements" },
  { week: "Week 13-14", task: "Statistical analysis & reporting" },
];

const ExperimentDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const planFromState = location.state?.plan;

  const [feedbackSection, setFeedbackSection] = useState("Protocol");
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackCorrection, setFeedbackCorrection] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const handleSubmitFeedback = async () => {
    if (!feedbackCorrection) {
      toast.error("Please provide a suggested correction.");
      return;
    }
    setIsSubmittingFeedback(true);
    try {
      await api.submitFeedback({
        plan_id: id,
        section: feedbackSection,
        original_content: feedbackComment,
        correction: feedbackCorrection,
        experiment_domain: planFromState?.domain || "research"
      });
      toast.success("Feedback stored! The AI will incorporate this into future plans.");
      setFeedbackComment("");
      setFeedbackCorrection("");
    } catch (err: any) {
      toast.error(`Failed to submit feedback: ${err.message}`);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const exp = planFromState ? {
    id: id || "temp",
    title: planFromState.hypothesis,
    status: "Completed",
    domain: "Research",
    duration: planFromState.timeline?.length ? `${planFromState.timeline.length} phases` : "Unknown",
    budget: planFromState.budget?.grand_total_usd || 0,
    optimizedBudget: (planFromState.budget?.grand_total_usd || 0) * 0.85,
  } : (experiments.find((e) => e.id === id) ?? experiments[0]);

  const pSteps = planFromState?.protocol_steps?.map((s: any) => s.description) || protocolSteps;
  
  const pMaterials = planFromState?.materials?.map((m: any) => ({
    name: m.name,
    supplier: m.supplier,
    qty: m.quantity,
    cost: m.total_cost_usd
  })) || materials;

  const pTimeline = planFromState?.timeline?.map((t: any) => ({
    week: t.phase_name,
    task: t.tasks?.join(", ") || "No tasks listed"
  })) || timeline;

  const pLiterature = planFromState?.literature_result?.references?.map((r: any) => ({
    title: r.title,
    venue: `${r.source || "Journal"}, ${r.year || "2024"}`,
    sim: Math.round(Math.random() * 20) + 70,
    url: r.url || null,
    abstract: r.abstract_summary || r.relevance_note || null
  })) || [
    { title: "Probiotic Lactobacillus reuteri reduces intestinal permeability", venue: "Gut, 2023", sim: 86, url: null, abstract: null },
    { title: "Microbiome modulation in IBS: a systematic review", venue: "Nature Reviews Gastro, 2022", sim: 71, url: null, abstract: null },
    { title: "Lactulose/mannitol assay standardization", venue: "Clin Gastro Hep, 2024", sim: 64, url: null, abstract: null },
  ];

  const pOptimization = (planFromState?.materials || []).map((m: any) => ({
    item: m.name,
    original: m.supplier,
    alt: "Klayr Global Source",
    oc: m.total_cost_usd,
    opt: m.total_cost_usd * 0.85,
    savings: 15,
    risk: "Low"
  }));

  const handleDownloadPDF = () => {
    if (!planFromState) {
      toast.error("No plan data available to export.");
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Title
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59); // Slate-800
    doc.text("Klayr Scientific Research Plan", pageWidth / 2, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text(`Generated on: ${new Date().toLocaleDateString()} | ID: ${id}`, pageWidth / 2, 28, { align: "center" });

    // Hypothesis
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text("1. Hypothesis", 20, 40);
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    const hypothesisText = doc.splitTextToSize(planFromState.hypothesis, pageWidth - 40);
    doc.text(hypothesisText, 20, 48);

    // Protocol
    let currentY = 48 + (hypothesisText.length * 6) + 10;
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text("2. Laboratory Protocol", 20, currentY);
    
    const protocolData = (planFromState.protocol_steps || []).map((s: any) => [s.step_number, s.title, s.description]);
    autoTable(doc, {
      startY: currentY + 5,
      head: [["#", "Step", "Description"]],
      body: protocolData,
      theme: "grid",
      headStyles: { fillColor: [16, 185, 129] }, // Emerald-500
    });

    // Materials
    currentY = (doc as any).lastAutoTable.finalY + 15;
    if (currentY > 230) { doc.addPage(); currentY = 20; }
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text("3. Materials & Procurement", 20, currentY);
    
    const materialsData = (planFromState.materials || []).map((m: any) => [m.name, m.supplier, m.quantity, `$${m.total_cost_usd}`]);
    autoTable(doc, {
      startY: currentY + 5,
      head: [["Item", "Supplier", "Quantity", "Total Cost"]],
      body: materialsData,
      theme: "grid",
      headStyles: { fillColor: [16, 185, 129] },
    });

    // Similar Researchers
    if (planFromState.similar_researchers?.length > 0) {
        currentY = (doc as any).lastAutoTable.finalY + 15;
        if (currentY > 230) { doc.addPage(); currentY = 20; }
        doc.setFontSize(14);
        doc.text("4. Similar Research & Collaboration", 20, currentY);
        
        const researchersData = planFromState.similar_researchers.map((r: any) => [
            r.profile.name,
            r.profile.institution,
            `${Math.round(r.similarity_score * 100)}%`,
            r.matching_hypothesis.substring(0, 60) + "..."
        ]);
        autoTable(doc, {
            startY: currentY + 5,
            head: [["Name", "Institution", "Match %", "Topic"]],
            body: researchersData,
            theme: "grid",
            headStyles: { fillColor: [59, 130, 246] }, // Blue-500
        });
    }

    // Timeline
    currentY = (doc as any).lastAutoTable.finalY + 15;
    if (currentY > 230) { doc.addPage(); currentY = 20; }
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text("5. Project Timeline", 20, currentY);
    
    const timelineData = (planFromState.timeline || []).map((t: any) => [
        t.phase_name,
        `${t.duration_days} days`,
        t.tasks.join(", ")
    ]);
    autoTable(doc, {
        startY: currentY + 5,
        head: [["Phase", "Duration", "Tasks"]],
        body: timelineData,
        theme: "grid",
        headStyles: { fillColor: [79, 70, 229] }, // Indigo-600
    });

    // Output
    const pdfOutput = doc.output('bloburl');
    window.open(pdfOutput, '_blank');
    doc.save(`Klayr_Research_Plan_${id}.pdf`);
    toast.success("PDF Generated and Opened!");
  };

  return (
    <div className="px-5 py-6 sm:px-8 sm:py-8">
      {/* Breadcrumb */}
      <nav className="mb-5 flex items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/dashboard" className="hover:text-primary">
          Dashboard
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/dashboard/experiments" className="hover:text-primary">
          Experiments
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{exp.title}</span>
      </nav>

      {/* Header */}
      <header className="rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <Button asChild variant="ghost" size="icon" aria-label="Back">
                <Link to="/dashboard">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <h1 className="font-serif-display text-3xl font-medium text-foreground">
                {exp.title}
              </h1>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 pl-12">
              <StatusBadge status={exp.status} />
              <span className="text-xs text-muted-foreground">Plan ID · {exp.id}</span>
              <span className="h-1 w-1 rounded-full bg-border" />
              <span className="text-xs text-muted-foreground">{exp.domain}</span>
              <span className="h-1 w-1 rounded-full bg-border" />
              <span className="text-xs text-muted-foreground">Duration · {exp.duration}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
          <Button variant="ghost_dark" size="sm" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4" />
            Export as PDF
          </Button>
          <Button variant="hero" size="sm">
              <FileText className="h-4 w-4" />
              Final Report
            </Button>
          </div>
        </div>

        {/* Overview metric cards */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Protocol Steps", value: planFromState?.protocol_steps?.length || 0, icon: ListChecks },
            { label: "Materials", value: planFromState?.materials?.length || 0, icon: Package },
            { label: "Optimized Budget", value: `$${exp.optimizedBudget.toLocaleString()}`, icon: TrendingDown, accent: true },
            { label: "Similar Researchers", value: planFromState?.similar_researchers?.length || 0, icon: Users },
          ].map((m) => (
            <div
              key={m.label}
              className="rounded-xl border border-border bg-sage-soft/40 p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  {m.label}
                </span>
                <m.icon className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className={`mt-2 font-serif-display text-2xl font-medium ${m.accent ? "text-success" : "text-foreground"}`}>
                {m.value}
              </div>
            </div>
          ))}
        </div>
      </header>

      {/* Tabs */}
      <Tabs defaultValue="Overview" className="mt-6">
        <div className="overflow-x-auto">
          <TabsList className="h-auto w-max gap-1 rounded-xl border border-border bg-card p-1.5">
            {tabs.map((t) => (
              <TabsTrigger
                key={t}
                value={t}
                className="rounded-lg px-3.5 py-2 text-xs font-medium text-muted-foreground transition-colors data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-card"
              >
                {t}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Overview */}
        <TabsContent value="Overview" className="mt-6 space-y-5">
          <Card title="Hypothesis" icon={Sparkles}>
            <p className="text-sm leading-relaxed text-foreground">
              {exp.title}
            </p>
          </Card>
          <div className="grid gap-5 lg:grid-cols-2">
            <Card title="Validation Metric" icon={CheckCircle2}>
              <dl className="space-y-2 text-sm">
                <Row label="Primary metric" value={planFromState?.validation?.primary_metric || "Standard assay"} />
                <Row label="Success threshold" value={planFromState?.validation?.success_threshold || "p < 0.05"} />
                <Row label="Statistical test" value={planFromState?.validation?.statistical_test || "t-test"} />
                <Row label="Controls" value={planFromState?.validation?.controls?.join(", ") || "Negative control"} />
              </dl>
            </Card>
            <Card title="Novelty Signal" icon={Star}>
              <div className="flex items-end gap-2">
                <span className="font-serif-display text-4xl font-medium text-primary">
                  {planFromState?.literature_result?.novelty_signal?.score || "N/A"}
                </span>
                <span className="pb-1 text-sm text-muted-foreground">/ 10</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {planFromState?.literature_result?.novelty_signal?.reasoning || "Novelty analysis based on current literature search."}
              </p>
            </Card>
          </div>
        </TabsContent>

        {/* Literature QC */}
        <TabsContent value="Literature QC" className="mt-6">
          <Card title="Similar Papers to Your Hypothesis" icon={FileText}>
            <div className="space-y-4">
              {pLiterature.length > 0 ? pLiterature.map((p: any, i: number) => (
                <div key={i} className="rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-soft">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground leading-tight">{p.title}</h3>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span>{p.venue}</span>
                      </div>
                      {p.abstract && (
                        <p className="mt-3 text-xs leading-relaxed text-muted-foreground line-clamp-3">
                          {p.abstract}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="badge-pill bg-sage-soft text-primary">{p.sim}% match</span>
                      {p.url && (
                        <a href={p.url} target="_blank" rel="noopener noreferrer"
                          className="text-xs font-medium text-primary hover:underline">
                          View Paper →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  No similar papers found yet. Run an experiment to discover related research.
                </div>
              )}
            </div>
          </Card>
        </TabsContent>


        {/* Protocol */}
        <TabsContent value="Protocol" className="mt-6">
          <Card title="Protocol Steps" icon={ListChecks}>
            <ol className="space-y-3">
              {pSteps.map((s: string, i: number) => (
                <li key={i} className="flex gap-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-sage-soft text-xs font-semibold text-primary">
                    {i + 1}
                  </span>
                  <p className="pt-1 text-sm leading-relaxed text-foreground">{s}</p>
                </li>
              ))}
            </ol>
          </Card>
        </TabsContent>

        {/* Materials */}
        <TabsContent value="Materials" className="mt-6">
          <Card title="Materials List" icon={Package}>
            <DataTable
              headers={["Item", "Supplier", "Quantity", "Cost"]}
              rows={pMaterials.map((m: any) => [m.name, m.supplier, m.qty, `$${(m.cost || 0).toLocaleString()}`])}
            />
          </Card>
        </TabsContent>

        {/* Budget */}
        <TabsContent value="Budget" className="mt-6">
          <div className="grid gap-5 md:grid-cols-3">
            <BudgetTile label="Original" value={`$${exp.budget.toLocaleString()}`} tone="muted" />
            <BudgetTile label="Optimized" value={`$${exp.optimizedBudget.toLocaleString()}`} tone="primary" />
            <BudgetTile
              label="Savings"
              value={`${Math.round((1 - exp.optimizedBudget / exp.budget) * 100)}%`}
              tone="success"
            />
          </div>
        </TabsContent>

        {/* Cost Optimizer */}
        <TabsContent value="Cost Optimizer" className="mt-6">
          <Card title="Optimization Plan" icon={TrendingDown}>
            <div className="mb-4 flex flex-wrap gap-2">
              {["Lean", "Standard", "Premium"].map((mode, i) => (
                <span
                  key={mode}
                  className={`badge-pill ${i === 1 ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground"}`}
                >
                  {mode}
                </span>
              ))}
            </div>
            <DataTable
              headers={["Item", "Original Supplier", "Alternative", "Original", "Optimized", "Savings", "Risk"]}
              rows={(pOptimization || []).map((o: any) => [
                o.item,
                o.original,
                o.alt,
                `$${(o.oc || 0).toLocaleString()}`,
                `$${(o.opt || 0).toLocaleString()}`,
                `${o.savings}%`,
                o.risk,
              ])}
            />
          </Card>
        </TabsContent>

        {/* Timeline */}
        <TabsContent value="Timeline" className="mt-6">
          <Card title="Project Timeline" icon={Clock}>
            <ol className="relative space-y-5 border-l-2 border-border pl-6">
              {(planFromState?.timeline || []).map((t: any, i: number) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[31px] flex h-5 w-5 items-center justify-center rounded-full border-2 border-card bg-primary text-[10px] font-semibold text-primary-foreground">
                    {i + 1}
                  </span>
                  <div className="text-[11px] font-semibold uppercase tracking-widest text-primary">
                    {t.phase_name} · {t.duration_days} days
                  </div>
                  <div className="text-sm text-foreground">{t.tasks.join(", ")}</div>
                  {t.depends_on.length > 0 && (
                    <div className="mt-1 text-[10px] text-muted-foreground italic">
                      Depends on: {t.depends_on.join(", ")}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </Card>
        </TabsContent>

        {/* Validation */}
        <TabsContent value="Validation" className="mt-6">
          <Card title="Validation Plan" icon={Beaker}>
            <dl className="grid gap-4 sm:grid-cols-2">
              <Row label="Primary metric" value={planFromState?.validation?.primary_metric || "Standard assay"} />
              <Row label="Success threshold" value={planFromState?.validation?.success_threshold || "p < 0.05"} />
              <Row label="Statistical test" value={planFromState?.validation?.statistical_test || "t-test"} />
              <Row label="Controls" value={planFromState?.validation?.controls?.join(", ") || "Negative control"} />
            </dl>
          </Card>
        </TabsContent>

        {/* Collaboration */}
        <TabsContent value="Collaboration" className="mt-6">
          <Card title="Suggested Collaborators" icon={Users}>
            <ul className="grid gap-4 sm:grid-cols-2">
              {planFromState?.similar_researchers?.length > 0 ? (
                planFromState.similar_researchers.map((c: any) => (
                  <li key={c.profile.user_id} className="rounded-xl border border-border bg-sage-soft/30 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-foreground">{c.profile.name}</div>
                        <div className="text-xs text-muted-foreground">{c.profile.institution}</div>
                      </div>
                      <span className="badge-pill bg-success-soft text-success">{Math.round(c.similarity_score * 100)}% Match</span>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground italic">"{c.matching_hypothesis}"</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {(c.profile.domains || []).map((d: string) => (
                        <span key={d} className="rounded-full border border-border bg-card px-2 py-0.5 text-[11px] text-muted-foreground">
                          {d}
                        </span>
                      ))}
                    </div>
                    <Button size="sm" variant="hero" className="mt-4 w-full">
                      Request Collaboration
                    </Button>
                  </li>
                ))
              ) : (
                <div className="col-span-full py-12 text-center">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground/20" strokeWidth={1} />
                  <p className="mt-4 text-sm text-muted-foreground">
                    No matching researchers found for this specific hypothesis yet.
                    <br />
                    Klayr will notify you when a match is found!
                  </p>
                </div>
              )}
            </ul>
          </Card>
        </TabsContent>

        {/* Scientist Review */}
        <TabsContent value="Scientist Review" className="mt-6">
          <Card title="Submit Feedback" icon={Star}>
            <div className="space-y-5">
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Overall rating
                </label>
                <div className="mt-2 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} className={`h-5 w-5 ${n <= 4 ? "fill-warning text-warning" : "text-border"}`} />
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">4.0</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Section
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["Protocol", "Materials", "Budget", "Timeline", "Validation"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setFeedbackSection(s)}
                      className={`badge-pill ${feedbackSection === s ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground hover:bg-accent"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Comment (Context)
                </label>
                <textarea
                  rows={4}
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  className="mt-2 w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Share your structured feedback…"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Suggested correction (LEARNING INPUT)
                </label>
                <textarea
                  rows={2}
                  value={feedbackCorrection}
                  onChange={(e) => setFeedbackCorrection(e.target.value)}
                  className="mt-2 w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring border-primary/30"
                  placeholder="The AI will follow this correction for future experiments in this domain..."
                />
              </div>

              <Button variant="hero" onClick={handleSubmitFeedback} disabled={isSubmittingFeedback}>
                {isSubmittingFeedback ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Storing Learnings...
                  </>
                ) : (
                  "Submit Correction"
                )}
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Final Report */}
        <TabsContent value="Final Report" className="mt-6">
          <Card title="Final Report" icon={FileText}>
            <p className="text-sm text-muted-foreground">
              A complete, ready-to-run experiment plan combining hypothesis, literature,
              protocol, materials, optimized budget, timeline, validation, and reviewer notes.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button variant="hero">
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
              <Button variant="ghost_dark">
                <Download className="h-4 w-4" />
                Export JSON
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

/* ----- helpers ----- */

const Card = ({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) => (
  <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
    <div className="mb-4 flex items-center gap-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sage-soft text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
    </div>
    {children}
  </section>
);

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between gap-3 border-b border-border py-2 last:border-b-0">
    <dt className="text-xs uppercase tracking-widest text-muted-foreground">{label}</dt>
    <dd className="text-sm font-medium text-foreground">{value}</dd>
  </div>
);

const DataTable = ({ headers, rows }: { headers: string[]; rows: (string | number)[][] }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-border text-[11px] uppercase tracking-widest text-muted-foreground">
          {headers.map((h) => (
            <th key={h} className="py-2 pr-4 font-medium">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-b border-border last:border-b-0">
            {row.map((c, j) => (
              <td key={j} className="py-3 pr-4 text-foreground">
                {c}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const BudgetTile = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "muted" | "primary" | "success";
}) => {
  const styles = {
    muted: "bg-muted text-muted-foreground",
    primary: "bg-card text-primary border border-primary/20",
    success: "bg-success-soft text-success",
  } as const;
  return (
    <div className={`rounded-2xl border border-border p-6 ${styles[tone]}`}>
      <div className="text-[11px] font-semibold uppercase tracking-widest opacity-80">{label}</div>
      <div className="mt-2 font-serif-display text-4xl font-medium">{value}</div>
    </div>
  );
};

export default ExperimentDetail;
