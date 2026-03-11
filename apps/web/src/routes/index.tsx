import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	beforeLoad: ({ context }) => {
		if (!context.auth) {
			throw redirect({ to: "/auth/sign-in" });
		} else if (
			context.auth.user &&
			context.auth.user.site_id &&
			context.auth.user.site_id != null &&
			context.auth.user.site_id != ""
		) {
			console.log("Found site_id");
			throw redirect({
				to: "/dashboard/s/$site",
				params: { site: context.auth.user.site_id! },
			});
		} else {
			throw redirect({ to: "/admin" });
		}
	},
	component: App,
});

function App() {
	return <></>;
}
