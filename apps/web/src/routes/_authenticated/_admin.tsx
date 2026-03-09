import { Button } from "#/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import { siteQueryOptions } from "#/data/query-options-sites";
import { useQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import { PlusIcon } from "@phosphor-icons/react";
import { type } from "arktype";
import { useState } from "react";
import { Route as SiteRoute } from "./_admin/admin.site.$site";
import { authClient } from "#/lib/auth-client";
import { ThemeToggle } from "#/components/theme-toggle";
const search = type({
  "site?": "string",
});

export const Route = createFileRoute("/_authenticated/_admin")({
  component: RouteComponent,
  validateSearch: search,
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
  const { data: sites } = useQuery(siteQueryOptions);
  const navigate = useNavigate();
  const { site } = useParams({ strict: false });

  return (
    <div className="flex">
      <div
        className="h-dvh w-75 border-e p-2 flex flex-col justify-between"
        id="sidebar"
      >
        <div>
          <div className="flex items-center gap-1">
            <Select
              disabled={sites ? (sites.length <= 0 ? true : false) : true}
              value={site}
              onValueChange={(e) => {
                navigate({
                  from: Route.fullPath,
                  to: "/admin/site/$site",
                  params: { site: e as string },
                });
              }}
            >
              <SelectTrigger className={"min-h-12 w-full"}>
                {sites && site
                  ? sites.filter((item) => item.id === site)[0].name
                  : "No sites"}
              </SelectTrigger>
              <SelectContent>
                {sites?.map((site) => (
                  <SelectItem key={site.id} value={site.id}>
                    {site.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant={"secondary"}
              className={"h-12"}
              render={
                <Link to="/admin/site-new">
                  <PlusIcon />
                </Link>
              }
            />
          </div>
        </div>
        <div className="py-2 flex gap-2 border-t bottom-0">
          <Button
            variant={"outline"}
            onClick={() => {
              authClient.signOut();
              navigate({ to: "/auth/sign-in" });
            }}
          >
            Sign out
          </Button>
          <ThemeToggle />
        </div>
      </div>
      <div className="p-8 w-full min-h-full">
        <Outlet />
      </div>
    </div>
  );
}
