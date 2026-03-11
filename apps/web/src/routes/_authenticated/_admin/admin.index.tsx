import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_admin/admin/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { auth } = Route.useRouteContext();

	return (
		<div>
			<div>hello {auth?.user.name}</div>
			<Outlet />
		</div>
	);
}
