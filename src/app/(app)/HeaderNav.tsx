
"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Bot, Menu, Wand2, Trophy, Newspaper, School, Users, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface UserProfile {
  role?: string;
}

interface HeaderNavProps {
    userProfile: UserProfile | null;
    isMobile?: boolean;
    isAdmin?: boolean;
    onLinkClick?: () => void;
}

export function HeaderNav({ userProfile, isMobile = false, isAdmin = false, onLinkClick }: HeaderNavProps) {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path || (path !== '/' && pathname.startsWith(path));
  
  const navLinkClass = isMobile 
    ? "flex items-center gap-4 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary text-base" 
    : "text-sm font-medium text-muted-foreground transition-colors hover:text-primary";

  const activeLinkClass = isMobile ? "bg-muted text-primary" : "text-primary";

  const NavLink = ({ href, children, icon: Icon }: { href: string; children: React.ReactNode, icon?: React.ElementType }) => (
     <Link href={href} className={cn(navLinkClass, isActive(href) && activeLinkClass)} onClick={onLinkClick}>
        {Icon && isMobile && <Icon className="h-5 w-5" />}
        {children}
    </Link>
  );
  
  const isCoachOrAdmin = userProfile?.role === 'Admin' || userProfile?.role === 'Coach';
  const aiToolsVisible = true;

  return (
    <>
        <NavLink href="/competitions" icon={Trophy}>Competitions</NavLink>
        <NavLink href="/community" icon={Newspaper}>Community</NavLink>
        <NavLink href="/schools" icon={School}>Schools</NavLink>
        <NavLink href="/coaches" icon={Users}>Coaches</NavLink>
        <NavLink href="/teams" icon={Users}>Teams</NavLink>
        
        {aiToolsVisible && (
            isMobile ? (
                <>
                    <div className="my-2 border-t pt-2">
                        <h3 className="px-3 py-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">AI Tools</h3>
                         <NavLink href="/ai/generate-post" icon={Wand2}>Post Generator</NavLink>
                         {isCoachOrAdmin && <NavLink href="/ai/coach" icon={Bot}>AI Coach</NavLink>}
                    </div>
                </>
            ) : (
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className={cn(navLinkClass, (isActive('/ai/coach') || isActive('/ai/generate-post')) && activeLinkClass, "flex items-center gap-1")}>
                            AI Tools
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                         <DropdownMenuItem asChild>
                            <Link href="/ai/generate-post">
                                <Wand2 className="mr-2 h-4 w-4"/> Post Generator
                            </Link>
                        </DropdownMenuItem>
                        {isCoachOrAdmin && (
                            <DropdownMenuItem asChild>
                                <Link href="/ai/coach">
                                <Bot className="mr-2 h-4 w-4"/> AI Coach
                                </Link>
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        )}
    </>
  );
}
