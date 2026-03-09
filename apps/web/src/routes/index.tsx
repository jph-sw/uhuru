import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: ({ context }) => {
    if (!context.auth) {
      throw redirect({ to: "/auth/sign-in" });
    }
    throw redirect({ to: "/dashboard" });
  },
  component: App,
});

function App() {
  return <></>;
}
