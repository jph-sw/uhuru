import type { User } from "better-auth";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export function UsersTable({ users }: { users: User[] | undefined }) {
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
