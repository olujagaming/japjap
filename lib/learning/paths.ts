import { KANA } from "@/data/kana";
import type { LearningPath, PathItem } from "@/data/learning-paths";
import {
  conversationsForSituation,
  getConversation,
  getSituation,
  listVocabulary,
} from "@/lib/content";
import { isConversationCompleted } from "@/lib/learning/conversation";
import { isKnownStatus } from "@/lib/learning/progress";
import type { ProgressRecord } from "@/lib/store/types";

export type ItemProgress = {
  label: string;
  labelJa?: string;
  href: string;
  value: number;
  max: number;
  done: boolean;
};

export type PathProgress = {
  items: ItemProgress[];
  completedItems: number;
  /** Nächste empfohlene Einheit (erste nicht abgeschlossene). */
  next: ItemProgress | null;
};

/** Ab welchem Anteil eine Einheit mit vielen Inhalten als geschafft gilt. */
const DONE_RATIO = 0.8;

const key = (r: Pick<ProgressRecord, "contentType" | "contentId">) =>
  `${r.contentType}:${r.contentId}`;

export function itemProgress(
  item: PathItem,
  records: ReadonlyMap<string, ProgressRecord>,
): ItemProgress {
  const known = (type: ProgressRecord["contentType"], id: string) => {
    const r = records.get(`${type}:${id}`);
    return r ? isKnownStatus(r.status) : false;
  };
  switch (item.kind) {
    case "kana": {
      const ids = KANA.filter(
        (k) => k.scriptType === item.script && item.groups.includes(k.group),
      ).map((k) => k.id);
      const value = ids.filter((id) => known("kana", id)).length;
      const chars = KANA.filter((k) => ids.includes(k.id)).map((k) => k.character);
      return {
        label: item.label,
        href: `/kana/practice?chars=${encodeURIComponent(chars.join(","))}`,
        value,
        max: ids.length,
        done: value >= Math.ceil(ids.length * DONE_RATIO),
      };
    }
    case "vocabulary": {
      const ids = listVocabulary()
        .filter((v) => v.tags.includes(item.tag))
        .map((v) => v.id);
      const value = ids.filter((id) => known("vocabulary", id)).length;
      return {
        label: item.label,
        href: `/vocabulary?tag=${item.tag}`,
        value,
        max: ids.length,
        done: value >= Math.ceil(ids.length * DONE_RATIO),
      };
    }
    case "situation": {
      const situation = getSituation(item.slug)!;
      const ids = conversationsForSituation(situation.id).map((c) => c.id);
      const value = ids.filter((id) =>
        isConversationCompleted(records.get(`conversation:${id}`)),
      ).length;
      return {
        label: situation.titleDe,
        labelJa: situation.titleJa,
        href: `/situations/${situation.slug}`,
        value,
        max: ids.length,
        done: value === ids.length,
      };
    }
    case "conversation": {
      const conversation = getConversation(item.id)!;
      const done = isConversationCompleted(records.get(`conversation:${conversation.id}`));
      return {
        label: conversation.titleDe,
        labelJa: conversation.titleJa,
        href: `/conversations/${conversation.id}`,
        value: done ? 1 : 0,
        max: 1,
        done,
      };
    }
  }
}

export function pathProgress(path: LearningPath, records: readonly ProgressRecord[]): PathProgress {
  const map = new Map(records.map((r) => [key(r), r]));
  const items = path.items.map((item) => itemProgress(item, map));
  return {
    items,
    completedItems: items.filter((i) => i.done).length,
    next: items.find((i) => !i.done) ?? null,
  };
}
