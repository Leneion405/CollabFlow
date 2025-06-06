import { redirect } from "next/navigation";
import { getCurrent } from "@/features/auth/queries";
import { SignUpCard } from "@/features/auth/components/sign-up-card";

const SignUpPage = async () => {
  try {
    const user = await getCurrent();
    if (user) redirect("/dashboard");
    return <SignUpCard />;
  } catch (error) {
    return <SignUpCard />;
  }
};
export default SignUpPage;