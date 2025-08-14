
import { Bot } from "lucide-react";
import Link from "next/link";
import React from "react";
import { APP_TITLE } from "@/lib/config";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
             <div className="hidden bg-muted lg:block relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-blue-700"></div>
            </div>
            <div className="flex items-center justify-center py-12">
                <div className="mx-auto grid w-[350px] gap-6">
                    <div className="grid gap-2 text-center">
                        <Link href="/" className="flex items-center justify-center gap-2 text-foreground">
                            <Bot className="w-8 h-8 text-primary" />
                            <span className="text-3xl font-bold">{APP_TITLE}</span>
                        </Link>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
