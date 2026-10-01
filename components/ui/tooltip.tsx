import { useId, type ReactElement, type ReactNode } from "react";
import { cloneElement } from "react";

/**
 * Reines CSS-Tooltip (Hover + Fokus), per aria-describedby mit dem Trigger verknüpft.
 * Für ergänzende Hinweise – nie für Pflichtinformationen.
 */
export function Tooltip({
  content,
  children,
}: {
  content: ReactNode;
  children: ReactElement<{ "aria-describedby"?: string }>;
}) {
  const id = useId();
  return (
    <span className="group/tooltip relative inline-flex">
      {cloneElement(children, { "aria-describedby": id })}
      <span
        id={id}
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 rounded-md bg-fg px-2 py-1 text-xs whitespace-nowrap text-bg opacity-0 transition-opacity delay-300 duration-150 group-focus-within/tooltip:opacity-100 group-hover/tooltip:opacity-100"
      >
        {content}
      </span>
    </span>
  );
}
