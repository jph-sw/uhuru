import { createFileRoute, redirect } from "@tanstack/react-router";
import { getSession } from "#/lib/auth-functions";

export const Route = createFileRoute("/_authenticated/_admin/admin/")({
	component: RouteComponent,
	loader: async () => {
		const session = await getSession();

		if (!session) {
			throw redirect({ to: "/auth/sign-in" });
		}

		return session;
	},
});

function RouteComponent() {
	const { user } = Route.useLoaderData();

	return (
		<div>
			<div>hello {user.name}</div>
		</div>
	);
}
