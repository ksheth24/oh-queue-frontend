"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TALoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  

  const handleLogin = () => {
    // DEMO auth logic
    if (password === "ta2035") {
      router.push("/ta");
    } else {
      setError("Incorrect password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      {/* Login Card */}
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6">
        {/* Header */}
        <div className="flex items-start gap-3 mb-6">
          <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600 text-xl">
            🔒
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              TA Login
            </h1>
            <p className="text-sm text-slate-500">
              Enter password to access TA dashboard
            </p>
          </div>
        </div>

        {/* Password */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Password
          </label>
          <input
            type="password"
            placeholder="Enter TA password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-600 mb-3">
            {error}
          </p>
        )}

        {/* Demo Password */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 mb-6">
          <p className="text-sm text-slate-600 mb-1">
            Demo Password:
          </p>
          <code className="text-sm font-mono bg-white border px-2 py-1 rounded">
            ta2035
          </code>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/")}
            className="flex-1 border border-slate-300 rounded-lg py-2 font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleLogin}
            className="flex-1 bg-indigo-600 text-white rounded-lg py-2 font-medium hover:bg-indigo-700"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
