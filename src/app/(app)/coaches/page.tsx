

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Users, Trophy } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

interface Coach {
  id: string;
  name: string;
  email: string;
  location: string;
  specialties: string[];
  teamsCount: number;
  achievements: number;
}

export default function CoachesPage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [filteredCoaches, setFilteredCoaches] = useState<Coach[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
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
        
        // For now, use mock data since we haven't migrated coaches to Prisma yet
        const mockCoaches: Coach[] = [
          {
            id: '1',
            name: 'Dr. Ahmed Hassan',
            email: 'ahmed.hassan@academy.edu.sy',
            location: 'Damascus',
            specialties: ['VEX Robotics', 'Arduino Programming'],
            teamsCount: 5,
            achievements: 12
          },
          {
            id: '2',
            name: 'Prof. Sarah Al-Mahmoud',
            email: 'sarah.almahmoud@academy.edu.sy',
            location: 'Aleppo',
            specialties: ['FIRST Robotics', 'Team Management'],
            teamsCount: 3,
            achievements: 8
          },
          {
            id: '3',
            name: 'Eng. Omar Khalil',
            email: 'omar.khalil@academy.edu.sy',
            location: 'Homs',
            specialties: ['Python Programming', 'Mechanical Design'],
            teamsCount: 4,
            achievements: 15
          }
        ];
        
        setCoaches(mockCoaches);
        setFilteredCoaches(mockCoaches);
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
    const filtered = coaches.filter(coach =>
      coach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coach.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coach.specialties.some(specialty => 
        specialty.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredCoaches(filtered);
  }, [searchTerm, coaches]);

  if (loading) {
    return (
      <div className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="mb-8">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-80 mt-2" />
        </div>
        <div className="mb-6">
          <Skeleton className="h-10 w-80" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
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
        <h1 className="text-3xl font-bold">Our Coaches</h1>
        <p className="text-muted-foreground">Meet our experienced robotics mentors</p>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search coaches by name, location, or specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCoaches.map((coach) => (
          <Card key={coach.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={`/avatars/coach-${coach.id}.jpg`} alt={coach.name} />
                  <AvatarFallback className="text-lg">{coach.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{coach.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {coach.location}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Specialties:</p>
                <div className="flex flex-wrap gap-1">
                  {coach.specialties.map((specialty, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{coach.teamsCount} teams</span>
                </div>
                <div className="flex items-center gap-1">
                  <Trophy className="h-4 w-4" />
                  <span>{coach.achievements} achievements</span>
                </div>
              </div>
              
              <Link href={`/coaches/${coach.id}`}>
                <Button className="w-full" size="sm">
                  View Profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCoaches.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No coaches found matching your search.</p>
        </div>
      )}
    </div>
  );
}
