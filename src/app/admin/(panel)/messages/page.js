
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
  Archive,
  Trash2,
  CheckCheck,
  Reply,
} from "lucide-react";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const [feedback, setFeedback] = useState("");

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

  // Update message status
  const updateStatus = async (id, status) => {
    try {
      setActionLoading(id);
      setFeedback("");

      const response = await fetch(`/api/admin/messages/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update message");
      }

      setMessages((previous) =>
        previous.map((message) =>
          message._id === id ? data.item : message
        )
      );

      setFeedback(`Message marked as ${status}.`);
    } catch (err) {
      setFeedback(err.message || "Failed to update message.");
    } finally {
      setActionLoading("");
    }
  };

  // Delete message permanently
  const deleteMessage = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this message?"
    );

    if (!confirmed) return;

    try {
      setActionLoading(id);
      setFeedback("");

      const response = await fetch(`/api/admin/messages/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete message");
      }

      setMessages((previous) =>
        previous.filter((message) => message._id !== id)
      );

      setFeedback("Message deleted successfully.");
    } catch (err) {
      setFeedback(err.message || "Failed to delete message.");
    } finally {
      setActionLoading("");
    }
  };

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

  const statistics = [
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
      icon: CheckCheck,
    },
  ];

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

      {/* Feedback */}
      {feedback && (
        <div className="rounded-xl border border-[#e9e3d8] bg-white px-5 py-3 text-sm text-[#234b3b]">
          {feedback}
        </div>
      )}

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statistics.map((item) => {
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
            {messages.map((message) => {
              const isProcessing = actionLoading === message._id;

              return (
                <div
                  key={message._id}
                  className="p-6 transition hover:bg-[#faf9f6]"
                >
                  <div className="flex flex-col justify-between gap-4 lg:flex-row">
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

                        <a
                          href={`mailto:${message.email}`}
                          className="flex items-center gap-2 hover:text-[#a9804d]"
                        >
                          <Mail size={15} />
                          {message.email}
                        </a>

                        {message.phone && (
                          <a
                            href={`tel:${message.phone}`}
                            className="flex items-center gap-2 hover:text-[#a9804d]"
                          >
                            <Phone size={15} />
                            {message.phone}
                          </a>
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

                    {/* Management Actions */}
                    <div className="flex flex-wrap content-start gap-2 lg:max-w-56 lg:justify-end">
                      {message.status !== "Read" &&
                        message.status !== "Replied" &&
                        message.status !== "Archived" && (
                          <button
                            onClick={() =>
                              updateStatus(message._id, "Read")
                            }
                            disabled={isProcessing}
                            className="inline-flex items-center gap-2 rounded-lg border border-[#e9e3d8] px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-100 disabled:opacity-50"
                          >
                            <MailOpen size={14} />
                            Mark Read
                          </button>
                        )}

                      {message.status !== "Replied" &&
                        message.status !== "Archived" && (
                          <button
                            onClick={() =>
                              updateStatus(message._id, "Replied")
                            }
                            disabled={isProcessing}
                            className="inline-flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 transition hover:bg-green-100 disabled:opacity-50"
                          >
                            <Reply size={14} />
                            Replied
                          </button>
                        )}

                      {message.status !== "Archived" && (
                        <button
                          onClick={() =>
                            updateStatus(message._id, "Archived")
                          }
                          disabled={isProcessing}
                          className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-200 disabled:opacity-50"
                        >
                          <Archive size={14} />
                          Archive
                        </button>
                      )}

                      <button
                        onClick={() => deleteMessage(message._id)}
                        disabled={isProcessing}
                        className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>

                      {isProcessing && (
                        <span className="w-full text-right text-xs text-gray-400">
                          Processing...
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
