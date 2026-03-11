import { createFormHook } from "@tanstack/react-form";
import { lazy } from "react";
import { Alert, AlertDescription } from "#/components/ui/alert.tsx";
import { Button } from "#/components/ui/button.tsx";
import { fieldContext, formContext, useFormContext } from "./form-context.tsx";

const TextField = lazy(() => import("#/components/forms/text-field.tsx"));

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

export const { useAppForm, withForm, withFieldGroup } = createFormHook({
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
