

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users, Trophy, Plus, MapPin, Building2 } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import CreateTeamForm from "./CreateTeamForm";

interface Team {
  id: string;
  name: string;
  description: string;
  school: string;
  coach: string;
  memberCount: number;
  maxMembers: number;
  status: string;
  achievements: number;
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          router.push('/login');
          return;
        }
        
        // For now, use mock data since we haven't migrated teams to Prisma yet
        const mockTeams: Team[] = [
          {
            id: '1',
            name: 'RoboMasters',
            description: 'A competitive robotics team specializing in VEX competitions. We focus on innovative design and strategic gameplay.',
            school: 'Damascus High School for Innovation',
            coach: 'Dr. Ahmed Hassan',
            memberCount: 4,
            maxMembers: 4,
            status: 'Active',
            achievements: 8
          },
          {
            id: '2',
            name: 'Tech Titans',
            description: 'University-level team working on advanced robotics projects including autonomous navigation and AI integration.',
            school: 'Aleppo University Robotics Department',
            coach: 'Prof. Sarah Al-Mahmoud',
            memberCount: 3,
            maxMembers: 5,
            status: 'Active',
            achievements: 12
          },
          {
            id: '3',
            name: 'Innovation Squad',
            description: 'Technical institute team focused on practical robotics applications and industrial automation.',
            school: 'Homs Technical Institute',
            coach: 'Eng. Omar Khalil',
            memberCount: 5,
            maxMembers: 6,
            status: 'Active',
            achievements: 6
          }
        ];
        
        setTeams(mockTeams);
        setFilteredTeams(mockTeams);
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    const filtered = teams.filter(team =>
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.school.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.coach.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTeams(filtered);
  }, [searchTerm, teams]);

  const handleTeamCreated = () => {
    setShowCreateForm(false);
    // In a real implementation, you would refresh the teams list
  };

  if (loading) {
    return (
      <div className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="mb-8">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-80 mt-2" />
        </div>
        <div className="mb-6">
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
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
        <h1 className="text-3xl font-bold">Robotics Teams</h1>
        <p className="text-muted-foreground">Discover and join robotics teams across Syria</p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search teams by name, school, or coach..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Team
        </Button>
      </div>

      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New Team</CardTitle>
            <CardDescription>Form a robotics team to compete in competitions</CardDescription>
          </CardHeader>
          <CardContent>
            <CreateTeamForm onTeamCreated={handleTeamCreated} onFinished={() => setShowCreateForm(false)} />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTeams.map((team) => (
          <Card key={team.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{team.name}</CardTitle>
                  <CardDescription className="mt-1">{team.description}</CardDescription>
                </div>
                <Badge variant={team.status === 'Active' ? 'default' : 'secondary'}>
                  {team.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>{team.school}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Coach: {team.coach}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{team.memberCount}/{team.maxMembers} members</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Trophy className="h-4 w-4" />
                  <span>{team.achievements} achievements</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {team.memberCount < team.maxMembers ? 'Open' : 'Full'}
                </Badge>
              </div>
              
              <Link href={`/teams/${team.id}`}>
                <Button className="w-full" size="sm">
                  View Details
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTeams.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No teams found matching your search.</p>
        </div>
      )}
    </div>
  );
}
