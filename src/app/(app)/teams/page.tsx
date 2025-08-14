

"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, PlusCircle, Users } from "lucide-react";
import { getTeams, getSchools, getCoaches, getUserById } from "@/lib/firestore";
import Link from "next/link";
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CreateTeamForm } from './CreateTeamForm';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

interface Team {
    id: string;
    name: string;
    schoolName: string;
    coachName: string;
    schoolId: string;
    coachId: string;
}

interface School {
    id: string;
    name: string;
}

interface Coach {
    id: string;
    name: string;
    school: string;
}

interface UserProfile {
    uid: string;
    role?: string;
    schoolId?: string;
    school?: string;
    name?: string;
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [teamsData, schoolsData, coachesData] = await Promise.all([
        getTeams(),
        getSchools(),
        getCoaches()
    ]);
    setTeams(teamsData as Team[]);
    setSchools(schoolsData as School[]);
    setCoaches(coachesData as Coach[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
            const profile = await getUserById(currentUser.uid);
            setUserProfile({ ...profile, uid: currentUser.uid } as UserProfile);
        } else {
            setUserProfile(null);
        }
    });
    return () => unsubscribe();
  }, [fetchData]);

  const filteredTeams = useMemo(() => {
    return teams.filter(team =>
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.coachName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, teams]);

  const canCreateTeam = userProfile?.role === 'Admin' || userProfile?.role === 'Coach';

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col items-center justify-center gap-4 mb-8 text-center">
          <h1 className="text-3xl font-bold font-headline">Teams Directory</h1>
          <p className="text-muted-foreground">Find and manage all the teams in the academy.</p>
      </div>

       <div className="mb-6 flex justify-between items-center gap-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search teams..." 
            className="pl-8" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {canCreateTeam && userProfile && (
             <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogTrigger asChild>
                    <Button><PlusCircle/> Register New Team</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Register a New Team</DialogTitle>
                        <DialogDescription>Fill out the details to add a new team to the academy.</DialogDescription>
                    </DialogHeader>
                    <CreateTeamForm 
                        onTeamCreated={fetchData}
                        onFinished={() => setIsFormOpen(false)}
                        schools={schools}
                        coaches={coaches}
                        userProfile={userProfile}
                    />
                </DialogContent>
             </Dialog>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team Name</TableHead>
                <TableHead>School</TableHead>
                <TableHead>Coach</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-24" /></TableCell>
                    </TableRow>
                ))
              ) : filteredTeams.length > 0 ? (
                filteredTeams.map((team) => (
                    <TableRow key={team.id}>
                        <TableCell className="font-medium">{team.name}</TableCell>
                        <TableCell>
                            <Link href={`/schools/${team.schoolId}`} className="hover:underline">{team.schoolName}</Link>
                        </TableCell>
                        <TableCell>
                            <Link href={`/coaches/${team.coachId}`} className="hover:underline">{team.coachName}</Link>
                        </TableCell>
                        <TableCell className="text-right">
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/teams/${team.id}`}>View Team</Link>
                            </Button>
                        </TableCell>
                    </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No teams found. {canCreateTeam && "Register one to get started!"}
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
