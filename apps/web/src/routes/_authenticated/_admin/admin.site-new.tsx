import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { useAppForm } from "#/hooks/form";
import { api } from "#/lib/api";

export const Route = createFileRoute("/_authenticated/_admin/admin/site-new")({
	component: RouteComponent,
});

function RouteComponent() {
	const { queryClient } = Route.useRouteContext();
	const navigate = Route.useNavigate();

	const form = useAppForm({
		defaultValues: {
			name: "",
			domain: "",
		},
		onSubmit: async ({ value }) => {
			const res = await api.sites.post({
				name: value.name,
				domain: value.domain,
			});

			if (res.error) {
				form.setErrorMap({
					onSubmit: {
						fields: {},
						form: res.error.value,
					},
				});
			} else {
				await queryClient.invalidateQueries({ queryKey: ["sites"] });
				toast.success("Success", { description: `Created ${res.data.id}` });
				navigate({ to: "/admin/site/$site", params: { site: res.data.id } });
			}
		},
	});
	return (
		<div className="h-full flex justify-center items-center">
			<Card className="w-full lg:min-w-xl lg:max-w-xl">
				<CardHeader>
					<CardTitle>New site</CardTitle>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							form.handleSubmit();
						}}
					>
						<form.AppField
							name="name"
							children={(field) => <field.TextField label="Name" />}
						/>
						<form.AppField
							name="domain"
							children={(field) => <field.TextField label="Domain" />}
						/>
						<form.AppForm>
							<form.SubscribeButton label="Create" />
							<form.ErrorMap />
						</form.AppForm>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
