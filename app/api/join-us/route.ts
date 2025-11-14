import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export async function GET() {
  try {
    const subscribersRef = collection(db, "subscribers");
    const snapshot = await getDocs(subscribersRef);
    
    const subscribers = snapshot.docs.map((doc) => ({
      id: doc.id,
      email: doc.data().email,
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
    }));

    return NextResponse.json(
      { 
        success: true, 
        subscribers 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching subscribers:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscribers. Please try again later." },
      { status: 500 }
    );
  }
}

