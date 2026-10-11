import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/shared/Field";
import { getErrorMessage } from "@/lib/api";
import { useLogin, useSignup } from "./useAuth";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
});
const signupSchema = loginSchema.extend({
  firstName: z.string().min(2, "At least 2 characters").max(50),
  lastName: z.string().max(50).optional(),
});

const inputCls = "h-12 rounded-full border-border px-5 font-normal";
const submitCls = "h-12 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90";

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
    <form onSubmit={handleSubmit((v) => login.mutate({ mailid: v.email, password: v.password }))} className="space-y-4">
      <Field label="Email address" error={errors.email?.message}>
        <Input {...register("email")} placeholder="you@example.com" className={inputCls} />
      </Field>
      <Field label="Password" error={errors.password?.message}>
        <PasswordInput {...register("password")} placeholder="Enter your password" />
      </Field>
      {login.isError && <p className="text-sm text-destructive">Invalid email or password.</p>}
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
    <form onSubmit={handleSubmit(({ email, lastName, ...rest }) =>
      signup.mutate({ ...rest, mailid: email, lastName: lastName || undefined }))} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="First name" error={errors.firstName?.message}>
          <Input {...register("firstName")} placeholder="Jiya" className={inputCls} />
        </Field>
        <Field label="Last name" error={errors.lastName?.message}>
          <Input {...register("lastName")} placeholder="Sharma" className={inputCls} />
        </Field>
      </div>
      <Field label="Email address" error={errors.email?.message}>
        <Input {...register("email")} placeholder="you@example.com" className={inputCls} />
      </Field>
      <Field label="Password" error={errors.password?.message}>
        <PasswordInput {...register("password")} placeholder="Create a password" />
      </Field>
      {signup.isError && (
        <p className="text-sm text-destructive">{getErrorMessage(signup.error, "Could not create account. Try another email.")}</p>
      )}
      <Button disabled={signup.isPending} className={submitCls}>
        {signup.isPending ? "Creating account..." : "Create your account"} <ArrowRight size={16} />
      </Button>
    </form>
  );
}
