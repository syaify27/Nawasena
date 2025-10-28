import { getEmployees, getJobs } from '@/lib/data';
import DashboardClient from '@/components/dashboard/dashboard-client';
import Logo from '@/components/logo';

export default function Home() {
  const employees = getEmployees();
  const jobs = getJobs();

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur md:px-6">
        <Logo />
        <h1 className="font-headline text-xl font-semibold text-primary md:text-2xl">
          Nawasena
        </h1>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <DashboardClient employees={employees} jobs={jobs} />
      </main>
      <footer className="flex items-center justify-center p-4 text-sm text-muted-foreground">
        © {new Date().getFullYear()} Nawasena. All rights reserved.
      </footer>
    </div>
  );
}
