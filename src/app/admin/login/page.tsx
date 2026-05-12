"use client";

import { createBrowserSupabase } from "@/lib/supabase";

export default function AdminLoginPage() {
  const handleSignIn = async () => {
    const supabase = createBrowserSupabase();
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { 
        redirectTo: `${window.location.origin}/auth/callback?next=/admin` 
      },
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#0d0d0f] p-4 font-pixel">
      <div className="text-center">
        <h1 className="mb-2 text-4xl text-[#ed0584]">Web4City Admin</h1>
        <p className="text-[#8c8c9c]">Sign in to manage ads, drops & city analytics</p>
      </div>

      <div className="rounded-none border-4 border-[#1a1a24] bg-[#101018] p-8">
        <div className="mb-6 text-center">
          <p className="text-sm text-[#8c8c9c]">Admin access requires GitHub authentication</p>
          <p className="mt-1 text-xs text-[#8c8c9c]">Only whitelisted GitHub accounts can access</p>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleSignIn}
            className="flex items-center gap-3 rounded-none border border-[#2a2a30] bg-[#161618] px-8 py-4 text-base text-white hover:bg-[#1c1c20]"
            style={{
              borderColor: "#ed0584",
            }}
          >
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clipRule="evenodd"
              />
            </svg>
            Sign in with GitHub
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-[#8c8c9c]">
            After signing in, you&apos;ll be redirected to the admin dashboard
          </p>
        </div>
      </div>

      <div className="mt-4 text-center text-xs text-[#8c8c9c]">
        <p>Admin: web4city</p>
      </div>
    </div>
  );
}
