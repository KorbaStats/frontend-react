import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SelectOption } from "@/lib/adminData";


interface OptionSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  id?: string;
  disabled?: boolean;
  className?: string;
}

const OptionSelect = ({ value, onChange, options, id, disabled, className }: OptionSelectProps) => (
  <Select value={value} onValueChange={onChange} disabled={disabled}>
    <SelectTrigger id={id} className={className ?? "w-full"}>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {options.map((option) => (
        <SelectItem key={option.value} value={option.value}>
          {option.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

export default OptionSelect;
