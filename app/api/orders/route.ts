import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, serverTimestamp } from "firebase/firestore";

// GET - Fetch all orders
export async function GET() {
  try {
    const ordersRef = collection(db, "orders");
    const snapshot = await getDocs(ordersRef);
    
    const orders = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        customerInfo: data.customerInfo || {
          name: "",
          email: "",
          phone: "",
          address: "",
          city: "",
        },
        items: data.items || [],
        paymentMethod: data.paymentMethod !== undefined ? data.paymentMethod : null,
        subtotal: data.subtotal !== undefined ? Number(data.subtotal) : 0,
        shippingFee: data.shippingFee !== undefined ? Number(data.shippingFee) : 0,
        total: data.total !== undefined ? Number(data.total) : 0,
        status: data.status || "pending",
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      };
    });

    return NextResponse.json(
      { 
        success: true, 
        orders 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders. Please try again later." },
      { status: 500 }
    );
  }
}

// PUT - Update order status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Valid status is required" },
        { status: 400 }
      );
    }

    const orderRef = doc(db, "orders", id);
    await updateDoc(orderRef, {
      status: status,
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json(
      { 
        success: true, 
        message: "Order status updated successfully" 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { error: "Failed to update order status. Please try again later." },
      { status: 500 }
    );
  }
}

