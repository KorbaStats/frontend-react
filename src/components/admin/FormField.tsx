import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  description?: string;
  children: React.ReactNode;
}

export const FormField = ({ id, label, error, description, children }: FormFieldProps) => (
  <Field>
    <FieldLabel htmlFor={id}>{label}</FieldLabel>
    {children}
    {error ? (
      <FieldError>{error}</FieldError>
    ) : (
      description && <FieldDescription>{description}</FieldDescription>
    )}
  </Field>
);

interface TextFieldProps extends Omit<FormFieldProps, "children"> {
  value: string;
  onChange: (value: string) => void;
  type?: string;
  disabled?: boolean;
}

export const TextField = ({ value, onChange, type, disabled, ...field }: TextFieldProps) => (
  <FormField {...field}>
    <Input
      id={field.id}
      type={type}
      autoComplete="off"
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      aria-invalid={field.error !== undefined}
    />
  </FormField>
);
