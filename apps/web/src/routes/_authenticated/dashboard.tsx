import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="h-screen w-full flex justify-center items-center">
      <Card className="min-w-4xl">
        <CardContent className="text-center flex flex-col items-center gap-2">
          <span className="text-2xl">HIER IST NOCH NICHTS</span>
          <Button className={"w-24"} render={<Link to="/admin">Admin</Link>} />
        </CardContent>
      </Card>
    </div>
  );
}
