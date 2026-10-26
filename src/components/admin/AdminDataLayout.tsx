import { Navigate, Outlet, useLocation } from "react-router";

import { useAuth } from "@/hooks/useAuth";
import { canAccessSection, DATA_SECTIONS, getAdminHome } from "@/lib/adminAccess";
import AdminTabs from "@/components/admin/AdminTabs";

const AdminDataLayout = () => {
  const { user } = useAuth();
  const { pathname } = useLocation();

  const sections = DATA_SECTIONS.filter((section) => canAccessSection(user, section));
  const current = sections.find((section) => pathname.startsWith(section.to));

  if (sections.length === 0) return <Navigate to={getAdminHome(user)} replace />;
  if (!current) return <Navigate to={sections[0].to} replace />;

  return (
    <>
      <AdminTabs sections={sections} />
      <Outlet />
    </>
  );
};

export default AdminDataLayout;
