import { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/forgotpassword/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password | Tenant Analysis Platform",
  description: "Reset your password to regain access to your account",
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-semibold mb-2">Reset Password</h1>
          <p className="text-muted-foreground">
            Enter your email address and we'll send you instructions to reset your password
          </p>
        </div>

        <ForgotPasswordForm />

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link
              href="/auth/login"
              className="text-primary hover:text-primary/90 font-medium"
            >
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
