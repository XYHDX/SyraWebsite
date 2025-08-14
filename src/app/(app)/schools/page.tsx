

"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { getSchools } from "@/lib/firestore";
import Link from "next/link";
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface School {
    id: string;
    name: string;
    location: string;
    teams: number;
    coaches: { id: string; name: string }[];
}

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchSchools = async () => {
        setLoading(true);
        const schoolsData = await getSchools();
        setSchools(schoolsData as School[]);
        setFilteredSchools(schoolsData as School[]);
        setLoading(false);
    };
    fetchSchools();
  }, []);

  useEffect(() => {
    const results = schools.filter(school =>
        school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSchools(results);
  }, [searchTerm, schools]);

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold font-headline">Schools</h1>
        <p className="text-muted-foreground">Directory of all schools participating in the academy.</p>
      </div>
       <div className="mb-6 mx-auto max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Search by school name or location..." 
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
                <TableHead>School Name</TableHead>
                <TableHead className="hidden sm:table-cell">Location</TableHead>
                <TableHead className="hidden md:table-cell">Teams</TableHead>
                <TableHead className="hidden md:table-cell">Coaches</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                        <TableCell className="hidden sm:table-cell"><Skeleton className="h-6 w-32" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-6 w-16" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-6 w-24" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-24" /></TableCell>
                    </TableRow>
                ))
              ) : (
                filteredSchools.map((school) => (
                    <TableRow key={school.id}>
                    <TableCell className="font-medium">{school.name}</TableCell>
                    <TableCell className="hidden sm:table-cell">{school.location}</TableCell>
                    <TableCell className="hidden md:table-cell">{school.teams}</TableCell>
                    <TableCell className="hidden md:table-cell">
                         {school.coaches.length > 0 ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">{school.coaches.length} coach(es)</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    {school.coaches.map(c => (
                                        <DropdownMenuItem key={c.id} asChild>
                                            <Link href={`/coaches/${c.id}`}>{c.name}</Link>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <span className="text-muted-foreground">Not Assigned</span>
                        )}
                    </TableCell>
                    <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                        <Link href={`/schools/${school.id}`}>View Profile</Link>
                        </Button>
                    </TableCell>
                    </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
