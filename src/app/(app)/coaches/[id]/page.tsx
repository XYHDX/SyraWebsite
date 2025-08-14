
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, Phone, MapPin, Trophy, Users } from "lucide-react";

interface Coach {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  specialties: string[];
  achievements: string[];
  teamsCount: number;
}

export default function CoachDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [coach, setCoach] = useState<Coach | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          router.push('/login');
          return;
        }
        
        // For now, use mock data since we haven't migrated coaches to Prisma yet
        const mockCoach: Coach = {
          id: params.id as string,
          name: 'Dr. Ahmed Hassan',
          email: 'ahmed.hassan@academy.edu.sy',
          phone: '+963 11 123 4567',
          location: 'Damascus, Syria',
          bio: 'Experienced robotics coach with over 10 years of experience in VEX and FIRST robotics competitions. Specializes in programming and mechanical design.',
          specialties: ['VEX Robotics', 'FIRST Robotics', 'Arduino Programming', 'Team Management'],
          achievements: [
            'National Robotics Champion 2023',
            'Best Coach Award 2022',
            'International Competition Finalist 2021'
          ],
          teamsCount: 5
        };
        
        setCoach(mockCoach);
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="mb-8">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-80 mt-2" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!coach) {
    return (
      <div className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Coach not found</h1>
          <p className="text-muted-foreground">The requested coach could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Coach Profile</h1>
        <p className="text-muted-foreground">Learn more about our robotics expert</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Coach Info Card */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarImage src="/avatars/coach.jpg" alt={coach.name} />
                <AvatarFallback className="text-2xl">{coach.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <CardTitle>{coach.name}</CardTitle>
              <CardDescription>Robotics Coach</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{coach.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{coach.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{coach.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{coach.teamsCount} teams</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coach Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Bio */}
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{coach.bio}</p>
            </CardContent>
          </Card>

          {/* Specialties */}
          <Card>
            <CardHeader>
              <CardTitle>Specialties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {coach.specialties.map((specialty, index) => (
                  <Badge key={index} variant="secondary">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {coach.achievements.map((achievement, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-primary rounded-full"></div>
                    <span>{achievement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Contact Button */}
          <div className="flex gap-4">
            <Button className="flex-1">
              <Mail className="h-4 w-4 mr-2" />
              Send Message
            </Button>
            <Button variant="outline" className="flex-1">
              <Phone className="h-4 w-4 mr-2" />
              Call Coach
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
