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
        
        // Extract the error message from the response
        if ('error' in errorData && typeof errorData.error === 'string') {
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
      console.error("Registration error:", error);
      
      const errorMessage = error.message;
      
      // Handle specific error messages
      if (errorMessage.includes("already exists")) {
        toast.error("This email is already registered. Please use a different email or sign in instead.");
      } else if (errorMessage.includes("agree to")) {
        toast.error("You must agree to the Privacy Policy and Terms of Service to continue.");
      } else if (errorMessage.includes("Password must be at least")) {
        toast.error("Password must be at least 8 characters long.");
      } else if (errorMessage.includes("Name") && errorMessage.includes("required")) {
        toast.error("Please enter your name.");
      } else if (errorMessage.includes("valid email")) {
        toast.error("Please enter a valid email address.");
      } else {
        toast.error(errorMessage || "Failed to create account");
      }
    },
  });

  return mutation;
};
