import { NavLink } from "react-router";

import type { AdminSection } from "@/lib/adminAccess";
import { buttonVariants } from "@/components/ui/button";

interface AdminTabsProps {
  sections: AdminSection[];
}

const AdminTabs = ({ sections }: AdminTabsProps) => (
  <nav className="flex items-center gap-1">
    {sections.map((section) => (
      <NavLink
        key={section.to}
        to={section.to}
        end={section.end}
        className={({ isActive }) =>
          buttonVariants({ variant: isActive ? "secondary" : "ghost", size: "sm" })
        }
      >
        {section.label}
      </NavLink>
    ))}
  </nav>
);

export default AdminTabs;
