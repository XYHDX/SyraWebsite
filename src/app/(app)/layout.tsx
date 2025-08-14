
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal } from "@/components/ui/dropdown-menu";
import { auth, db } from "@/lib/firebase";
import { signOut, onAuthStateChanged, User } from "firebase/auth";
import { LogOut, Moon, Settings, Sun, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { doc, getDoc } from "firebase/firestore";
import { HeaderNav } from "./HeaderNav";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Bot } from "lucide-react";
import { APP_TITLE } from "@/lib/config";
import { Sidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface UserProfile {
  role?: string;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { setTheme } = useTheme();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        setUser(currentUser);
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        let profile;
        if (userDocSnap.exists()) {
            profile = userDocSnap.data() as UserProfile;
            setUserProfile(profile);
        } else {
            profile = { role: 'Student' }; // Default role
            setUserProfile(profile);
        }
        
        if (window.location.pathname === '/login' || window.location.pathname === '/register' || window.location.pathname === '/') {
             router.push(profile?.role === 'Admin' ? '/admin' : '/dashboard');
        }

      } else {
        router.push('/login');
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
        await signOut(auth);
        router.push('/login');
    } catch (error) {
        console.error("Logout error:", error);
    }
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  if (loading) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <Bot className="w-16 h-16 animate-pulse text-primary" />
                <p className="text-muted-foreground">Loading Academy...</p>
            </div>
        </div>
    );
  }
  
  if (!user) {
    return null; 
  }

  const isAdmin = userProfile?.role === 'Admin';

  return (
    <div className="flex min-h-screen w-full flex-col">
       {isAdmin && <Sidebar />}
       <div className={cn(isAdmin && "md:pl-64")}>
        <header className="sticky top-0 flex h-16 items-center justify-between gap-4 border-b bg-background/95 backdrop-blur-sm px-4 md:px-6 z-50">
            <div className="flex items-center gap-2">
                {/* Mobile Menu & Logo */}
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle navigation menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="flex flex-col">
                         <SheetHeader>
                            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                            <Link href="/" className="flex items-center gap-2 font-semibold" onClick={closeMobileMenu}>
                                <Bot className="h-6 w-6 text-primary" />
                                <span className="">{APP_TITLE}</span>
                            </Link>
                        </SheetHeader>
                         <nav className="grid gap-2 text-base font-medium">
                            {isAdmin ? (
                                <Sidebar isMobile={true} onLinkClick={closeMobileMenu} />
                            ) : (
                                <HeaderNav userProfile={userProfile} isMobile={true} isAdmin={isAdmin} onLinkClick={closeMobileMenu} />
                            )}
                         </nav>
                    </SheetContent>
                </Sheet>
                 <Link
                    href={isAdmin ? '/admin' : '/community'}
                    className={cn(
                        "items-center gap-2 font-semibold",
                        isAdmin ? "hidden" : "flex"
                    )}
                >
                    <Bot className="h-6 w-6 text-primary" />
                    <span className="font-bold">{APP_TITLE}</span>
                </Link>
            </div>
            
            {/* Centered Navigation for non-admins */}
            {!isAdmin && (
                <div className="hidden md:flex">
                    <nav className="flex items-center gap-5 lg:gap-6">
                        <HeaderNav userProfile={userProfile} />
                    </nav>
                </div>
            )}

            {/* User Menu on the right */}
            <div className="flex items-center justify-end">
                <UserMenu user={user} onLogout={handleLogout} setTheme={setTheme} isAdmin={isAdmin} loading={loading} />
            </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}


function UserMenu({ user, onLogout, setTheme, isAdmin, loading }: { user: User | null, onLogout: () => void, setTheme: (theme: string) => void, isAdmin: boolean, loading: boolean }){
    if (loading) {
        return <Skeleton className="h-10 w-10 rounded-full" />;
    }
    
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10 border-2 border-primary/50">
                    <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || "User"} />
                    <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.displayName || "User"}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                        {user?.email || 'user@example.com'}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem asChild>
                    <Link href="/dashboard"><UserIcon className="mr-2 h-4 w-4" />Profile & Settings</Link>
                </DropdownMenuItem>

                {isAdmin && (
                    <DropdownMenuItem asChild>
                       <Link href="/admin"><Settings className="mr-2 h-4 w-4" />Admin Dashboard</Link>
                    </DropdownMenuItem>
                )}
                
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <Sun className="h-4 w-4 mr-2 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-4 w-4 mr-2 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span>Toggle theme</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                            <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
