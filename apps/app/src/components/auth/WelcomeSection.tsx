import React from "react";

interface Props {
  variant?: "login" | "signup";
}

export function WelcomeSection({ variant = "login" }: Props) {
  return (
    <div className="hidden lg:flex w-1/2 flex-col items-center justify-center bg-gradient-to-br from-black to-gray-900">
      <div className="max-w-md px-8">
        <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 leading-[1] pb-2">
          {variant === "login" ? "Welcome to" : "Get Started with"}
        </p>
        <h1 className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 leading-[1.1] pb-2">
          Tenant Analysis
        </h1>
        <p className="text-gray-300 text-lg mt-4">
          {variant === "login"
            ? "Access your AI-powered tenant default risk analysis dashboard."
            : "Start analyzing tenant default risks with advanced AI insights."}
        </p>
        <div className="mt-8 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-300">AI-powered risk assessment</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <p className="text-gray-300">Real-time market insights</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-300">Detailed analytics & reports</p>
          </div>
        </div>
      </div>
    </div>
  );
}
