"use client";
// Add this line at the top of the file to disable static generation
export const dynamic = 'force-dynamic';

import LoginForm from "@/components/Auth/LoginForm";
import { getAuth } from "@/utils/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const { isAuthenticated } = getAuth();
    
    if (isAuthenticated) {
      router.push("/statistics");
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
            NextGem Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Please login to access your dashboard
          </p>
        </div>
        
        <LoginForm />
      </div>
    </div>
  );
} 