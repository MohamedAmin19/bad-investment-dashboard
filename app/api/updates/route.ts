import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";

// GET - Fetch all updates
export async function GET() {
  try {
    const updatesRef = collection(db, "updates");
    const snapshot = await getDocs(updatesRef);
    
    const updates = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        date: data.date || "",
        title: data.title || "",
        url: data.url || "",
        imageUrl: data.imageUrl || "",
        isAvailable: data.isAvailable || false,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
      };
    });

    return NextResponse.json(
      { 
        success: true, 
        updates 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching updates:", error);
    return NextResponse.json(
      { error: "Failed to fetch updates. Please try again later." },
      { status: 500 }
    );
  }
}

// POST - Create a new update
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, title, url, imageUrl, isAvailable } = body;

    // Validate required fields
    if (!date || !title) {
      return NextResponse.json(
        { error: "Date and title are required" },
        { status: 400 }
      );
    }

    const updatesRef = collection(db, "updates");
    const docRef = await addDoc(updatesRef, {
      date: date.trim(),
      title: title.trim(),
      url: url?.trim() || "",
      imageUrl: imageUrl || "",
      isAvailable: isAvailable || false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json(
      { 
        success: true, 
        message: "Update created successfully",
        id: docRef.id 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating update:", error);
    return NextResponse.json(
      { error: "Failed to create update. Please try again later." },
      { status: 500 }
    );
  }
}

// PUT - Update an existing update
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, date, title, url, imageUrl, isAvailable } = body;

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: "Update ID is required" },
        { status: 400 }
      );
    }

    if (!date || !title) {
      return NextResponse.json(
        { error: "Date and title are required" },
        { status: 400 }
      );
    }

    const updateRef = doc(db, "updates", id);
    await updateDoc(updateRef, {
      date: date.trim(),
      title: title.trim(),
      url: url?.trim() || "",
      imageUrl: imageUrl || "",
      isAvailable: isAvailable || false,
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json(
      { 
        success: true, 
        message: "Update updated successfully" 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating update:", error);
    return NextResponse.json(
      { error: "Failed to update update. Please try again later." },
      { status: 500 }
    );
  }
}

// DELETE - Delete an update
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Update ID is required" },
        { status: 400 }
      );
    }

    const updateRef = doc(db, "updates", id);
    await deleteDoc(updateRef);

    return NextResponse.json(
      { 
        success: true, 
        message: "Update deleted successfully" 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting update:", error);
    return NextResponse.json(
      { error: "Failed to delete update. Please try again later." },
      { status: 500 }
    );
  }
}

