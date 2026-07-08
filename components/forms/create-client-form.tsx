"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { UserPlus } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input, Select, Textarea } from "@/components/ui/input";

const GOALS = ["FAT_LOSS", "MUSCLE_GAIN", "RECOMPOSITION", "MAINTENANCE"] as const;
const ACTIVITY_LEVELS = ["SEDENTARY", "LIGHT", "MODERATE", "ACTIVE", "VERY_ACTIVE"] as const;
const EXPERIENCE_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;

export function CreateClientForm() {
  const t = useTranslations();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());

    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error?.formErrors?.[0] ?? data.error ?? "Failed to create client");
      }
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button icon={<UserPlus className="h-4 w-4" />} onClick={() => setOpen(true)}>
        {t("trainer.addClient")}
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title={t("trainer.clientIntake")}>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input name="name" label={t("auth.fullName")} required />
          <Input name="email" type="email" label={t("auth.email")} required />
          <Input name="age" type="number" label="Age" min={10} max={100} required />
          <Select name="gender" label="Gender" required defaultValue="MALE">
            <option value="MALE">{t("gender.MALE")}</option>
            <option value="FEMALE">{t("gender.FEMALE")}</option>
          </Select>
          <Input name="heightCm" type="number" label="Height (cm)" min={100} max={250} required />
          <Input name="weightKg" type="number" step="0.1" label="Weight (kg)" min={30} max={300} required />
          <Select name="goal" label="Goal" required defaultValue="FAT_LOSS">
            {GOALS.map((g) => (
              <option key={g} value={g}>
                {t(`goal.${g}`)}
              </option>
            ))}
          </Select>
          <Select name="activityLevel" label="Activity Level" required defaultValue="MODERATE">
            {ACTIVITY_LEVELS.map((a) => (
              <option key={a} value={a}>
                {t(`activityLevel.${a}`)}
              </option>
            ))}
          </Select>
          <Select name="experience" label="Experience" required defaultValue="BEGINNER">
            {EXPERIENCE_LEVELS.map((e) => (
              <option key={e} value={e}>
                {t(`experience.${e}`)}
              </option>
            ))}
          </Select>
          <Input name="sleepHours" type="number" step="0.5" label="Sleep Hours" min={0} max={14} />
          <Textarea name="injuries" label="Injuries" className="sm:col-span-2" />
          <Textarea name="diseases" label="Diseases / Conditions" className="sm:col-span-2" />

          {error && <p className="text-sm text-red-500 sm:col-span-2">{error}</p>}

          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" loading={loading}>
              {t("common.create")}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
