"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { FileUp } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export function BodyAnalysisUploadForm({ clientId }: { clientId: string }) {
  const t = useTranslations("trainer");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    setSummary(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("clientId", clientId);

    try {
      const res = await fetch("/api/pdf-analysis", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Upload failed");
      }
      const data = await res.json();
      setSummary(data.report?.summary ?? "Analysis processed.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <input ref={inputRef} type="file" accept="application/pdf" hidden onChange={handleFileChange} />
      <Button
        size="sm"
        variant="outline"
        icon={<FileUp className="h-4 w-4" />}
        loading={loading}
        onClick={() => inputRef.current?.click()}
      >
        {t("uploadAnalysis")}
      </Button>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {summary && <p className="max-w-xs text-xs text-ink-400">{summary}</p>}
    </div>
  );
}
