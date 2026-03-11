import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { type } from "arktype";
import { AdminSidebar } from "#/components/admin/admin-sidebar";
import { SidebarProvider } from "#/components/ui/sidebar";
import { TooltipProvider } from "#/components/ui/tooltip";

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
				to: "/dashboard/s/$site",
				params: { site: context.auth.user.site_id! },
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
