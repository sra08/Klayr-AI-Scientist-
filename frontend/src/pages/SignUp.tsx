import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { KlayrLogo } from "@/components/KlayrLogo";
import { ScienceWave } from "@/components/ScienceWave";
import { Lock, Microscope, Sparkles, Users, Wallet, ArrowRight, Check } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { FormEvent, useState } from "react";

const valueBullets = [
  { icon: Microscope, label: "Smarter Literature Insights" },
  { icon: Sparkles, label: "AI-Powered Experiment Planning" },
  { icon: Wallet, label: "Cost Optimization" },
  { icon: Users, label: "Scientist-in-the-Loop Review" },
];

const DOMAINS = [
  "Biology", "Chemistry", "Physics", "Computer Science", 
  "Mathematics", "Medicine", "Engineering", "Social Science"
];

const SignUp = () => {
  const navigate = useNavigate();
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleDomain = (domain: string) => {
    setSelectedDomains(prev => 
      prev.includes(domain) 
        ? prev.filter(d => d !== domain) 
        : [...prev, domain]
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      institution: formData.get("institution") as string,
      bio: formData.get("bio") as string,
      domains: selectedDomains.map(d => d.toLowerCase()),
    };

    if (selectedDomains.length === 0) {
      toast.error("Please select at least one research domain.");
      return;
    }

    setIsLoading(true);
    try {
      const profile = await api.createProfile(data);
      localStorage.setItem("klayr_user_id", profile.user_id);
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(`Sign up failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left side */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-hero p-10 lg:flex">
          <div className="absolute inset-0 hero-grid-bg opacity-40" aria-hidden />
          <div className="relative">
            <Link to="/">
              <KlayrLogo />
            </Link>
          </div>

          <div className="relative max-w-md">
            <h1 className="font-serif-display text-5xl font-medium leading-[1.05] text-foreground">
              Join the Future
              <br />
              <span className="italic text-primary">of Research</span>
            </h1>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">
              Create your researcher profile and start collaborating with AI and peers worldwide.
            </p>

            <ul className="mt-8 space-y-3">
              {valueBullets.map((b) => (
                <li key={b.label} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-card text-primary shadow-card">
                    <b.icon className="h-4 w-4" strokeWidth={1.6} />
                  </span>
                  <span className="text-sm font-medium text-foreground">{b.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative -mb-16 -ml-6 opacity-90">
            <ScienceWave className="h-56" showLabels={false} />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-xl">
            <div className="lg:hidden mb-8">
              <Link to="/">
                <KlayrLogo />
              </Link>
            </div>

            <div className="rounded-2xl border border-border bg-card p-7 shadow-soft sm:p-9">
              <h2 className="font-serif-display text-3xl font-medium">Create Profile</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Tell us about your research expertise.
              </p>

              <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" name="name" placeholder="Dr. Jane Smith" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email address</Label>
                    <Input id="email" name="email" type="email" placeholder="jane@university.edu" required />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" placeholder="••••••••" required />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="institution">Institution</Label>
                  <Input id="institution" name="institution" placeholder="Stanford University" required />
                </div>

                <div className="space-y-1.5">
                  <Label>Research Domains</Label>
                  <div className="flex flex-wrap gap-2">
                    {DOMAINS.map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggleDomain(d)}
                        className={`badge-pill flex items-center gap-1.5 transition-all ${
                          selectedDomains.includes(d) 
                            ? "bg-primary text-primary-foreground border-primary" 
                            : "bg-sage-soft text-muted-foreground hover:border-primary/30"
                        }`}
                      >
                        {selectedDomains.includes(d) && <Check className="h-3 w-3" />}
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="bio">Brief Bio</Label>
                  <Textarea 
                    id="bio" 
                    name="bio" 
                    placeholder="Tell us about your research interests..." 
                    className="min-h-[100px]"
                    required
                  />
                </div>

                <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating Profile..." : "Create Account"}
                  {!isLoading && <ArrowRight className="h-4 w-4" />}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="font-medium text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-xl border border-border bg-sage-soft/60 p-4">
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={1.8} />
              <p className="text-xs leading-relaxed text-muted-foreground">
                Your profile will be used to match you with relevant collaborators and research opportunities.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
