
"use client";

import { signOut } from "next-auth/react";
import {
  Bell,
  LogOut,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";

export default function AdminHeader() {
  async function handleLogout() {
    await signOut({
      callbackUrl: "/admin/login",
    });
  }

  return (
    <header className="sticky top-0 z-30 flex h-[82px] items-center justify-between border-b border-[#eeece4] bg-white px-5 sm:px-8">
      {/* Page Information */}
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#92998f]">
          Lama Valley Resort
        </p>

        <h2 className="mt-1 text-lg font-semibold text-[#252a25]">
          Management Portal
        </h2>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Notification */}
        <button
          type="button"
          aria-label="Notifications"
          title="Notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#777d73] transition hover:bg-[#f4f5f1] hover:text-[#234b3b]"
        >
          <Bell size={19} strokeWidth={1.8} />
        </button>

        <div className="hidden h-9 w-px bg-[#eeece4] sm:block" />

        {/* Admin Profile */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#edf2ed] text-sm font-semibold text-[#234b3b]">
            A
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-[#303a32]">
              Administrator
            </p>

            <div className="mt-0.5 flex items-center gap-1 text-[11px] text-[#92998f]">
              <ShieldCheck size={12} className="text-[#426b55]" />
              <span>Super Admin</span>
            </div>
          </div>

          <ChevronDown
            size={15}
            className="hidden text-[#92998f] sm:block"
          />
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          title="Sign out"
          aria-label="Sign out"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#eee8df] text-[#777d73] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
}
