import { useFieldContext } from "#/hooks/form-context";
import { useStore } from "@tanstack/react-form";
import { Input } from "#/components/ui/input";

export default function TextField({
  label,
  type,
  readOnly = false,
  disabled = false,
}: {
  label: string;
  type?: string;
  readOnly?: boolean;
  disabled?: boolean;
}) {
  const field = useFieldContext<string>();

  const errors = useStore(field.store, (state) => state.meta.errors);

  return (
    <div className="mb-3">
      <label>
        <div>{label}</div>
        <Input
          value={field.state.value}
          type={type}
          onChange={(e) => field.handleChange(e.target.value)}
          onBlur={field.handleBlur}
          readOnly={readOnly}
          disabled={disabled}
        />
      </label>
      {errors.map((error: string) => (
        <div key={error} className="text-red-500 text-xs pt-0.5">
          {error}
        </div>
      ))}
    </div>
  );
}
