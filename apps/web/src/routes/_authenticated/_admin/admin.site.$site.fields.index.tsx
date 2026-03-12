import { CheckIcon, TrashIcon, XIcon } from "@phosphor-icons/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "#/components/ui/dialog";
import { Input } from "#/components/ui/input";
import { fieldQueryOptions } from "#/data/query-options-fields";
import { siteByIdQueryOptions } from "#/data/query-options-site";
import { useAppForm } from "#/hooks/form";
import { api } from "#/lib/api";

export const Route = createFileRoute(
	"/_authenticated/_admin/admin/site/$site/fields/",
)({
	component: RouteComponent,
});

export type Field = {
	id: string;
	key: string | null;
	content: string | null;
	siteId: string | null;
	language?: string | null;
};

export function groupFields(fields: Field[]): Record<string, Field[]> {
	const groups: Record<string, Field[]> = {};
	for (const field of fields) {
		const top = field.key?.split(".")[0] ?? "ungrouped";
		groups[top] ??= [];
		groups[top].push(field);
	}
	return groups;
}

function FieldRow({
	field,
	siteId,
	language,
}: {
	field: Field;
	siteId: string;
	language: string;
}) {
	const queryClient = useQueryClient();
	const [editing, setEditing] = useState(false);
	const [value, setValue] = useState(field.content ?? "");
	const [saving, setSaving] = useState(false);

	const subKey = field.key?.split(".").slice(1).join(".") ?? field.key ?? "";

	async function remove() {
		if (!field.id) return;
		await api.fields({ id: field.id }).delete();
		await queryClient.invalidateQueries({ queryKey: ["fields", siteId] });
	}

	async function save() {
		setSaving(true);
		if (field.id) {
			await api.fields({ id: field.id }).patch({ content: value });
		} else {
			await api.fields.post({
				key: field.key!,
				content: value,
				siteId,
				language,
			});
		}
		await queryClient.invalidateQueries({ queryKey: ["fields", siteId] });
		setSaving(false);
		setEditing(false);
	}

	function cancel() {
		setValue(field.content ?? "");
		setEditing(false);
	}

	return (
		<div className="flex items-center gap-3 py-2 border-b last:border-0">
			<span className="font-mono text-sm text-muted-foreground w-48 shrink-0">
				{subKey || <span className="italic">root</span>}
			</span>
			{editing ? (
				<div className="flex items-center gap-2">
					<Input
						className="h-8 text-sm w-64"
						value={value}
						onChange={(e) => setValue(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") save();
							if (e.key === "Escape") cancel();
						}}
						autoFocus
					/>
					<Button size="icon-sm" onClick={save} disabled={saving}>
						<CheckIcon />
					</Button>
					<Button size="icon-sm" variant="ghost" onClick={cancel}>
						<XIcon />
					</Button>
				</div>
			) : (
				<div className="flex items-center gap-2 flex-1">
					<span
						className="text-sm cursor-pointer hover:text-muted-foreground flex-1"
						onClick={() => setEditing(true)}
					>
						{field.content || (
							<span className="text-muted-foreground italic">empty</span>
						)}
					</span>
					{field.id && (
						<Button size="icon-sm" variant="ghost" onClick={remove}>
							<TrashIcon />
						</Button>
					)}
				</div>
			)}
		</div>
	);
}

function RouteComponent() {
	const { site } = Route.useParams();
	const queryClient = useQueryClient();

	const { data: siteData }: any = useQuery(
		siteByIdQueryOptions({ siteId: site }),
	);
	const languages: string[] = siteData?.languages || ["en"];

	const [language, setLanguage] = useState<string>("en");

	useEffect(() => {
		if (languages.length > 0 && !languages.includes(language)) {
			setLanguage(languages[0]);
		}
	}, [languages, language]);

	const { data: allFields } = useQuery(fieldQueryOptions({ siteId: site }));
	const [open, setOpen] = useState(false);

	const keys = Array.from(
		new Set((allFields ?? []).map((f) => f.key).filter(Boolean)),
	) as string[];

	const fields = keys.map((key) => {
		const existing = allFields?.find(
			(f) => f.key === key && f.language === language,
		);
		return existing || { id: "", key, content: "", siteId: site, language };
	});

	const groups = groupFields(fields);

	const form = useAppForm({
		defaultValues: { key: "", content: "" },
		onSubmit: async ({ value }) => {
			await api.fields.post({
				key: value.key,
				content: value.content,
				siteId: site,
				language,
			});
			await queryClient.invalidateQueries({ queryKey: ["fields", site] });
			form.reset();
			setOpen(false);
		},
	});

	return (
		<div className="flex justify-center">
			<div className="w-7xl flex flex-col gap-4">
				<div className="flex justify-between items-center mb-4">
					<div className="flex gap-2">
						{languages.length > 1 &&
							languages.map((lang) => (
								<Button
									key={lang}
									variant={lang === language ? "default" : "outline"}
									size="sm"
									onClick={() => setLanguage(lang)}
								>
									{lang.toUpperCase()}
								</Button>
							))}
					</div>
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

				{!fields?.length && (
					<span className="text-muted-foreground text-sm">No fields yet.</span>
				)}

				<div className="flex flex-col gap-3">
					{Object.entries(groups).map(([group, groupFields]) => (
						<Card key={group}>
							<CardHeader>
								<CardTitle className="font-mono text-sm">{group}</CardTitle>
							</CardHeader>
							<CardContent>
								{groupFields.map((field) => (
									<FieldRow
										key={`${field.key}-${language}`}
										field={field as Field}
										siteId={site}
										language={language}
									/>
								))}
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</div>
	);
}
