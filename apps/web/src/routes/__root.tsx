import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";

import { TanStackDevtools } from "@tanstack/react-devtools";
import { ThemeProvider } from "#/hooks/theme";

import "../styles.css";
import type { authClient } from "#/lib/auth-client";
import type { QueryClient } from "@tanstack/react-query";
import { Toaster } from "#/components/ui/sonner";

type AuthSession = typeof authClient.$Infer.Session;

interface MyRouterContext {
  auth: AuthSession | null | undefined;
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  return (
    <ThemeProvider>
      <div id="root-content">
        <Outlet />
        <Toaster richColors />
      </div>
      <div id="portal-root"></div>

      <TanStackDevtools
        config={{
          position: "bottom-right",
        }}
        plugins={[
          {
            name: "TanStack Router",
            render: <TanStackRouterDevtoolsPanel />,
          },
          {
            name: "TanStack Query",
            render: <ReactQueryDevtoolsPanel />,
          },
        ]}
      />
    </ThemeProvider>
  );
}
