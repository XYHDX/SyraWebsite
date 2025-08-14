
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Users, Building2, Trophy, ArrowLeft, Phone, Mail, Globe } from "lucide-react";
import Link from "next/link";

interface School {
  id: string;
  name: string;
  location: string;
  description: string;
  studentCount: number;
  coachCount: number;
  status: string;
  contact: {
    phone: string;
    email: string;
    website: string;
  };
  programs: string[];
  achievements: string[];
}

export default function SchoolDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          router.push('/login');
          return;
        }
        
        // For now, use mock data since we haven't migrated schools to Prisma yet
        const mockSchool: School = {
          id: params.id as string,
          name: 'Damascus High School for Innovation',
          location: 'Damascus, Syria',
          description: 'A leading institution focused on robotics and technology education. We offer comprehensive programs in VEX robotics, Arduino programming, and team competitions. Our state-of-the-art facilities and experienced coaching staff provide students with the skills and knowledge needed to excel in robotics competitions.',
          studentCount: 150,
          coachCount: 8,
          status: 'Active',
          contact: {
            phone: '+963 11 123 4567',
            email: 'info@damascus-innovation.edu.sy',
            website: 'www.damascus-innovation.edu.sy'
          },
          programs: [
            'VEX Robotics Competition',
            'Arduino Programming',
            'Python for Robotics',
            'Team Building & Leadership',
            'Competition Preparation'
          ],
          achievements: [
            'National Robotics Champions 2023',
            'Best Innovation Award 2022',
            'Regional Competition Winners 2021',
            'Excellence in Education Award 2020'
          ]
        };
        
        setSchool(mockSchool);
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

  if (!school) {
    return (
      <div className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">School not found</h1>
          <p className="text-muted-foreground">The requested school could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <Link href="/schools" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Schools
        </Link>
        <h1 className="text-3xl font-bold">{school.name}</h1>
        <p className="text-muted-foreground">Learn more about this robotics academy</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* School Overview */}
          <Card>
            <CardHeader>
              <CardTitle>About {school.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{school.description}</p>
            </CardContent>
          </Card>

          {/* Programs */}
          <Card>
            <CardHeader>
              <CardTitle>Robotics Programs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {school.programs.map((program, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <div className="h-2 w-2 bg-primary rounded-full"></div>
                    <span className="font-medium">{program}</span>
                  </div>
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
                {school.achievements.map((achievement, index) => (
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
          {/* School Details */}
          <Card>
            <CardHeader>
              <CardTitle>School Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{school.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{school.studentCount} students</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{school.coachCount} coaches</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Badge variant={school.status === 'Active' ? 'default' : 'secondary'}>
                  {school.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{school.contact.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{school.contact.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span>{school.contact.website}</span>
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
                Contact School
              </Button>
              <Button variant="outline" className="w-full">
                View Coaches
              </Button>
              <Button variant="outline" className="w-full">
                Join Program
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
