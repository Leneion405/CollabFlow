import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";

type ResponseType = InferResponseType<(typeof client.api.auth.register)["$post"]>;
type RequestType = InferRequestType<(typeof client.api.auth.register)["$post"]>;

export const useRegister = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.auth.register.$post({ json });
      
      if (!response.ok) {
        const errorData = await response.json();
        // Type guard to check if errorData has an error property
        if ('error' in errorData) {
          throw new Error(errorData.error);
        }
        throw new Error("Registration failed");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Account created successfully!");
      queryClient.invalidateQueries({ queryKey: ["current"] });
      router.push("/dashboard");
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create account");
    },
  });

  return mutation;
};
