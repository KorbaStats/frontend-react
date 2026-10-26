import { useState } from "react";

import type { Stadium, StadiumInput } from "@/data/types";
import {
  isInvalidNumber,
  toInputValue,
  toNullableNumber,
  toNullableText,
} from "@/lib/adminData";

import FormDialog from "@/components/admin/FormDialog";
import { TextField } from "@/components/admin/FormField";

type StadiumFieldErrors = Partial<Record<"name" | "capacity" | "latitude" | "longitude", string>>;

function validateStadiumForm(values: {
  name: string;
  capacity: string;
  latitude: string;
  longitude: string;
}): StadiumFieldErrors {
  const errors: StadiumFieldErrors = {};
  const capacity = toNullableNumber(values.capacity);
  const latitude = toNullableNumber(values.latitude);
  const longitude = toNullableNumber(values.longitude);

  if (!values.name.trim()) errors.name = "Podaj nazwę stadionu";
  if (isInvalidNumber(values.capacity) || (capacity !== null && (capacity < 0 || !Number.isInteger(capacity))))
    errors.capacity = "Pojemność musi być nieujemną liczbą całkowitą";
  if (isInvalidNumber(values.latitude) || (latitude !== null && Math.abs(latitude) > 90))
    errors.latitude = "Szerokość musi być między -90 a 90";
  if (isInvalidNumber(values.longitude) || (longitude !== null && Math.abs(longitude) > 180))
    errors.longitude = "Długość musi być między -180 a 180";

  return errors;
}

interface StadiumDialogProps {
  stadium: Stadium | null;
  error: string | null;
  isSaving: boolean;
  onSubmit: (input: StadiumInput) => void;
  onClose: () => void;
}

const StadiumDialog = ({ stadium, error, isSaving, onSubmit, onClose }: StadiumDialogProps) => {
  const isNew = stadium === null;

  const [name, setName] = useState(stadium?.name ?? "");
  const [city, setCity] = useState(stadium?.city ?? "");
  const [capacity, setCapacity] = useState(toInputValue(stadium?.capacity));
  const [address, setAddress] = useState(stadium?.address ?? "");
  const [latitude, setLatitude] = useState(toInputValue(stadium?.latitude));
  const [longitude, setLongitude] = useState(toInputValue(stadium?.longitude));
  const [fieldErrors, setFieldErrors] = useState<StadiumFieldErrors>({});

  const handleSubmit = () => {
    const errors = validateStadiumForm({ name, capacity, latitude, longitude });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    onSubmit({
      ...(isNew && { name: name.trim() }),
      city: toNullableText(city),
      capacity: toNullableNumber(capacity),
      address: toNullableText(address),
      latitude: toNullableNumber(latitude),
      longitude: toNullableNumber(longitude),
    });
  };

  return (
    <FormDialog
      title={isNew ? "Dodaj stadion" : "Edytuj stadion"}
      description={isNew ? "Nazwa musi być taka sama jak na Flashscore" : stadium.name}
      error={error}
      isSaving={isSaving}
      onSubmit={handleSubmit}
      onClose={onClose}
    >
      <TextField
        id="stadium-name"
        label="Nazwa"
        value={name}
        onChange={setName}
        error={fieldErrors.name}
        disabled={!isNew}
        description={isNew ? undefined : "Scraper rozpoznaje stadiony po nazwie, więc jej nie zmieniamy"}
      />
      <div className="grid grid-cols-2 gap-4">
        <TextField id="stadium-city" label="Miasto" value={city} onChange={setCity} />
        <TextField
          id="stadium-capacity"
          label="Pojemność"
          value={capacity}
          onChange={setCapacity}
          error={fieldErrors.capacity}
        />
      </div>
      <TextField id="stadium-address" label="Adres" value={address} onChange={setAddress} />
      <div className="grid grid-cols-2 gap-4">
        <TextField
          id="stadium-latitude"
          label="Szerokość geograficzna"
          value={latitude}
          onChange={setLatitude}
          error={fieldErrors.latitude}
        />
        <TextField
          id="stadium-longitude"
          label="Długość geograficzna"
          value={longitude}
          onChange={setLongitude}
          error={fieldErrors.longitude}
        />
      </div>
    </FormDialog>
  );
};

export default StadiumDialog;
