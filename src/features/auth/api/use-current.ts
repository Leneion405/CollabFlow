import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

export const useCurrent = () => {
  const query = useQuery({
    queryKey: ["current"],
    queryFn: async () => {
      const response = await client.api.auth.current.$get();

      if (!response.ok) {
        return null;
      }

      // Fixed: Properly handle both success and error response types
      const json = await response.json();
      
      // Type guard to check if response has data property
      if ('data' in json) {
        return json.data;
      }
      
      // If no data property, return null (likely an error response)
      return null;
    },
  });

  return query;
};
