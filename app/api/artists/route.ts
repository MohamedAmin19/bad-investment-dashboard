import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";

// GET - Fetch all artists
export async function GET() {
  try {
    const artistsRef = collection(db, "artists");
    const snapshot = await getDocs(artistsRef);
    
    const artists = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || "",
        slug: data.slug || "",
        title: data.title || "",
        socials: data.socials || [],
        bio: data.bio || [],
        imageUrl: data.imageUrl || "",
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
      };
    });

    return NextResponse.json(
      { 
        success: true, 
        artists 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching artists:", error);
    return NextResponse.json(
      { error: "Failed to fetch artists. Please try again later." },
      { status: 500 }
    );
  }
}

// POST - Create a new artist
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, title, socials, bio, imageUrl } = body;

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      );
    }

    const artistsRef = collection(db, "artists");
    const docRef = await addDoc(artistsRef, {
      name: name.trim(),
      slug: slug.trim(),
      title: title?.trim() || "",
      socials: socials || [],
      bio: bio || [],
      imageUrl: imageUrl || "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json(
      { 
        success: true, 
        message: "Artist created successfully",
        id: docRef.id 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating artist:", error);
    return NextResponse.json(
      { error: "Failed to create artist. Please try again later." },
      { status: 500 }
    );
  }
}

// PUT - Update an existing artist
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, slug, title, socials, bio, imageUrl } = body;

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: "Artist ID is required" },
        { status: 400 }
      );
    }

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      );
    }

    const artistRef = doc(db, "artists", id);
    await updateDoc(artistRef, {
      name: name.trim(),
      slug: slug.trim(),
      title: title?.trim() || "",
      socials: socials || [],
      bio: bio || [],
      imageUrl: imageUrl || "",
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json(
      { 
        success: true, 
        message: "Artist updated successfully" 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating artist:", error);
    return NextResponse.json(
      { error: "Failed to update artist. Please try again later." },
      { status: 500 }
    );
  }
}

// DELETE - Delete an artist
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Artist ID is required" },
        { status: 400 }
      );
    }

    const artistRef = doc(db, "artists", id);
    await deleteDoc(artistRef);

    return NextResponse.json(
      { 
        success: true, 
        message: "Artist deleted successfully" 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting artist:", error);
    return NextResponse.json(
      { error: "Failed to delete artist. Please try again later." },
      { status: 500 }
    );
  }
}

