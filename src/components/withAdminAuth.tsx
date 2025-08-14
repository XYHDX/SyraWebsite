
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Bot } from 'lucide-react';

const withAdminAuth = <P extends object>(Component: React.ComponentType<P>) => {
  const WrappedComponent = (props: P) => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
        if (user) {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists() && userDocSnap.data().role === 'Admin') {
            setIsAdmin(true);
          } else {
            router.push('/dashboard'); // Redirect if not an admin
          }
        } else {
          router.push('/login'); // Redirect if not logged in
        }
        setLoading(false);
      });

      return () => unsubscribe();
    }, [router]);

    if (loading) {
      return (
         <div className="flex h-screen w-full items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <Bot className="w-16 h-16 animate-pulse text-primary" />
                <p className="text-muted-foreground">Verifying permissions...</p>
            </div>
        </div>
      );
    }

    return isAdmin ? <Component {...props} /> : null;
  };

  WrappedComponent.displayName = `withAdminAuth(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
};

export default withAdminAuth;
