import { createFileRoute, redirect } from "@tanstack/react-router";
import BetterAuthHeader from "#/integrations/better-auth/header-user";
import { getSession } from "#/lib/auth-functions";

export const Route = createFileRoute("/")({
	component: App,
	beforeLoad: async () => {
		const session = await getSession();

		if (!session) {
			throw redirect({ to: "/auth/sign-in" });
		} else if (
			session.user &&
			session.user.site_id &&
			session.user.site_id !== null &&
			session.user.site_id !== ""
		) {
			throw redirect({
				to: "/dashboard/s/$site",
				params: { site: session.user.site_id },
			});
		} else {
			throw redirect({ to: "/admin" });
		}
	},
});

function App() {
	return (
		<main className="page-wrap px-4 pb-8 pt-14">
			<BetterAuthHeader />
		</main>
	);
}
