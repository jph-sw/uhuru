import {
	ArrowRightIcon,
	EnvelopeIcon,
	GearIcon,
	TextboxIcon,
	UsersIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { fieldQueryOptions } from "#/data/query-options-fields";
import { inviteQueryOptions } from "#/data/query-options-invites";
import { siteByIdQueryOptions } from "#/data/query-options-site";
import { usersQueryOptions } from "#/data/query-options-users";

export const Route = createFileRoute(
	"/_authenticated/_admin/admin/site/$site/",
)({
	component: RouteComponent,
});

interface SiteData {
	id: string;
	name: string;
	domain: string;
	languages?: string[];
}

interface InviteData {
	id: string;
	usedAt: string | null;
}

interface FieldData {
	id: string;
	key: string;
}

interface UserData {
	id: string;
}

function RouteComponent() {
	const { site } = Route.useParams();

	const { data: siteData } = useQuery(siteByIdQueryOptions({ siteId: site }));
	const { data: users } = useQuery(usersQueryOptions({ siteId: site }));
	const { data: invites } = useQuery(inviteQueryOptions({ siteId: site }));
	const { data: fields } = useQuery(fieldQueryOptions({ siteId: site }));

	const typedSiteData = siteData as SiteData | undefined;
	const typedUsers = users as UserData[] | undefined;
	const typedInvites = invites as InviteData[] | undefined;
	const typedFields = fields as FieldData[] | undefined;

	const activeInvitesCount =
		typedInvites?.filter((i) => i.usedAt === null).length || 0;
	const uniqueFieldsCount = new Set((typedFields || []).map((f) => f.key)).size;

	return (
		<div className="flex justify-center pt-8">
			<div className="w-7xl flex flex-col gap-8">
				<div>
					<h1 className="text-3xl font-bold">
						{typedSiteData?.name || "Loading..."}
					</h1>
					<p className="text-muted-foreground mt-1">
						{typedSiteData?.domain || "No domain configured"}
					</p>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Users
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{typedUsers?.length || 0}
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Active Invites
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{activeInvitesCount}</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Fields
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{uniqueFieldsCount}</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Languages
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{typedSiteData?.languages?.length || 1}
							</div>
						</CardContent>
					</Card>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Link
						to="/admin/site/$site/users"
						params={{ site }}
						className="no-underline"
					>
						<Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
							<CardHeader>
								<CardTitle className="flex items-center justify-between">
									<span className="flex items-center gap-2">
										<UsersIcon className="w-5 h-5" />
										Users
									</span>
									<ArrowRightIcon className="w-5 h-5" />
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground">
									Manage site users and their access
								</p>
								<div className="mt-3 text-xs text-muted-foreground">
									{typedUsers?.length || 0} active users
								</div>
							</CardContent>
						</Card>
					</Link>
					<Link
						to="/admin/site/$site/invites"
						params={{ site }}
						className="no-underline"
					>
						<Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
							<CardHeader>
								<CardTitle className="flex items-center justify-between">
									<span className="flex items-center gap-2">
										<EnvelopeIcon className="w-5 h-5" />
										Invites
									</span>
									<ArrowRightIcon className="w-5 h-5" />
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground">
									Create and manage user invitations
								</p>
								<div className="mt-3 text-xs text-muted-foreground">
									{activeInvitesCount} pending
								</div>
							</CardContent>
						</Card>
					</Link>
					<Link
						to="/admin/site/$site/fields"
						params={{ site }}
						className="no-underline"
					>
						<Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
							<CardHeader>
								<CardTitle className="flex items-center justify-between">
									<span className="flex items-center gap-2">
										<TextboxIcon className="w-5 h-5" />
										Fields
									</span>
									<ArrowRightIcon className="w-5 h-5" />
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground">
									Manage custom fields and content
								</p>
								<div className="mt-3 text-xs text-muted-foreground">
									{uniqueFieldsCount} fields
								</div>
							</CardContent>
						</Card>
					</Link>
					<Link
						to="/admin/site/$site/settings"
						params={{ site }}
						className="no-underline"
					>
						<Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
							<CardHeader>
								<CardTitle className="flex items-center justify-between">
									<span className="flex items-center gap-2">
										<GearIcon className="w-5 h-5" />
										Settings
									</span>
									<ArrowRightIcon className="w-5 h-5" />
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground">
									Configure site details and preferences
								</p>
								<div className="mt-3 text-xs text-muted-foreground">
									{typedSiteData?.languages?.join(", ") || "en"}
								</div>
							</CardContent>
						</Card>
					</Link>
				</div>
			</div>
		</div>
	);
}
