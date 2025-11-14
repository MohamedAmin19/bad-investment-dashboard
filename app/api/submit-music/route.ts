import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export async function GET() {
  try {
    const submissionsRef = collection(db, "submissions");
    const snapshot = await getDocs(submissionsRef);
    
    const submissions = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        role: data.role || "",
        submissionType: data.submissionType || "",
        name: data.name || "",
        phone: data.phone || "",
        email: data.email || "",
        artist: data.artist || "",
        profile: data.profile || "",
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      };
    });

    return NextResponse.json(
      { 
        success: true, 
        submissions 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions. Please try again later." },
      { status: 500 }
    );
  }
}

