import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { usersQueryOptions } from "#/data/query-options-users";
import { UsersTable } from "#/components/admin/users-table";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";

export const Route = createFileRoute(
  "/_authenticated/_admin/admin/site/$site/users/",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { site } = Route.useParams();

  const { data: users } = useQuery(usersQueryOptions({ siteId: site }));

  return (
    <div>
      <Card className="w-5xl">
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
