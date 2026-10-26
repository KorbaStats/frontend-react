import { useState } from "react";

import type { League, Stadium, Team, TeamInput } from "@/data/types";
import { fromIdValue, toIdOptions, toIdValue, toNullableText } from "@/lib/adminData";

import FormDialog from "@/components/admin/FormDialog";
import { FormField, TextField } from "@/components/admin/FormField";
import OptionSelect from "@/components/admin/OptionSelect";

interface TeamDialogProps {
  team: Team | null;
  leagues: League[];
  stadiums: Stadium[];
  canPickStadium: boolean;
  error: string | null;
  isSaving: boolean;
  onSubmit: (input: TeamInput) => void;
  onClose: () => void;
}

const TeamDialog = ({
  team,
  leagues,
  stadiums,
  canPickStadium,
  error,
  isSaving,
  onSubmit,
  onClose,
}: TeamDialogProps) => {
  const isNew = team === null;

  const [name, setName] = useState(team?.name ?? "");
  const [shortName, setShortName] = useState(team?.short_name ?? "");
  const [city, setCity] = useState(team?.city ?? "");
  const [country, setCountry] = useState(team?.country ?? "");
  const [leagueId, setLeagueId] = useState(toIdValue(team?.league_id));
  const [stadiumId, setStadiumId] = useState(toIdValue(team?.home_stadium_id));
  const [nameError, setNameError] = useState<string>();

  const stadiumOptions = canPickStadium
    ? toIdOptions(stadiums, "Brak stadionu")
    : toIdOptions(team?.homeStadium ? [team.homeStadium] : [], "Brak stadionu");

  const handleSubmit = () => {
    if (isNew && !name.trim()) {
      setNameError("Podaj nazwę drużyny");
      return;
    }
    setNameError(undefined);

    onSubmit({
      ...(isNew && { name: name.trim() }),
      short_name: toNullableText(shortName),
      city: toNullableText(city),
      country: toNullableText(country),
      league_id: fromIdValue(leagueId),
      ...(canPickStadium && { home_stadium_id: fromIdValue(stadiumId) }),
    });
  };

  return (
    <FormDialog
      title={isNew ? "Dodaj drużynę" : "Edytuj drużynę"}
      description={isNew ? "Nazwa musi być taka sama jak na Flashscore" : team.name}
      error={error}
      isSaving={isSaving}
      onSubmit={handleSubmit}
      onClose={onClose}
    >
      <TextField
        id="team-name"
        label="Nazwa"
        value={name}
        onChange={setName}
        error={nameError}
        disabled={!isNew}
        description={isNew ? undefined : "Scraper rozpoznaje drużyny po nazwie, więc jej nie zmieniamy"}
      />
      <div className="grid grid-cols-2 gap-4">
        <TextField id="team-short-name" label="Skrót" value={shortName} onChange={setShortName} />
        <TextField id="team-city" label="Miasto" value={city} onChange={setCity} />
        <TextField id="team-country" label="Kraj" value={country} onChange={setCountry} />
        <FormField id="team-league" label="Liga">
          <OptionSelect
            id="team-league"
            value={leagueId}
            onChange={setLeagueId}
            options={toIdOptions(leagues, "Brak ligi")}
          />
        </FormField>
      </div>
      <FormField
        id="team-stadium"
        label="Stadion domowy"
        description={canPickStadium ? undefined : "Wybór stadionu wymaga uprawnienia „Stadiony”"}
      >
        <OptionSelect
          id="team-stadium"
          value={stadiumId}
          onChange={setStadiumId}
          options={stadiumOptions}
          disabled={!canPickStadium}
        />
      </FormField>
    </FormDialog>
  );
};

export default TeamDialog;
