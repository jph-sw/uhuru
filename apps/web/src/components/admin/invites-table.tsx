import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function InvitesTable({
  invites,
}: {
  invites:
    | {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        siteId: string;
        code: string;
        maxUses: string;
      }[]
    | undefined;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-25">Id</TableHead>
          <TableHead>Site id</TableHead>
          <TableHead>Max uses</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invites &&
          invites.map((invite) => (
            <TableRow>
              <TableCell className="font-medium">{invite.id}</TableCell>
              <TableCell>{invite.siteId}</TableCell>
              <TableCell>{invite.maxUses}</TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}
