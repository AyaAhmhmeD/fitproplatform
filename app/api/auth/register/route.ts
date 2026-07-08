import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Self-registration is intentionally narrow: FitPro accounts are normally
 * provisioned by an Admin (trainers) or a Trainer/Admin (clients) via
 * `provisionUser` (see src/lib/auth/roles.ts), so that every account has a
 * clear owner and role from day one. The one exception is bootstrapping the
 * very first Admin account on a fresh deployment — if no Admin exists yet,
 * this route creates one from the sign-up form. Once an Admin exists, this
 * route rejects further sign-ups and directs people to ask their Admin or
 * Trainer for an invite instead.
 */
export async function POST(request: NextRequest) {
  const { name, email, password } = await request.json();

  if (!name || !email || !password || password.length < 8) {
    return NextResponse.json(
      { error: "Name, email, and an 8+ character password are required" },
      { status: 400 },
    );
  }

  const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
  if (adminCount > 0) {
    return NextResponse.json(
      {
        error:
          "Self-registration is disabled. Ask your gym's Admin or Trainer to create your account and send you an invite.",
      },
      { status: 403 },
    );
  }

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role: "ADMIN" },
    user_metadata: { name },
  });

  if (error || !data.user) {
    return NextResponse.json({ error: error?.message ?? "Failed to create account" }, { status: 500 });
  }

  const user = await prisma.user.create({
    data: { supabaseId: data.user.id, email, name, role: "ADMIN" },
  });

  return NextResponse.json({ ok: true, userId: user.id }, { status: 201 });
}
