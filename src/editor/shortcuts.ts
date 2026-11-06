export interface ShortcutDef {
  combo: string;
  commandId: string;
}

/** "mod" = Ctrl on Windows/Linux, Cmd on macOS. */
export const SHORTCUTS: ShortcutDef[] = [
  { combo: "mod+b", commandId: "bold" },
  { combo: "mod+i", commandId: "italic" },
  { combo: "mod+u", commandId: "underline" },
  { combo: "mod+shift+x", commandId: "strikethrough" },
  { combo: "mod+e", commandId: "inlineCode" },
  { combo: "mod+k", commandId: "link" },
  { combo: "mod+z", commandId: "undo" },
  { combo: "mod+shift+z", commandId: "redo" },
  { combo: "mod+y", commandId: "redo" },
  { combo: "mod+1", commandId: "heading1" },
  { combo: "mod+2", commandId: "heading2" },
  { combo: "mod+3", commandId: "heading3" },
  { combo: "mod+shift+7", commandId: "orderedList" },
  { combo: "mod+shift+8", commandId: "unorderedList" },
  { combo: "mod+shift+9", commandId: "checklist" },
  { combo: "mod+shift+.", commandId: "blockquote" },
];

interface KeyLike {
  key: string;
  /** Physical key (KeyboardEvent.code). Used for digits and "." so Shift and non-US layouts work. */
  code?: string;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}

export function normalizeShortcut(e: KeyLike): string {
  const parts: string[] = [];
  if (e.ctrlKey || e.metaKey) parts.push("mod");
  if (e.shiftKey) parts.push("shift");
  if (e.altKey) parts.push("alt");
  parts.push(baseKey(e));
  return parts.join("+");
}

/**
 * With Shift held, `event.key` is the *shifted* symbol ("7" becomes "&", "."
 * becomes ">" on a US keyboard) and it differs per layout, so shortcuts such
 * as Ctrl+Shift+7 would never match. Digits and the period are therefore
 * identified by their physical key code; letters still use `event.key` so
 * shortcuts follow the letter printed on the keycap on any layout.
 */
function baseKey(e: KeyLike): string {
  if (e.code) {
    const digit = /^Digit(\d)$/.exec(e.code);
    if (digit) return digit[1];
    if (e.code === "Period") return ".";
  }
  return e.key.toLowerCase();
}

export function matchShortcut(e: KeyLike): string | null {
  const combo = normalizeShortcut(e);
  return SHORTCUTS.find((s) => s.combo === combo)?.commandId ?? null;
}
