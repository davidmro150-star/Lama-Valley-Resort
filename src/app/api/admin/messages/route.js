import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import ContactMessage from "@/models/ContactMessage";

export async function GET() {
  try {
    // Check admin authentication
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized access",
        },
        { status: 401 }
      );
    }

    // Connect to MongoDB
    await connectDB();

    // Retrieve all contact messages
    const messages = await ContactMessage.find({})
      .sort({ createdAt: -1 })
      .lean();

    // Convert MongoDB ObjectId to string
    const formattedMessages = messages.map((message) => ({
      ...message,
      _id: message._id.toString(),
    }));

    return NextResponse.json({
      success: true,
      messages: formattedMessages,
    });
  } catch (error) {
    console.error("Admin messages GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve contact messages",
      },
      { status: 500 }
    );
  }
}