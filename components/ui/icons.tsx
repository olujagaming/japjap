import type { SVGProps } from "react";

/**
 * Schlanke, eigene Linien-Icons (1.5px Strich) statt einer Icon-Library.
 * Dekorativ per Default (aria-hidden); Beschriftung übernimmt das umgebende Element.
 */
type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Icon({ size = 20, children, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export type IconComponent = (props: IconProps) => React.JSX.Element;

export const HomeIcon: IconComponent = (p) => (
  <Icon {...p}>
    <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z" />
  </Icon>
);
export const LearnIcon: IconComponent = (p) => (
  <Icon {...p}>
    <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5z" />
    <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5z" />
  </Icon>
);
export const KanaIcon: IconComponent = (p) => (
  <Icon {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="2" />
    <path d="M8 9h8M12 7v10M9 13.5c1.5 2 4.5 2 6 0" />
  </Icon>
);
export const SituationIcon: IconComponent = (p) => (
  <Icon {...p}>
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" />
    <circle cx="12" cy="10" r="2.25" />
  </Icon>
);
export const ConversationIcon: IconComponent = (p) => (
  <Icon {...p}>
    <path d="M4 5h11a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H9l-4 3v-3H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
    <path d="M16 9h4a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-1v3l-4-3h-3" />
  </Icon>
);
export const VocabularyIcon: IconComponent = (p) => (
  <Icon {...p}>
    <path d="M6 4h11a1 1 0 0 1 1 1v15H7a2 2 0 0 1-2-2V5a1 1 0 0 1 1-1z" />
    <path d="M5 18a2 2 0 0 1 2-2h11M9 8h5" />
  </Icon>
);
export const KanjiIcon: IconComponent = (p) => (
  <Icon {...p}>
    <path d="M5 7h14M12 4v16M7 12h10M8 16.5l-2 3.5M16 16.5l2 3.5" />
  </Icon>
);
export const GrammarIcon: IconComponent = (p) => (
  <Icon {...p}>
    <path d="M4 7h7M4 12h11M4 17h5" />
    <path d="m15 15 2.5 2.5L21 13" />
  </Icon>
);
export const ReviewIcon: IconComponent = (p) => (
  <Icon {...p}>
    <path d="M20 12a8 8 0 1 1-2.34-5.66" />
    <path d="M20 4v4.5h-4.5" />
  </Icon>
);
export const SearchIcon: IconComponent = (p) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.2-4.2" />
  </Icon>
);
export const ProgressIcon: IconComponent = (p) => (
  <Icon {...p}>
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </Icon>
);
export const StarIcon: IconComponent = (p) => (
  <Icon {...p}>
    <path d="m12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 16.4l-4.8 2.5.9-5.4-3.9-3.8 5.4-.8z" />
  </Icon>
);
export const SettingsIcon: IconComponent = (p) => (
  <Icon {...p}>
    <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
    <circle cx="16" cy="7" r="2" />
    <circle cx="8" cy="17" r="2" />
  </Icon>
);
export const ProfileIcon: IconComponent = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="8.5" r="3.5" />
    <path d="M5 20c.8-3.5 3.6-5.5 7-5.5s6.2 2 7 5.5" />
  </Icon>
);
export const MoreIcon: IconComponent = (p) => (
  <Icon {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Icon>
);
export const CloseIcon: IconComponent = (p) => (
  <Icon {...p}>
    <path d="m6 6 12 12M18 6 6 18" />
  </Icon>
);
export const PlayIcon: IconComponent = (p) => (
  <Icon {...p}>
    <path d="M8 5.5v13a.5.5 0 0 0 .76.43l10.4-6.5a.5.5 0 0 0 0-.86L8.76 5.07A.5.5 0 0 0 8 5.5z" />
  </Icon>
);
export const SpeakerIcon: IconComponent = (p) => (
  <Icon {...p}>
    <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" />
    <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
  </Icon>
);
export const StopIcon: IconComponent = (p) => (
  <Icon {...p}>
    <rect x="6.5" y="6.5" width="11" height="11" rx="1.5" />
  </Icon>
);
export const ArrowRightIcon: IconComponent = (p) => (
  <Icon {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icon>
);
export const ArrowLeftIcon: IconComponent = (p) => (
  <Icon {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Icon>
);
export const CheckIcon: IconComponent = (p) => (
  <Icon {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Icon>
);
export const SunIcon: IconComponent = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
  </Icon>
);
export const MoonIcon: IconComponent = (p) => (
  <Icon {...p}>
    <path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z" />
  </Icon>
);
export const AlertIcon: IconComponent = (p) => (
  <Icon {...p}>
    <path d="M12 4 2.8 19.5h18.4z" />
    <path d="M12 10v4.5M12 17.2v.1" />
  </Icon>
);
export const InfoIcon: IconComponent = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 11v5M12 8v.1" />
  </Icon>
);
export const TranslateIcon: IconComponent = (p) => (
  <Icon {...p}>
    <path d="M4 6h8M8 4v2M6 6c0 3.5 2.5 6.5 5.5 7.5M10 6c-.5 3-2.5 6-5.5 7.5" />
    <path d="m13 20 3.5-8 3.5 8M14.2 17.5h4.6" />
  </Icon>
);
export const ChatIcon: IconComponent = (p) => (
  <Icon {...p}>
    <path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.1A8 8 0 1 1 20 12z" />
  </Icon>
);
