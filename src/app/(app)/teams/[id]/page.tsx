

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  Trophy, 
  ArrowLeft, 
  MapPin, 
  Building2, 
  Award,
  Calendar,
  Target
} from "lucide-react";
import Link from "next/link";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

interface Team {
  id: string;
  name: string;
  description: string;
  school: string;
  coach: string;
  members: TeamMember[];
  maxMembers: number;
  status: string;
  achievements: string[];
  competitions: string[];
  specialties: string[];
}

export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          router.push('/login');
          return;
        }
        
        // For now, use mock data since we haven't migrated teams to Prisma yet
        const mockTeam: Team = {
          id: params.id as string,
          name: 'RoboMasters',
          description: 'A competitive robotics team specializing in VEX competitions. We focus on innovative design and strategic gameplay. Our team has been competing for over 3 years and has won multiple regional championships.',
          school: 'Damascus High School for Innovation',
          coach: 'Dr. Ahmed Hassan',
          members: [
            { id: '1', name: 'Ahmed Al-Rashid', role: 'Team Captain', avatar: '/avatars/ahmed.jpg' },
            { id: '2', name: 'Sarah Mahmoud', role: 'Lead Programmer', avatar: '/avatars/sarah.jpg' },
            { id: '3', name: 'Omar Khalil', role: 'Mechanical Engineer', avatar: '/avatars/omar.jpg' },
            { id: '4', name: 'Fatima Al-Zahra', role: 'Strategy Specialist', avatar: '/avatars/fatima.jpg' }
          ],
          maxMembers: 4,
          status: 'Active',
          achievements: [
            '1st Place - Regional VEX Competition 2023',
            'Best Design Award - National Robotics Olympiad 2022',
            'Innovation Award - Damascus Tech Fair 2021',
            'Excellence in Programming - School Competition 2020'
          ],
          competitions: [
            'VEX Robotics Competition 2024',
            'National Robotics Olympiad 2024',
            'Damascus Tech Fair 2024'
          ],
          specialties: [
            'VEX Robotics',
            'Autonomous Navigation',
            'Object Manipulation',
            'Strategic Gameplay'
          ]
        };
        
        setTeam(mockTeam);
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

  if (!team) {
    return (
      <div className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Team not found</h1>
          <p className="text-muted-foreground">The requested team could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <Link href="/teams" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Teams
        </Link>
        <h1 className="text-3xl font-bold">{team.name}</h1>
        <p className="text-muted-foreground">Learn more about this robotics team</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Team Overview */}
          <Card>
            <CardHeader>
              <CardTitle>About {team.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{team.description}</p>
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members ({team.members.length}/{team.maxMembers})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {team.members.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {team.members.length < team.maxMembers && (
                <div className="mt-4 p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">
                    {team.maxMembers - team.members.length} spot(s) available
                  </p>
                  <Button className="mt-2" size="sm">
                    Join Team
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Specialties */}
          <Card>
            <CardHeader>
              <CardTitle>Team Specialties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {team.specialties.map((specialty, index) => (
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
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {team.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Badge variant="outline">🏆</Badge>
                    <span className="font-medium">{achievement}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Team Details */}
          <Card>
            <CardHeader>
              <CardTitle>Team Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{team.school}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>Coach: {team.coach}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{team.members.length}/{team.maxMembers} members</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Badge variant={team.status === 'Active' ? 'default' : 'secondary'}>
                  {team.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Competitions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Competitions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {team.competitions.map((competition, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="text-sm">{competition}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full">
                Contact Team
              </Button>
              <Button variant="outline" className="w-full">
                View Competitions
              </Button>
              <Button variant="outline" className="w-full">
                Join Team
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
