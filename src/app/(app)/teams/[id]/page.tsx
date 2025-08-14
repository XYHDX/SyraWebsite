

"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, School, User, Users, Loader2, PlusCircle } from "lucide-react";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { getStudentsBySchool, addMembersToTeam, getTeamMembers } from "@/lib/firestore";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


interface Team {
  name: string;
  schoolName: string;
  schoolId: string;
  coachName: string;
  coachId: string;
  members: string[]; // Array of user IDs
}

interface Student {
    id: string;
    name: string;
    email: string;
}

interface TeamMember {
    id: string;
    name: string;
    avatarUrl?: string;
}

export default function TeamProfilePage() {
  const params = useParams<{ id: string }>();
  const [team, setTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isCoachOfTeam, setIsCoachOfTeam] = useState(false);

   const fetchTeamData = async () => {
      const id = params.id as string;
      if (!id) return;

      try {
        setLoading(true);
        const teamDocRef = doc(db, "teams", id);
        const teamDoc = await getDoc(teamDocRef);

        if (teamDoc.exists()) {
          const teamData = teamDoc.data() as Team;
          setTeam(teamData);
          setIsCoachOfTeam(auth.currentUser?.uid === teamData.coachId);
          if (teamData.members && teamData.members.length > 0) {
              const membersData = await getTeamMembers(teamData.members);
              setTeamMembers(membersData as TeamMember[]);
          } else {
              setTeamMembers([]);
          }
        } else {
          setError("Team not found.");
        }
      } catch (err) {
        setError("Failed to load team profile.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };


  useEffect(() => {
    fetchTeamData();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
        if (team) {
            setIsCoachOfTeam(user?.uid === team.coachId);
        }
    });
    return () => unsubscribe();
  }, [params.id, team?.coachId]);


  if (loading) {
    return (
      <main className="flex-1 p-8">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-10 w-3/4 mb-2" />
                <Skeleton className="h-5 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1 space-y-6">
            <Card><CardHeader><Skeleton className="h-6 w-2/3" /></CardHeader><CardContent><Skeleton className="h-16 w-full" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-6 w-2/3" /></CardHeader><CardContent><Skeleton className="h-16 w-full" /></CardContent></Card>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return <main className="flex-1 p-8 text-center text-destructive">{error}</main>;
  }

  if (!team) {
    return <main className="flex-1 p-8 text-center text-muted-foreground">Team not found.</main>;
  }

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <Button variant="outline" asChild>
          <Link href="/teams"><ArrowLeft className="mr-2 h-4 w-4" />Back to Teams</Link>
        </Button>
      </div>
      
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-4xl font-headline">{team.name}</CardTitle>
              <CardDescription className="flex items-center gap-2 pt-2 text-muted-foreground">
                <School className="h-4 w-4" /> 
                Part of <Link href={`/schools/${team.schoolId}`} className="hover:underline font-semibold">{team.schoolName}</Link>
              </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-4">About the Team</h3>
                    <p className="text-muted-foreground">
                        A detailed description of the team, their goals, achievements, and current projects will be displayed here. This section can be edited by the team's coach.
                    </p>
                </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><User className="mr-2 h-5 w-5 text-primary" />Coach</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <p className="font-semibold">{team.coachName}</p>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/coaches/${team.coachId}`}>View Profile</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle className="flex items-center"><Users className="mr-2 h-5 w-5 text-primary" />Team Members</CardTitle>
               {isCoachOfTeam && (
                    <AddMembersDialog 
                        teamId={params.id as string} 
                        teamName={team.name}
                        schoolName={team.schoolName}
                        currentMemberIds={teamMembers.map(m => m.id)}
                        onMembersAdded={fetchTeamData} 
                    />
                )}
            </CardHeader>
            <CardContent>
              {teamMembers.length > 0 ? (
                <ul className="space-y-3">
                  {teamMembers.map(member => (
                    <li key={member.id} className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={member.avatarUrl} />
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{member.name}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-4">No members have joined yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}


function AddMembersDialog({ teamId, teamName, schoolName, currentMemberIds, onMembersAdded }: { teamId: string, teamName: string, schoolName: string, currentMemberIds: string[], onMembersAdded: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (isOpen) {
            const fetchStudents = async () => {
                setLoading(true);
                const studentData = await getStudentsBySchool(schoolName);
                // Filter out students who are already members
                const availableStudents = studentData.filter(s => !currentMemberIds.includes(s.id));
                setStudents(availableStudents as Student[]);
                setLoading(false);
            };
            fetchStudents();
        }
    }, [isOpen, schoolName, currentMemberIds]);

    const handleSelectStudent = (studentId: string, checked: boolean) => {
        setSelectedStudents(prev => 
            checked ? [...prev, studentId] : prev.filter(id => id !== studentId)
        );
    };

    const handleSubmit = async () => {
        if (selectedStudents.length === 0) {
            toast({ variant: "destructive", title: "No students selected" });
            return;
        }
        setIsSubmitting(true);
        try {
            await addMembersToTeam(teamId, selectedStudents);
            toast({ title: "Members Added!", description: "The new members have been added to the team." });
            onMembersAdded();
            setIsOpen(false);
            setSelectedStudents([]);
        } catch (error: any) {
            toast({ variant: "destructive", title: "Failed to Add Members", description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm"><PlusCircle /> Add</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Members to {teamName}</DialogTitle>
                    <DialogDescription>Select students from {schoolName} to add to the team.</DialogDescription>
                </DialogHeader>
                <div className="py-4 max-h-[60vh] overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center items-center h-24">
                            <Loader2 className="animate-spin text-primary" />
                            <p className="ml-2">Loading students...</p>
                        </div>
                    ) : students.length > 0 ? (
                        <div className="space-y-3">
                            {students.map(student => (
                                <div key={student.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted">
                                    <Checkbox
                                        id={`student-${student.id}`}
                                        onCheckedChange={(checked) => handleSelectStudent(student.id, !!checked)}
                                        checked={selectedStudents.includes(student.id)}
                                    />
                                    <label
                                        htmlFor={`student-${student.id}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1"
                                    >
                                        {student.name} <span className="text-muted-foreground">({student.email})</span>
                                    </label>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground py-8">No available students found in this school.</p>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || selectedStudents.length === 0}>
                        {isSubmitting ? <Loader2 className="animate-spin" /> : `Add ${selectedStudents.length} Member(s)`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
