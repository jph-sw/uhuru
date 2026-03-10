import { Button } from "#/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "#/components/ui/select";
import { siteQueryOptions } from "#/data/query-options-sites";
import { authClient } from "#/lib/auth-client";
import { ThemeToggle } from "#/components/theme-toggle";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import {
  GearIcon,
  PlusIcon,
  TextboxIcon,
  UsersIcon,
} from "@phosphor-icons/react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "#/components/ui/sidebar";

export function AdminSidebar() {
  const { data: sites } = useQuery(siteQueryOptions);
  const navigate = useNavigate();
  const { site } = useParams({ strict: false });

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-1">
          <Select
            disabled={sites ? (sites.length <= 0 ? true : false) : true}
            value={site}
            onValueChange={(e) => {
              navigate({
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
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  disabled={!site}
                  render={
                    <Link
                      to="/admin/site/$site/fields"
                      params={{ site: site! }}
                    >
                      <TextboxIcon /> Fields
                    </Link>
                  }
                />
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  disabled={!site}
                  render={
                    <Link to="/admin/site/$site/users" params={{ site: site! }}>
                      <UsersIcon /> Users
                    </Link>
                  }
                />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={
                    <Link to="/admin/site-new">
                      <GearIcon /> General Settings
                    </Link>
                  }
                />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex gap-1">
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
      </SidebarFooter>
    </Sidebar>
  );
}
