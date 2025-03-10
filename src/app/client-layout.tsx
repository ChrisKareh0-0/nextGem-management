"use client";

import { Sidebar } from "@/components/Layouts/sidebar";
import { Header } from "@/components/Layouts/header";
import { usePathname } from "next/navigation";
import { PropsWithChildren } from "react";

export default function ClientLayout({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/';
  
  return (
    <div className="flex min-h-screen">
      {!isLoginPage && <Sidebar />}

      <div className={`w-full ${!isLoginPage ? 'bg-gray-2 dark:bg-[#020d1a]' : ''}`}>
        {!isLoginPage && <Header />}

        <main className={`isolate mx-auto w-full max-w-screen-2xl overflow-hidden ${!isLoginPage ? 'p-4 md:p-6 2xl:p-10' : 'p-0'}`}>
          {children}
        </main>
      </div>
    </div>
  );
} 