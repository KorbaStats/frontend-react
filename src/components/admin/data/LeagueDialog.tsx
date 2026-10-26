import { useState } from "react";

import type { League, LeagueInput } from "@/data/types";
import { toNullableText } from "@/lib/adminData";

import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";
import FormDialog from "@/components/admin/FormDialog";
import { TextField } from "@/components/admin/FormField";

interface LeagueDialogProps {
  league: League | null;
  error: string | null;
  isSaving: boolean;
  onSubmit: (input: LeagueInput) => void;
  onClose: () => void;
}

const LeagueDialog = ({ league, error, isSaving, onSubmit, onClose }: LeagueDialogProps) => {
  const [name, setName] = useState(league?.name ?? "");
  const [country, setCountry] = useState(league?.country ?? "");
  const [slug, setSlug] = useState(league?.slug ?? "");
  const [active, setActive] = useState(league?.active ?? true);
  const [nameError, setNameError] = useState<string>();

  const handleSubmit = () => {
    if (!name.trim()) {
      setNameError("Podaj nazwę ligi");
      return;
    }
    setNameError(undefined);

    onSubmit({
      name: name.trim(),
      country: toNullableText(country),
      slug: toNullableText(slug),
      active,
    });
  };

  return (
    <FormDialog
      title={league === null ? "Dodaj ligę" : "Edytuj ligę"}
      description="Mecze trafiają do ligi po jej id, które podaje się przy uruchamianiu scrapera"
      error={error}
      isSaving={isSaving}
      onSubmit={handleSubmit}
      onClose={onClose}
    >
      <TextField id="league-name" label="Nazwa" value={name} onChange={setName} error={nameError} />
      <div className="grid grid-cols-2 gap-4">
        <TextField id="league-country" label="Kraj" value={country} onChange={setCountry} />
        <TextField id="league-slug" label="Slug" value={slug} onChange={setSlug} />
      </div>
      <Field orientation="horizontal">
        <Checkbox
          id="league-active"
          checked={active}
          onCheckedChange={(checked) => setActive(checked === true)}
        />
        <FieldLabel htmlFor="league-active" className="font-normal">
          Aktywna
        </FieldLabel>
      </Field>
    </FormDialog>
  );
};

export default LeagueDialog;
