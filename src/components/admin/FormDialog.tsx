import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";

interface FormDialogProps {
  title: string;
  description: string;
  error: string | null;
  isSaving: boolean;
  onSubmit: () => void;
  onClose: () => void;
  children: React.ReactNode;
}

const FormDialog = ({
  title,
  description,
  error,
  isSaving,
  onSubmit,
  onClose,
  children,
}: FormDialogProps) => (
  <Dialog open onOpenChange={(open) => !open && onClose()}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>

      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <FieldGroup>
          {children}

          {error && !isSaving && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Anuluj
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Zapisywanie..." : "Zapisz"}
            </Button>
          </DialogFooter>
        </FieldGroup>
      </form>
    </DialogContent>
  </Dialog>
);

export default FormDialog;
