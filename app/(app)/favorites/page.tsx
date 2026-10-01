import type { Metadata } from "next";
import { FavoritesView } from "@/components/favorites/favorites-view";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = { title: "Favoriten" };

export default function FavoritesPage() {
  return (
    <>
      <PageHeader
        title="Favoriten"
        ja="お気に入り"
        description="Alles, was du dir gemerkt hast – zum Nachschlagen und gezielten Wiederholen."
      />
      <FavoritesView />
    </>
  );
}
