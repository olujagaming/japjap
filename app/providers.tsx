"use client";

import type { ReactNode } from "react";
import { AudioProvider } from "@/providers/audio-provider";

export function Providers({ children }: { children: ReactNode }) {
  return <AudioProvider>{children}</AudioProvider>;
}
