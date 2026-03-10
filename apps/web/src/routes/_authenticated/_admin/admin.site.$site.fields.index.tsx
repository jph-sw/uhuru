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
import { useAppForm } from "#/hooks/form";
import { api } from "#/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { CheckIcon, XIcon } from "@phosphor-icons/react";
import { useState } from "react";

export const Route = createFileRoute(
  "/_authenticated/_admin/admin/site/$site/fields/",
)({
  component: RouteComponent,
});

type Field = {
  id: string;
  key: string | null;
  content: string | null;
  siteId: string | null;
};

function groupFields(fields: Field[]): Record<string, Field[]> {
  const groups: Record<string, Field[]> = {};
  for (const field of fields) {
    const top = field.key?.split(".")[0] ?? "ungrouped";
    (groups[top] ??= []).push(field);
  }
  return groups;
}

function FieldRow({ field, siteId }: { field: Field; siteId: string }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(field.content ?? "");
  const [saving, setSaving] = useState(false);

  const subKey = field.key?.split(".").slice(1).join(".") ?? field.key ?? "";

  async function save() {
    setSaving(true);
    await api.fields({ id: field.id }).patch({ content: value });
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
        <span
          className="text-sm cursor-pointer hover:text-muted-foreground"
          onClick={() => setEditing(true)}
        >
          {field.content || (
            <span className="text-muted-foreground italic">empty</span>
          )}
        </span>
      )}
    </div>
  );
}

function RouteComponent() {
  const { site } = Route.useParams();
  const queryClient = useQueryClient();
  const { data: fields } = useQuery(fieldQueryOptions({ siteId: site }));
  const [open, setOpen] = useState(false);

  const groups = groupFields(fields ?? []);

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
                <FieldRow key={field.id} field={field} siteId={site} />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
