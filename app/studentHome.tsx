"use client";

import {
  UserGroupIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

import React, { useEffect, useState } from "react";

// API Base URL - add http:// prefix
const API_BASE_URL = "/api/proxy";

export default function StudentHome() {
  const [name, setName] = useState("");
  const [section, setSection] = useState("");
  const [topic, setTopic] = useState("");
  const [location, setLocation] =
    useState<"IN_PERSON" | "ONLINE">("IN_PERSON");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [joined, setJoined] = useState(false);
  const [joinedAt, setJoinedAt] = useState<Date | null>(null);
  const [id, setId] = useState<string | null>(null);

  const [queueSpot, setQueueSpot] = useState<number | null>(null);

  /* ---------------- Fetch queue spot (polling) ---------------- */
  const fetchQueueSpot = async () => {
    if (!id) return;

    try {
      console.log("Fetching queue spot for id:", id);

      const res = await fetch(
        `${API_BASE_URL}/api/queue/getQueueSpot/${id}`,
        { credentials: "include" }
      );

      if (!res.ok) {
        console.error("Failed to fetch queue spot");
        return;
      }

      const spot = await res.json();
      setQueueSpot(spot);
    } catch (e) {
      console.error("Failed to fetch queue spot", e);
    }
  };

  /* ---------------- Start polling AFTER id exists ---------------- */
  useEffect(() => {
    if (!id) return;

    fetchQueueSpot(); // immediate

    const interval = setInterval(fetchQueueSpot, 5000);
    return () => clearInterval(interval);
  }, [id]);

  /* ---------------- Submit ---------------- */
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/queue/add`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name,
            section,
            topic,
            location,
          }),
        }
      );

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to join queue");
      }

      const data = await res.json();

      setId(String(data)); // IMPORTANT
      setJoined(true);
      setJoinedAt(new Date());
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
              <h2 className="text-xl font-semibold mb-6">
                Join Queue
              </h2>

              <form
                className="space-y-5"
                onSubmit={submit}
              >
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
              <h2 className="text-xl font-semibold">
                You're in the queue
              </h2>

              {joinedAt && (
                <p className="text-sm text-slate-500 mt-2">
                  Joined at {joinedAt.toLocaleTimeString()}
                </p>
              )}
            </div>
          )}
        </div>

        {/* RIGHT CARD — QUEUE SPOT */}
        <div className="bg-white rounded-xl shadow-md p-8 flex flex-col items-center justify-center">
          <UserGroupIcon className="h-12 w-12 text-indigo-600 mb-4" />

          {!joined ? (
            <>
              <p className="text-sm text-slate-500 mb-1">
                Your spot in queue
              </p>
              <p className="text-4xl font-bold text-slate-400">—</p>
            </>
          ) : (
            <>
              <p className="text-sm text-slate-500 mb-1">
                Your spot in queue
              </p>
              <p className="text-4xl font-bold text-slate-900">
                {queueSpot !== null ? queueSpot + 1 : "…"}
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}