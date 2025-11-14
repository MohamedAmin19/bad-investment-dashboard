"use client";

import { useState, useEffect } from "react";
import { HeaderNav } from "@/components/HeaderNav";
import { BackButton } from "@/components/BackButton";

type Submission = {
  id: string;
  role: string;
  submissionType: string;
  name: string;
  phone: string;
  email: string;
  artist: string;
  profile: string;
  createdAt: string | null;
};

export default function SubmitMusicPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/submit-music");
        const data = await response.json();

        if (response.ok) {
          setSubmissions(data.submissions || []);
        } else {
          setError(data.error || "Failed to load submissions");
        }
      } catch (err) {
        setError("Network error. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  return (
    <div className="relative min-h-screen bg-black text-white">
      <div className="container mx-auto px-6 py-8">
        <HeaderNav />
        
        <main className="mt-16">
          <h1 className="mb-8 text-4xl font-bold text-center">Submit Music</h1>
          <div className="mb-8">
            <BackButton />
          </div>
          
          {isLoading ? (
            <div className="text-center text-white">Loading submissions...</div>
          ) : error ? (
            <div className="text-center text-red-400">{error}</div>
          ) : (
            <div className="max-w-7xl mx-auto">
              <div className="mb-4 text-white">
                Total Submissions: {submissions.length}
              </div>
              
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white">
                    <th className="px-4 py-3 text-left text-white font-normal">Submission Type</th>
                    <th className="px-4 py-3 text-left text-white font-normal">Role</th>
                    <th className="px-4 py-3 text-left text-white font-normal">Name</th>
                    <th className="px-4 py-3 text-left text-white font-normal">Phone</th>
                    <th className="px-4 py-3 text-left text-white font-normal">Email</th>
                    <th className="px-4 py-3 text-left text-white font-normal">Artist</th>
                    <th className="px-4 py-3 text-left text-white font-normal">Profile</th>
                    <th className="px-4 py-3 text-left text-white font-normal">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-white border-b border-white">
                        No submissions found
                      </td>
                    </tr>
                  ) : (
                    submissions.map((submission) => (
                      <tr
                        key={submission.id}
                        className="border-b border-white"
                      >
                        <td className="px-4 py-3 text-white">{submission.submissionType}</td>
                        <td className="px-4 py-3 text-white">{submission.role}</td>
                        <td className="px-4 py-3 text-white">{submission.name}</td>
                        <td className="px-4 py-3 text-white">{submission.phone}</td>
                        <td className="px-4 py-3 text-white">{submission.email}</td>
                        <td className="px-4 py-3 text-white">{submission.artist}</td>
                        <td className="px-4 py-3 text-white">{submission.profile}</td>
                        <td className="px-4 py-3 text-white">
                          {submission.createdAt
                            ? new Date(submission.createdAt).toLocaleDateString('en-US', {
                                month: '2-digit',
                                day: '2-digit',
                                year: 'numeric'
                              })
                            : "N/A"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

