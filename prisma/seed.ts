/**
 * Demo data seed script.
 *
 * Usage: `npm run db:seed` (after `DATABASE_URL` + Supabase env vars are set
 * in `.env`). Creates three real, working demo accounts (with Supabase Auth
 * users, so you can actually log in) plus the full exercise library and a
 * sample client with measurements, an active meal plan, and an active
 * workout plan — enough to explore every dashboard immediately.
 */
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import { exercisesSeedData } from "./seed-data/exercises";
import { calculateNutritionTargets } from "../src/lib/nutrition/calculations";
import { generateDeterministicMealPlan } from "../src/lib/nutrition/generator";
import { generateDeterministicWorkoutPlan } from "../src/lib/workout/generator";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "FitProDemo123!";

const DEMO_ACCOUNTS = {
  admin: { email: "admin@fitpro.dev", name: "Amina Al-Fitri" },
  trainer: { email: "trainer@fitpro.dev", name: "Karim Osman" },
  client: { email: "client@fitpro.dev", name: "Sara Al-Harbi" },
};

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.warn(
      "\n⚠️  NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set.\n" +
        "   Demo Users/ClientProfile/TrainerProfile rows will be skipped —\n" +
        "   only the Exercise library will be seeded.\n" +
        "   Set your Supabase env vars in .env and re-run `npm run db:seed` for full demo data.\n",
    );
    return null;
  }
  return createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function upsertSupabaseUser(admin: ReturnType<typeof getSupabaseAdmin>, email: string, role: string) {
  if (!admin) return null;
  const { data: existing } = await admin.auth.admin.listUsers();
  const found = existing.users.find((u) => u.email === email);
  if (found) {
    await admin.auth.admin.updateUserById(found.id, { app_metadata: { role } });
    return found.id;
  }
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    app_metadata: { role },
  });
  if (error) throw new Error(`Failed to create Supabase user ${email}: ${error.message}`);
  return data.user!.id;
}

async function seedExercises() {
  console.log(`Seeding ${exercisesSeedData.length} exercises…`);
  for (const exercise of exercisesSeedData) {
    await prisma.exercise.upsert({
      where: { slug: exercise.slug },
      update: exercise,
      create: exercise,
    });
  }
}

