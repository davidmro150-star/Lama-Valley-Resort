
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ArrowRight,
  Mountain,
  LoaderCircle,
} from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (!result || result.error) {
        setError("Invalid email or password. Please try again.");
        setLoading(false);
        return;
      }

      router.replace("/admin/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Admin login error:", error);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f5ef] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[1050px] overflow-hidden rounded-2xl border border-[#e8e4da] bg-white shadow-[0_20px_70px_rgba(35,75,59,0.10)]">
        <div className="grid md:grid-cols-2">
          {/* Brand Panel */}
          <div className="relative hidden min-h-[650px] flex-col justify-between overflow-hidden bg-[#173729] p-12 text-white md:flex">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(196,154,98,0.22),transparent_35%),radial-gradient(circle_at_10%_90%,rgba(66,107,85,0.55),transparent_45%)]" />

            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-white/10">
                  <Mountain size={25} />
                </div>

                <div>
                  <h1 className="font-serif text-xl font-semibold tracking-wide">
                    LAMA VALLEY
                  </h1>
                  <p className="mt-0.5 text-[10px] tracking-[0.28em] text-white/60">
                    RESORT & RESTAURANT
                  </p>
                </div>
              </div>

              <div className="mt-32 max-w-sm">
                <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d6b786]">
                  Administration
                </span>

                <h2 className="mt-5 font-serif text-4xl leading-[1.2]">
                  Manage your
                  <br />
                  hospitality
                  <br />
                  experience.
                </h2>

                <p className="mt-6 text-sm leading-7 text-white/65">
                  Welcome to the resort management portal. Manage
                  reservations and keep your operations organized
                  from one place.
                </p>
              </div>
            </div>

            <div className="relative z-10 border-t border-white/15 pt-6">
              <p className="text-xs text-white/50">
                Lama, Bandarban, Bangladesh
              </p>
            </div>
          </div>

          {/* Login Form */}
          <div className="flex min-h-[650px] flex-col justify-center px-6 py-12 sm:px-12 lg:px-14">
            <div className="mb-10">
              <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-xl bg-[#edf2ed] text-[#234b3b] md:hidden">
                <Mountain size={25} />
              </div>

              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a47d4d]">
                Admin Portal
              </p>

              <h2 className="mt-3 font-serif text-3xl font-semibold text-[#252a25]">
                Welcome back
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#777d73]">
                Sign in with your administrator credentials to
                access the management dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-[#303a32]"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#92998f]"
                  />

                  <input
                    id="email"
                    type="email"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="admin@example.com"
                    className="h-12 w-full rounded-lg border border-[#e5e5dc] bg-[#fcfcfa] pl-11 pr-4 text-sm text-[#252a25] outline-none transition placeholder:text-[#a5aaa1] focus:border-[#426b55] focus:ring-2 focus:ring-[#426b55]/10"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-[#303a32]"
                  >
                    Password
                  </label>
                </div>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#92998f]"
                  />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    className="h-12 w-full rounded-lg border border-[#e5e5dc] bg-[#fcfcfa] pl-11 pr-12 text-sm text-[#252a25] outline-none transition placeholder:text-[#a5aaa1] focus:border-[#426b55] focus:ring-2 focus:ring-[#426b55]/10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#92998f] transition hover:text-[#234b3b]"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#234b3b] px-5 text-sm font-semibold text-white transition hover:bg-[#173729] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <LoaderCircle size={18} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in to dashboard
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 border-t border-[#eeece4] pt-6">
              <Link
                href="/"
                className="text-sm font-medium text-[#777d73] transition hover:text-[#234b3b]"
              >
                ← Back to resort website
              </Link>

              <p className="mt-8 text-center text-xs text-[#a0a49b]">
                © {new Date().getFullYear()} Lama Valley Resort & Restaurant
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
