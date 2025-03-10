// Add this line at the top of the file to disable static generation
export const dynamic = 'force-dynamic';

import { ClientPaymentsWrapper } from "@/components/Charts/client-payments-wrapper";
import { UpcomingPaymentsWrapper } from "@/components/Tables/upcoming-payments-wrapper";
import { createTimeFrameExtractor } from "@/utils/timeframe-extractor";

type PropsType = {
  searchParams: {
    selected_time_frame?: string;
  };
};

export default function StatisticsPage({ searchParams }: PropsType) {
  const { selected_time_frame } = searchParams;
  const extractTimeFrame = createTimeFrameExtractor(selected_time_frame);
  
  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold text-black dark:text-white">Statistics</h1>
      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-9 2xl:gap-7.5">
        <div className="col-span-12 xl:col-span-7">
          <ClientPaymentsWrapper />
        </div>
        <div className="col-span-12 xl:col-span-5">
          <UpcomingPaymentsWrapper />
        </div>
      </div>
    </>
  );
} 