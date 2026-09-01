import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: "Phone number required" }, { status: 400 });
    }

    const user = await prisma.user.upsert({
      where: { phone },
      update: {
        phoneVerifiedAt: new Date(),
      },
      create: {
        phone,
        phoneVerifiedAt: new Date(),
        role: "PARENT",
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error("Auth sync error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
