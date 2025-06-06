import { useQuery } from "@tanstack/react-query";


interface UseGetTaskProps {
  taskId: string;
}

export const useGetTask = ({ taskId }: UseGetTaskProps) => {
  const query = useQuery({
    queryKey: ["task", taskId],
    queryFn: async () => {
      // Fixed: Use direct fetch since RPC client doesn't support individual task fetching
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch task.");
      }

      const json = await response.json();
      
      // Handle response structure properly
      if ('data' in json) {
        return json.data;
      }
      
      return json;
    },
  });

  return query;
};
