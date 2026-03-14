import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { siteByIdQueryOptions } from "#/data/query-options/site";
import { useAppForm } from "#/hooks/form";
import { getTreaty } from "#/routes/api/$";

export const Route = createFileRoute(
	"/_authenticated/_admin/admin/site/$site/settings",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { site } = Route.useParams();
	const { queryClient } = Route.useRouteContext();

	const { data: siteData } = useQuery(siteByIdQueryOptions({ siteId: site }));

	const form = useAppForm({
		defaultValues: {
			name: siteData?.name || "",
			domain: siteData?.domain || "",
			languages: siteData?.languages?.join(", ") || "en",
		},
		onSubmit: async ({ value }) => {
			const { api } = await getTreaty();

			const langs = value.languages
				.split(",")
				.map((l: string) => l.trim())
				.filter(Boolean);

			const res = await api.sites({ id: site }).patch({
				name: value.name,
				domain: value.domain,
				languages: langs.length > 0 ? langs : ["en"],
			});

			if (res.error) {
				form.setErrorMap({
					onSubmit: {
						fields: {},
						form: res.error.value,
					},
				});
			} else {
				await queryClient.invalidateQueries({ queryKey: ["site", site] });
				await queryClient.invalidateQueries({ queryKey: ["sites"] });
				toast.success("Success", { description: "Site settings updated" });
			}
		},
	});

	useEffect(() => {
		if (siteData) {
			form.reset({
				name: siteData.name,
				domain: siteData.domain,
				languages: siteData.languages?.join(", ") || "en",
			});
		}
	}, [siteData, form]);

	if (!siteData) return null;

	return (
		<div className="flex justify-center">
			<div className="w-7xl">
				<Card className="w-full">
					<CardHeader>
						<CardTitle>Site Settings</CardTitle>
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
							<form.AppField
								name="languages"
								children={(field) => (
									<field.TextField label="Languages (comma separated)" />
								)}
							/>
							<form.AppForm>
								<form.SubscribeButton label="Save Changes" />
								<form.ErrorMap />
							</form.AppForm>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
