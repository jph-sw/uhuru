import { createFileRoute } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "#/components/ui/dialog";
import { useState } from "react";
import { useAppForm } from "#/hooks/form";
import { api } from "#/lib/api";
import { useCopyToClipboard } from "#/hooks/use-copy-to-clipboard";
import { Button } from "#/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "#/components/ui/alert";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "#/components/ui/input-group";
import { CheckIcon } from "@phosphor-icons/react";
import { CopyIcon } from "@phosphor-icons/react/dist/ssr";
import { useQuery } from "@tanstack/react-query";
import { inviteQueryOptions } from "#/data/query-options-invites";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { InvitesTable } from "#/components/admin/invites-table";

export const Route = createFileRoute(
  "/_authenticated/_admin/admin/site/$site/invites/",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { site } = Route.useParams();

  const { copyToClipboard, isCopied } = useCopyToClipboard();
  const [inviteCode, setInviteCode] = useState<string | undefined>("");

  const { data: invites } = useQuery(inviteQueryOptions({ siteId: site }));

  const form = useAppForm({
    defaultValues: {
      maxUses: "1",
    },
    onSubmit: async ({ value }) => {
      const res = await api.invite.post({
        maxUses: value.maxUses,
        siteId: site,
      });

      if (res.error) {
        form.setErrorMap({
          onSubmit: {
            fields: {},
            form: res.error.value,
          },
        });
      } else {
        setInviteCode(res.data[0].code);
      }
    },
  });

  return (
    <div className="flex justify-center">
      <div className="w-7xl flex flex-col gap-8">
        <div className="flex justify-end">
          <Dialog>
            <DialogTrigger render={<Button>Invite user</Button>} />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  Create invite for <code className="text-xs">{site}</code>
                </DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  form.handleSubmit();
                }}
              >
                <form.AppField
                  name="maxUses"
                  children={(field) => (
                    <field.TextField label="Max uses" type="number" />
                  )}
                />
                <form.AppForm>
                  <form.SubscribeButton label="Create invite" />
                  <form.ErrorMap />
                </form.AppForm>

                {inviteCode && (
                  <Alert>
                    <AlertTitle>Success!</AlertTitle>
                    <AlertDescription className="mb-1">
                      Your invite code
                    </AlertDescription>
                    <InputGroup>
                      <InputGroupInput value={inviteCode} readOnly />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          aria-label="Copy"
                          title="Copy"
                          size="icon-xs"
                          onClick={() => {
                            copyToClipboard(
                              "http://localhost:3000/auth/join/" + inviteCode,
                            );
                          }}
                        >
                          {isCopied ? <CheckIcon /> : <CopyIcon />}
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                  </Alert>
                )}
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Invites</CardTitle>
          </CardHeader>
          <CardContent>
            <InvitesTable invites={invites} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
