import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "#/components/ui/dialog";
import { fieldQueryOptions } from "#/data/query-options-fields";
import { useAppForm } from "#/hooks/form";
import { api } from "#/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute(
	"/_authenticated/_admin/admin/site/$site/fields/",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { site } = Route.useParams();
	const queryClient = useQueryClient();
	const { data: fields } = useQuery(fieldQueryOptions({ siteId: site }));
	const [open, setOpen] = useState(false);

	const form = useAppForm({
		defaultValues: { key: "", content: "" },
		onSubmit: async ({ value }) => {
			await api.fields.post({
				key: value.key,
				content: value.content,
				siteId: site,
			});
			await queryClient.invalidateQueries({ queryKey: ["fields", site] });
			form.reset();
			setOpen(false);
		},
	});

	return (
		<div className="flex flex-col gap-4">
			<div className="flex justify-end">
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogTrigger render={<Button>New field</Button>} />
					<DialogContent>
						<DialogHeader>
							<DialogTitle>New field</DialogTitle>
						</DialogHeader>
						<form
							onSubmit={(e) => {
								e.preventDefault();
								form.handleSubmit();
							}}
						>
							<form.AppField
								name="key"
								children={(field) => <field.TextField label="Key" />}
							/>
							<form.AppField
								name="content"
								children={(field) => <field.TextField label="Content" />}
							/>
							<form.AppForm>
								<form.SubscribeButton label="Create" />
								<form.ErrorMap />
							</form.AppForm>
						</form>
					</DialogContent>
				</Dialog>
			</div>

			<div className="flex flex-col gap-2">
				{!fields?.length && (
					<span className="text-muted-foreground text-sm">No fields yet.</span>
				)}
				{fields?.map((field) => (
					<Card key={field.id}>
						<CardHeader>
							<CardTitle className="font-mono text-sm font-medium">
								{field.key}
							</CardTitle>
						</CardHeader>
						<CardContent className="flex justify-between items-start">
							<div className="flex flex-col gap-1">
								<span className="text-muted-foreground text-sm">
									{field.content}
								</span>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
