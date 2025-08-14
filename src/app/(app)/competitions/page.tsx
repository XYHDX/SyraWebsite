
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Trophy } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Competition {
  id: string;
  name: string;
  date: string;
  location: string;
  maxTeams: number;
  currentTeams: number;
  status: string;
  description: string;
}

export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          router.push('/login');
          return;
        }
        
        // For now, use mock data since we haven't migrated competitions to Prisma yet
        const mockCompetitions: Competition[] = [
          {
            id: '1',
            name: 'VEX Robotics Competition',
            date: '2024-03-15',
            location: 'Damascus Convention Center',
            maxTeams: 50,
            currentTeams: 32,
            status: 'Upcoming',
            description: 'Annual VEX robotics competition for high school students.'
          },
          {
            id: '2',
            name: 'FIRST Robotics Competition',
            date: '2024-04-20',
            location: 'Aleppo University',
            maxTeams: 30,
            currentTeams: 25,
            status: 'Upcoming',
            description: 'International robotics competition focusing on innovation and teamwork.'
          }
        ];
        
        setCompetitions(mockCompetitions);
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Competitions</h1>
          <p className="text-muted-foreground">Discover upcoming robotics competitions</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Competitions</h1>
        <p className="text-muted-foreground">Discover upcoming robotics competitions</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {competitions.map((competition) => (
          <Card key={competition.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{competition.name}</CardTitle>
                  <CardDescription className="mt-1">{competition.description}</CardDescription>
                </div>
                <Badge variant={competition.status === 'Upcoming' ? 'default' : 'secondary'}>
                  {competition.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{competition.date}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{competition.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{competition.currentTeams}/{competition.maxTeams} teams</span>
              </div>
              
              <div className="pt-2">
                <Link href={`/competitions/${competition.id}`}>
                  <Button className="w-full" size="sm">
                    <Trophy className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
