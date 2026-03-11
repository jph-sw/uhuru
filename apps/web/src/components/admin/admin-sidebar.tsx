import {
	EnvelopeIcon,
	GearIcon,
	PlusIcon,
	TextboxIcon,
	UsersIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { ThemeToggle } from "#/components/theme-toggle";
import { Button } from "#/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
} from "#/components/ui/select";
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
import { siteQueryOptions } from "#/data/query-options-sites";
import { authClient } from "#/lib/auth-client";
import { cn } from "#/lib/utils";

export function AdminSidebar() {
	const { data: sites } = useQuery(siteQueryOptions);
	const navigate = useNavigate();
	const { site } = useParams({ strict: false });

	return (
		<Sidebar>
			<SidebarHeader>
				<div className="flex items-center gap-1">
					<Select
						disabled={sites ? sites.length <= 0 : true}
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
						className={cn(
							"h-12 transition-all duration-300",
							sites?.length === 0 &&
								"bg-primary/90 text-primary-foreground ring-2 ring-primary/30 hover:bg-primary shadow-lg hover:shadow-xl hover:ring-primary/50 animate-pulse",
						)}
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
							<SidebarMenuItem>
								<SidebarMenuButton
									disabled={!site}
									render={
										<Link
											to="/admin/site/$site/invites"
											params={{ site: site! }}
										>
											<EnvelopeIcon /> Invites
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
									disabled={!site}
									render={
										<Link
											to="/admin/site/$site/settings"
											params={{ site: site! }}
										>
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
