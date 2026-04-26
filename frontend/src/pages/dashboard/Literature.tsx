import { useState } from "react";
import { PageHeader } from "./PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, ExternalLink, Search, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

const Literature = () => {
  const [query, setQuery] = useState("probiotic gut permeability");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await api.searchLiterature(query);
      setResults(data.map((p: any) => ({
        title: p.title,
        authors: p.authors.join(", "),
        journal: `${p.source.toUpperCase()} · ${p.year}`,
        similarity: Math.round(Math.random() * 20) + 70, // Mocked similarity
        abstract: p.abstract_summary || p.abstract || "No abstract available.",
        url: p.url
      })));
      toast.success(`Found ${data.length} papers`);
    } catch (error) {
      toast.error("Failed to search literature");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-5 py-6 sm:px-8 sm:py-8">
      <PageHeader
        eyebrow="Literature Search"
        title="Discover related work"
        description="Klayr scans peer-reviewed sources to surface the closest precedents to your hypothesis."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search keywords, authors, or DOI..."
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button variant="hero" size="sm" onClick={handleSearch} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookOpen className="h-4 w-4" />}
          Run Literature QC
        </Button>
      </div>

      <section className="space-y-4">
        {results.length === 0 && !loading && (
          <div className="flex h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-border text-muted-foreground">
            <BookOpen className="mb-2 h-8 w-8 opacity-20" />
            <p>Enter a query to search real scientific databases</p>
          </div>
        )}
        {results.map((p) => (
          <article
            key={p.title}
            className="rounded-2xl border border-border bg-card p-6 shadow-card transition-colors hover:border-primary/30"
          >
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="badge-pill bg-sage-soft text-primary">
                {p.similarity}% similar
              </span>
              <span className="text-xs text-muted-foreground">{p.journal}</span>
            </div>
            <h3 className="font-serif-display text-lg font-medium leading-snug text-foreground">
              {p.title}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">{p.authors}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.abstract}</p>
            <div className="mt-4 flex items-center gap-2">
              <Button variant="ghost_dark" size="sm" asChild>
                <a href={p.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open paper
                </a>
              </Button>
              <Button variant="ghost" size="sm">
                Save to references
              </Button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
};

export default Literature;

