
"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { PlusCircle } from "lucide-react";
import { getCompetitions, getUserById } from "@/lib/firestore";
import { CompetitionTableRow, CompetitionTableSkeletonRow } from "./CompetitionTableRow";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useCallback } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

interface Competition {
  id: string;
  name: string;
  date: string;
  status: string;
}

interface UserProfile {
  role?: string;
}

function CompetitionsPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const fetchComps = useCallback(async () => {
    setLoading(true);
    const comps = await getCompetitions();
    setCompetitions(comps as any);
    setLoading(false);
  }, []);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const profile = await getUserById(currentUser.uid);
        setUserProfile(profile as UserProfile);
      }
    });
    fetchComps();
    return () => unsubscribe();
  }, [fetchComps]);
  
  const isAdmin = userProfile?.role === 'Admin';


  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold font-headline tracking-tight">Competitions</h1>
          <p className="text-muted-foreground">Explore and register for upcoming robotics events.</p>
      </div>

       {isAdmin && (
            <div className="mb-8 flex justify-center sm:justify-end">
                <Button asChild>
                    <Link href="/admin?tab=competitions"><PlusCircle className="mr-2 h-4 w-4" /> Announce New Competition</Link>
                </Button>
            </div>
        )}

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Competition Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({length: 3}).map((_, i) => <CompetitionTableSkeletonRow key={i} />)
              ) : competitions.length > 0 ? (
                  competitions.map((comp) => (
                    <CompetitionTableRow key={comp.id} competition={comp} />
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No competitions have been announced yet. Check back soon!
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

export default CompetitionsPage;
