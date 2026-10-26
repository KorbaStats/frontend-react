import { Navigate, Outlet } from "react-router";
import { Shield } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { ADMIN_SECTIONS, canAccessAdmin, canAccessSection } from "@/lib/adminAccess";
import AdminTabs from "@/components/admin/AdminTabs";

const AdminLayout = () => {
  const { user, isRestoringSession } = useAuth();

  if (isRestoringSession) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Ładowanie...
        </CardContent>
      </Card>
    );
  }

  if (!canAccessAdmin(user)) return <Navigate to="/" replace />;

  return (
    <>
      <div className="flex items-center gap-4">
        <h1 className="flex items-center gap-2 text-lg font-semibold">
          <Shield className="h-5 w-5 text-primary" />
          Panel admina
        </h1>
        <AdminTabs
          sections={ADMIN_SECTIONS.filter((section) => canAccessSection(user, section))}
        />
      </div>

      <Outlet />
    </>
  );
};

export default AdminLayout;
