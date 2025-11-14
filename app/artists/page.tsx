"use client";

import { useState, useEffect } from "react";
import { HeaderNav } from "@/components/HeaderNav";
import { BackButton } from "@/components/BackButton";

type Social = {
  label: string;
  href: string;
};

type Artist = {
  id: string;
  name: string;
  slug: string;
  title: string;
  socials: Social[];
  bio: string[];
  imageUrl: string;
  createdAt: string | null;
  updatedAt: string | null;
};

export default function ArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    title: "",
    socials: [] as Social[],
    bio: [] as string[],
    imageUrl: "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/artists");
      const data = await response.json();

      if (response.ok) {
        setArtists(data.artists || []);
      } else {
        setError(data.error || "Failed to load artists");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Compress and convert image to base64
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxWidth = 800;
          const maxHeight = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          const base64 = canvas.toDataURL("image/jpeg", 0.7);
          
          if (base64.length > 800000) {
            const compressed = canvas.toDataURL("image/jpeg", 0.5);
            resolve(compressed);
          } else {
            resolve(base64);
          }
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: "error", text: "Image size must be less than 5MB" });
        return;
      }

      try {
        const base64 = await compressImage(file);
        setFormData({ ...formData, imageUrl: base64 });
        setImagePreview(base64);
      } catch (error) {
        setMessage({ type: "error", text: "Failed to process image" });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const url = "/api/artists";
      const method = editingArtist ? "PUT" : "POST";
      const body = editingArtist
        ? { ...formData, id: editingArtist.id }
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
        setMessage({ type: "success", text: data.message || "Artist saved successfully!" });
        setIsFormOpen(false);
        setEditingArtist(null);
        setFormData({ name: "", slug: "", title: "", socials: [], bio: [], imageUrl: "" });
        setImagePreview(null);
        fetchArtists();
      } else {
        setMessage({ type: "error", text: data.error || "Something went wrong. Please try again." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (artist: Artist) => {
    setEditingArtist(artist);
    setFormData({
      name: artist.name,
      slug: artist.slug,
      title: artist.title,
      socials: artist.socials || [],
      bio: artist.bio || [],
      imageUrl: artist.imageUrl,
    });
    setImagePreview(artist.imageUrl || null);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this artist?")) {
      return;
    }

    try {
      const response = await fetch(`/api/artists?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: data.message || "Artist deleted successfully!" });
        fetchArtists();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to delete artist." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error. Please try again." });
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingArtist(null);
    setFormData({ name: "", slug: "", title: "", socials: [], bio: [], imageUrl: "" });
    setImagePreview(null);
    setMessage(null);
  };

  const addSocial = () => {
    setFormData({
      ...formData,
      socials: [...formData.socials, { label: "", href: "" }],
    });
  };

  const removeSocial = (index: number) => {
    setFormData({
      ...formData,
      socials: formData.socials.filter((_, i) => i !== index),
    });
  };

  const updateSocial = (index: number, field: "label" | "href", value: string) => {
    const updatedSocials = [...formData.socials];
    updatedSocials[index] = { ...updatedSocials[index], [field]: value };
    setFormData({ ...formData, socials: updatedSocials });
  };

  const addBio = () => {
    setFormData({
      ...formData,
      bio: [...formData.bio, ""],
    });
  };

  const removeBio = (index: number) => {
    setFormData({
      ...formData,
      bio: formData.bio.filter((_, i) => i !== index),
    });
  };

  const updateBio = (index: number, value: string) => {
    const updatedBio = [...formData.bio];
    updatedBio[index] = value;
    setFormData({ ...formData, bio: updatedBio });
  };

  return (
    <div className="relative min-h-screen bg-black text-white">
      <div className="container mx-auto px-6 py-8">
        <HeaderNav />
        
        <main className="mt-16">
          <h1 className="mb-8 text-4xl font-bold text-center">Artists</h1>
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
              Total Artists: {artists.length}
            </div>
            <button
              onClick={() => setIsFormOpen(true)}
              className="px-6 py-2 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors"
            >
              Add Artist
            </button>
          </div>

          {isFormOpen && (
            <div className="mb-8 p-6 bg-gray-900 rounded-lg border border-gray-700">
              <h2 className="text-2xl font-bold mb-4">
                {editingArtist ? "Edit Artist" : "Add New Artist"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block mb-2 text-sm font-medium">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="slug" className="block mb-2 text-sm font-medium">
                      Slug *
                    </label>
                    <input
                      type="text"
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      required
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white text-white"
                    />
                  </div>
                  <div className="col-span-2">
                    <label htmlFor="title" className="block mb-2 text-sm font-medium">
                      Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white text-white"
                    />
                  </div>
                  <div className="col-span-2">
                    <label htmlFor="image" className="block mb-2 text-sm font-medium">
                      Image (Max 5MB, will be compressed)
                    </label>
                    <input
                      type="file"
                      id="image"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-white file:text-black hover:file:bg-gray-200"
                    />
                    {imagePreview && (
                      <div className="mt-2">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-w-xs max-h-48 object-contain rounded-lg border border-gray-700"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Socials Section */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium">Socials</label>
                    <button
                      type="button"
                      onClick={addSocial}
                      className="px-3 py-1 bg-gray-700 text-white text-sm rounded hover:bg-gray-600 transition-colors"
                    >
                      + Add Social
                    </button>
                  </div>
                  {formData.socials.map((social, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Label (e.g., Instagram)"
                        value={social.label}
                        onChange={(e) => updateSocial(index, "label", e.target.value)}
                        className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white text-white"
                      />
                      <input
                        type="url"
                        placeholder="URL"
                        value={social.href}
                        onChange={(e) => updateSocial(index, "href", e.target.value)}
                        className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white text-white"
                      />
                      <button
                        type="button"
                        onClick={() => removeSocial(index)}
                        className="px-3 py-2 bg-red-700 text-white rounded hover:bg-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                {/* Bio Section */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium">Bio</label>
                    <button
                      type="button"
                      onClick={addBio}
                      className="px-3 py-1 bg-gray-700 text-white text-sm rounded hover:bg-gray-600 transition-colors"
                    >
                      + Add Bio Line
                    </button>
                  </div>
                  {formData.bio.map((bioLine, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <textarea
                        placeholder="Bio line..."
                        value={bioLine}
                        onChange={(e) => updateBio(index, e.target.value)}
                        rows={2}
                        className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white text-white resize-none"
                      />
                      <button
                        type="button"
                        onClick={() => removeBio(index)}
                        className="px-3 py-2 bg-red-700 text-white rounded hover:bg-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Saving..." : editingArtist ? "Update Artist" : "Add Artist"}
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
            <div className="text-center text-white">Loading artists...</div>
          ) : error ? (
            <div className="text-center text-red-400">{error}</div>
          ) : (
            <div className="max-w-7xl mx-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white">
                    <th className="px-4 py-3 text-left text-white font-normal">Image</th>
                    <th className="px-4 py-3 text-left text-white font-normal">Name</th>
                    <th className="px-4 py-3 text-left text-white font-normal">Slug</th>
                    <th className="px-4 py-3 text-left text-white font-normal">Title</th>
                    <th className="px-4 py-3 text-left text-white font-normal">Socials</th>
                    <th className="px-4 py-3 text-left text-white font-normal">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {artists.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-white border-b border-white">
                        No artists found
                      </td>
                    </tr>
                  ) : (
                    artists.map((artist) => (
                      <tr
                        key={artist.id}
                        className="border-b border-white"
                      >
                        <td className="px-4 py-3 text-white">
                          {artist.imageUrl ? (
                            <img
                              src={artist.imageUrl}
                              alt={artist.name}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                          ) : (
                            "N/A"
                          )}
                        </td>
                        <td className="px-4 py-3 text-white">{artist.name}</td>
                        <td className="px-4 py-3 text-white">{artist.slug}</td>
                        <td className="px-4 py-3 text-white">{artist.title}</td>
                        <td className="px-4 py-3 text-white">
                          {artist.socials && artist.socials.length > 0 ? (
                            <div className="flex flex-col gap-1">
                              {artist.socials.map((social, idx) => (
                                <a
                                  key={idx}
                                  href={social.href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:underline text-sm"
                                >
                                  {social.label}
                                </a>
                              ))}
                            </div>
                          ) : (
                            "N/A"
                          )}
                        </td>
                        <td className="px-4 py-3 text-white">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(artist)}
                              className="px-3 py-1 bg-gray-700 text-white text-sm rounded hover:bg-gray-600 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(artist.id)}
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

