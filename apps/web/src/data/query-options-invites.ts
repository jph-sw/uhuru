import { queryOptions } from "@tanstack/react-query";
import { api } from "#/lib/api";

export const inviteQueryOptions = ({ siteId }: { siteId: string }) =>
	queryOptions({
		queryKey: ["invites", siteId],
		queryFn: async () => {
			const res = await api.invite.site({ siteId }).get();
			if (res.error) throw res.error;
			return res.data;
		},
	});
