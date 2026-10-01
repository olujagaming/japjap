import {
  ConversationIcon,
  GrammarIcon,
  HomeIcon,
  KanaIcon,
  KanjiIcon,
  LearnIcon,
  ProfileIcon,
  ProgressIcon,
  ReviewIcon,
  SearchIcon,
  SettingsIcon,
  SituationIcon,
  StarIcon,
  VocabularyIcon,
  type IconComponent,
} from "@/components/ui/icons";

export type NavItem = {
  href: string;
  label: string;
  /** Kurzer japanischer Begriff – typografisches Element, keine Pflichtinformation. */
  ja: string;
  icon: IconComponent;
};

export const PRIMARY_NAV: NavItem[] = [
  { href: "/", label: "Start", ja: "ホーム", icon: HomeIcon },
  { href: "/learn", label: "Lernen", ja: "学ぶ", icon: LearnIcon },
  { href: "/kana", label: "Kana", ja: "かな", icon: KanaIcon },
  { href: "/situations", label: "Situationen", ja: "場面", icon: SituationIcon },
  { href: "/conversations", label: "Gespräche", ja: "会話", icon: ConversationIcon },
  { href: "/vocabulary", label: "Vokabeln", ja: "語彙", icon: VocabularyIcon },
  { href: "/kanji", label: "Kanji", ja: "漢字", icon: KanjiIcon },
  { href: "/grammar", label: "Grammatik", ja: "文法", icon: GrammarIcon },
  { href: "/review", label: "Wiederholen", ja: "復習", icon: ReviewIcon },
  { href: "/search", label: "Suche", ja: "検索", icon: SearchIcon },
  { href: "/progress", label: "Fortschritt", ja: "進歩", icon: ProgressIcon },
];

export const SECONDARY_NAV: NavItem[] = [
  { href: "/favorites", label: "Favoriten", ja: "お気に入り", icon: StarIcon },
  { href: "/settings", label: "Einstellungen", ja: "設定", icon: SettingsIcon },
  { href: "/profile", label: "Profil", ja: "プロフィール", icon: ProfileIcon },
];

/** Bottom-Navigation (mobil): die vier wichtigsten Bereiche + „Mehr“. */
export const MOBILE_NAV_HREFS = ["/", "/learn", "/review", "/search"] as const;

export const MOBILE_NAV: NavItem[] = MOBILE_NAV_HREFS.map((href) =>
  PRIMARY_NAV.find((item) => item.href === href)!,
);

/** Alles, was mobil hinter „Mehr“ liegt. */
export const MOBILE_MORE_NAV: NavItem[] = [
  ...PRIMARY_NAV.filter((item) => !(MOBILE_NAV_HREFS as readonly string[]).includes(item.href)),
  ...SECONDARY_NAV,
];

/** Aktiver Zustand: exakter Treffer für „/“, Präfix-Treffer für alle anderen Bereiche. */
export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
