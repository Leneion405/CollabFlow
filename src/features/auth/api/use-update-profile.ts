import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";
import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<typeof client.api.auth.profile.$patch, 200>;
type RequestType = InferRequestType<typeof client.api.auth.profile.$patch>;

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType["json"]>({
    mutationFn: async (json) => {
      const response = await client.api.auth.profile.$patch({ json });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["current"] });
    },
    onError: () => {
      toast.error("Failed to update profile");
    },
  });

  return mutation;
};
