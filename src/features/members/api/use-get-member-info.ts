import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

interface UseGetMemberInfoProps {
  memberId: string;
  workspaceId: string;
}

export const useGetMemberInfo = ({ memberId, workspaceId }: UseGetMemberInfoProps) => {
  const query = useQuery({
    queryKey: ["member-info", memberId, workspaceId],
    queryFn: async () => {
      const response = await client.api.members[":memberId"]["info"].$get({
        param: { memberId },
        query: { workspaceId },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch member info.");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
