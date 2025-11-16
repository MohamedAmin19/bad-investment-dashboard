"use client";

import { useState, useEffect } from "react";
import { HeaderNav } from "@/components/HeaderNav";
import { BackButton } from "@/components/BackButton";

type Product = {
  id: string;
  name: string;
  description: string;
  stock: number;
  price: number;
  images: string[];
  createdAt: string | null;
  updatedAt: string | null;
};

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    stock: 0,
    price: 0,
    images: [] as string[],
  });
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/store");
      const data = await response.json();

      if (response.ok) {
        setProducts(data.products || []);
      } else {
        setError(data.error || "Failed to load products");
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
    const files = e.target.files;
    if (files && files.length > 0) {
      const newImages: string[] = [];
      const newPreviews: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 5 * 1024 * 1024) {
          setMessage({ type: "error", text: `Image ${file.name} is too large (max 5MB)` });
          continue;
        }

        try {
          const base64 = await compressImage(file);
          newImages.push(base64);
          newPreviews.push(base64);
        } catch (error) {
          setMessage({ type: "error", text: `Failed to process image ${file.name}` });
        }
      }

      setFormData({ ...formData, images: [...formData.images, ...newImages] });
      setImagePreviews([...imagePreviews, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = formData.images.filter((_, i) => i !== index);
    const updatedPreviews = imagePreviews.filter((_, i) => i !== index);
    setFormData({ ...formData, images: updatedImages });
    setImagePreviews(updatedPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const url = "/api/store";
      const method = editingProduct ? "PUT" : "POST";
      const body = editingProduct
        ? { ...formData, id: editingProduct.id }
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
        setMessage({ type: "success", text: data.message || "Product saved successfully!" });
        setIsFormOpen(false);
        setEditingProduct(null);
        setFormData({ name: "", description: "", stock: 0, price: 0, images: [] });
        setImagePreviews([]);
        fetchProducts();
      } else {
        setMessage({ type: "error", text: data.error || "Something went wrong. Please try again." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      stock: product.stock,
      price: product.price,
      images: product.images || [],
    });
    setImagePreviews(product.images || []);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const response = await fetch(`/api/store?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: data.message || "Product deleted successfully!" });
        fetchProducts();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to delete product." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error. Please try again." });
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
    setFormData({ name: "", description: "", stock: 0, price: 0, images: [] });
    setImagePreviews([]);
    setMessage(null);
  };

  return (
    <div className="relative min-h-screen bg-black text-white">
      <div className="container mx-auto px-6 py-8">
        <HeaderNav />
        
        <main className="mt-16">
          <h1 className="mb-8 text-4xl font-bold text-center">Store</h1>
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
              Total Products: {products.length}
            </div>
            <button
              onClick={() => setIsFormOpen(true)}
              className="px-6 py-2 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors"
            >
              Add Product
            </button>
          </div>

          {isFormOpen && (
            <div className="mb-8 p-6 bg-gray-900 rounded-lg border border-gray-700">
              <h2 className="text-2xl font-bold mb-4">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block mb-2 text-sm font-medium">
                      Product Name *
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
                    <label htmlFor="stock" className="block mb-2 text-sm font-medium">
                      Stock *
                    </label>
                    <input
                      type="number"
                      id="stock"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                      required
                      min="0"
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="price" className="block mb-2 text-sm font-medium">
                      Price *
                    </label>
                    <input
                      type="number"
                      id="price"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white text-white"
                    />
                  </div>
                  <div className="col-span-2">
                    <label htmlFor="description" className="block mb-2 text-sm font-medium">
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white text-white resize-none"
                      placeholder="Product description..."
                    />
                  </div>
                </div>

                {/* Images Section */}
                <div>
                  <label htmlFor="images" className="block mb-2 text-sm font-medium">
                    Images (Max 5MB each, will be compressed)
                  </label>
                  <input
                    type="file"
                    id="images"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-white file:text-black hover:file:bg-gray-200"
                  />
                  {imagePreviews.length > 0 && (
                    <div className="mt-4 grid grid-cols-4 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-700"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 px-2 py-1 bg-red-700 text-white text-xs rounded hover:bg-red-600 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Saving..." : editingProduct ? "Update Product" : "Add Product"}
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
            <div className="text-center text-white">Loading products...</div>
          ) : error ? (
            <div className="text-center text-red-400">{error}</div>
          ) : (
            <div className="max-w-7xl mx-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white">
                    <th className="px-4 py-3 text-left text-white font-normal">Image</th>
                    <th className="px-4 py-3 text-left text-white font-normal">Name</th>
                    <th className="px-4 py-3 text-left text-white font-normal">Description</th>
                    <th className="px-4 py-3 text-left text-white font-normal">Stock</th>
                    <th className="px-4 py-3 text-left text-white font-normal">Price</th>
                    <th className="px-4 py-3 text-left text-white font-normal">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-white border-b border-white">
                        No products found
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr
                        key={product.id}
                        className="border-b border-white"
                      >
                        <td className="px-4 py-3 text-white">
                          {product.images && product.images.length > 0 ? (
                            <div className="flex gap-2">
                              {product.images.slice(0, 3).map((image, idx) => (
                                <img
                                  key={idx}
                                  src={image}
                                  alt={`${product.name} ${idx + 1}`}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                              ))}
                              {product.images.length > 3 && (
                                <div className="w-16 h-16 flex items-center justify-center bg-gray-800 rounded-lg text-xs">
                                  +{product.images.length - 3}
                                </div>
                              )}
                            </div>
                          ) : (
                            "N/A"
                          )}
                        </td>
                        <td className="px-4 py-3 text-white">{product.name}</td>
                        <td 
                          className="px-4 py-3 text-white max-w-xs"
                          title={product.description}
                          style={{ 
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {product.description || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-white">{product.stock}</td>
                        <td className="px-4 py-3 text-white">${product.price.toFixed(2)}</td>
                        <td className="px-4 py-3 text-white">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(product)}
                              className="px-3 py-1 bg-gray-700 text-white text-sm rounded hover:bg-gray-600 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
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

