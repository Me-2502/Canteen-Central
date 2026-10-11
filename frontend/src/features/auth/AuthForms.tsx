import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLogin, useSignup } from "./useAuth";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
});
const signupSchema = loginSchema.extend({ username: z.string().min(3, "At least 3 characters") });

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5 text-sm font-semibold">
      <span className="pl-1">{label}</span>
      {children}
      {error && <span className="block pl-1 text-xs font-normal text-red-600">{error}</span>}
    </label>
  );
}

const inputCls = "h-12 rounded-full border-sage px-5 font-normal";
const submitCls = "h-12 w-full rounded-full bg-forest text-white hover:bg-forest/90";

function PasswordInput(props: React.ComponentProps<typeof Input>) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input {...props} type={show ? "text" : "password"} className={inputCls} />
      <button type="button" aria-label="Toggle password" onClick={() => setShow(!show)}
        className="absolute right-4 top-1/2 -translate-y-1/2">
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

export function LoginForm() {
  const login = useLogin();
  const { register, handleSubmit, formState: { errors } } =
    useForm<z.infer<typeof loginSchema>>({ resolver: zodResolver(loginSchema) });

  return (
    <form onSubmit={handleSubmit((v) => login.mutate(v))} className="space-y-4">
      <Field label="Email address" error={errors.email?.message}>
        <Input {...register("email")} placeholder="you@example.com" className={inputCls} />
      </Field>
      <Field label="Password" error={errors.password?.message}>
        <PasswordInput {...register("password")} placeholder="Enter your password" />
      </Field>
      {login.isError && <p className="text-sm text-red-600">Invalid email or password.</p>}
      <Button disabled={login.isPending} className={submitCls}>
        {login.isPending ? "Logging in..." : "Log in to your account"} <ArrowRight size={16} />
      </Button>
    </form>
  );
}

export function SignupForm() {
  const signup = useSignup();
  const { register, handleSubmit, formState: { errors } } =
    useForm<z.infer<typeof signupSchema>>({ resolver: zodResolver(signupSchema) });

  return (
    <form onSubmit={handleSubmit((v) => signup.mutate(v))} className="space-y-4">
      <Field label="Username" error={errors.username?.message}>
        <Input {...register("username")} placeholder="jiya123" className={inputCls} />
      </Field>
      <Field label="Email address" error={errors.email?.message}>
        <Input {...register("email")} placeholder="you@example.com" className={inputCls} />
      </Field>
      <Field label="Password" error={errors.password?.message}>
        <PasswordInput {...register("password")} placeholder="Create a password" />
      </Field>
      {signup.isError && <p className="text-sm text-red-600">Could not create account. Try another email.</p>}
      <Button disabled={signup.isPending} className={submitCls}>
        {signup.isPending ? "Creating account..." : "Create your account"} <ArrowRight size={16} />
      </Button>
    </form>
  );
}
