import { Alert, AlertDescription, AlertTitle } from "#/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "#/components/ui/dialog";
import { Input } from "#/components/ui/input";
import { useAppForm } from "#/hooks/form";
import { api } from "#/lib/api";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "#/components/ui/input-group";
import { CheckIcon } from "@phosphor-icons/react";
import { CopyIcon } from "@phosphor-icons/react/dist/ssr";
import { useCopyToClipboard } from "#/hooks/use-copy-to-clipboard";

export const Route = createFileRoute(
  "/_authenticated/_admin/admin/site/$site/users/",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { site } = Route.useParams();

  const { copyToClipboard, isCopied } = useCopyToClipboard();

  const [inviteCode, setInviteCode] = useState<string | undefined>("");

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
    <div>
      <Dialog>
        <DialogTrigger>Invite user</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create invite</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <form.AppField
              name="maxUses"
              children={(field) => <field.TextField label="Max uses" />}
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
  );
}
