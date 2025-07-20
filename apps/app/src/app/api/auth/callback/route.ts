import { createServerClientFromEnv } from "@v1/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase_server = createServerClientFromEnv();
  const { searchParams, origin } = new URL(request.url);

  // Extract parameters for different auth flows
  const code = searchParams.get("code"); // OAuth callback parameter
  const token_hash = searchParams.get("token_hash"); // Email confirmation parameter
  const type = searchParams.get("type"); // Email confirmation type (usually 'email')
  const next = searchParams.get("next") ?? "/en"; // Default redirect to locale dashboard

  let authSuccess = false;

  // FLOW 1: Handle OAuth callback (from social providers, magic links)
  if (code) {
    console.log("🔄 [AUTH CALLBACK] Processing OAuth callback with code");
    const { error } = await supabase_server.auth.exchangeCodeForSession(code);
    if (!error) {
      console.log("✅ [AUTH CALLBACK] OAuth session exchange successful");
      authSuccess = true;
    } else {
      console.error("❌ [AUTH CALLBACK] OAuth session exchange failed:", error);
    }
  }

  // FLOW 2: Handle email confirmation (from signup confirmation emails)
  if (token_hash && type) {
    console.log("📧 [AUTH CALLBACK] Processing email confirmation with token");
    const { data, error } = await supabase_server.auth.verifyOtp({
      token_hash,
      type: type as "email",
    });
    if (!error && data.user) {
      console.log("✅ [AUTH CALLBACK] Email confirmation successful");
      console.log("📝 [AUTH CALLBACK] User profile should already exist from database trigger");
      authSuccess = true;
    } else {
      console.error("❌ [AUTH CALLBACK] Email confirmation failed:", error);
    }
  }

  // If either authentication flow succeeded, proceed with subscription-based redirect
  if (authSuccess) {
    const forwardedHost = request.headers.get("x-forwarded-host");
    const isLocalEnv = process.env.NODE_ENV === "development";

    try {
      console.log("👤 [AUTH CALLBACK] Fetching user profile for subscription-based redirect");
      const {
        data: { user },
      } = await supabase_server.auth.getUser();

      if (user?.email) {
        // Query user_profiles table to get subscription info
        const { data: profile, error: profileError } = await supabase_server
          .from("user_profiles")
          .select("subscription_plan, is_active, trial_ends_at, analyses_used_this_month, analysis_quota")
          .eq("email", user.email)
          .single();

        if (profileError) {
          console.error("❌ [AUTH CALLBACK] Error fetching user profile:", profileError);
          throw profileError;
        }

        if (profile) {
          console.log(`🎯 [AUTH CALLBACK] User profile found: ${JSON.stringify(profile)}`);

          // Check if user's trial has ended or account is inactive
          const trialEnded = profile.trial_ends_at && new Date(profile.trial_ends_at) < new Date();
          if (!profile.is_active || trialEnded) {
            console.log("⚠️ [AUTH CALLBACK] Account inactive or trial ended");
            return NextResponse.redirect(`${origin}/en/subscription?status=${trialEnded ? 'trial-ended' : 'inactive'}`);
          }

          // Check if user has reached their analysis quota
          if (profile.analyses_used_this_month != null && 
              profile.analysis_quota != null && 
              profile.analyses_used_this_month >= profile.analysis_quota) {
            console.log("⚠️ [AUTH CALLBACK] Analysis quota reached");
            return NextResponse.redirect(`${origin}/en/subscription?status=quota-reached`);
          }

          // Subscription-based redirect logic - redirect to locale dashboard
          let redirectPath = "/en"; // Default to English locale dashboard
          
          // Add any subscription-specific parameters
          if (profile.subscription_plan === "starter") {
            redirectPath += "?tour=true"; // Show tutorial for new starter users
          }

          console.log(`🔀 [AUTH CALLBACK] Redirecting to: ${redirectPath}`);

          // Handle different deployment environments
          if (isLocalEnv) {
            return NextResponse.redirect(`${origin}${redirectPath}`);
          }
          if (forwardedHost) {
            return NextResponse.redirect(`https://${forwardedHost}${redirectPath}`);
          }
          return NextResponse.redirect(`${origin}${redirectPath}`);
        }
        console.log("⚠️ [AUTH CALLBACK] No profile found, redirecting to onboarding");
        return NextResponse.redirect(`${origin}/auth/signup`);
      } else {
        console.log("⚠️ [AUTH CALLBACK] No user found after successful auth");
        return NextResponse.redirect(`${origin}/auth/login?error=user-not-found`);
      }
    } catch (error) {
      console.error("❌ [AUTH CALLBACK] Error in auth flow:", error);
      return NextResponse.redirect(`${origin}/auth/login?error=auth-error`);
    }
  }

  // If no valid auth parameters or auth failed, redirect to login with error
  console.error("❌ [AUTH CALLBACK] Authentication failed - no valid code or token_hash");
  return NextResponse.redirect(`${origin}/auth/login?error=auth-code-error`);
}
