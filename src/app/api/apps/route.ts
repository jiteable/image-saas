import { createAppSchema } from "@/server/db/validate-schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { db } from "@/server/db/db";
import { apps } from "@/server/db/schema";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const input = createAppSchema.pick({ name: true, description: true }).safeParse(body);

    if (!input.success) {
      return NextResponse.json({ error: "Validation failed", details: input.error }, { status: 400 });
    }

    const result = await db.insert(apps).values({
      name: input.data.name,
      description: input.data.description,
      userId: session.user.id
    }).returning();

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Failed to create app:", error);
    return NextResponse.json({ error: "Failed to create app" }, { status: 500 });
  }
}