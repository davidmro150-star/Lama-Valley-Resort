
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ContactMessage from "@/models/ContactMessage";

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      name,
      email,
      phone,
      subject,
      message,
    } = body;

    // Required field validation
    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Please fill in all required fields.",
        },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid email address.",
        },
        { status: 400 }
      );
    }

    // Length validation
    if (
      name.trim().length > 100 ||
      email.trim().length > 150 ||
      (phone && phone.trim().length > 30) ||
      subject.trim().length > 150 ||
      message.trim().length > 3000
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "One or more fields exceed the allowed length.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const newMessage = await ContactMessage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || "",
      subject: subject.trim(),
      message: message.trim(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Your message has been sent successfully. Thank you for contacting us!",
        data: {
          id: newMessage._id.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Contact form submission error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to send your message right now. Please try again later.",
      },
      { status: 500 }
    );
  }
}
