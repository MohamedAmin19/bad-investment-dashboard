"use client";

import { useState, useEffect } from "react";
import { HeaderNav } from "@/components/HeaderNav";
import { BackButton } from "@/components/BackButton";

type Contact = {
  id: string;
  name: string;
  phone: string;
  email: string;
  comment: string;
  createdAt: string | null;
};

export default function ContactUsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/contact-us");
        const data = await response.json();

        if (response.ok) {
          setContacts(data.contacts || []);
        } else {
          setError(data.error || "Failed to load contacts");
        }
      } catch (err) {
        setError("Network error. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchContacts();
  }, []);

  return (
    <div className="relative min-h-screen bg-black text-white">
      <div className="container mx-auto px-6 py-8">
        <HeaderNav />
        
        <main className="mt-16">
          <h1 className="mb-8 text-4xl font-bold text-center">Contact Us</h1>
          <div className="mb-8">
            <BackButton />
          </div>
          
          {isLoading ? (
            <div className="text-center text-white">Loading contacts...</div>
          ) : error ? (
            <div className="text-center text-red-400">{error}</div>
          ) : (
            <div className="max-w-6xl mx-auto">
              <div className="mb-4 text-white">
                Total Contacts: {contacts.length}
              </div>
              
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white">
                    <th className="px-4 py-3 text-left text-white font-normal">Name</th>
                    <th className="px-4 py-3 text-left text-white font-normal">Phone</th>
                    <th className="px-4 py-3 text-left text-white font-normal">Email</th>
                    <th className="px-4 py-3 text-left text-white font-normal">Comment</th>
                    <th className="px-4 py-3 text-left text-white font-normal">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-white border-b border-white">
                        No contacts found
                      </td>
                    </tr>
                  ) : (
                    contacts.map((contact) => (
                      <tr
                        key={contact.id}
                        className="border-b border-white"
                      >
                        <td className="px-4 py-3 text-white">{contact.name}</td>
                        <td className="px-4 py-3 text-white">{contact.phone}</td>
                        <td className="px-4 py-3 text-white">{contact.email}</td>
                        <td className="px-4 py-3 text-white">{contact.comment}</td>
                        <td className="px-4 py-3 text-white">
                          {contact.createdAt
                            ? new Date(contact.createdAt).toLocaleDateString('en-US', {
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

