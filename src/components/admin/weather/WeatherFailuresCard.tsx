import { useNavigate } from "react-router";
import { CloudAlert } from "lucide-react";

import type { WeatherFetchingStatus } from "@/data/types";
import type { MatchWithWeather } from "@/services/matchesService";
import { getFormatedDate, getLocalTime } from "@/lib/date";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AdminTableCard from "@/components/admin/AdminTableCard";

interface WeatherFailuresCardProps {
  failures: WeatherFetchingStatus["failedMatches"];
  matches: MatchWithWeather[];
  className?: string;
}

const WeatherFailuresCard = ({ failures, matches, className }: WeatherFailuresCardProps) => {
  const navigate = useNavigate();
  const matchesById = new Map(matches.map((match) => [match.id, match]));

  return (
    <AdminTableCard
      className={className}
      icon={CloudAlert}
      title="Nieudane w ostatnim pobieraniu"
      description={`${failures.length} meczów bez pobranej pogody`}
      isPending={false}
      isError={false}
      errorText=""
    >
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-4">Data</TableHead>
            <TableHead>Mecz</TableHead>
            <TableHead className="pr-4">Powód</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {failures.map((failure) => {
            const match = matchesById.get(failure.id);

            return (
              <TableRow
                key={failure.id}
                onClick={() => navigate(`/match/${failure.id}`)}
                className="cursor-pointer"
              >
                <TableCell className="pl-4">
                  {getFormatedDate(failure.datetime)} {getLocalTime(failure.datetime)}
                </TableCell>
                <TableCell className="font-medium text-foreground">
                  {match ? `${match.homeTeam.name} – ${match.awayTeam.name}` : `Mecz #${failure.id}`}
                </TableCell>
                <TableCell className="pr-4 text-muted-foreground">{failure.reason}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </AdminTableCard>
  );
};

export default WeatherFailuresCard;
