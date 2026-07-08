import { supabase } from "@/lib/supabase";
import type {
  AppNotification,
  Attendance,
  AttendanceStatus,
  ClientIntakeInput,
  ClientProfile,
  Exercise,
  MealPlan,
  Measurement,
  NotificationType,
  NutritionTargets,
  Role,
  TrainerProfile,
  TrainingStyle,
  WorkoutPlan,
} from "@/types";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000/api";

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

/**
 * Thin fetch wrapper: resolves the current Supabase session, attaches it as
 * `Authorization: Bearer <token>`, and points at EXPO_PUBLIC_API_URL. The
 * Next.js route handlers under web/src/app/api validate this token the same
 * way they validate the web app's own cookies (see web/src/proxy.ts) — no
 * backend changes needed, we just need to send the header.
 */
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
    ...(init.headers as Record<string, string> | undefined),
  };

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });

  const text = await res.text();
  const body = text ? JSON.parse(text) : undefined;

  if (!res.ok) {
    const message =
      (body && typeof body === "object" && "error" in body
        ? typeof body.error === "string"
          ? body.error
          : JSON.stringify(body.error)
        : undefined) ?? `Request failed with status ${res.status}`;
    throw new ApiError(message, res.status, body);
  }

  return body as T;
}

function qs(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== "");
  if (entries.length === 0) return "";
  const search = new URLSearchParams(entries.map(([k, v]) => [k, String(v)]));
  return `?${search.toString()}`;
}

// ── Clients ──────────────────────────────────────────────────────────────

export function getClients(search?: string) {
  return request<{ clients: ClientProfile[] }>(`/clients${qs({ q: search })}`);
}

export function getClient(id: string) {
  return request<{ client: ClientProfile }>(`/clients/${id}`);
}

export function createClient(data: ClientIntakeInput & { email: string }) {
  return request<{ client: ClientProfile }>("/clients", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function patchClient(id: string, data: Partial<ClientProfile>) {
  return request<{ client: ClientProfile }>(`/clients/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteClient(id: string) {
  return request<{ ok: true }>(`/clients/${id}`, { method: "DELETE" });
}

// ── Nutrition / workout generation ──────────────────────────────────────

export function generateNutritionPlan(clientId: string, variantSeed?: number) {
  return request<{ mealPlan: MealPlan; targets: NutritionTargets; source: string }>(
    "/nutrition/generate",
    { method: "POST", body: JSON.stringify({ clientId, variantSeed }) },
  );
}

export function generateWorkoutPlan(params: {
  clientId: string;
  style: TrainingStyle;
  daysPerWeek?: number;
  equipment?: string[];
}) {
  return request<{ workoutPlan: WorkoutPlan; source: string }>("/workout/generate", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

// ── Exercises ────────────────────────────────────────────────────────────

export function getExercises(filters?: {
  muscleGroup?: string;
  difficulty?: string;
  equipment?: string;
  q?: string;
}) {
  return request<{ exercises: Exercise[] }>(`/exercises${qs(filters ?? {})}`);
}

export function getExercise(slug: string) {
  return request<{ exercise: Exercise }>(`/exercises/${slug}`);
}

// ── Notifications ────────────────────────────────────────────────────────

export function getNotifications() {
  return request<{ notifications: AppNotification[] }>("/notifications");
}

export function markAllNotificationsRead() {
  return request<{ ok: true }>("/notifications", { method: "PATCH" });
}

export function sendNotification(payload: {
  recipientId?: string;
  broadcastRole?: Role;
  type: NotificationType;
  title: string;
  titleAr?: string;
  body: string;
  bodyAr?: string;
}) {
  return request<{ count: number }>("/notifications", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ── Measurements / photos ────────────────────────────────────────────────

export function postMeasurement(data: Partial<Measurement> & { clientId?: string }) {
  return request<{ measurement: Measurement }>("/measurements", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function postPhoto(params: {
  uri: string;
  fileName: string;
  mimeType: string;
  clientId?: string;
  angle?: "FRONT" | "SIDE" | "BACK";
  notes?: string;
}) {
  const form = new FormData();
  // React Native's FormData accepts this { uri, name, type } shape for files.
  form.append("file", {
    uri: params.uri,
    name: params.fileName,
    type: params.mimeType,
  } as unknown as Blob);
  if (params.clientId) form.append("clientId", params.clientId);
  if (params.angle) form.append("angle", params.angle);
  if (params.notes) form.append("notes", params.notes);

  return request<{ photo: { id: string; url: string } }>("/photos", {
    method: "POST",
    body: form,
  });
}

// ── Attendance ────────────────────────────────────────────────────────────

export function getAttendance(clientId?: string) {
  return request<
    { attendances: Attendance[] } | { rate: number; total: number; present: number }
  >(`/attendance${qs({ clientId })}`);
}

export function postAttendance(data: {
  clientId: string;
  date?: string;
  status?: AttendanceStatus;
  notes?: string;
}) {
  return request<{ attendance: Attendance }>("/attendance", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ── Reports ──────────────────────────────────────────────────────────────

export function generatePdfReport(clientId: string, kind: "progress" | "meal" | "workout") {
  return request<{ url: string; report: { id: string } }>("/reports/pdf", {
    method: "POST",
    body: JSON.stringify({ clientId, kind }),
  });
}

export function generateExcelReport(params: { kind: "progress" | "analytics"; clientId?: string }) {
  return request<{ url: string; report: { id: string } }>("/reports/excel", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

// ── Trainers ──────────────────────────────────────────────────────────────

export function getTrainers() {
  return request<{ trainers: TrainerProfile[] }>("/trainers");
}

export function createTrainer(data: {
  email: string;
  name: string;
  phone?: string;
  bio?: string;
  specialties?: string[];
}) {
  return request<{ ok: true }>("/trainers", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
