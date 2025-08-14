
"use client";

import { useEffect, useState } from "react";
import { getCoachById } from "@/lib/firestore";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, School, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "next/navigation";

interface CoachProfile {
    name: string;
    school: string;
    schoolId?: string;
    expertise: string;
    avatar: string;
}

export default function CoachProfilePage() {
  const params = useParams<{ id: string }>();
  const [coach, setCoach] = useState<CoachProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoach = async () => {
      const id = params.id;
      if (!id) return;

      try {
        setLoading(true);
        const coachData = await getCoachById(id);
        if (coachData) {
            setCoach({ ...coachData } as CoachProfile);
        } else {
            setError("Coach not found.");
        }
      } catch (err) {
        setError("Failed to load coach profile.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCoach();
  }, [params.id]);

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
      <div className="mb-8">
        <Button variant="outline" asChild>
          <Link href="/coaches"><ArrowLeft className="mr-2 h-4 w-4" />Back to Coaches</Link>
        </Button>
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
                        {coach.expertise && coach.expertise.split(', ').map(exp => (
                            <Badge key={exp} variant="secondary">{exp}</Badge>
                        ))}
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
                    <p className="text-muted-foreground">Detailed biography and coaching philosophy for {coach.name} will be displayed here. This section can include their background, notable achievements, and their approach to mentoring young roboticists.</p>
                     <div className="mt-8">
                        <h3 className="text-xl font-semibold mb-4 flex items-center"><Users className="mr-2 h-5 w-5 text-primary"/>Current Teams</h3>
                        <p className="text-muted-foreground">A list of teams currently mentored by {coach.name} will appear here, along with links to their individual team pages.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </main>
  );
}
