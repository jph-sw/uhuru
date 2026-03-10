import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: ({ context }) => {
    if (!context.auth) {
      throw redirect({ to: "/auth/sign-in" });
    } else if (context.auth.user.site_id) {
      throw redirect({
        to: "/dashboard/s/$site",
        params: { site: context.auth.user.site_id! },
      });
    }
    throw redirect({ to: "/admin" });
  },
  component: App,
});

function App() {
  return <></>;
}
