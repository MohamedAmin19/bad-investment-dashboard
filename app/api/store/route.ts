import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";

// GET - Fetch all products
export async function GET() {
  try {
    const productsRef = collection(db, "products");
    const snapshot = await getDocs(productsRef);
    
    const products = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || "",
        description: data.description || "",
        stock: data.stock || 0,
        price: data.price || 0,
        images: data.images || [],
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
      };
    });

    return NextResponse.json(
      { 
        success: true, 
        products 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products. Please try again later." },
      { status: 500 }
    );
  }
}

// POST - Create a new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, stock, price, images } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: "Product name is required" },
        { status: 400 }
      );
    }

    if (stock === undefined || stock === null) {
      return NextResponse.json(
        { error: "Stock is required" },
        { status: 400 }
      );
    }

    if (price === undefined || price === null) {
      return NextResponse.json(
        { error: "Price is required" },
        { status: 400 }
      );
    }

    const productsRef = collection(db, "products");
    const docRef = await addDoc(productsRef, {
      name: name.trim(),
      description: description?.trim() || "",
      stock: Number(stock),
      price: Number(price),
      images: images || [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json(
      { 
        success: true, 
        message: "Product created successfully",
        id: docRef.id 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product. Please try again later." },
      { status: 500 }
    );
  }
}

// PUT - Update an existing product
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, stock, price, images } = body;

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: "Product name is required" },
        { status: 400 }
      );
    }

    if (stock === undefined || stock === null) {
      return NextResponse.json(
        { error: "Stock is required" },
        { status: 400 }
      );
    }

    if (price === undefined || price === null) {
      return NextResponse.json(
        { error: "Price is required" },
        { status: 400 }
      );
    }

    const productRef = doc(db, "products", id);
    await updateDoc(productRef, {
      name: name.trim(),
      description: description?.trim() || "",
      stock: Number(stock),
      price: Number(price),
      images: images || [],
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json(
      { 
        success: true, 
        message: "Product updated successfully" 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product. Please try again later." },
      { status: 500 }
    );
  }
}

// DELETE - Delete a product
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const productRef = doc(db, "products", id);
    await deleteDoc(productRef);

    return NextResponse.json(
      { 
        success: true, 
        message: "Product deleted successfully" 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product. Please try again later." },
      { status: 500 }
    );
  }
}

