import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_admin")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (!context.auth) {
      throw redirect({
        to: "/auth/sign-in",
      });
    } else if (context.auth.user.role !== "admin") {
      throw redirect({
        to: "/dashboard",
      });
    }
  },
});

function RouteComponent() {
  return <Outlet />;
}
