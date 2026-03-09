import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { useAppForm } from "#/hooks/form";
import { authClient } from "#/lib/auth-client";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/sign-up")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (context.auth) {
      throw redirect({ to: "/" });
    }
  },
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const form = useAppForm({
    defaultValues: {
      name: "",
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
      const res = await authClient.signUp.email({
        name: value.name,
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
    <div className="bg-secondary h-screen w-full flex justify-center items-center">
      <Card className="w-100">
        <CardHeader>
          <CardTitle>Sign up</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
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
            </form.AppForm>
          </form>
          <Link
            to={"/auth/sign-in"}
            className="hover:underline text-muted-foreground"
          >
            Already have an account?
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
