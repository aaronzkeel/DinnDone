"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";

export default function TestHouseholdPage() {
  const [seedResult, setSeedResult] = useState<string | null>(null);
  const members = useQuery(api.householdMembers.list);
  const seedMutation = useMutation(api.householdMembers.seedZinkFamily);

  const handleSeed = async () => {
    try {
      const result = await seedMutation();
      setSeedResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setSeedResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const admins = members?.filter((m) => m.isAdmin) ?? [];
  const viewers = members?.filter((m) => !m.isAdmin) ?? [];

  return (
    <div className="min-h-screen bg-bg p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-heading text-text mb-6">
          Household Members Test
        </h1>

        <div className="bg-card rounded-lg p-6 shadow-md mb-6">
          <h2 className="text-xl font-heading text-text mb-4">Seed Zink Family</h2>
          <button
            onClick={handleSeed}
            className="bg-primary text-white px-4 py-2 rounded hover:opacity-90 transition"
          >
            Seed Household Members
          </button>
          {seedResult && (
            <pre className="mt-4 p-4 bg-bg rounded text-sm overflow-x-auto">
              {seedResult}
            </pre>
          )}
        </div>

        <div className="bg-card rounded-lg p-6 shadow-md mb-6">
          <h2 className="text-xl font-heading text-text mb-4">
            Current Members ({members?.length ?? 0})
          </h2>
          {members === undefined ? (
            <p className="text-text/70">Loading...</p>
          ) : members.length === 0 ? (
            <p className="text-text/70">No members yet. Click seed button above.</p>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-secondary mb-2">
                  Admins ({admins.length})
                </h3>
                <ul className="list-disc list-inside">
                  {admins.map((member) => (
                    <li key={member._id} className="text-text">
                      {member.name} - <span className="text-primary font-medium">Admin</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-secondary mb-2">
                  Viewers ({viewers.length})
                </h3>
                <ul className="list-disc list-inside">
                  {viewers.map((member) => (
                    <li key={member._id} className="text-text">
                      {member.name} - <span className="text-text/70">Viewer</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="bg-card rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-heading text-text mb-4">Verification Checklist</h2>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <span className={members?.length === 5 ? "text-secondary" : "text-danger"}>
                {members?.length === 5 ? "✓" : "✗"}
              </span>
              <span className="text-text">5 members exist</span>
              <span className="text-text/70">({members?.length ?? 0}/5)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className={admins.length === 2 ? "text-secondary" : "text-danger"}>
                {admins.length === 2 ? "✓" : "✗"}
              </span>
              <span className="text-text">Aaron and Katie are admins</span>
              <span className="text-text/70">({admins.map(a => a.name).join(", ") || "none"})</span>
            </li>
            <li className="flex items-center gap-2">
              <span className={viewers.length === 3 ? "text-secondary" : "text-danger"}>
                {viewers.length === 3 ? "✓" : "✗"}
              </span>
              <span className="text-text">Kids are viewers</span>
              <span className="text-text/70">({viewers.map(v => v.name).join(", ") || "none"})</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
