"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth } from "@/utils/auth";

interface AuthCheckProps {
  children: React.ReactNode;
}

export default function AuthCheck({ children }: AuthCheckProps) {
  const router = useRouter();

  useEffect(() => {
    const { isAuthenticated } = getAuth();
    
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [router]);

  return <>{children}</>;
} 