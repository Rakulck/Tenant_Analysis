import { Metadata } from "next";
import Link from "next/link";
import { SignUpForm } from "@/components/auth/signup/SignUpForm";
import { WelcomeSection } from "@/components/auth/WelcomeSection";

export const metadata: Metadata = {
  title: "Create Account | Tenant Analysis Platform",
  description: "Create your account to start analyzing tenant default risks",
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Welcome Section */}
      <WelcomeSection />

      {/* Sign Up Form Section */}
      <div className="flex flex-col justify-center p-4 sm:p-6 md:p-8 lg:p-10">
        <div className="mb-8 text-center">
          <h1 className="text-2xl md:text-3xl font-semibold mb-2">Create Your Account</h1>
          <p className="text-muted-foreground">
            Start analyzing tenant default risks with AI-powered insights
          </p>
        </div>

        <SignUpForm />

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-primary hover:text-primary/90 font-medium"
            >
              Sign In
            </Link>
          </p>
        </div>

        <div className="mt-8 text-xs text-center text-muted-foreground">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-foreground">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-foreground">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
