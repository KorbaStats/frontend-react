import { useState } from "react";

import type { MatchInput, Stadium } from "@/data/types";
import type { MatchWithWeather } from "@/services/matchesService";
import {
  fromIdValue,
  isInvalidNumber,
  NO_VALUE,
  toIdOptions,
  toIdValue,
  toInputValue,
  toNullableNumber,
  toNullableText,
} from "@/lib/adminData";
import { fromDateTimeInputValue, toDateTimeInputValue } from "@/lib/date";

import FormDialog from "@/components/admin/FormDialog";
import { FormField, TextField } from "@/components/admin/FormField";
import OptionSelect from "@/components/admin/OptionSelect";

type MatchFieldErrors = Partial<
  Record<"home_goals" | "away_goals" | "datetime" | "attendance", string>
>;

function goalsError(value: string): string | undefined {
  const goals = toNullableNumber(value);
  if (goals === null || isInvalidNumber(value) || goals < 0 || !Number.isInteger(goals))
    return "Podaj nieujemną liczbę całkowitą";
  return undefined;
}

interface MatchDialogProps {
  match: MatchWithWeather;
  stadiums: Stadium[];
  seasons: string[];
  canPickStadium: boolean;
  error: string | null;
  isSaving: boolean;
  onSubmit: (input: MatchInput) => void;
  onClose: () => void;
}

const MatchDialog = ({
  match,
  stadiums,
  seasons,
  canPickStadium,
  error,
  isSaving,
  onSubmit,
  onClose,
}: MatchDialogProps) => {
  const [homeGoals, setHomeGoals] = useState(String(match.home_goals));
  const [awayGoals, setAwayGoals] = useState(String(match.away_goals));
  const [datetime, setDatetime] = useState(toDateTimeInputValue(match.datetime));
  const [stadiumId, setStadiumId] = useState(toIdValue(match.stadium_id));
  const [referee, setReferee] = useState(match.referee ?? "");
  const [attendance, setAttendance] = useState(toInputValue(match.attendance));
  const [season, setSeason] = useState(match.season ?? NO_VALUE);
  const [fieldErrors, setFieldErrors] = useState<MatchFieldErrors>({});

  const stadiumOptions = toIdOptions(
    canPickStadium ? stadiums : match.stadium ? [match.stadium] : [],
    "Brak stadionu",
  );
  const seasonOptions = [
    { value: NO_VALUE, label: "Brak sezonu" },
    ...seasons.map((value) => ({ value, label: value })),
  ];

  const handleSubmit = () => {
    const attendanceValue = toNullableNumber(attendance);
    const errors: MatchFieldErrors = {
      home_goals: goalsError(homeGoals),
      away_goals: goalsError(awayGoals),
      datetime: datetime ? undefined : "Podaj datę i godzinę",
      attendance:
        isInvalidNumber(attendance) ||
        (attendanceValue !== null && (attendanceValue < 0 || !Number.isInteger(attendanceValue)))
          ? "Frekwencja musi być nieujemną liczbą całkowitą"
          : undefined,
    };
    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) return;

    onSubmit({
      home_goals: Number(homeGoals),
      away_goals: Number(awayGoals),
      datetime: fromDateTimeInputValue(datetime),
      referee: toNullableText(referee),
      attendance: attendanceValue,
      season: season === NO_VALUE ? null : season,
      ...(canPickStadium && { stadium_id: fromIdValue(stadiumId) }),
    });
  };

  return (
    <FormDialog
      title="Edytuj mecz"
      description={`${match.homeTeam.name} – ${match.awayTeam.name}`}
      error={error}
      isSaving={isSaving}
      onSubmit={handleSubmit}
      onClose={onClose}
    >
      <div className="grid grid-cols-2 gap-4">
        <TextField
          id="match-home-goals"
          label={`Gole: ${match.homeTeam.name}`}
          value={homeGoals}
          onChange={setHomeGoals}
          error={fieldErrors.home_goals}
        />
        <TextField
          id="match-away-goals"
          label={`Gole: ${match.awayTeam.name}`}
          value={awayGoals}
          onChange={setAwayGoals}
          error={fieldErrors.away_goals}
        />
        <TextField
          id="match-datetime"
          label="Data i godzina"
          type="datetime-local"
          value={datetime}
          onChange={setDatetime}
          error={fieldErrors.datetime}
        />
        <FormField id="match-season" label="Sezon">
          <OptionSelect
            id="match-season"
            value={season}
            onChange={setSeason}
            options={seasonOptions}
          />
        </FormField>
        <TextField id="match-referee" label="Sędzia" value={referee} onChange={setReferee} />
        <TextField
          id="match-attendance"
          label="Frekwencja"
          value={attendance}
          onChange={setAttendance}
          error={fieldErrors.attendance}
        />
      </div>
      <FormField
        id="match-stadium"
        label="Stadion"
        description={canPickStadium ? undefined : "Wybór stadionu wymaga uprawnienia „Stadiony”"}
      >
        <OptionSelect
          id="match-stadium"
          value={stadiumId}
          onChange={setStadiumId}
          options={stadiumOptions}
          disabled={!canPickStadium}
        />
      </FormField>
    </FormDialog>
  );
};

export default MatchDialog;
