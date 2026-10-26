import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConfirmDeleteDialogProps {
  title: string;
  description: string;
  error: string | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const ConfirmDeleteDialog = ({
  title,
  description,
  error,
  isDeleting,
  onConfirm,
  onClose,
}: ConfirmDeleteDialogProps) => (
  <AlertDialog open onOpenChange={(open) => !open && onClose()}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
      </AlertDialogHeader>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <AlertDialogFooter>
        <AlertDialogCancel disabled={isDeleting}>Anuluj</AlertDialogCancel>
        <AlertDialogAction
          variant="destructive"
          disabled={isDeleting}
          onClick={(event) => {
            event.preventDefault();
            onConfirm();
          }}
        >
          {isDeleting ? "Usuwanie..." : "Usuń"}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default ConfirmDeleteDialog;
