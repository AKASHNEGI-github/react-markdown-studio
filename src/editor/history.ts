import type { EditorState } from "./types";

const DEFAULT_COALESCE_WINDOW_MS = 500;
const MAX_HISTORY = 500;

/**
 * A simple linear undo/redo stack of {value, selection} snapshots.
 * Toolbar/command edits always start a new step; plain typing coalesces
 * consecutive keystrokes (within `coalesceWindowMs`) into one step so a
 * single Ctrl+Z undoes a whole burst of typing, not one character.
 */
export class HistoryStack {
  private stack: EditorState[];
  private index: number;
  private lastPushTime = 0;
  private coalesceWindowMs: number;

  constructor(initial: EditorState, coalesceWindowMs = DEFAULT_COALESCE_WINDOW_MS) {
    this.stack = [initial];
    this.index = 0;
    this.coalesceWindowMs = coalesceWindowMs;
  }

  get current(): EditorState {
    return this.stack[this.index];
  }

  canUndo(): boolean {
    return this.index > 0;
  }

  canRedo(): boolean {
    return this.index < this.stack.length - 1;
  }

  push(state: EditorState, coalesce = false): void {
    const now = Date.now();
    const canCoalesce =
      coalesce && this.index === this.stack.length - 1 && now - this.lastPushTime < this.coalesceWindowMs;
    if (canCoalesce) {
      this.stack[this.index] = state;
    } else {
      this.stack = this.stack.slice(0, this.index + 1);
      this.stack.push(state);
      this.index++;
      if (this.stack.length > MAX_HISTORY) {
        this.stack = this.stack.slice(this.stack.length - MAX_HISTORY);
        this.index = this.stack.length - 1;
      }
    }
    this.lastPushTime = now;
  }

  undo(): EditorState | null {
    if (!this.canUndo()) return null;
    this.index--;
    return this.current;
  }

  redo(): EditorState | null {
    if (!this.canRedo()) return null;
    this.index++;
    return this.current;
  }

  /** Resets the whole stack to a single new initial state (e.g. after a controlled `value` change from outside). */
  reset(state: EditorState): void {
    this.stack = [state];
    this.index = 0;
  }
}
