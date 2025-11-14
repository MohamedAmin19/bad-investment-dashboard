import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";

// GET - Fetch all tours
export async function GET() {
  try {
    const toursRef = collection(db, "tours");
    const snapshot = await getDocs(toursRef);
    
    const tours = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        city: data.city || "",
        date: data.date || "",
        ticketsUrl: data.ticketsUrl || "",
        venue: data.venue || "",
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
      };
    });

    return NextResponse.json(
      { 
        success: true, 
        tours 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching tours:", error);
    return NextResponse.json(
      { error: "Failed to fetch tours. Please try again later." },
      { status: 500 }
    );
  }
}

// POST - Create a new tour
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { city, date, ticketsUrl, venue } = body;

    // Validate required fields
    if (!city || !date || !venue) {
      return NextResponse.json(
        { error: "City, date, and venue are required" },
        { status: 400 }
      );
    }

    const toursRef = collection(db, "tours");
    const docRef = await addDoc(toursRef, {
      city: city.trim(),
      date: date.trim(),
      ticketsUrl: ticketsUrl?.trim() || "",
      venue: venue.trim(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json(
      { 
        success: true, 
        message: "Tour created successfully",
        id: docRef.id 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating tour:", error);
    return NextResponse.json(
      { error: "Failed to create tour. Please try again later." },
      { status: 500 }
    );
  }
}

// PUT - Update an existing tour
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, city, date, ticketsUrl, venue } = body;

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: "Tour ID is required" },
        { status: 400 }
      );
    }

    if (!city || !date || !venue) {
      return NextResponse.json(
        { error: "City, date, and venue are required" },
        { status: 400 }
      );
    }

    const tourRef = doc(db, "tours", id);
    await updateDoc(tourRef, {
      city: city.trim(),
      date: date.trim(),
      ticketsUrl: ticketsUrl?.trim() || "",
      venue: venue.trim(),
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json(
      { 
        success: true, 
        message: "Tour updated successfully" 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating tour:", error);
    return NextResponse.json(
      { error: "Failed to update tour. Please try again later." },
      { status: 500 }
    );
  }
}

// DELETE - Delete a tour
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Tour ID is required" },
        { status: 400 }
      );
    }

    const tourRef = doc(db, "tours", id);
    await deleteDoc(tourRef);

    return NextResponse.json(
      { 
        success: true, 
        message: "Tour deleted successfully" 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting tour:", error);
    return NextResponse.json(
      { error: "Failed to delete tour. Please try again later." },
      { status: 500 }
    );
  }
}

