// import { getLucia, validateRequest } from "../auth";
// import { Form } from "./signup/form";
// import { redirect } from "next/navigation";
// import { cookies } from "next/headers";

// import type { ActionResult } from "./signup/form";
// import { getRequestContext } from "@cloudflare/next-on-pages";
// import { LOGIN_PATH } from "@/routes";
// import { LogoutButton } from "@/components/auth/log-out-button";

// export default async function Page() {
//   const { user } = await validateRequest();
//   if (!user) {
//     return redirect(LOGIN_PATH);
//   }
//   return (
//     <>
//       <h1>Hi, {user?.id}!</h1>
//       <p>Your user ID is {user.username}.</p>
//       <LogoutButton>Sign out</LogoutButton>
//     </>
//   );
// }

import { Poppins } from "next/font/google";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LoginButton } from "@/components/auth/login-button";

const font = Poppins({
  subsets: ["latin"],
  weight: ["600"],
});

export default function Home() {
  return (
    <main className="flex h-full flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400 to-blue-800">
      <div className="space-y-6 text-center">
        <h1
          className={cn(
            "text-6xl font-semibold text-white drop-shadow-md",
            font.className
          )}
        >
          🔐 Auth
        </h1>
        <p className="text-white text-lg">A simple authentication service</p>
        <div>
          <LoginButton asChild>
            <Button variant="secondary" size="lg">
              Sign in
            </Button>
          </LoginButton>
        </div>
      </div>
    </main>
  );
}
