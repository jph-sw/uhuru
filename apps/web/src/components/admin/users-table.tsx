import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export function UsersTable({
	users,
}: {
	users:
		| {
				id: string;
				name: string;
				email: string;
				emailVerified: boolean;
				image: string | null;
				createdAt: Date;
				updatedAt: Date;
				role: string | null;
				banned: boolean | null;
				banReason: string | null;
				banExpires: Date | null;
				site_id: string | null;
		  }[]
		| undefined;
}) {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead className="w-25">Name</TableHead>
					<TableHead>Email</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{users ? (
					users.map((user) => (
						<TableRow key={user.id}>
							<TableCell className="font-medium">{user.name}</TableCell>
							<TableCell>{user.email}</TableCell>
						</TableRow>
					))
				) : (
					<span>No users</span>
				)}
			</TableBody>
		</Table>
	);
}
