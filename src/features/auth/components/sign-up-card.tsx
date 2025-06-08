"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa6";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";

import { DottedSeparator } from "@/components/dotted-separator";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { PrivacyPolicyContent } from "@/components/privacy-policy-content";
import { TermsOfServiceContent } from "@/components/terms-of-service-content";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { signUpWithGithub, signUpWithGoogle } from "@/lib/oauth";

import { registerSchema } from "../schemas";
import { useRegister } from "../api/use-register";

export const SignUpCard = () => {
  const { mutate, isPending } = useRegister();
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfService, setShowTermsOfService] = useState(false);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      agreeToTerms: false,
    },
  });

  const onSubmit = (values: z.infer<typeof registerSchema>) => {
    mutate({ json: values });
  };

  const isFormValid = form.watch("agreeToTerms");

  const handleGoogleSignUp = () => {
    if (!isFormValid) {
      form.setError("agreeToTerms", {
        message: "You must agree to the Privacy Policy and Terms of Service"
      });
      return;
    }
    signUpWithGoogle();
  };

  const handleGithubSignUp = () => {
    if (!isFormValid) {
      form.setError("agreeToTerms", {
        message: "You must agree to the Privacy Policy and Terms of Service"
      });
      return;
    }
    signUpWithGithub();
  };

  return (
    <>
      <Card className="size-full md:w-[487px] border-none shadow-none">
        <CardHeader className="flex items-center justify-center text-center p-7">
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>
            Create your account to get started with Collab Flow
          </CardDescription>
        </CardHeader>
        <div className="px-7">
          <DottedSeparator />
        </div>
        <CardContent className="p-7">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter your name"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email address"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="password"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Agreement Checkbox */}
              <FormField
                name="agreeToTerms"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isPending}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-normal cursor-pointer">
                        I agree to the{" "}
                        <button
                          type="button"
                          onClick={() => setShowPrivacyPolicy(true)}
                          className="text-blue-700 hover:underline font-medium"
                          disabled={isPending}
                        >
                          Privacy Policy
                        </button>{" "}
                        and{" "}
                        <button
                          type="button"
                          onClick={() => setShowTermsOfService(true)}
                          className="text-blue-700 hover:underline font-medium"
                          disabled={isPending}
                        >
                          Terms of Service
                        </button>
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              
              <Button 
                disabled={isPending || !isFormValid} 
                size="lg" 
                className="w-full"
                type="submit"
              >
                {isPending ? "Creating Account..." : "Sign Up"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <div className="px-7">
          <DottedSeparator />
        </div>
        <CardContent className="p-7 flex flex-col gap-y-4">
          <Button
            onClick={handleGoogleSignUp}
            disabled={isPending || !isFormValid}
            variant="secondary"
            size="lg"
            className="w-full"
            type="button"
          >
            <FcGoogle className="mr-2 size-5" />
            {isPending ? "Signing Up..." : "Sign Up with Google"}
          </Button>
          <Button
            onClick={handleGithubSignUp}
            disabled={isPending || !isFormValid}
            variant="secondary"
            size="lg"
            className="w-full"
            type="button"
          >
            <FaGithub className="mr-2 size-5" />
            {isPending ? "Signing Up..." : "Sign Up with GitHub"}
          </Button>
        </CardContent>
        <div className="px-7">
          <DottedSeparator />
        </div>
        <CardContent className="p-7 flex items-center justify-center">
          <p>
            Already have an account?{" "}
            <Link href="/sign-in">
              <span className="text-blue-700 hover:underline">Login</span>
            </Link>
          </p>
        </CardContent>
      </Card>

      {/* Privacy Policy Modal */}
      <Modal
        isOpen={showPrivacyPolicy}
        onClose={() => setShowPrivacyPolicy(false)}
        title="Privacy Policy"
      >
        <PrivacyPolicyContent />
      </Modal>

      {/* Terms of Service Modal */}
      <Modal
        isOpen={showTermsOfService}
        onClose={() => setShowTermsOfService(false)}
        title="Terms of Service"
      >
        <TermsOfServiceContent />
      </Modal>
    </>
  );
};
