import Image from "next/image";
import Link from "next/link";

import { DottedSeparator } from "./dotted-separator";
import { Navigation } from "./navigation";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { Projects } from "./projects";

export const Sidebar = () => {
  return (
    <aside className="h-full bg-neutral-100 p-4 w-full">
     <div className="flex items-center gap-2">
        <Link href="/dashboard">
          <Image src="/logo.svg" alt="logo" width={50} height={39} />
        </Link>
        <Link href="/dashboard">
          <p className="font-bold text-lg">Collab Flow</p>
        </Link>
      </div>

      <DottedSeparator className="my-4" />
      <WorkspaceSwitcher />
      <DottedSeparator className="my-4" />
      <Navigation />
      <DottedSeparator className="my-4" />
      <Projects />
    </aside>
  );
};
