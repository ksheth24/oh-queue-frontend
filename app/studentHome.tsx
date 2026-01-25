"use client";

import {
  UserGroupIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

import React, { useEffect, useState } from "react";

export default function StudentHome() {
  const [name, setName] = useState("");
  const [section, setSection] = useState("");
  const [topic, setTopic] = useState("");
  const [location, setLocation] = useState<"IN_PERSON" | "ONLINE">("IN_PERSON");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [joined, setJoined] = useState(false);
  const [joinedAt, setJoinedAt] = useState<Date | null>(null);

  const [queueCount, setQueueCount] = useState<number>(0);

  /* ---------------- Fetch queue count ---------------- */
  const fetchQueueCount = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/queue/getQueueLength", {
        credentials: "include",
      });
      if (!res.ok) return;
      const count = await res.json();
      setQueueCount(count);
    } catch (e) {
      console.error("Failed to fetch queue count");
    }
  };

  useEffect(() => {
    fetchQueueCount();
  }, []);

  /* ---------------- Submit ---------------- */
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:8080/api/queue/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          section,
          topic,
          location,
        }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to join queue");
      }

      setJoined(true);
      setJoinedAt(new Date());
      setQueueCount((prev) => prev + 1); // optimistic update
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-100">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6 border-b bg-white">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Office Hours Queue
          </h1>
          <p className="text-sm text-slate-500">
            ECE 2035 - Student View
          </p>
        </div>
        <a
          href="/login"
          className="text-sm font-medium text-indigo-600 hover:underline"
        >
          TA Login
        </a>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* LEFT CARD */}
        <div className="bg-white rounded-xl shadow-md p-8">
          {!joined ? (
            <>
              <h2 className="text-xl font-semibold mb-6">Join Queue</h2>

              <form className="space-y-5" onSubmit={submit}>
                <input
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-lg border px-4 py-2"
                />

                <input
                  placeholder="Section"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  required
                  className="w-full rounded-lg border px-4 py-2"
                />

                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  required
                  className="w-full rounded-lg border px-4 py-2"
                >
                  <option value="">Select topic</option>
                  <option value="Assignments">Assignments</option>
                  <option value="Concepts">Concepts</option>
                  <option value="Grading">Grading</option>
                  <option value="Mbed">Mbed</option>
                  <option value="Other">Other</option>
                </select>

                <div className="flex gap-6">
                  <label className="flex gap-2 items-center">
                    <input
                      type="radio"
                      checked={location === "IN_PERSON"}
                      onChange={() => setLocation("IN_PERSON")}
                    />
                    In-person
                  </label>
                  <label className="flex gap-2 items-center">
                    <input
                      type="radio"
                      checked={location === "ONLINE"}
                      onChange={() => setLocation("ONLINE")}
                    />
                    Online
                  </label>
                </div>

                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:bg-slate-400"
                >
                  {loading ? "Joining..." : "Join Queue"}
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-center">
              <CheckCircleIcon className="h-14 w-14 text-green-500 mb-4" />
              <h2 className="text-xl font-semibold">You’re in the queue</h2>
              {joinedAt && (
                <p className="text-sm text-slate-500 mt-2">
                  Joined at {joinedAt.toLocaleTimeString()}
                </p>
              )}
            </div>
          )}
        </div>

        {/* RIGHT CARD — SIMPLE */}
        <div className="bg-white rounded-xl shadow-md p-8 flex flex-col items-center justify-center">
          <UserGroupIcon className="h-12 w-12 text-indigo-600 mb-4" />
          <p className="text-sm text-slate-500 mb-1">
            People in Queue
          </p>
          <p className="text-4xl font-bold text-slate-900">
            {queueCount}
          </p>
        </div>
      </main>
    </div>
  );
}
