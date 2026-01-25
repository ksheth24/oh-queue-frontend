"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type QueueEntry = {
  id: number;
  name: string;
  section: string;
  topic: string;
  inPerson: boolean;     // true = in-person, false = online
  joinedAt: string;
  status?: "Queue" | "In Progress" | "Done";  // Optional, defaults to "Queue"
};

export default function TADashboard() {
  const router = useRouter();

  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingResponses, setAcceptingResponses] = useState(true);

  // ─────────────────────────────────────────────
  // Fetch queue from backend
  // ─────────────────────────────────────────────
  const fetchQueue = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/queue/getQueue");
      if (!res.ok) throw new Error("Failed to fetch queue");
      const data: QueueEntry[] = await res.json();
      // Ensure each entry has a status field, defaulting to "Queue" if missing
      const dataWithStatus = data.map(entry => ({
        ...entry,
        status: entry.status || "Queue"
      }));
      setQueue(dataWithStatus);
    } catch (err) {
      console.error("Failed to fetch queue", err);
    } finally {
      setLoading(false);
    }
  };

   const updateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch("http://localhost:8080/api/queue/updateStatus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          id,
          status
        }),
      });
      if (!res.ok) throw new Error("Failed to update queue");
    } catch (err) {
      console.error("Failed to fetch queue", err);
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  fetchQueue(); // initial load

  const interval = setInterval(fetchQueue, 100); // every 5 seconds

  return () => clearInterval(interval);
}, []);

  // Safe derived value
  const nextStudent = queue.length > 0 ? queue[0] : null;

  // ─────────────────────────────────────────────
  // Actions
  // ─────────────────────────────────────────────
  const clearQueue = async () => {
    try {
      await fetch("http://localhost:8080/api/queue/clear", {
        method: "POST",
      });
      setQueue([]);
    } catch (err) {
      console.error("Failed to clear queue", err);
    }
  };

  // ─────────────────────────────────────────────
  // Loading guard (CRITICAL)
  // ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-600">
        Loading queue…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-slate-100">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6 bg-white border-b">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            TA Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            ECE 2035 Office Hours Management
          </p>
        </div>

        <button
          onClick={() => router.push("/")}
          className="text-red-600 font-medium hover:underline"
        >
          ⎋ Logout
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {/* Queue Status */}
        <section className="bg-white rounded-xl shadow-md p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-slate-900 mb-3">
                Queue Status
              </h2>

              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                {nextStudent === null ? (
                  <>
                    <p className="text-sm text-slate-600 mb-1">
                      Next Student:
                    </p>
                    <p className="text-lg font-semibold text-green-600">
                      Caught Up! 🎉
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-slate-600 mb-1">
                      Next Student:
                    </p>
                    <p className="text-lg font-semibold text-slate-900">
                      {nextStudent.name}
                    </p>
                    <p className="text-sm text-slate-600 mt-1">
                      Section {nextStudent.section} •{" "}
                      {nextStudent.inPerson ? "In-person" : "Online"}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-4 min-w-[260px]">
              <div className="text-right text-sm text-slate-600">
                Total in queue:{" "}
                <span className="text-indigo-600 font-semibold">
                  {queue.length}
                </span>
              </div>

              <button
                onClick={clearQueue}
                className="bg-red-600 text-white rounded-lg py-3 font-medium hover:bg-red-700"
              >
                🗑️ Clear Queue
              </button>

              <button
                onClick={() => setAcceptingResponses(!acceptingResponses)}
                className={`rounded-lg py-3 font-medium text-white ${
                  acceptingResponses
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-slate-400"
                }`}
              >
                {acceptingResponses
                  ? "👁️ Accepting Responses"
                  : "🚫 Not Accepting Responses"}
              </button>
            </div>
          </div>
        </section>

        {/* Queue Table */}
        <section className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="grid grid-cols-7 gap-4 px-6 py-4 border-b text-xs font-semibold text-slate-500 uppercase">
            <div>Timestamp</div>
            <div>Name</div>
            <div>Section</div>
            <div>Question(s) On</div>
            <div>Location</div>
            <div>Status</div>
            <div>Actions</div>
          </div>

          {queue.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <div className="text-4xl mb-4">👤</div>
              <p className="text-sm">No students in queue</p>
            </div>
          ) : (
            queue.map((student) => (
              <div
                key={student.id}
                className="grid grid-cols-7 gap-4 px-6 py-4 border-b items-center text-sm"
              >
                <div>{student.joinedAt}</div>
                <div className="font-medium">{student.name}</div>
                <div>{student.section}</div>
                <div>{student.topic}</div>
                <div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      student.inPerson
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {student.inPerson ? "In-person" : "Online"}
                  </span>
                </div>
                <div>
                  <select
                    value={student.status}
                    onChange={(e) => updateStatus(student.id, e.target.value)}
                    className="border rounded-md px-2 py-1"
                  >
                    <option value="Queue">Queue</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
                <div className="text-red-600 cursor-pointer">🗑️</div>
              </div>
            ))
          )}
        </section>

        {/* Instructions */}
        <section className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            TA Instructions:
          </h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-blue-800">
            <li>Change status to <strong>In Progress</strong> when helping</li>
            <li>Change status to <strong>Done</strong> when finished</li>
            <li>Delete duplicate submissions</li>
            <li>Use <strong>Clear Queue</strong> at session end</li>
            <li>Toggle <strong>Accepting Responses</strong> to control access</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
