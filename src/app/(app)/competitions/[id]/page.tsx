

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin, Users, Trophy, ArrowLeft, Clock, Award } from "lucide-react";
import Link from "next/link";

interface Competition {
  id: string;
  name: string;
  date: string;
  location: string;
  description: string;
  maxTeams: number;
  currentTeams: number;
  status: string;
  rules: string[];
  prizes: string[];
  registrationDeadline: string;
}

export default function CompetitionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          router.push('/login');
          return;
        }
        
        // For now, use mock data since we haven't migrated competitions to Prisma yet
        const mockCompetition: Competition = {
          id: params.id as string,
          name: 'VEX Robotics Competition 2024',
          date: '2024-03-15',
          location: 'Damascus Convention Center',
          description: 'Join us for the most exciting robotics competition of the year! Teams will compete in various challenges including autonomous navigation, object manipulation, and creative problem-solving. This competition is open to all skill levels and encourages innovation and teamwork.',
          maxTeams: 50,
          currentTeams: 32,
          status: 'Upcoming',
          rules: [
            'Teams must consist of 2-4 students',
            'All robots must be built using VEX parts',
            'Programming must be done using VEXcode',
            'Teams must follow safety guidelines',
            'No modifications to competition field allowed'
          ],
          prizes: [
            '1st Place: $1000 + Trophy + Certificates',
            '2nd Place: $500 + Medals + Certificates',
            '3rd Place: $250 + Medals + Certificates',
            'Best Design Award: $200 + Special Recognition',
            'Innovation Award: $200 + Special Recognition'
          ],
          registrationDeadline: '2024-02-28'
        };
        
        setCompetition(mockCompetition);
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

  if (!competition) {
    return (
      <div className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Competition not found</h1>
          <p className="text-muted-foreground">The requested competition could not be found.</p>
        </div>
      </div>
    );
  }

  const isRegistrationOpen = new Date(competition.registrationDeadline) > new Date();
  const daysUntilDeadline = Math.ceil((new Date(competition.registrationDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <Link href="/competitions" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Competitions
        </Link>
        <h1 className="text-3xl font-bold">{competition.name}</h1>
        <p className="text-muted-foreground">Join the competition and showcase your robotics skills</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Competition Overview */}
          <Card>
            <CardHeader>
              <CardTitle>About the Competition</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{competition.description}</p>
            </CardContent>
          </Card>

          {/* Rules */}
          <Card>
            <CardHeader>
              <CardTitle>Competition Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {competition.rules.map((rule, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="h-2 w-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Prizes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Prizes & Awards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {competition.prizes.map((prize, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Badge variant={index === 0 ? 'default' : index === 1 ? 'secondary' : 'outline'}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏆'}
                    </Badge>
                    <span className="font-medium">{prize}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Competition Details */}
          <Card>
            <CardHeader>
              <CardTitle>Competition Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{competition.date}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{competition.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{competition.currentTeams}/{competition.maxTeams} teams</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Trophy className="h-4 w-4 text-muted-foreground" />
                <span>{competition.status}</span>
              </div>
            </CardContent>
          </Card>

          {/* Registration */}
          <Card>
            <CardHeader>
              <CardTitle>Registration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <Badge variant={isRegistrationOpen ? 'default' : 'destructive'} className="mb-2">
                  {isRegistrationOpen ? 'Open' : 'Closed'}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {isRegistrationOpen 
                    ? `Deadline: ${competition.registrationDeadline} (${daysUntilDeadline} days left)`
                    : 'Registration has closed'
                  }
                </p>
              </div>
              
              {isRegistrationOpen && competition.currentTeams < competition.maxTeams ? (
                <Button className="w-full">
                  Register Team
                </Button>
              ) : (
                <Button className="w-full" disabled>
                  {competition.currentTeams >= competition.maxTeams ? 'Full' : 'Registration Closed'}
                </Button>
              )}
              
              <p className="text-xs text-muted-foreground text-center">
                {competition.maxTeams - competition.currentTeams} spots remaining
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
