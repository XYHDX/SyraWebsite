

"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Users, School as SchoolIcon, ArrowRight, Bot, Activity, Edit, Save, Upload, Loader2, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { getCompetitions, getPosts, getUserById, getSchools, getSchoolByName, updateSchool } from "@/lib/firestore";
import { auth, db, storage } from "@/lib/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { onAuthStateChanged, User, updateProfile } from "firebase/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { doc, getDoc, setDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


interface UserProfile {
  name: string;
  email: string;
  phone: string;
  role: string;
  school: string;
  schoolId?: string;
  avatarUrl?: string;
}

interface School {
    id: string;
    name: string;
}

interface Competition {
  id: string;
  name: string;
  date: string;
  status: string;
  registered: boolean;
}

interface Post {
  id: string;
  author: string;
  avatar: string;
  content: string;
  status: string;
}

function DashboardPage() {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [schools, setSchools] = useState<School[]>([]);

  const [upcomingCompetitions, setUpcomingCompetitions] = useState<Competition[]>([]);
  const [myRegisteredCompetitions, setMyRegisteredCompetitions] = useState<Competition[]>([]);
  const [myPosts, setMyPosts] = useState<Post[]>([]);

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchUserData = useCallback(async (currentUser: User) => {
    const docRef = doc(db, "users", currentUser.uid);
    const docSnap = await getDoc(docRef);
    let userProfile;
    if (docSnap.exists()) {
      userProfile = docSnap.data() as UserProfile;
    } else {
      userProfile = {
        name: currentUser.displayName || "New User",
        email: currentUser.email || "",
        phone: "",
        role: "Student",
        school: "Not Set"
      };
      await setDoc(docRef, userProfile);
    }
    const schoolData = await getSchoolByName(userProfile.school);
    userProfile.schoolId = schoolData?.id;

    setProfile(userProfile);
    setName(userProfile.name);
    setPhone(userProfile.phone);
    setSelectedSchool(userProfile.school);
    return userProfile;
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(true);

        const profilePromise = fetchUserData(currentUser);
        const competitionsPromise = getCompetitions(undefined, true); 
        const postsPromise = getPosts("All", 3, currentUser.uid);
        const schoolsPromise = getSchools();

        const [profile, competitions, posts, schoolsData] = await Promise.all([
          profilePromise,
          competitionsPromise,
          postsPromise,
          schoolsPromise,
        ]);

        setUpcomingCompetitions(competitions);
        setMyRegisteredCompetitions(competitions.filter(c => c.registered));
        setMyPosts(posts as Post[]);
        setSchools(schoolsData as School[]);
        
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchUserData]);

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    setIsSaving(true);
    try {
        const userDocRef = doc(db, "users", user.uid);
        const updatedProfileData = { name, school: selectedSchool, phone: phone || "" };
        
        await updateDoc(userDocRef, updatedProfileData);
      
        if (user.displayName !== name) {
            await updateProfile(user, { displayName: name });
        }

        if (profile.role === 'Coach') {
            const coachDocRef = doc(db, "coaches", user.uid);
            await updateDoc(coachDocRef, { name, school: selectedSchool });
        }

        const schoolData = await getSchoolByName(selectedSchool);

        setProfile(prev => prev ? { ...prev, ...updatedProfileData, schoolId: schoolData?.id } : null);
      
        toast({
            title: "Success!",
            description: "Your profile has been updated.",
        });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) {
        return;
    }
    const file = e.target.files[0];
    if (file.size > 1024 * 1024) { // 1MB limit
        toast({ variant: "destructive", title: "File too large", description: "Please upload an image smaller than 1MB." });
        return;
    }

    setIsUploading(true);
    try {
        const storageRef = ref(storage, `profile-pictures/${user.uid}`);
        await uploadBytes(storageRef, file);
        const avatarUrl = await getDownloadURL(storageRef);

        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, { avatarUrl });
        
        await updateProfile(user, { photoURL: avatarUrl });

        if (profile?.role === 'Coach') {
            const coachDocRef = doc(db, 'coaches', user.uid);
            await updateDoc(coachDocRef, { avatar: avatarUrl });
        }
        
        setProfile(prev => prev ? { ...prev, avatarUrl } : null);

        toast({ title: "Success!", description: "Profile picture updated." });
    } catch (error) {
        console.error("Error uploading picture:", error);
        toast({ variant: "destructive", title: "Upload Failed", description: "Could not update your profile picture." });
    } finally {
        setIsUploading(false);
    }
  };

  if (loading || !profile) {
    return (
        <main className="flex-1 p-4 md:p-6 lg:p-8">
             <div className="mb-8">
                <Skeleton className="h-9 w-64" />
                <Skeleton className="h-5 w-80 mt-2" />
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card><CardContent className="p-6"><Skeleton className="h-24 w-full"/></CardContent></Card>
                <Card><CardContent className="p-6"><Skeleton className="h-24 w-full"/></CardContent></Card>
                <Card className="md:col-span-2 lg:col-span-3"><CardContent className="p-6"><Skeleton className="h-24 w-full"/></CardContent></Card>
                <Card className="md:col-span-2 lg:col-span-2"><CardContent className="p-6"><Skeleton className="h-32 w-full"/></CardContent></Card>
                 <Card className="md:col-span-2 lg:col-span-1"><CardContent className="p-6"><Skeleton className="h-32 w-full"/></CardContent></Card>
            </div>
        </main>
    )
  }
  
  const isAdmin = profile.role === 'Admin';
  const isStudent = profile.role === 'Student';
  const isCoach = profile.role === 'Coach';


  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Welcome, {profile.name || 'User'}!</h1>
        <p className="text-muted-foreground">
          {isAdmin 
            ? "Manage the platform from your admin dashboard."
            : "Here's a snapshot of what's happening in the academy. Manage your profile below."
          }
        </p>
      </div>

        <div className="grid gap-8 lg:grid-cols-3">
        
          <div className="lg:col-span-2 space-y-8">
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><UserIcon /> Account Details</CardTitle>
                    <CardDescription>Update your personal information here.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSaveChanges}>
                         <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={isSaving || isUploading} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input id="phone" type="tel" value={phone || ''} onChange={(e) => setPhone(e.target.value)} disabled={isSaving || isUploading} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" value={profile.email} readOnly disabled />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <Input id="role" value={profile.role} readOnly disabled />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="school">School</Label>
                                <Select value={selectedSchool} onValueChange={setSelectedSchool} disabled={isSaving || isUploading || isStudent || isCoach}>
                                    <SelectTrigger id="school">
                                        <SelectValue placeholder="Select your school" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Not Set">Not Set</SelectItem>
                                        {schools.map(school => (
                                            <SelectItem key={school.id} value={school.name}>{school.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="flex justify-end">
                                <Button type="submit" disabled={isSaving || isUploading}>
                                    {isSaving ? <Loader2 className="animate-spin" /> : <Save/>}
                                    Save Changes
                                </Button>
                            </div>
                        </div>

                        <div className="flex flex-col items-center justify-center gap-4">
                            <div className="relative">
                                <Avatar className="h-32 w-32 border-4 border-primary/20">
                                    <AvatarImage src={profile.avatarUrl || user?.photoURL || ''} />
                                    <AvatarFallback>{profile.name?.charAt(0) || 'U'}</AvatarFallback>
                                </Avatar>
                                {isUploading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                                    </div>
                                )}
                            </div>
                            <input type="file" ref={fileInputRef} onChange={handlePictureChange} accept="image/png, image/jpeg" style={{ display: 'none' }} />
                            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading || isSaving}>
                                {isUploading ? <Loader2 className="animate-spin" /> : <Upload />}
                                Change Picture
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                 <Card className="flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Upcoming Competitions</CardTitle>
                        <Trophy className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{upcomingCompetitions.length}</div>
                        <p className="text-xs text-muted-foreground">challenges awaiting your skills</p>
                    </CardContent>
                    <CardFooter className="mt-auto">
                        <Button variant="outline" asChild className="w-full">
                            <Link href="/competitions">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
                        </Button>
                    </CardFooter>
                </Card>

                 <Card className="flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Community Activity</CardTitle>
                        <Activity className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{myPosts.length}</div>
                        <p className="text-xs text-muted-foreground">posts you've created</p>
                    </CardContent>
                    <CardFooter className="mt-auto">
                        <Button variant="outline" asChild className="w-full">
                            <Link href="/community">Join the Conversation <ArrowRight className="ml-2 h-4 w-4" /></Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-8">
             <Card className="bg-gradient-to-r from-primary/10 to-transparent">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Bot /> AI Assistant</CardTitle>
                    <CardDescription>Need help drafting a post or have a question? Our AI tools are here to help.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                    <Button asChild>
                        <Link href="/ai/generate-post">Try AI Post Generator</Link>
                    </Button>
                    <Button asChild variant="secondary">
                        <Link href="/ai/coach">Chat with AI Coach</Link>
                    </Button>
                </CardContent>
            </Card>

            {myRegisteredCompetitions.length > 0 && (
            <Card>
                <CardHeader>
                <CardTitle>My Registered Competitions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                {myRegisteredCompetitions.map(comp => (
                    <div key={comp.id} className="flex items-center justify-between p-2 rounded-md bg-secondary/50">
                    <div>
                        <p className="font-semibold">{comp.name}</p>
                        <p className="text-sm text-muted-foreground">{comp.date}</p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                        <Link href={`/competitions/${comp.id}`}>View</Link>
                    </Button>
                    </div>
                ))}
                </CardContent>
            </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>My Posts</CardTitle>
                    <CardDescription>A summary of your recent contributions.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-2">
                           <Skeleton className="h-8 w-full" />
                           <Skeleton className="h-8 w-full" />
                           <Skeleton className="h-8 w-4/5" />
                        </div>
                    ) : (
                        myPosts.length > 0 ? (
                            <ul className="space-y-2">
                                {myPosts.map(post => (
                                    <li key={post.id} className="text-sm p-2 rounded-md bg-secondary flex items-center justify-between">
                                        <span className="truncate pr-2">{post.content}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${post.status === 'Approved' ? 'bg-green-200 text-green-900 dark:bg-green-800 dark:text-green-100' : 'bg-amber-200 text-amber-900 dark:bg-amber-800 dark:text-amber-100'}`}>{post.status}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                             <p className="text-sm text-muted-foreground text-center py-4">You haven't made any posts yet.</p>
                        )
                    )}
                     <Button variant="link" className="p-0 h-auto mt-4 text-sm" asChild>
                        <Link href="/community">Go to Community to post <ArrowRight className="ml-1 h-3 w-3" /></Link>
                    </Button>
                </CardContent>
            </Card>
          </div>
        </div>
    </main>
  );
}


export default DashboardPage;
