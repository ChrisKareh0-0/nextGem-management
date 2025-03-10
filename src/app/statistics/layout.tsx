import { ReactNode } from 'react';

interface StatisticsLayoutProps {
  children: ReactNode;
}

export default function StatisticsLayout({ children }: StatisticsLayoutProps) {
  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <h1 className="mb-6 text-2xl font-semibold text-black dark:text-white">Statistics</h1>
      {children}
    </div>
  );
} 