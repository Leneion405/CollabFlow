import { useQuery } from "@tanstack/react-query";

export const useGetInvites = () => {
  return useQuery({
    queryKey: ["invites"],
    queryFn: async () => {
      const res = await fetch("/api/invitations", {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to load invites");
      const { data } = await res.json();
      return data; // This should be an array of invite objects
    },
  });
};

