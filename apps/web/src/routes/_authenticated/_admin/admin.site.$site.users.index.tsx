import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { UsersTable } from "#/components/admin/users-table";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { usersQueryOptions } from "#/data/query-options-users";

export const Route = createFileRoute(
	"/_authenticated/_admin/admin/site/$site/users/",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { site } = Route.useParams();

	const { data: users } = useQuery(usersQueryOptions({ siteId: site }));

	return (
		<div className="flex justify-center pt-15">
			<Card className="w-7xl">
				<CardHeader>
					<CardTitle>Users</CardTitle>
				</CardHeader>
				<CardContent>
					<UsersTable users={users} />
				</CardContent>
			</Card>
		</div>
	);
}
