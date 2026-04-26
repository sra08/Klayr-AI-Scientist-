import { cn } from "@/lib/utils";

interface KlayrLogoProps {
  className?: string;
  variant?: "dark" | "light";
}

export const KlayrLogo = ({ className, variant = "dark" }: KlayrLogoProps) => {
  const color = variant === "dark" ? "hsl(var(--primary))" : "hsl(var(--primary-foreground))";
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <img 
        src="/logo.png" 
        alt="Klayr Logo" 
        className="h-8 w-auto object-contain"
      />
      <span
        className="font-serif-display text-xl font-semibold tracking-tight"
        style={{ color }}
      >
        Klayr
      </span>
    </div>
  );
};
