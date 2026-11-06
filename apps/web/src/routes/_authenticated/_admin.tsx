import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AdminSidebar } from "#/components/admin/admin-sidebar";
import { SidebarProvider } from "#/components/ui/sidebar";
import { TooltipProvider } from "#/components/ui/tooltip";
import { getSession } from "#/lib/auth-functions";

type Search = {
	site?: string;
};

export const Route = createFileRoute("/_authenticated/_admin")({
	component: RouteComponent,
	validateSearch: (search: Record<string, unknown>): Search => {
		return { site: search?.site as string };
	},
	beforeLoad: async () => {
		const session = await getSession();

		if (!session) {
			throw redirect({
				to: "/auth/sign-in",
			});
		} else if (session.user.role !== "admin") {
			throw redirect({
				to: "/dashboard/s/$site",
				params: { site: session.user.site_id ?? "" },
			});
		}
	},
});

function RouteComponent() {
	return (
		<div className="flex">
			<TooltipProvider>
				<SidebarProvider>
					<AdminSidebar />
					<div className="p-8 w-full min-h-full">
						<Outlet />
					</div>
				</SidebarProvider>
			</TooltipProvider>
		</div>
	);
}
