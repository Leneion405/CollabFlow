import Image from "next/image";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface WorkspaceAvatarProps {
  image?: string;
  name: string;
  className?: string;
}

export const WorkspaceAvatar = ({
  image,
  name,
  className,
}: WorkspaceAvatarProps) => {
  if (image) {
    return (
      <div className={cn("relative", className)}>
        <Image
          src={image}
          alt={name}
          fill
          className="rounded-lg object-cover"
        />
      </div>
    );
  }

  return (
    <Avatar className={cn("rounded-lg bg-gradient-to-br from-blue-500 to-blue-600", className)}>
      <AvatarFallback className="rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold border-0">
        {name.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
};
