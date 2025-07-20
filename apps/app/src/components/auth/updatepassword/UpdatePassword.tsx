"use client";

import { Loading } from "@/components/ui/loading";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@v1/ui/button";
import { Input } from "@v1/ui/input";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { createClient } from "@v1/supabase/client";
import { updatePassword } from "@v1/supabase/queries";

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

export function UpdatePassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const handleRecoveryToken = async () => {
      const hash = window.location.hash;
      if (hash?.includes("type=recovery")) {
        try {
          const supabase = createClient();
          const { error } = await supabase.auth.getSession();
          if (error) {
            console.error("Error getting session:", error);
            setError("Invalid or expired recovery link. Please request a new one.");
            setTimeout(() => {
              router.push("/auth/login");
            }, 3000);
          }
        } catch (error) {
          console.error("Error handling recovery:", error);
          setError("An error occurred. Please try again.");
        }
      }
    };

    handleRecoveryToken();
  }, [router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: PasswordFormValues) {
    try {
      setIsLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append("password", data.password);

      const result = await updatePassword(formData);

      if (!result.success) {
        setError(result.error || "Failed to update password");
        if (result.error?.includes("expired")) {
          setTimeout(() => {
            router.push("/auth/login");
          }, 3000);
        }
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } catch (error) {
      console.error("Password update error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <Link href="/auth/login" className="inline-block mb-4">
            <Button variant="ghost" className="text-muted hover:text-white">
              ← Back to Login
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4285F4] via-[#9177C7] to-[#CA6673]">
              {searchParams.get("type") === "recovery" ? "Reset Password" : "Update Password"}
            </span>
          </h1>
          <p className="text-muted">Enter your new password below</p>
        </div>

        {success ? (
          <div className="text-center space-y-4">
            <p className="text-green-500">
              Password has been updated successfully. Redirecting to login...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  {...register("password")}
                  className={cn(
                    "w-full bg-transparent border-0 border-b-2 border-muted rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0 text-base md:text-lg py-2 md:py-3",
                    error && "border-red-500",
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff size={20} className="md:w-6 md:h-6" />
                  ) : (
                    <Eye size={20} className="md:w-6 md:h-6" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm md:text-base text-destructive mt-1 md:mt-2">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  {...register("confirmPassword")}
                  className={cn(
                    "w-full bg-transparent border-0 border-b-2 border-muted rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0 text-base md:text-lg py-2 md:py-3",
                    error && "border-red-500",
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} className="md:w-6 md:h-6" />
                  ) : (
                    <Eye size={20} className="md:w-6 md:h-6" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm md:text-base text-destructive mt-1 md:mt-2">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#4285F4] via-[#9177C7] to-[#CA6673] hover:opacity-90 text-base md:text-lg py-2 md:py-3 mt-6 md:mt-10"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loading size={16} className="text-white" />
                  <span>Updating...</span>
                </div>
              ) : (
                "Update Password"
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