async function seedDemoAccounts() {
  const supabaseAdmin = getSupabaseAdmin();

  const adminSupabaseId = await upsertSupabaseUser(supabaseAdmin, DEMO_ACCOUNTS.admin.email, "ADMIN");
  const trainerSupabaseId = await upsertSupabaseUser(supabaseAdmin, DEMO_ACCOUNTS.trainer.email, "TRAINER");
  const clientSupabaseId = await upsertSupabaseUser(supabaseAdmin, DEMO_ACCOUNTS.client.email, "CLIENT");

  if (!adminSupabaseId || !trainerSupabaseId || !clientSupabaseId) {
    console.log("Skipping demo Users/profiles (no Supabase connection configured).");
    return;
  }

  await prisma.user.upsert({
    where: { email: DEMO_ACCOUNTS.admin.email },
    update: {},
    create: {
      supabaseId: adminSupabaseId,
      email: DEMO_ACCOUNTS.admin.email,
      name: DEMO_ACCOUNTS.admin.name,
      role: "ADMIN",
    },
  });

  const trainerUser = await prisma.user.upsert({
    where: { email: DEMO_ACCOUNTS.trainer.email },
    update: {},
    create: {
      supabaseId: trainerSupabaseId,
      email: DEMO_ACCOUNTS.trainer.email,
      name: DEMO_ACCOUNTS.trainer.name,
      role: "TRAINER",
    },
  });

  const trainerProfile = await prisma.trainerProfile.upsert({
    where: { userId: trainerUser.id },
    update: {},
    create: {
      userId: trainerUser.id,
      bio: "Certified strength & conditioning coach, 8 years experience.",
      specialties: ["Strength Training", "Fat Loss", "Nutrition Coaching"],
      yearsExperience: 8,
    },
  });

  const clientUser = await prisma.user.upsert({
    where: { email: DEMO_ACCOUNTS.client.email },
    update: {},
    create: {
      supabaseId: clientSupabaseId,
      email: DEMO_ACCOUNTS.client.email,
      name: DEMO_ACCOUNTS.client.name,
      role: "CLIENT",
    },
  });

  const clientIntake = {
    age: 29,
    gender: "FEMALE" as const,
    heightCm: 165,
    weightKg: 68,
    goal: "FAT_LOSS" as const,
    activityLevel: "MODERATE" as const,
    experience: "INTERMEDIATE" as const,
  };

  const clientProfile = await prisma.clientProfile.upsert({
    where: { userId: clientUser.id },
    update: {},
    create: {
      userId: clientUser.id,
      trainerId: trainerProfile.id,
      age: clientIntake.age,
      gender: clientIntake.gender,
      heightCm: clientIntake.heightCm,
      goal: clientIntake.goal,
      activityLevel: clientIntake.activityLevel,
      experience: clientIntake.experience,
      sleepHours: 7,
      waterIntakeMl: 2500,
      subscriptionStatus: "ACTIVE",
      subscriptionStart: new Date(),
    },
  });

  // A short measurement history so the progress chart has something to show.
  const today = new Date();
  const measurementHistory = [
    { daysAgo: 60, weightKg: 72.4, bodyFatPct: 29, muscleMassKg: 47.1 },
    { daysAgo: 45, weightKg: 71.2, bodyFatPct: 28, muscleMassKg: 47.3 },
    { daysAgo: 30, weightKg: 70.1, bodyFatPct: 27, muscleMassKg: 47.6 },
    { daysAgo: 15, weightKg: 69, bodyFatPct: 26, muscleMassKg: 47.8 },
    { daysAgo: 0, weightKg: 68, bodyFatPct: 25, muscleMassKg: 48 },
  ];

  for (const point of measurementHistory) {
    const date = new Date(today);
    date.setDate(date.getDate() - point.daysAgo);
    await prisma.measurement.create({
      data: {
        clientId: clientProfile.id,
        date,
        weightKg: point.weightKg,
        bodyFatPct: point.bodyFatPct,
        muscleMassKg: point.muscleMassKg,
        bmi: Number((point.weightKg / (clientIntake.heightCm / 100) ** 2).toFixed(1)),
        source: "MANUAL",
      },
    });
  }

  // Active meal plan (deterministic generator — no AI key needed for seeding).
  const targets = calculateNutritionTargets(clientIntake);
  const mealPlanContent = generateDeterministicMealPlan(targets, clientIntake.goal);
  await prisma.mealPlan.create({
    data: {
      clientId: clientProfile.id,
      goal: clientIntake.goal,
      bmr: targets.bmr,
      tdee: targets.tdee,
      calories: targets.calories,
      proteinG: targets.proteinG,
      carbsG: targets.carbsG,
      fatG: targets.fatG,
      waterMl: targets.waterMl,
      meals: mealPlanContent.meals,
      supplements: mealPlanContent.supplements,
      alternatives: mealPlanContent.alternatives,
      shoppingList: mealPlanContent.shoppingList,
      generatedBy: "AI",
      status: "ACTIVE",
    },
  });

  // Active workout plan.
  const schedule = generateDeterministicWorkoutPlan({
    style: "PUSH_PULL_LEGS",
    experience: clientIntake.experience,
    daysPerWeek: 4,
  });
  await prisma.workoutPlan.create({
    data: {
      clientId: clientProfile.id,
      style: "PUSH_PULL_LEGS",
      experience: clientIntake.experience,
      daysPerWeek: 4,
      schedule,
      generatedBy: "AI",
      status: "ACTIVE",
    },
  });

  // A welcome notification.
  await prisma.notification.create({
    data: {
      recipientId: clientUser.id,
      senderId: trainerUser.id,
      type: "GENERAL",
      title: "Welcome to FitPro!",
      titleAr: "أهلاً بك في فِت برو!",
      body: "Your first meal plan and workout program are ready — check your dashboard.",
      bodyAr: "خطة وجباتك وبرنامجك التدريبي الأول جاهزان — تحقق من لوحتك.",
    },
  });

  // A few attendance check-ins.
  for (let i = 0; i < 5; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i * 3);
    date.setHours(0, 0, 0, 0);
    await prisma.attendance
      .upsert({
        where: { clientId_date: { clientId: clientProfile.id, date } },
        update: {},
        create: { clientId: clientProfile.id, date, status: "PRESENT" },
      })
      .catch(() => undefined);
  }

  console.log("\n✅ Demo accounts ready — password for all three: " + DEMO_PASSWORD);
  console.log(`   Admin:   ${DEMO_ACCOUNTS.admin.email}`);
  console.log(`   Trainer: ${DEMO_ACCOUNTS.trainer.email}`);
  console.log(`   Client:  ${DEMO_ACCOUNTS.client.email}`);
}

async function main() {
  await seedExercises();
  await seedDemoAccounts();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
