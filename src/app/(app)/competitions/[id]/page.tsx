

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCompetitionById, getTeamsForCoach, getUserById, registerTeamForCompetition } from "@/lib/firestore";
import { Calendar, Users, ArrowLeft, Loader2, PlusCircle } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Competition {
  id: string;
  name: string;
  description: string;
  date: Date;
  status: string;
  registeredTeams: any[];
}

interface Team {
  id: string;
  name: string;
  coachName: string;
}

interface UserProfile {
  role?: string;
  uid?: string;
}

export default function CompetitionDetailPage() {
  const params = useParams<{ id: string }>();
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isCoach, setIsCoach] = useState(false);
  const [coachTeams, setCoachTeams] = useState<Team[]>([]);
  const { toast } = useToast();

  const fetchCompetitionData = async (id: string) => {
      setLoading(true);
      const comp = await getCompetitionById(id);
      setCompetition(comp);
      setLoading(false);
  }

  useEffect(() => {
    const id = params.id as string;
    if (!id) return;

    fetchCompetitionData(id);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if(currentUser) {
            const profile = await getUserById(currentUser.uid);
            setUserProfile({ ...profile, uid: currentUser.uid } as UserProfile);
            const coachStatus = profile?.role === 'Coach';
            setIsCoach(coachStatus);
            if (coachStatus) {
                const teams = await getTeamsForCoach(currentUser.uid);
                setCoachTeams(teams as Team[]);
            }
        } else {
            setUserProfile(null);
            setIsCoach(false);
        }
    });

    return () => unsubscribe();
  }, [params.id]);


  if (loading) {
    return (
        <main className="flex-1 p-4 md:p-6 lg:p-8 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
    );
  }

  if (!competition) {
    return (
        <main className="flex-1 p-4 md:p-6 lg:p-8 text-center">
            <h1 className="text-2xl font-bold">Competition Not Found</h1>
            <p className="text-muted-foreground">The competition you are looking for does not exist.</p>
            <Button asChild className="mt-4">
                <Link href="/competitions">Back to all competitions</Link>
            </Button>
        </main>
    );
  }

  const isRegisterable = competition.status !== 'Completed';

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <Button variant="outline" asChild>
          <Link href="/competitions"><ArrowLeft className="mr-2 h-4 w-4" />Back to all competitions</Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <Badge variant={competition.status === 'Completed' ? 'secondary' : 'default'} className="w-fit mb-2">
                            {competition.status}
                        </Badge>
                         <div className="flex items-center text-muted-foreground text-sm">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>{format(new Date(competition.date), "PPP")}</span>
                        </div>
                    </div>
                    <CardTitle className="text-4xl font-headline tracking-tight">{competition.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-lg text-muted-foreground">{competition.description}</p>
                    
                    <div className="mt-8 prose prose-p:text-muted-foreground max-w-none">
                        <h3 className="text-xl font-semibold mb-4 text-foreground">About this Competition</h3>
                        <p>Placeholder text for more detailed information about the competition's theme, objectives, and the challenges participants will face. This section can be expanded with rich text, images, and videos.</p>
                         <p>Further details will elaborate on the specific tasks, scoring mechanisms, and unique constraints that define this year's challenge, ensuring all teams have a clear understanding of what is required to succeed.</p>
                    </div>

                     <div className="mt-8 prose prose-p:text-muted-foreground max-w-none">
                        <h3 className="text-xl font-semibold mb-4 text-foreground">Rules &amp; Regulations</h3>
                        <p>Placeholder for the official rulebook. This might include robot specifications, game rules, scoring details, and eligibility requirements. A downloadable PDF could be linked here for comprehensive guidelines.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1 space-y-6 sticky top-24">
            <Card>
                <CardHeader>
                    <CardTitle>Competition Registration</CardTitle>
                </CardHeader>
                <CardContent>
                    {isRegisterable ? (
                        isCoach ? (
                            <>
                                <p className="mb-4 text-muted-foreground text-sm">To enter this competition, please register one of your existing teams below.</p>
                                <TeamRegistrationDialog 
                                    competition={competition}
                                    coachTeams={coachTeams}
                                    onRegistrationSuccess={() => fetchCompetitionData(params.id as string)}
                                />
                            </>
                        ) : (
                             <p className="mb-4 text-muted-foreground text-sm">Only a team's coach can register them for a competition.</p>
                        )
                    ) : (
                         <p className="text-muted-foreground text-sm">Registration for this event has closed.</p>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center text-xl"><Users className="mr-2 h-5 w-5 text-primary"/>Registered Teams</CardTitle>
                </CardHeader>
                <CardContent>
                     {competition.registeredTeams.length > 0 ? (
                        <ul className="space-y-2">
                           {competition.registeredTeams.map(team => (
                               <li key={team.id} className="text-sm">
                                   <p className="font-semibold">{team.teamName}</p>
                                   <p className="text-xs text-muted-foreground">Coached by {team.coachName}</p>
                               </li>
                           ))}
                        </ul>
                    ) : (
                        <p className="text-muted-foreground text-sm">No teams have been approved for this competition yet.</p>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </main>
  );
}


function TeamRegistrationDialog({ competition, coachTeams, onRegistrationSuccess }: { competition: Competition, coachTeams: Team[], onRegistrationSuccess: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedTeamId, setSelectedTeamId] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    // Filter out teams that are already registered or pending
    const availableTeams = coachTeams.filter(ct => !competition.registeredTeams.some(rt => rt.id === ct.id));

    const handleSubmit = async () => {
        if (!selectedTeamId) {
            toast({ variant: "destructive", title: "Please select a team." });
            return;
        }
        setIsSubmitting(true);
        try {
            const selectedTeam = coachTeams.find(t => t.id === selectedTeamId);
            if (!selectedTeam) throw new Error("Selected team not found.");

            await registerTeamForCompetition(competition.id, selectedTeam);
            toast({ title: "Registration Submitted!", description: `${selectedTeam.name} is now pending approval.` });
            setIsOpen(false);
            onRegistrationSuccess();
        } catch (error: any) {
            toast({ variant: "destructive", title: "Registration Failed", description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    }


    return (
         <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="w-full" disabled={!isRegisterable}><PlusCircle />Register a Team</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Register a Team for {competition.name}</DialogTitle>
                    <DialogDescription>Select one of your teams to register for this competition.</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    {availableTeams.length > 0 ? (
                        <div className="space-y-2">
                             <Label htmlFor="team-select">Select a team</Label>
                             <Select onValueChange={setSelectedTeamId} disabled={isSubmitting}>
                                <SelectTrigger id="team-select">
                                    <SelectValue placeholder="Choose a team..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableTeams.map(team => (
                                        <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    ) : (
                        <p className="text-sm text-center text-muted-foreground py-4">All of your teams are already registered for this competition.</p>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || !selectedTeamId || availableTeams.length === 0}>
                        {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
                        Submit for Approval
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
