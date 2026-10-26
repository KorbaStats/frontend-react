import type { LucideIcon } from "lucide-react";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AdminTableCardProps {
  icon: LucideIcon;
  title: string;
  description: React.ReactNode;
  actions?: React.ReactNode;
  isPending: boolean;
  isError: boolean;
  errorText: string;
  footer?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

const AdminTableCard = ({
  icon: Icon,
  title,
  description,
  actions,
  isPending,
  isError,
  errorText,
  footer,
  className,
  children,
}: AdminTableCardProps) => (
  <Card className={className}>
    <CardHeader className="border-b pb-4">
      <CardTitle className="flex items-center gap-2 text-base">
        <Icon className="h-4 w-4 text-primary" />
        {title}
      </CardTitle>
      <CardDescription>{description}</CardDescription>
      {actions && <CardAction className="flex items-center gap-2">{actions}</CardAction>}
    </CardHeader>

    <CardContent className="px-0">
      {isPending && <p className="py-10 text-center text-muted-foreground">Ładowanie...</p>}

      {isError && <p className="py-10 text-center text-muted-foreground">{errorText}</p>}

      {!isPending && !isError && <div className="overflow-x-auto">{children}</div>}
    </CardContent>

    {!isPending && !isError && footer}
  </Card>
);

export default AdminTableCard;
