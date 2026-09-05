import type { LucideIcon } from "lucide-react";

interface SidebarSectionProps {
  icon: LucideIcon;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

const SidebarSection = ({
  icon: Icon,
  title,
  action,
  children,
}: SidebarSectionProps) => (
  <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
    <div className="mb-3 flex items-center justify-between gap-2">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Icon className="h-4 w-4 text-primary" />
        {title}
      </h3>
      {action}
    </div>
    {children}
  </section>
);

export default SidebarSection;
