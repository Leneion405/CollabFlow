import Image from "next/image";
import Link from "next/link";

import { UserButton } from "@/features/auth/components/user-button";
import { NotificationBell } from "@/features/invitations/components/notificationBell";

interface StandaloneLayoutProps {
  children: React.ReactNode;
}
const DocumentationLink = () => (
  <a
    href="https://github.com/Leneion405/CollabFlow"
    target="_blank"
    rel="noopener noreferrer"
    className="text-sm text-primary hover:underline flex items-center gap-1"
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 3h7m0 0v7m0-7L10 14" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10v10h10" />
    </svg>
    Documentation
  </a>
);

const StandaloneLayout = ({ children }: StandaloneLayoutProps) => {
  return (
    <main className="bg-neutral-100 min-h-screen">
      <div className="mx-auto max-w-screen-2xl p-4">
        <nav className="flex justify-between items-center h-[73px]">
          <div className="flex items-center gap-2">
            <Link href="/dashboard">
              <Image src="/logo.svg" alt="logo" width={50} height={39} />
            </Link>
            <Link href="/dashboard">
              <p className="font-bold text-lg">Collab Flow</p>
            </Link>
          </div>
          <div className="flex items-center gap-x-2">
            <DocumentationLink />
            <NotificationBell />
            <UserButton />
          </div>
        </nav>
        <div className="flex flex-col items-center justify-center py-4">
          {children}
        </div>
      </div>
    </main>
  );
};

export default StandaloneLayout;