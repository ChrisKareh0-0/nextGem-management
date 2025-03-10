"use client";
import AuthCheck from "@/components/Auth/AuthCheck";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthCheck>{children}</AuthCheck>;
} 