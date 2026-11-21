
"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import {
  LockKeyhole,
  Eye,
  EyeOff,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

const initialForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

// Keep this component outside ChangePasswordPage.
// This prevents the input from being remounted on every keystroke.
function PasswordField({
  label,
  name,
  value,
  field,
  placeholder,
  autoComplete,
  visible,
  onChange,
  onToggle,
  disabled,
}) {
  return (
    <div className="w-full min-w-0">
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-[#344238]"
      >
        {label}
      </label>

      <div className="relative w-full">
        <input
          id={name}
          name={name}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          required
          maxLength={128}
          disabled={disabled}
          dir="ltr"
          style={{
            writingMode: "horizontal-tb",
            textOrientation: "mixed",
            direction: "ltr",
            whiteSpace: "nowrap",
            wordBreak: "normal",
            overflowWrap: "normal",
            letterSpacing: "normal",
          }}
          className="!block !h-14 !w-full !min-w-0 !text-left !text-base !leading-normal rounded-xl border border-[#dfe5dd] bg-white px-4 pr-14 text-[#26352b] outline-none transition placeholder:text-sm placeholder:font-normal placeholder:text-[#a4aaa3] focus:border-[#426b55] focus:ring-4 focus:ring-[#426b55]/10 disabled:bg-[#f5f6f3]"
        />

        <button
          type="button"
          onClick={() => onToggle(field)}
          disabled={disabled}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-[#788078] transition hover:bg-[#edf3ed] hover:text-[#234b3b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#426b55] disabled:opacity-50"
        >
          {visible ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    </div>
  );
}

export default function ChangePasswordPage() {
  const [form, setForm] = useState(initialForm);

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [passwordChanged, setPasswordChanged] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
    setMessageType("");
  }

  function toggleVisibility(field) {
    setShowPasswords((previous) => ({
      ...previous,
      [field]: !previous[field],
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    if (
      !form.currentPassword ||
      !form.newPassword ||
      !form.confirmPassword
    ) {
      setMessage("Please complete all password fields.");
      setMessageType("error");
      return;
    }

    if (form.newPassword.length < 8) {
      setMessage("New password must contain at least 8 characters.");
      setMessageType("error");
      return;
    }

    if (form.newPassword.length > 128) {
      setMessage("Password cannot exceed 128 characters.");
      setMessageType("error");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setMessage("New password and confirmation do not match.");
      setMessageType("error");
      return;
    }

    if (form.newPassword === form.currentPassword) {
      setMessage(
        "Your new password must be different from your current password."
      );
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to change password."
        );
      }

      setPasswordChanged(true);
      setMessage(
        result.message || "Password updated successfully."
      );
      setMessageType("success");
      setForm(initialForm);

      await signOut({
        callbackUrl: "/admin/login",
      });
    } catch (error) {
      setMessage(
        error.message || "Something went wrong. Please try again."
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  const passwordFieldProps = {
    onChange: handleChange,
    onToggle: toggleVisibility,
    disabled: loading || passwordChanged,
  };

  return (
    <div className="min-h-full bg-[#f7f5ef] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-3xl">

        {/* Page heading */}
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#8a958b]">
            <ShieldCheck size={15} />
            Account Security
          </div>

          <h1 className="font-serif text-3xl font-semibold text-[#234b3b]">
            Change Password
          </h1>

          <p className="mt-2 text-sm text-[#788078]">
            Update your account password to keep your management account secure.
          </p>
        </div>

        {/* Password card */}
        <div className="overflow-hidden rounded-2xl border border-[#e9e7de] bg-white shadow-sm">

          <div className="flex items-center gap-4 border-b border-[#efeee8] px-6 py-5 sm:px-8">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#edf3ed] text-[#234b3b]">
              <LockKeyhole size={23} />
            </div>

            <div>
              <h2 className="font-semibold text-[#303a32]">
                Password Settings
              </h2>

              <p className="mt-1 text-xs text-[#92998f]">
                Only your own account password will be changed.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-7 p-6 sm:p-8"
          >

            {/* Current password */}
            <PasswordField
              {...passwordFieldProps}
              label="Current Password"
              name="currentPassword"
              value={form.currentPassword}
              field="current"
              visible={showPasswords.current}
              placeholder="Enter your current password"
              autoComplete="current-password"
            />

            {/* New password section */}
            <div className="border-t border-[#efeee8] pt-7">

              <div className="mb-6 flex items-center gap-2 text-sm font-semibold text-[#344238]">
                <KeyRound size={18} className="text-[#426b55]" />
                Create a New Password
              </div>

              <div className="space-y-6">

                <PasswordField
                  {...passwordFieldProps}
                  label="New Password"
                  name="newPassword"
                  value={form.newPassword}
                  field="new"
                  visible={showPasswords.new}
                  placeholder="Enter your new password"
                  autoComplete="new-password"
                />

                <PasswordField
                  {...passwordFieldProps}
                  label="Confirm New Password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  field="confirm"
                  visible={showPasswords.confirm}
                  placeholder="Enter your new password again"
                  autoComplete="new-password"
                />

              </div>
            </div>

            {/* Password requirements */}
            <div className="rounded-xl bg-[#f6f7f3] p-5">
              <p className="mb-3 text-sm font-semibold text-[#526052]">
                Password requirements
              </p>

              <ul className="space-y-2 text-sm text-[#788078]">
                <li>• Minimum 8 characters</li>
                <li>• Maximum 128 characters</li>
                <li>• Must be different from your current password</li>
                <li>• Your existing sessions will be invalidated</li>
              </ul>
            </div>

            {/* Feedback */}
            {message && (
              <div
                role="alert"
                aria-live="polite"
                className={`flex items-start gap-3 rounded-xl p-4 text-sm ${
                  messageType === "success"
                    ? "bg-green-50 text-green-800"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {messageType === "success" ? (
                  <CheckCircle2
                    size={19}
                    className="mt-0.5 shrink-0"
                  />
                ) : (
                  <AlertCircle
                    size={19}
                    className="mt-0.5 shrink-0"
                  />
                )}

                <p>{message}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || passwordChanged}
              className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#234b3b] px-5 text-base font-semibold text-white transition hover:bg-[#173729] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#426b55]/20 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-52"
            >
              {loading ? (
                <>
                  <Loader2 size={19} className="animate-spin" />
                  Updating Password...
                </>
              ) : (
                <>
                  <LockKeyhole size={18} />
                  Update Password
                </>
              )}
            </button>

          </form>
        </div>

        {/* Security note */}
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#e9e7de] bg-white/70 p-4">
          <ShieldCheck
            size={19}
            className="mt-0.5 shrink-0 text-[#426b55]"
          />

          <p className="text-sm leading-6 text-[#788078]">
            Your password is securely hashed before being saved.
            After a successful update, you will be signed out and
            must log in again using your new password.
          </p>
        </div>

      </div>
    </div>
  );
}
