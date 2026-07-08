import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole, isSessionUser } from "@/lib/auth/session";
import { uploadFile } from "@/lib/storage/upload";

/** POST /api/photos — multipart upload of a progress photo (client or trainer on client's behalf). */
export async function POST(request: NextRequest) {
  const session = await requireApiRole("ADMIN", "TRAINER", "CLIENT");
  if (!isSessionUser(session)) return session;

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const clientIdInput = formData.get("clientId") as string | null;
  const angle = (formData.get("angle") as string | null) ?? "FRONT";
  const notes = formData.get("notes") as string | null;

  if (!file) return NextResponse.json({ error: "file is required" }, { status: 400 });

  let clientId = clientIdInput ?? undefined;
  if (session.role === "CLIENT") {
    const own = await prisma.clientProfile.findUnique({ where: { userId: session.id } });
    if (!own) return NextResponse.json({ error: "Client profile not found" }, { status: 404 });
    clientId = own.id;
  }
  if (!clientId) return NextResponse.json({ error: "clientId is required" }, { status: 400 });

  const bytes = Buffer.from(await file.arrayBuffer());
  const path = `${clientId}/${Date.now()}-${file.name}`;
  const url = await uploadFile({
    bucket: "photos",
    path,
    file: bytes,
    contentType: file.type || "image/jpeg",
  });

  const photo = await prisma.progressPhoto.create({
    data: {
      clientId,
      url,
      angle: angle as "FRONT" | "SIDE" | "BACK",
      notes: notes ?? undefined,
    },
  });

  return NextResponse.json({ photo }, { status: 201 });
}
