import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface MemberAvatarProps {
  name?: string; // Make name optional for extra safety
  className?: string;
  fallbackClassName?: string;
}

export const MemberAvatar = ({
  name,
  className,
  fallbackClassName,
}: MemberAvatarProps) => {
  // Safely get the first letter, or fallback to "U"
  const initial =
    typeof name === "string" && name.trim().length > 0
      ? name.trim().charAt(0).toUpperCase()
      : "U";

  return (
    <Avatar className={className}>
      <AvatarFallback className={fallbackClassName}>
        {initial}
      </AvatarFallback>
    </Avatar>
  );
};
