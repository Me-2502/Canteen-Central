import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { Soup } from "lucide-react";
import { LoginForm, SignupForm } from "@/features/auth/AuthForms";
import { ThemeToggle } from "@/features/theme/ThemeToggle";

export default function AuthPage() {
  const [params] = useSearchParams();
  const [tab, setTab] = useState<"login" | "signup">(params.get("mode") === "signup" ? "signup" : "login");

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1.4fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-forest p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-full bg-sage text-forest"><Soup size={22} /></span>
          <div className="leading-tight">
            <p className="font-bold tracking-wide">CANTEEN</p>
            <p className="text-xs tracking-[0.25em] text-sage">CENTRAL</p>
          </div>
        </div>
        <div>
          <p className="mb-4 text-sm tracking-widest text-sage">FRESH FOOD, YOUR WAY</p>
          <h1 className="text-6xl font-medium leading-[1.05] tracking-tight">Welcome to your neighbourhood canteen.</h1>
          <p className="mt-8 max-w-md text-lg text-cream/90">
            Sign in to save your favourites, order ahead, and make every lunch break a little easier.
          </p>
        </div>
        <p className="text-xs tracking-widest text-sage">FRESHLY MADE · MINDFULLY SERVED</p>
        <div className="pointer-events-none absolute -right-40 top-1/3 size-[520px] rounded-full border border-sage/30" />
        <div className="pointer-events-none absolute -right-20 top-[40%] size-[380px] rounded-full border border-sage/30" />
      </aside>

      <section className="relative flex items-center justify-center p-6">
        <ThemeToggle className="absolute right-6 top-6" />
        <div className="w-full max-w-md space-y-10">
          <div className="grid grid-cols-2 rounded-full border border-border p-1.5">
            {(["login", "signup"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`relative z-10 h-11 rounded-full text-sm font-semibold transition-colors ${tab === t ? "text-primary-foreground" : ""}`}>
                {tab === t && (
                  <motion.span layoutId="auth-pill" className="absolute inset-0 -z-10 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }} />
                )}
                {t === "login" ? "Log in" : "Sign up"}
              </button>
            ))}
          </div>

          <div>
            <p className="text-sm font-bold tracking-widest">{tab === "login" ? "WELCOME BACK" : "NEW HERE"}</p>
            <h2 className="mt-3 text-5xl font-medium tracking-tight">
              {tab === "login" ? "Good to see you again." : "Let's get you started."}
            </h2>
            <p className="mt-3 text-muted-foreground">
              {tab === "login" ? "Enter your details to continue to your account." : "Create an account to order ahead."}
            </p>
          </div>

          {tab === "login" ? <LoginForm /> : <SignupForm />}
          <p className="text-center text-xs text-muted-foreground">By continuing, you agree to our Terms of Service and Privacy Policy.</p>
        </div>
      </section>
    </div>
  );
}
