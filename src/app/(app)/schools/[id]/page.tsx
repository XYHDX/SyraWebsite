
"use client";

import { useEffect, useState } from "react";
import { getSchoolById, getUserById, getCoachesBySchool, getTeamsBySchool } from "@/lib/firestore";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, User, MapPin, ArrowLeft, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { EditSchoolButton } from "./EditSchoolButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface School {
    id: string;
    name: string;
    location: string;
    teams: number;
    coach: string;
    about?: string;
    adminId?: string;
}

interface Coach {
    id: string;
    name: string;
    avatar: string;
}

interface Team {
    id: string;
    name: string;
}

interface UserProfile {
  role?: string;
  schoolId?: string;
}

export default function SchoolProfilePage() {
  const params = useParams<{ id: string }>();
  const [school, setSchool] = useState<School | null>(null);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isSchoolAdmin, setIsSchoolAdmin] = useState(false);

  const fetchSchoolData = async () => {
      const id = params.id as string;
      if (!id) return;
      
      try {
        setLoading(true);
        const schoolData = await getSchoolById(id);
        if (schoolData) {
          setSchool(schoolData as School);
          const [coachData, teamData] = await Promise.all([
             getCoachesBySchool(schoolData.name),
             getTeamsBySchool(id)
          ]);
          setCoaches(coachData as Coach[]);
          setTeams(teamData as Team[]);
        } else {
          setError("School not found.");
        }
      } catch (err) {
        setError("Failed to load school profile.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchSchoolData();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if(currentUser) {
            const profile = await getUserById(currentUser.uid) as UserProfile;
            setUserProfile(profile);
            setIsSchoolAdmin(profile?.role === 'School Admin' && profile?.schoolId === params.id);
        } else {
            setUserProfile(null);
            setIsSchoolAdmin(false);
        }
    });

    return () => unsubscribe();

  }, [params.id]);


  if (loading) {
    return (
        <main className="flex-1 p-4 md:p-6 lg:p-8 flex items-center justify-center">
             <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
    )
  }

  if (error) {
     return <main className="flex-1 p-8 text-center text-destructive">{error}</main>;
  }

  if (!school) {
    return <main className="flex-1 p-8 text-center text-muted-foreground">School not found.</main>;
  }

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-8">
        <Button variant="outline" asChild>
          <Link href="/schools"><ArrowLeft className="mr-2 h-4 w-4" />Back to Schools</Link>
        </Button>
        {isSchoolAdmin && school && (
            <EditSchoolButton school={school} onSchoolUpdated={fetchSchoolData} />
        )}
      </div>
      
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle className="text-4xl font-headline">{school.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 pt-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" /> {school.location}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary"/>
                            <div>
                                <p className="font-semibold">{teams.length} Teams</p>
                                <p className="text-muted-foreground">Actively Competing</p>
                            </div>
                        </div>
                         <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-primary"/>
                             <div>
                                <p className="font-semibold">{coaches.length} Coaches</p>
                                <p className="text-muted-foreground">Mentoring students</p>
                            </div>
                        </div>
                    </div>
                     <div className="mt-8">
                        <h3 className="text-xl font-semibold mb-4">About the School</h3>
                        <p className="text-muted-foreground whitespace-pre-wrap">
                          {school.about || "Information about the school's robotics program, history, and philosophy will be displayed here."}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
         <div className="lg:col-span-1 space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle>Coaches</CardTitle>
                </CardHeader>
                <CardContent>
                   {coaches.length > 0 ? (
                    <ul className="space-y-4">
                        {coaches.map(coach => (
                            <li key={coach.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={coach.avatar} />
                                        <AvatarFallback>{coach.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">{coach.name}</span>
                                </div>
                                <Button size="sm" variant="outline" asChild>
                                    <Link href={`/coaches/${coach.id}`}>View</Link>
                                </Button>
                            </li>
                        ))}
                    </ul>
                   ) : (
                    <p className="text-muted-foreground text-sm text-center py-4">No coaches are currently assigned to this school.</p>
                   )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Registered Teams</CardTitle>
                </CardHeader>
                <CardContent>
                   {teams.length > 0 ? (
                       <ul className="space-y-3">
                           {teams.map(team => (
                               <li key={team.id} className="flex items-center justify-between">
                                   <span className="font-medium">{team.name}</span>
                                   <Button size="sm" variant="outline" asChild>
                                       <Link href={`/teams/${team.id}`}>View</Link>
                                   </Button>
                               </li>
                           ))}
                       </ul>
                   ) : (
                    <p className="text-muted-foreground text-sm text-center py-4">No teams have been registered for this school yet.</p>
                   )}
                </CardContent>
            </Card>
        </div>
      </div>
    </main>
  );
}
