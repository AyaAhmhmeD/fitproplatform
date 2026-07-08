import { createAdminClient } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/types";

/**
 * Creates a fully wired user: a Supabase auth account (invited via email),
 * a Prisma `User` row, and — critically — syncs the role into Supabase's
 * `app_metadata` so `src/proxy.ts` can enforce RBAC on every request without
 * touching the database. Call this from admin/trainer "create account" flows.
 */
export async function provisionUser(params: {
  email: string;
  name: string;
  role: Role;
  phone?: string;
  sendInviteEmail?: boolean;
}): Promise<{ userId: string; supabaseId: string }> {
  const admin = createAdminClient();

  const { data, error } = await params.sendInviteEmail
    ? await admin.auth.admin.inviteUserByEmail(params.email, {
        data: { name: params.name, role: params.role },
      })
    : await admin.auth.admin.createUser({
        email: params.email,
        email_confirm: true,
        user_metadata: { name: params.name },
        app_metadata: { role: params.role },
      });

  if (error || !data.user) {
    throw new Error(error?.message ?? "Failed to create Supabase auth user");
  }

  // Make sure app_metadata.role is set even on the invite path.
  await admin.auth.admin.updateUserById(data.user.id, {
    app_metadata: { role: params.role },
  });

  const dbUser = await prisma.user.create({
    data: {
      supabaseId: data.user.id,
      email: params.email,
      name: params.name,
      phone: params.phone,
      role: params.role,
    },
  });

  if (params.role === "TRAINER") {
    await prisma.trainerProfile.create({ data: { userId: dbUser.id } });
  }

  return { userId: dbUser.id, supabaseId: data.user.id };
}

/** Updates a user's role in both Prisma and Supabase app_metadata, keeping them in sync. */
export async function updateUserRole(userId: string, role: Role): Promise<void> {
  const user = await prisma.user.update({ where: { id: userId }, data: { role } });
  const admin = createAdminClient();
  await admin.auth.admin.updateUserById(user.supabaseId, { app_metadata: { role } });
}

/** Deactivates a user (soft delete) — keeps historical data intact for reporting. */
export async function deactivateUser(userId: string): Promise<void> {
  const user = await prisma.user.update({ where: { id: userId }, data: { isActive: false } });
  const admin = createAdminClient();
  await admin.auth.admin.updateUserById(user.supabaseId, { ban_duration: "876000h" });
}
