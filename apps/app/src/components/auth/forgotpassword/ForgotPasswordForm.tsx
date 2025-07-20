"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../../../../../../packages/ui/src/components/button";
import { Input } from "../../../../../../packages/ui/src/components/input";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { resetPassword } from "../../../../../../packages/supabase/src/queries/auth";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("email", data.email);

      const result = await resetPassword(formData);
      if (result.success) {
        setMessage({
          type: "success",
          text: result.message || "Password reset instructions sent to your email",
        });
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to send reset instructions. Please try again.",
        });
      }
    } catch (error) {
      console.error("Password reset error:", error);
      setMessage({
        type: "error",
        text: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {message && (
        <div
          className={`p-4 rounded-lg text-sm md:text-base ${
            message.type === "success"
              ? "bg-green-900/20 text-green-400 border border-green-800"
              : "bg-red-900/20 text-red-400 border border-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <div>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          {...register("email")}
          className="w-full bg-transparent border-0 border-b-2 border-muted rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0 text-base md:text-lg py-2 md:py-3"
        />
        {errors.email && (
          <p className="text-sm md:text-base text-destructive mt-1 md:mt-2">
            {errors.email.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg py-3 md:py-4 text-base md:text-lg font-medium transition-colors"
      >
        {isLoading ? "Sending Instructions..." : "Send Reset Instructions"}
      </Button>
    </form>
  );
} 