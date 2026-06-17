import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Field, TextInput } from "../../components/ui/TextInput";
import { useAuth } from "../../features/auth/AuthProvider";
import { APP_NAME } from "../../lib/app-info";

const schema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter")
});

type FormInput = z.infer<typeof schema>;

export function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "pns@uppjpds.local",
      password: "Password123!"
    }
  });

  if (user) {
    return <Navigate to={user.role === "PNS" ? "/admin/dashboard" : "/"} replace />;
  }

  async function onSubmit(input: FormInput) {
    setError("");
    try {
      const authUser = await login(input.email, input.password);
      navigate(authUser.role === "PNS" ? "/admin/dashboard" : "/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login gagal");
    }
  }

  return (
    <main className="relative grid min-h-screen place-items-center bg-infobase-dark px-4 py-8">
      {/* Background glow */}
      <div className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-infobase-accent/10 blur-[120px]" aria-hidden="true" />

      <div className="relative w-full max-w-sm animate-slideUp">
        <Link to="/" className="mb-5 inline-flex text-xs font-bold uppercase tracking-widest text-white/50 transition hover:text-white">
          ← UPPJPDS
        </Link>

        <section className="overflow-hidden rounded-2xl bg-white shadow-glass-lg">
          {/* Gradient bar */}
          <div className="h-1.5 bg-gradient-to-r from-infobase-dark via-infobase-primary to-infobase-accent" />

          <div className="p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-infobase-primary">{APP_NAME}</p>
            <h1 className="mt-1.5 text-xl font-black text-infobase-dark">Login Petugas</h1>

            <form className="mt-6 grid gap-4" onSubmit={handleSubmit(onSubmit)}>
              <Field label="Email" mode="solid">
                <TextInput type="email" autoComplete="email" mode="solid" {...register("email")} />
                {errors.email ? <span className="text-xs text-red-500">{errors.email.message}</span> : null}
              </Field>
              <Field label="Password" mode="solid">
                <TextInput type="password" autoComplete="current-password" mode="solid" {...register("password")} />
                {errors.password ? <span className="text-xs text-red-500">{errors.password.message}</span> : null}
              </Field>
              {error ? (
                <div className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600">
                  {error}
                </div>
              ) : null}
              <Button type="submit" disabled={isSubmitting} className="mt-1">
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
