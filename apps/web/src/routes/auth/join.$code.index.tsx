import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import { useAppForm } from "#/hooks/form";
import { api } from "#/lib/api";
import { authClient } from "#/lib/auth-client";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/join/$code/")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const { data, error } = await api.invite.check({ code: params.code }).get();

    if (error || !data.valid) throw redirect({ to: "/" });

    return { invite: data.invite! };
  },
});

function RouteComponent() {
  const { invite } = Route.useLoaderData();
  const navigate = Route.useNavigate();

  const form = useAppForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      const res = await api.join.post({
        code: invite.code,
        name: value.name,
        email: value.email,
        password: value.password,
        siteId: invite.siteId,
      });

      if (res.error) {
        form.setErrorMap({
          onSubmit: {
            fields: {},
            form: res.error.value,
          },
        });
      } else {
        const signInResponse = await authClient.signIn.email({
          email: value.email,
          password: value.password,
        });

        if (signInResponse.error) {
          form.setErrorMap({
            onSubmit: {
              fields: {},
              form: signInResponse.error.message,
            },
          });
        } else {
          navigate({
            to: "/dashboard/s/$site",
            params: { site: invite.siteId },
          });
        }
      }
    },
  });

  return (
    <div className="bg-secondary min-h-dvh w-full flex justify-center items-center">
      {invite && (
        <Card className="w-100">
          <CardHeader>
            <CardTitle>You've been invited</CardTitle>
            <CardDescription>
              Create an account to join <strong>{invite.siteId}</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
            >
              <form.AppField
                name={"name"}
                children={(field) => <field.TextField label="Name" />}
              />
              <form.AppField
                name={"email"}
                children={(field) => <field.TextField label="Email" />}
              />{" "}
              <form.AppField
                name={"password"}
                children={(field) => (
                  <field.TextField label="Password" type="password" />
                )}
              />
              <form.AppForm>
                <form.SubscribeButton label="Sign up" />
                <form.ErrorMap />
              </form.AppForm>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
