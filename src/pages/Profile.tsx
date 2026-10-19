import { Navigate } from "react-router";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { getUserHandle } from "@/lib/userLabel";

const Profile = () => {
  const { user, isAuthenticated, isRestoringSession, logout } = useAuth();

  if (isRestoringSession) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Ładowanie...
        </CardContent>
      </Card>
    );
  }

  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{getUserHandle(user.email)}</CardTitle>
        <CardDescription>{user.email}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Rola</p>
            <p className="font-medium">{user.role ?? "brak roli"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Uprawnienia</p>
            <p className="font-medium">
              {user.permissions.length > 0
                ? user.permissions.join(", ")
                : "brak uprawnień"}
            </p>
          </div>
        </div>

        <div>
          <Button variant="outline" onClick={() => logout()}>
            Wyloguj
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Profile;
