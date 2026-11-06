"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent, RefObject, SyntheticEvent } from "react";
import { HistoryStack } from "../../editor/history";
import type { EditorSelection, EditorState } from "../../editor/types";

export interface UseMarkdownEditorStateOptions {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

export interface MarkdownEditorController {
  value: string;
  selection: EditorSelection;
  textareaRef: RefObject<HTMLTextAreaElement>;
  runCommand: (fn: (state: EditorState) => EditorState) => void;
  handleTextareaChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  handleSelect: (e: SyntheticEvent<HTMLTextAreaElement>) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  setValue: (value: string) => void;
}

/** Applies `sel` to the live DOM textarea on the next frame (after React commits the new value). */
function syncDomSelection(ref: RefObject<HTMLTextAreaElement>, sel: EditorSelection) {
  requestAnimationFrame(() => {
    const ta = ref.current;
    if (ta && document.activeElement === ta) {
      ta.setSelectionRange(sel.start, sel.end);
    }
  });
}

export function useMarkdownEditorState(opts: UseMarkdownEditorStateOptions): MarkdownEditorController {
  const isControlled = opts.value !== undefined;
  const [internalValue, setInternalValue] = useState(opts.value ?? opts.defaultValue ?? "");
  const [selection, setSelection] = useState<EditorSelection>({ start: 0, end: 0 });
  const [, forceRender] = useState(0);

  const value = isControlled ? (opts.value as string) : internalValue;
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const historyRef = useRef<HistoryStack>(new HistoryStack({ value, selection: { start: 0, end: 0 } }));
  const onChangeRef = useRef(opts.onChange);
  onChangeRef.current = opts.onChange;
  const lastSyncedControlledValue = useRef(value);

  useEffect(() => {
    if (isControlled && opts.value !== lastSyncedControlledValue.current) {
      lastSyncedControlledValue.current = opts.value as string;
      setInternalValue(opts.value as string);
      historyRef.current.reset({ value: opts.value as string, selection });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.value]);

  const commit = useCallback(
    (next: EditorState, options: { pushHistory?: boolean; coalesce?: boolean; focus?: boolean } = {}) => {
      lastSyncedControlledValue.current = next.value;
      setInternalValue(next.value);
      setSelection(next.selection);
      if (options.pushHistory !== false) {
        historyRef.current.push(next, options.coalesce ?? false);
      }
      onChangeRef.current?.(next.value);
      syncDomSelection(textareaRef, next.selection);
      forceRender((n) => n + 1);
    },
    [],
  );

  const runCommand = useCallback(
    (fn: (state: EditorState) => EditorState) => {
      const ta = textareaRef.current;
      const currentSelection = ta ? { start: ta.selectionStart, end: ta.selectionEnd } : selection;
      const current: EditorState = { value, selection: currentSelection };
      const next = fn(current);
      commit(next, { pushHistory: true, coalesce: false });
      ta?.focus();
    },
    [value, selection, commit],
  );

  const handleTextareaChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    const next: EditorState = {
      value: e.target.value,
      selection: { start: e.target.selectionStart, end: e.target.selectionEnd },
    };
    lastSyncedControlledValue.current = next.value;
    setInternalValue(next.value);
    setSelection(next.selection);
    historyRef.current.push(next, true);
    onChangeRef.current?.(next.value);
  }, []);

  const handleSelect = useCallback((e: SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    setSelection({ start: target.selectionStart, end: target.selectionEnd });
  }, []);

  const undo = useCallback(() => {
    const prev = historyRef.current.undo();
    if (prev) commit(prev, { pushHistory: false });
  }, [commit]);

  const redo = useCallback(() => {
    const next = historyRef.current.redo();
    if (next) commit(next, { pushHistory: false });
  }, [commit]);

  const setValue = useCallback(
    (v: string) => {
      const next: EditorState = { value: v, selection: { start: v.length, end: v.length } };
      commit(next, { pushHistory: true, coalesce: false });
    },
    [commit],
  );

  return {
    value,
    selection,
    textareaRef,
    runCommand,
    handleTextareaChange,
    handleSelect,
    undo,
    redo,
    canUndo: historyRef.current.canUndo(),
    canRedo: historyRef.current.canRedo(),
    setValue,
  };
}
