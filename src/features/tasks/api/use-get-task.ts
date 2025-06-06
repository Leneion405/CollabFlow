import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

// Define the expected types
import type { PopulatedTask } from "../types"; // or wherever you store this

interface UseGetTaskProps {
  taskId: string;
}

export const useGetTask = ({ taskId }: UseGetTaskProps) => {
  const query = useQuery({
    queryKey: ["task", taskId],
    queryFn: async (): Promise<PopulatedTask> => {
      const response = await client.api.tasks[":taskId"].$get({
        param: { taskId },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch task.");
      }

      const { data } = await response.json();

      // Optionally, validate/transform `data` here if needed
      return data as PopulatedTask;
    },
  });

  return query;
};
