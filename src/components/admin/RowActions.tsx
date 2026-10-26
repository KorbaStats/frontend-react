import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

interface RowActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  deleteBlockedReason?: string | null;
}

const RowActions = ({ onEdit, onDelete, deleteBlockedReason }: RowActionsProps) => (
  <div className="flex justify-end gap-1">
    <Button variant="ghost" size="icon-sm" aria-label="Edytuj" onClick={onEdit}>
      <Pencil />
    </Button>
    <span title={deleteBlockedReason ?? undefined}>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Usuń"
        className="text-destructive"
        disabled={Boolean(deleteBlockedReason)}
        onClick={onDelete}
      >
        <Trash2 />
      </Button>
    </span>
  </div>
);

export default RowActions;
