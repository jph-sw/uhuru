import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
	"/_authenticated/_admin/admin/site/$site/",
)({
	component: RouteComponent,
});

function RouteComponent() {
	return <div></div>;
}
