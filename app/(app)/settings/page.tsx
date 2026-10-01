import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { SettingsForm } from "@/components/settings/settings-form";

export const metadata: Metadata = { title: "Einstellungen" };

export default function SettingsPage() {
  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Einstellungen"
        ja="設定"
        description="Lesehilfen lassen sich jederzeit anpassen. Mit wachsendem Können kannst du sie Schritt für Schritt reduzieren."
      />
      <SettingsForm />
    </div>
  );
}
