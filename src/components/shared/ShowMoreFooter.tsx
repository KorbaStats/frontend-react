import { CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ShowMoreFooterProps {
  hiddenCount: number;
  onClick: () => void;
}

const ShowMoreFooter = ({ hiddenCount, onClick }: ShowMoreFooterProps) => {
  return hiddenCount > 0 ? (
    <CardFooter className="justify-center border-t pt-6">
      <Button variant="outline" onClick={onClick}>
        Pokaż więcej ({hiddenCount})
      </Button>
    </CardFooter>
  ) : null;
};

export default ShowMoreFooter;
