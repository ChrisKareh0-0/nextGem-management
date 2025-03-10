"use client";
import AuthCheck from "@/components/Auth/AuthCheck";

export default function StatisticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthCheck>{children}</AuthCheck>;
} 