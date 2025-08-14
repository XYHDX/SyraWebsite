

"use client";

import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

interface Competition {
  id: string;
  name: string;
  date: string;
  status: string;
}

export function CompetitionTableRow({ competition }: { competition: Competition }) {

  return (
    <TableRow key={competition.id}>
      <TableCell className="font-medium">{competition.name}</TableCell>
      <TableCell>{competition.date}</TableCell>
      <TableCell>
        <Badge variant={competition.status === 'Completed' ? 'secondary' : 'default'}>
          {competition.status}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/competitions/${competition.id}`}>View Details</Link>
        </Button>
      </TableCell>
    </TableRow>
  );
}

export function CompetitionTableSkeletonRow() {
    return (
        <TableRow>
            <TableCell><Skeleton className="h-6 w-48" /></TableCell>
            <TableCell><Skeleton className="h-6 w-24" /></TableCell>
            <TableCell><Skeleton className="h-6 w-20" /></TableCell>
            <TableCell className="text-right">
                <Skeleton className="h-8 w-28 inline-block" />
            </TableCell>
        </TableRow>
    )
}

    
