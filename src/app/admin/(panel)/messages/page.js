
"use client";

import { useEffect, useState } from "react";
import {
  Mail,
  MailOpen,
  Phone,
  User,
  Calendar,
  RefreshCw,
  Inbox,
} from "lucide-react";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/messages");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load messages");
      }

      setMessages(data.messages || []);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-BD", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusColors = {
    New: "bg-blue-100 text-blue-700",
    Read: "bg-amber-100 text-amber-700",
    Replied: "bg-green-100 text-green-700",
    Archived: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#a9804d]">
            Communication
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#234b3b]">
            Contact Messages
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            View and manage enquiries submitted through your website.
          </p>
        </div>

        <button
          onClick={fetchMessages}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#234b3b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#173729] disabled:opacity-60"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Total Messages",
            value: messages.length,
            icon: Inbox,
          },
          {
            label: "New Messages",
            value: messages.filter((m) => m.status === "New").length,
            icon: Mail,
          },
          {
            label: "Read Messages",
            value: messages.filter((m) => m.status === "Read").length,
            icon: MailOpen,
          },
          {
            label: "Replied",
            value: messages.filter((m) => m.status === "Replied").length,
            icon: MailOpen,
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="rounded-2xl border border-[#e9e3d8] bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{item.label}</p>
                <Icon size={20} className="text-[#a9804d]" />
              </div>

              <p className="mt-3 text-3xl font-bold text-[#234b3b]">
                {item.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Messages List */}
      <div className="overflow-hidden rounded-2xl border border-[#e9e3d8] bg-white shadow-sm">
        <div className="border-b border-[#eee9df] px-6 py-5">
          <h2 className="font-semibold text-[#234b3b]">
            All Enquiries
          </h2>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">
            Loading messages...
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={fetchMessages}
              className="mt-4 text-sm font-semibold text-[#234b3b] underline"
            >
              Try again
            </button>
          </div>
        ) : messages.length === 0 ? (
          <div className="p-12 text-center">
            <Inbox size={40} className="mx-auto text-gray-300" />
            <h3 className="mt-4 font-semibold text-gray-700">
              No messages yet
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Customer enquiries will appear here when submitted.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#eee9df]">
            {messages.map((message) => (
              <div
                key={message._id}
                className="p-6 transition hover:bg-[#faf9f6]"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-semibold text-[#234b3b]">
                        {message.subject}
                      </h3>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          statusColors[message.status] ||
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {message.status}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">
                      <span className="flex items-center gap-2">
                        <User size={15} />
                        {message.name}
                      </span>

                      <span className="flex items-center gap-2">
                        <Mail size={15} />
                        {message.email}
                      </span>

                      {message.phone && (
                        <span className="flex items-center gap-2">
                          <Phone size={15} />
                          {message.phone}
                        </span>
                      )}
                    </div>

                    <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-gray-600">
                      {message.message}
                    </p>

                    <p className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                      <Calendar size={14} />
                      {formatDate(message.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
