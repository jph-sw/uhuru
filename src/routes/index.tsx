import { createFileRoute } from "@tanstack/react-router";
import { getTreaty } from "./api/$";

export const Route = createFileRoute("/")({
	component: App,
	loader: () =>
		getTreaty()
			.get()
			.then((res) => res.data),
});

function App() {
	const data = Route.useLoaderData();

	return <main className="page-wrap px-4 pb-8 pt-14">{data}</main>;
}
