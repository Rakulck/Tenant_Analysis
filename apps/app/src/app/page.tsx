import { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "../components/auth/login/LoginForm";

export const metadata: Metadata = {
  title: "Sign in to Tenant Analysis",
  description: "Sign in to your tenant default risk analysis platform",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-center">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            Tenant Analysis
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <LoginForm />
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">New to Tenant Analysis?</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/auth/signup"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Create an account
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/auth/forgotpassword"
            className="text-sm text-gray-600 hover:text-gray-500"
          >
            Forgot your password?
          </Link>
        </div>
      </div>
    </div>
  );
} 