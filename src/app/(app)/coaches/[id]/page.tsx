
"use client";

import { useEffect, useState } from "react";
import { getCoachById, updateCoachProfile } from "@/lib/firestore";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ArrowLeft, School, Users, Edit, Save, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


interface CoachProfile {
    name: string;
    school: string;
    schoolId?: string;
    expertise: string;
    avatar: string;
    about: string;
}

export default function CoachProfilePage() {
  const params = useParams<{ id: string }>();
  const [coach, setCoach] = useState<CoachProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [about, setAbout] = useState('');
  const [expertise, setExpertise] = useState('');
  const { toast } = useToast();
  
  useEffect(() => {
    const id = params.id as string;
    if (!id) return;

    const fetchCoach = async () => {
      try {
        setLoading(true);
        const coachData = await getCoachById(id);
        
        if (coachData) {
            setCoach(coachData as CoachProfile);
            setAbout(coachData.about);
            setExpertise(coachData.expertise);
        } else {
            setError("Coach not found.");
        }
      } catch (err) {
        setError("Failed to load profile data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCoach();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
        setIsOwnProfile(user?.uid === id);
    });

    return () => unsubscribe();

  }, [params.id]);

  const handleSave = async () => {
    if (!coach) return;
    setIsSaving(true);
    try {
        await updateCoachProfile(params.id as string, { about, expertise });
        setCoach(prev => prev ? {...prev, about, expertise} : null);
        setIsEditing(false);
        toast({ title: "Profile Updated", description: "Your changes have been saved."});
    } catch(err: any) {
        toast({ variant: "destructive", title: "Update Failed", description: err.message });
    } finally {
        setIsSaving(false);
    }
  }


  if (loading) {
    return (
        <main className="flex-1 p-4 md:p-6 lg:p-8">
             <div className="mb-8">
                <Skeleton className="h-10 w-48" />
            </div>
             <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-1">
                    <Card>
                        <CardContent className="pt-6 flex flex-col items-center text-center">
                            <Skeleton className="h-32 w-32 rounded-full mb-4" />
                            <Skeleton className="h-8 w-40 mb-2" />
                            <Skeleton className="h-5 w-32" />
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-5/6" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    )
  }

  if (error) {
     return <main className="flex-1 p-8 text-center text-destructive">{error}</main>;
  }

  if (!coach) {
    return <main className="flex-1 p-8 text-center text-muted-foreground">Coach not found.</main>;
  }

  const SchoolLink = coach.schoolId
    ? ({ children }: { children: React.ReactNode }) => <Link href={`/schools/${coach.schoolId}`} className="hover:underline">{children}</Link>
    : ({ children }: { children: React.ReactNode }) => <>{children}</>;

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-8">
        <Button variant="outline" asChild>
          <Link href="/coaches"><ArrowLeft className="mr-2 h-4 w-4" />Back to Coaches</Link>
        </Button>
        {isOwnProfile && !isEditing && (
            <Button onClick={() => setIsEditing(true)}><Edit className="mr-2 h-4 w-4"/>Edit Profile</Button>
        )}
      </div>
      
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
             <Card>
                <CardContent className="pt-6 flex flex-col items-center text-center">
                    <Avatar className="h-32 w-32 mb-4">
                        <AvatarImage src={coach.avatar} />
                        <AvatarFallback>{coach.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-2xl font-headline">{coach.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-2">
                        <School className="h-4 w-4" />
                        <SchoolLink>{coach.school}</SchoolLink>
                    </CardDescription>
                     <div className="flex flex-wrap justify-center gap-2 mt-4">
                        {isEditing ? (
                             <div className="w-full px-4 pt-2 text-left">
                                <Label htmlFor="expertise">Expertise (comma-separated)</Label>
                                <Input id="expertise" value={expertise} onChange={e => setExpertise(e.target.value)} placeholder="e.g., VEX, Arduino, Python"/>
                            </div>
                        ) : (
                             coach.expertise && coach.expertise.split(',').map(exp => (
                                exp.trim() && <Badge key={exp} variant="secondary">{exp.trim()}</Badge>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>About {coach.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    {isEditing ? (
                        <div className="space-y-2">
                            <Label htmlFor="about">About Section</Label>
                            <Textarea 
                                id="about"
                                value={about}
                                onChange={(e) => setAbout(e.target.value)}
                                rows={10}
                                placeholder="Write a short biography..."
                            />
                        </div>
                    ) : (
                       <p className="text-muted-foreground whitespace-pre-wrap">{coach.about || `Detailed biography for ${coach.name} will be displayed here.`}</p>
                    )}
                     <div className="mt-8">
                        <h3 className="text-xl font-semibold mb-4 flex items-center"><Users className="mr-2 h-5 w-5 text-primary"/>Current Teams</h3>
                        <p className="text-muted-foreground">A list of teams currently mentored by {coach.name} will appear here. To create a new team, go to the <Link href="/teams" className="text-primary hover:underline">Teams page</Link>.</p>
                    </div>
                </CardContent>
                {isEditing && (
                    <CardFooter className="justify-end gap-2">
                        <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
                            Save
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </div>
      </div>
    </main>
  );
}
