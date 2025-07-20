"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signUpWithDetails } from "../../../../../../packages/supabase/src/queries/auth";

const signupSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  company_name: z.string().min(2, "Company name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  timezone: z.string().default("America/New_York"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignUpFormData = z.infer<typeof signupSchema>;

export function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      timezone: "America/New_York",
    },
  });

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    setMessage(null);

    try {
      const result = await signUpWithDetails(data);
      if (result.success) {
        setMessage({
          type: "success",
          text: result.message || "Account created successfully! Please check your email to verify your account.",
        });
      } else {
        setMessage({
          type: "error",
          text: result.error || "An error occurred during signup. Please try again.",
        });
      }
    } catch (error) {
      console.error("Signup error:", error);
      setMessage({
        type: "error",
        text: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {message && (
        <div
          className={`rounded-md p-4 text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
          Full name
        </label>
        <div className="mt-1">
          <input
            id="full_name"
            type="text"
            autoComplete="name"
            {...register("full_name")}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter your full name"
          />
          {errors.full_name && (
            <p className="mt-2 text-sm text-red-600">{errors.full_name.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <div className="mt-1">
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register("email")}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter your email"
          />
          {errors.email && (
            <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">
          Company name
        </label>
        <div className="mt-1">
          <input
            id="company_name"
            type="text"
            autoComplete="organization"
            {...register("company_name")}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter your company name"
          />
          {errors.company_name && (
            <p className="mt-2 text-sm text-red-600">{errors.company_name.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Phone number
        </label>
        <div className="mt-1">
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            {...register("phone")}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter your phone number"
          />
          {errors.phone && (
            <p className="mt-2 text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <div className="mt-1">
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register("password")}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Create a password"
          />
          {errors.password && (
            <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Creating account..." : "Create account"}
        </button>
      </div>
    </form>
  );
}
