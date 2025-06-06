import Image from "next/image";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ProjectAvatarProps {
  image?: string;
  name: string;
  className?: string;
  fallbackClassName?: string;
}

export const ProjectAvatar = ({
  image,
  name,
  className,
  fallbackClassName,
}: ProjectAvatarProps) => {
  // Safety check for name
  const safeName = name || "?";
  const fallbackText = safeName.charAt(0).toUpperCase() || "?";

  if (image) {
    return (
      <div className={cn("size-5 relative rounded-md overflow-hidden", className)}>
        <Image src={image} alt={safeName} fill className="object-cover" />
      </div>
    );
  }

  return (
    <Avatar className={cn("size-5 rounded-md", className)}>
      <AvatarFallback
        className={cn(
          "text-white bg-blue-600 font-semibold text-sm rounded-md",
          fallbackClassName
        )}
      >
        {fallbackText}
      </AvatarFallback>
    </Avatar>
  );
};
