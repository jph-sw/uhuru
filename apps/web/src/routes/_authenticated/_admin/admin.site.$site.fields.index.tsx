import { fieldQueryOptions } from "#/data/query-options-fields";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_authenticated/_admin/admin/site/$site/fields/",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { site } = Route.useParams();

  const { data } = useQuery(fieldQueryOptions({ siteId: site }));

  return <div></div>;
}
