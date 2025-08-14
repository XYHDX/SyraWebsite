

"use client";

import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCoaches } from "@/lib/firestore";
import Link from "next/link";
import { Skeleton } from '@/components/ui/skeleton';

interface Coach {
    id: string;
    name: string;
    school: string;
    expertise: string;
    avatar: string;
}

export default function CoachesPage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchCoaches = async () => {
      setLoading(true);
      const coachesData = await getCoaches();
      setCoaches(coachesData as Coach[]);
      setLoading(false);
    };
    fetchCoaches();
  }, []);

  const filteredCoaches = useMemo(() => {
    return coaches.filter(coach =>
      coach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coach.school.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coach.expertise.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, coaches]);


  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col items-center justify-center gap-4 mb-8 text-center">
          <h1 className="text-3xl font-bold font-headline">Coaches</h1>
          <p className="text-muted-foreground">Find experienced mentors to guide your teams.</p>
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search coaches..." 
            className="pl-8" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Coach</TableHead>
                <TableHead className="hidden sm:table-cell">Affiliated School</TableHead>
                <TableHead className="hidden md:table-cell">Expertise</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                        <TableCell className="hidden sm:table-cell"><Skeleton className="h-6 w-32" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-6 w-40" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-24" /></TableCell>
                    </TableRow>
                ))
              ) : filteredCoaches.length > 0 ? (
                filteredCoaches.map((coach) => (
                    <TableRow key={coach.id}>
                    <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={coach.avatar} />
                            <AvatarFallback>{coach.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="truncate">{coach.name}</span>
                        </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{coach.school}</TableCell>
                    <TableCell className="hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                        {coach.expertise && coach.expertise.split(', ').map(exp => <Badge key={exp} variant="secondary">{exp}</Badge>)}
                        </div>
                    </TableCell>
                    <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                        <Link href={`/coaches/${coach.id}`}>View Profile</Link>
                        </Button>
                    </TableCell>
                    </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No coaches found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
