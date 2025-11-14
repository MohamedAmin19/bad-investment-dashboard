"use client";

import { useState, useEffect } from "react";
import { HeaderNav } from "@/components/HeaderNav";
import { BackButton } from "@/components/BackButton";

type Tour = {
  id: string;
  city: string;
  date: string;
  ticketsUrl: string;
  venue: string;
  createdAt: string | null;
  updatedAt: string | null;
};

export default function TourPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [formData, setFormData] = useState({
    city: "",
    date: "",
    ticketsUrl: "",
    venue: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/tour");
      const data = await response.json();

      if (response.ok) {
        setTours(data.tours || []);
      } else {
        setError(data.error || "Failed to load tours");
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
      const url = editingTour ? "/api/tour" : "/api/tour";
      const method = editingTour ? "PUT" : "POST";
      const body = editingTour
        ? { ...formData, id: editingTour.id }
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
        setMessage({ type: "success", text: data.message || "Tour saved successfully!" });
        setIsFormOpen(false);
        setEditingTour(null);
        setFormData({ city: "", date: "", ticketsUrl: "", venue: "" });
        fetchTours();
      } else {
        setMessage({ type: "error", text: data.error || "Something went wrong. Please try again." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (tour: Tour) => {
    setEditingTour(tour);
    setFormData({
      city: tour.city,
      date: tour.date,
      ticketsUrl: tour.ticketsUrl,
      venue: tour.venue,
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tour?")) {
      return;
    }

    try {
      const response = await fetch(`/api/tour?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: data.message || "Tour deleted successfully!" });
        fetchTours();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to delete tour." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error. Please try again." });
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingTour(null);
    setFormData({ city: "", date: "", ticketsUrl: "", venue: "" });
    setMessage(null);
  };

  return (
    <div className="relative min-h-screen bg-black text-white">
      <div className="container mx-auto px-6 py-8">
        <HeaderNav />
        
        <main className="mt-16">
          <h1 className="mb-8 text-4xl font-bold text-center">Tour</h1>
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
              Total Tours: {tours.length}
            </div>
            <button
              onClick={() => setIsFormOpen(true)}
              className="px-6 py-2 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors"
            >
              Add Tour
            </button>
          </div>

          {isFormOpen && (
            <div className="mb-8 p-6 bg-gray-900 rounded-lg border border-gray-700">
              <h2 className="text-2xl font-bold mb-4">
                {editingTour ? "Edit Tour" : "Add New Tour"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block mb-2 text-sm font-medium">
                      City *
                    </label>
                    <input
                      type="text"
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white text-white"
                    />
                  </div>
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
                    <label htmlFor="venue" className="block mb-2 text-sm font-medium">
                      Venue *
                    </label>
                    <input
                      type="text"
                      id="venue"
                      value={formData.venue}
                      onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                      required
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="ticketsUrl" className="block mb-2 text-sm font-medium">
                      Tickets URL
                    </label>
                    <input
                      type="url"
                      id="ticketsUrl"
                      value={formData.ticketsUrl}
                      onChange={(e) => setFormData({ ...formData, ticketsUrl: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white text-white"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Saving..." : editingTour ? "Update Tour" : "Add Tour"}
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
            <div className="text-center text-white">Loading tours...</div>
          ) : error ? (
            <div className="text-center text-red-400">{error}</div>
          ) : (
            <div className="max-w-6xl mx-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white">
                    <th className="px-4 py-3 text-left text-white font-normal">Date</th>
                    <th className="px-4 py-3 text-left text-white font-normal">City</th>
                    <th className="px-4 py-3 text-left text-white font-normal">Venue</th>
                    <th className="px-4 py-3 text-left text-white font-normal">Tickets</th>
                    <th className="px-4 py-3 text-left text-white font-normal">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tours.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-white border-b border-white">
                        No tours found
                      </td>
                    </tr>
                  ) : (
                    tours.map((tour) => (
                      <tr
                        key={tour.id}
                        className="border-b border-white"
                      >
                        <td className="px-4 py-3 text-white">{tour.date}</td>
                        <td className="px-4 py-3 text-white">{tour.city}</td>
                        <td className="px-4 py-3 text-white">{tour.venue}</td>
                        <td className="px-4 py-3 text-white">
                          {tour.ticketsUrl ? (
                            <a
                              href={tour.ticketsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:underline"
                            >
                              Tickets
                            </a>
                          ) : (
                            "N/A"
                          )}
                        </td>
                        <td className="px-4 py-3 text-white">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(tour)}
                              className="px-3 py-1 bg-gray-700 text-white text-sm rounded hover:bg-gray-600 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(tour.id)}
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

