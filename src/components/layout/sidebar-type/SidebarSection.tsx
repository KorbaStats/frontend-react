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
  <section className="flex flex-col gap-2">
    <div className="flex h-8 items-center justify-between gap-2">
      <h3 className="flex items-center gap-2 text-xs font-semibold tracking-wide text-foreground uppercase">
        <Icon className="h-4 w-4 text-primary" />
        {title}
      </h3>
      {action}
    </div>
    {children}
  </section>
);

export default SidebarSection;
