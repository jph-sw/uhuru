import { useStore } from "@tanstack/react-form";
import { Input } from "#/components/ui/input";
import { useFieldContext } from "#/hooks/form-context";

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
	const id = `${label}-${crypto.randomUUID()}`;
	const field = useFieldContext<string>();
	const errors = useStore(field.store, (state) => state.meta.errors);

	return (
		<div className="mb-3">
			<label htmlFor={id}>
				<div>{label}</div>
				<Input
					id={id}
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
