import { createFormHook } from "@tanstack/react-form";
import TextField from "#/components/forms/text-field";
import { Alert, AlertDescription } from "#/components/ui/alert";
import { Button } from "#/components/ui/button";
import { fieldContext, formContext, useFormContext } from "./form-context";

function SubscribeButton({ label }: { label: string }) {
	const form = useFormContext();
	return (
		<form.Subscribe selector={(state) => state.isSubmitting}>
			{(isSubmitting) => (
				<Button type="submit" className={"mt-2"} disabled={isSubmitting}>
					{label}
				</Button>
			)}
		</form.Subscribe>
	);
}

function ErrorMap() {
	const form = useFormContext();
	return (
		<div className="mt-2">
			<form.Subscribe
				selector={(form) => form.errorMap}
				children={(errorMap) =>
					errorMap.onSubmit && (
						<Alert variant={"destructive"}>
							<AlertDescription>{errorMap.onSubmit}</AlertDescription>
						</Alert>
					)
				}
			/>
		</div>
	);
}

export const { useAppForm } = createFormHook({
	fieldComponents: {
		TextField,
	},
	formComponents: {
		SubscribeButton,
		ErrorMap,
	},
	fieldContext,
	formContext,
});
