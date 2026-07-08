"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export function DeleteClientButton({ clientId }: { clientId: string }) {
  const t = useTranslations("common");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      await fetch(`/api/clients/${clientId}`, { method: "DELETE" });
      router.push("/admin/clients");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button size="sm" variant="danger" icon={<Trash2 className="h-4 w-4" />} onClick={() => setOpen(true)}>
        {t("delete")}
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Delete client?">
        <p className="text-sm text-ink-400">
          This permanently deletes the client, their measurements, plans, and photos. This cannot be undone.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            {t("cancel")}
          </Button>
          <Button variant="danger" loading={loading} onClick={handleDelete}>
            {t("delete")}
          </Button>
        </div>
      </Modal>
    </>
  );
}
