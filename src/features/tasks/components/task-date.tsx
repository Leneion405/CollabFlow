import { differenceInDays, format } from "date-fns";
import { cn } from "@/lib/utils";

interface TaskDateProps {
  value: string; // The date value (as string)
  className?: string; // Optional className for custom styling
  isDueDate?: boolean; // Prop to indicate if this is a due date (to apply color change logic)
}

export const TaskDate = ({ value, className, isDueDate }: TaskDateProps) => {
  const today = new Date();
  const date = new Date(value); // Convert the 'value' to Date object
  const diffInDays = differenceInDays(date, today);

  let textColor = "text-muted-foreground"; // Default color

  // Apply color logic only for dueDate
  if (isDueDate) {
    if (diffInDays <= 3) {
      textColor = "text-red-500"; // Red if due in 3 days or less
    } else if (diffInDays <= 7) {
      textColor = "text-orange-500"; // Orange if due in 7 days or less
    } else if (diffInDays <= 14) {
      textColor = "text-yellow-500"; // Yellow if due in 14 days or less
    }
  }

  return (
    <div className={cn("text-sm", textColor, className)}>
      {format(date, "MMM dd, yyyy")}
    </div>
  );
};
