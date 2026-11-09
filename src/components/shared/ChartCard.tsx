import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ChartCardProps {
  Icon: LucideIcon;
  title: string;
  scope?: string;
  topic: string;
  isPending?: boolean;
  isError?: boolean;
  isEmpty: boolean;
  insight?: ReactNode;
  footnote: ReactNode;
  children: ReactNode;
}

const ChartCard = ({
  Icon,
  title,
  scope = "Wszystkie ligi i sezony",
  topic,
  isPending = false,
  isError = false,
  isEmpty,
  insight,
  footnote,
  children,
}: ChartCardProps) => {
  const placeholder = isPending
    ? "Ładowanie..."
    : isError
      ? "Nie udało się pobrać meczów."
      : isEmpty
        ? "Za mało meczów, żeby porównać."
        : null;

  return (
    <Card className="break-inside-avoid">
      <CardHeader className="border-b pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{scope} · {topic}</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4">
        {placeholder ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {placeholder}
          </p>
        ) : (
          <>
            {children}
            <div className="mt-auto flex flex-col gap-2">
              {insight && (
                <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
                  {insight}
                </p>
              )}
              <p className="text-xs text-muted-foreground">{footnote}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ChartCard;
