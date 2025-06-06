import { redirect } from "next/navigation";
import { getCurrent } from "@/features/auth/queries";
import { SignInCard } from "@/features/auth/components/sign-in-card";

const SignInPage = async () => {
  try {
    const user = await getCurrent();
    if (user) redirect("/dashboard");
    return <SignInCard />;
  } catch {
    // If user is not authenticated, show sign-in form
    return <SignInCard />;
  }
};

export default SignInPage;
