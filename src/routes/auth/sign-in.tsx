import { createFileRoute, redirect } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { useAppForm } from "#/hooks/form";
import { authClient } from "#/lib/auth-client";
import { getSession } from "#/lib/auth-functions";

export const Route = createFileRoute("/auth/sign-in")({
	component: RouteComponent,
	beforeLoad: async () => {
		const auth = await getSession();

		if (auth) {
			throw redirect({ to: "/" });
		}
	},
});

function RouteComponent() {
	const navigate = Route.useNavigate();
	const form = useAppForm({
		defaultValues: {
			email: "",
			password: "",
		},
		validators: {
			onSubmitAsync: async ({ value }) => {
				const fields: Record<string, string> = {};

				if (!value.email) fields.email = "Email is required";
				if (!value.password) fields.password = "Password is required";

				return Object.keys(fields).length ? { fields } : null;
			},
		},
		onSubmit: async ({ value }) => {
			const res = await authClient.signIn.email({
				email: value.email,
				password: value.password,
			});

			if (res.error) {
				form.setErrorMap({
					onSubmit: {
						fields: {},
						form: res.error.message,
					},
				});
			}

			navigate({
				to: "/",
			});
		},
	});
	return (
		<div className="bg-[url('/light-mode.jpg')] dark:bg-[url('/dark-mode.jpg')] bg-cover h-screen w-full flex justify-center items-center">
			<Card className="w-100">
				<CardHeader>
					<CardTitle>Sign in</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					<form
						onSubmit={(e) => {
							e.preventDefault();
							form.handleSubmit();
						}}
					>
						<form.AppField
							name="email"
							children={(field) => <field.TextField label="Email" />}
						/>
						<form.AppField
							name="password"
							children={(field) => (
								<field.TextField label="Password" type="password" />
							)}
						/>
						<form.AppForm>
							<form.SubscribeButton label="Submit" />
							<form.ErrorMap />
						</form.AppForm>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
