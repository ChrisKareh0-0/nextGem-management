"use client";
import { ClientPaymentsWrapper } from "@/components/Charts/client-payments-wrapper";
import { UpcomingPaymentsWrapper } from "@/components/Tables/upcoming-payments-wrapper";
import { createTimeFrameExtractor } from "@/utils/timeframe-extractor";
import LogoutButton from "@/components/Auth/LogoutButton";
import { getAuth } from "@/utils/auth";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function StatisticsPage() {
  const searchParams = useSearchParams();
  const selected_time_frame = searchParams?.get('selected_time_frame') || undefined;
  const extractTimeFrame = createTimeFrameExtractor(selected_time_frame);
  const [username, setUsername] = useState<string | null>(null);
  
  useEffect(() => {
    const { username } = getAuth();
    setUsername(username);
  }, []);
  
  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-black dark:text-white">
          Statistics
        </h1>
        <div className="flex items-center gap-4">
          {username && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Welcome, <span className="font-medium">{username}</span>
            </span>
          )}
          <LogoutButton />
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-9 2xl:gap-7.5">
        <div className="col-span-12 xl:col-span-7">
          <ClientPaymentsWrapper />
        </div>
        <div className="col-span-12 xl:col-span-5">
          <UpcomingPaymentsWrapper />
        </div>
      </div>
    </div>
  );
} 