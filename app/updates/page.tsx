"use client";

import { useState, useEffect } from "react";
import { HeaderNav } from "@/components/HeaderNav";
import { BackButton } from "@/components/BackButton";

type Update = {
  id: string;
  date: string;
  title: string;
  url: string;
  isAvailable: boolean;
  createdAt: string | null;
  updatedAt: string | null;
};

export default function UpdatesPage() {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<Update | null>(null);
  const [formData, setFormData] = useState({
    date: "",
    title: "",
    url: "",
    isAvailable: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchUpdates();
  }, []);

  const fetchUpdates = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/updates");
      const data = await response.json();

      if (response.ok) {
        setUpdates(data.updates || []);
      } else {
        setError(data.error || "Failed to load updates");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const url = "/api/updates";
      const method = editingUpdate ? "PUT" : "POST";
      const body = editingUpdate
        ? { ...formData, id: editingUpdate.id }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: data.message || "Update saved successfully!" });
        setIsFormOpen(false);
        setEditingUpdate(null);
        setFormData({ date: "", title: "", url: "", isAvailable: false });
        fetchUpdates();
      } else {
        setMessage({ type: "error", text: data.error || "Something went wrong. Please try again." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (update: Update) => {
    setEditingUpdate(update);
    setFormData({
      date: update.date,
      title: update.title,
      url: update.url,
      isAvailable: update.isAvailable,
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this update?")) {
      return;
    }

    try {
      const response = await fetch(`/api/updates?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: data.message || "Update deleted successfully!" });
        fetchUpdates();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to delete update." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error. Please try again." });
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingUpdate(null);
    setFormData({ date: "", title: "", url: "", isAvailable: false });
    setMessage(null);
  };

  return (
    <div className="relative min-h-screen bg-black text-white">
      <div className="container mx-auto px-6 py-8">
        <HeaderNav />
        
        <main className="mt-16">
          <h1 className="mb-8 text-4xl font-bold text-center">Updates</h1>
          <div className="mb-8">
            <BackButton />
          </div>

          {message && (
            <div
              className={`mb-4 p-4 rounded-lg ${
                message.type === "success"
                  ? "bg-green-900/30 text-green-400 border border-green-700"
                  : "bg-red-900/30 text-red-400 border border-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="mb-6 flex justify-between items-center">
            <div className="text-white">
              Total Updates: {updates.length}
            </div>
            <button
              onClick={() => setIsFormOpen(true)}
              className="px-6 py-2 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors"
            >
              Add Update
            </button>
          </div>

          {isFormOpen && (
            <div className="mb-8 p-6 bg-gray-900 rounded-lg border border-gray-700">
              <h2 className="text-2xl font-bold mb-4">
                {editingUpdate ? "Edit Update" : "Add New Update"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="date" className="block mb-2 text-sm font-medium">
                      Date *
                    </label>
                    <input
                      type="text"
                      id="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                      placeholder="MM/DD/YYYY"
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="title" className="block mb-2 text-sm font-medium">
                      Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="url" className="block mb-2 text-sm font-medium">
                      URL
                    </label>
                    <input
                      type="url"
                      id="url"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white text-white"
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isAvailable}
                        onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-white"
                      />
                      <span className="text-sm font-medium">Is Available</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Saving..." : editingUpdate ? "Update" : "Add Update"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {isLoading ? (
            <div className="text-center text-white">Loading updates...</div>
          ) : error ? (
            <div className="text-center text-red-400">{error}</div>
          ) : (
            <div className="max-w-6xl mx-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white">
                    <th className="px-4 py-3 text-left text-white font-normal">Date</th>
                    <th className="px-4 py-3 text-left text-white font-normal">Title</th>
                    <th className="px-4 py-3 text-left text-white font-normal">URL</th>
                    <th className="px-4 py-3 text-left text-white font-normal">Available</th>
                    <th className="px-4 py-3 text-left text-white font-normal">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {updates.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-white border-b border-white">
                        No updates found
                      </td>
                    </tr>
                  ) : (
                    updates.map((update) => (
                      <tr
                        key={update.id}
                        className="border-b border-white"
                      >
                        <td className="px-4 py-3 text-white">{update.date}</td>
                        <td className="px-4 py-3 text-white">{update.title}</td>
                        <td className="px-4 py-3 text-white">
                          {update.url ? (
                            <a
                              href={update.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:underline"
                            >
                              Link
                            </a>
                          ) : (
                            "N/A"
                          )}
                        </td>
                        <td className="px-4 py-3 text-white">
                          {update.isAvailable ? "Yes" : "No"}
                        </td>
                        <td className="px-4 py-3 text-white">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(update)}
                              className="px-3 py-1 bg-gray-700 text-white text-sm rounded hover:bg-gray-600 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(update.id)}
                              className="px-3 py-1 bg-red-700 text-white text-sm rounded hover:bg-red-600 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
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

