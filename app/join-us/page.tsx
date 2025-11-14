"use client";

import { useState, useEffect } from "react";
import { HeaderNav } from "@/components/HeaderNav";
import { BackButton } from "@/components/BackButton";

type Subscriber = {
  id: string;
  email: string;
  createdAt: string | null;
};

export default function JoinUsPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/join-us");
        const data = await response.json();

        if (response.ok) {
          setSubscribers(data.subscribers || []);
        } else {
          setError(data.error || "Failed to load subscribers");
        }
      } catch (err) {
        setError("Network error. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscribers();
  }, []);

  return (
    <div className="relative min-h-screen bg-black text-white">
      <div className="container mx-auto px-6 py-8">
        <HeaderNav />
        
        <main className="mt-16">
          <h1 className="mb-8 text-4xl font-bold text-center">Join Us</h1>
          <div className="mb-8">
            <BackButton />
          </div>
          
          {isLoading ? (
            <div className="text-center text-white">Loading subscribers...</div>
          ) : error ? (
            <div className="text-center text-red-400">{error}</div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <div className="mb-4 text-white">
                Total Subscribers: {subscribers.length}
              </div>
              
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white">
                    <th className="px-4 py-3 text-left text-white font-normal">Email</th>
                    <th className="px-4 py-3 text-left text-white font-normal">Date Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="px-4 py-8 text-center text-white border-b border-white">
                        No subscribers found
                      </td>
                    </tr>
                  ) : (
                    subscribers.map((subscriber, index) => (
                      <tr
                        key={subscriber.id}
                        className="border-b border-white"
                      >
                        <td className="px-4 py-3 text-white">
                          {subscriber.email}
                        </td>
                        <td className="px-4 py-3 text-white">
                          {subscriber.createdAt
                            ? new Date(subscriber.createdAt).toLocaleDateString('en-US', {
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

