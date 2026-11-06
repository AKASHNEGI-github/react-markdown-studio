"use client";
import {
  forwardRef,
  useCallback,
  useDeferredValue,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import type { ClipboardEvent, CSSProperties, DragEvent, KeyboardEvent, UIEvent } from "react";
import { useMarkdownEditorState } from "../hooks/useMarkdownEditorState";
import { useControllableState } from "../hooks/useControllableState";
import { Toolbar, type EditorMode, type EditorTheme, type ToolbarLabels } from "./Toolbar";
import { Preview } from "./Preview";
import { StatusBar } from "./StatusBar";
import { downloadTextFile } from "../utils/download";
import { getCaretPosition, getTextStats } from "../../editor/stats";
import { TableTools } from "./TableTools";
import { matchShortcut } from "../../editor/shortcuts";
import {
  toggleBold,
  toggleItalic,
  toggleUnderline,
  toggleStrikethrough,
  toggleInlineCode,
  toggleUnorderedList,
  toggleOrderedList,
  toggleChecklist,
  toggleBlockquote,
  setHeadingLevel,
  insertLink,
  continueList,
  indentLines,
  outdentLines,
  insertText,
  linkSelection,
  replaceText,
} from "../../editor/commands";
import { toggleCheckboxInMarkdown } from "../../editor/checklist";
import { markdownToHtml, markdownToHtmlDocument } from "../../core/index";
import { CopyIconSmall, CheckIconSmall } from "./Icons";
import type { Highlighter } from "../../highlighter/index";
import type { EditorState } from "../../editor/types";

export type { EditorMode, EditorTheme } from "./Toolbar";

export interface MarkdownEditorProps {
  /** Controlled markdown value. Omit (with `defaultValue`) for uncontrolled use. */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;

  mode?: EditorMode;
  defaultMode?: EditorMode;
  onModeChange?: (mode: EditorMode) => void;

  fullscreen?: boolean;
  defaultFullscreen?: boolean;
  onFullscreenChange?: (fullscreen: boolean) => void;

  theme?: EditorTheme;
  defaultTheme?: EditorTheme;
  onThemeChange?: (theme: EditorTheme) => void;

  /**
   * Which toolbar buttons to show, by id (alert, blockquote, bold, checklist, codeBlock, codeGroup, details,
   * heading, horizontalRule, image, inlineCode, italic, link, orderedList, redo, strikethrough, subscript,
   * superscript, table, underline, undo, unorderedList). The layout order is fixed. `false` hides the toolbar.
   */
  toolbar?: string[] | false;
  /** Custom syntax highlighter (e.g. wrapping Shiki). Defaults to the built-in tokenizer. */
  highlighter?: Highlighter;
  placeholder?: string;
  readOnly?: boolean;
  disabled?: boolean;
  height?: string | number;
  minHeight?: string | number;
  className?: string;
  labels?: ToolbarLabels;
  /** Let the preview's checkboxes be clicked to toggle the underlying markdown. On by default (ignored when `readOnly`). */
  interactiveChecklists?: boolean;
  openExternalLinksInNewTab?: boolean;
  headingIds?: boolean;
  showTableTools?: boolean;
  /** Tab/Shift+Tab indents list lines; otherwise Tab moves focus normally. Default true. */
  tabIndentation?: boolean;
  /** Pressing Enter in a list continues it with the same marker. Default true. */
  autoContinueList?: boolean;
  /** Show the light/dark theme toggle button in the toolbar. Default true. */
  showThemeToggle?: boolean;
  /** Show the "reset to original content" button in the toolbar. Default true. */
  showResetButton?: boolean;
  /** Show the "view rendered HTML source" mode button in the toolbar. Default true. */
  showHtmlView?: boolean;
  /** Show the "download/print preview as PDF" button in the toolbar. Default true. */
  showDownloadButton?: boolean;
  /** Show the "?" markdown syntax guide button in the toolbar. Default true. */
  showHelpButton?: boolean;
  /** Show line numbers in the gutter next to the markdown source. Default true. Disables textarea soft-wrap so numbers stay aligned with their line, matching GitHub's file editor. */
  showLineNumbers?: boolean;
  /** Show a "copy markdown source" button over the writing area. Default true. */
  showEditorCopyButton?: boolean;
  /** Show the "Ln, Col · words · characters · reading time" bar under the editor. Default true. */
  showStatusBar?: boolean;
  /** Keep editor and preview scrolled to the same relative position in split mode. Default true. */
  syncScroll?: boolean;
  /** Show the edit / split / preview / HTML mode switcher. Default true. */
  showModeControls?: boolean;
  /** Show the fullscreen toggle. Default true. */
  showFullscreenControl?: boolean;
  /** Pasting a URL over selected text turns the selection into a link. Default true. */
  smartPaste?: boolean;
  /**
   * Prefix for every heading `id` and `#anchor`, for example `"user-content-"`.
   * Stops author-controlled ids from shadowing `window.*` globals (DOM
   * clobbering). Default `""`.
   */
  headingIdPrefix?: string;
  /** Shifts preview heading tags down this many levels so the editor fits your page outline (0 to 5). Default 0. */
  headingOffset?: number;
  /**
   * Enables pasting and dropping images into the editor. Receives the file and
   * returns its hosted URL (or `{ url, alt }`); an "Uploading…" placeholder is
   * shown meanwhile and replaced with `![alt](url)`. Without this prop, image
   * files are ignored and nothing is ever embedded or sent anywhere.
   */
  onImageUpload?: (file: File) => Promise<ImageUploadResult> | ImageUploadResult;
  /** Called when `onImageUpload` throws or rejects. The placeholder is removed automatically. */
  onImageUploadError?: (error: unknown, file: File) => void;
  /** Called when the reset button is used, after content has been reset. */
  onReset?: () => void;
}

/** What `onImageUpload` may resolve to: a URL, or a URL with alt text. */
export type ImageUploadResult = string | { url: string; alt?: string };

export interface MarkdownEditorHandle {
  getMarkdown: () => string;
  getHTML: () => string;
  focus: () => void;
  undo: () => void;
  redo: () => void;
  setMode: (mode: EditorMode) => void;
  reset: () => void;
  /** Replaces the whole document (undoable). */
  setMarkdown: (markdown: string) => void;
  /** Inserts text at the caret, replacing any selection. */
  insertText: (text: string) => void;
  /** Saves the Markdown source as a `.md` file. */
  downloadMarkdown: (filename?: string) => void;
  /** Saves a complete, standalone `.html` page (embedded stylesheet, working tabs and copy buttons). */
  downloadHtml: (filename?: string) => void;
}

const SHORTCUT_COMMANDS: Record<string, (s: EditorState) => EditorState> = {
  bold: toggleBold,
  italic: toggleItalic,
  underline: toggleUnderline,
  strikethrough: toggleStrikethrough,
  inlineCode: toggleInlineCode,
  link: insertLink,
  heading1: (s) => setHeadingLevel(s, 1),
  heading2: (s) => setHeadingLevel(s, 2),
  heading3: (s) => setHeadingLevel(s, 3),
  orderedList: toggleOrderedList,
  unorderedList: toggleUnorderedList,
  checklist: toggleChecklist,
  blockquote: toggleBlockquote,
};

export const MarkdownEditor = forwardRef<MarkdownEditorHandle, MarkdownEditorProps>(
  function MarkdownEditor(props, ref) {
    const {
      value,
      defaultValue = "",
      onChange,
      mode: modeProp,
      defaultMode = "split",
      onModeChange,
      fullscreen: fullscreenProp,
      defaultFullscreen = false,
      onFullscreenChange,
      theme: themeProp,
      defaultTheme = "auto",
      onThemeChange,
      toolbar,
      highlighter,
      placeholder,
      readOnly = false,
      disabled = false,
      height,
      minHeight = "320px",
      className,
      labels,
      interactiveChecklists = true,
      openExternalLinksInNewTab = true,
      headingIds = true,
      showTableTools = true,
      tabIndentation = true,
      autoContinueList = true,
      showThemeToggle = true,
      showResetButton = true,
      showHtmlView = true,
      showDownloadButton = true,
      showHelpButton = true,
      showLineNumbers = true,
      showEditorCopyButton = true,
      showStatusBar = true,
      syncScroll = true,
      showModeControls = true,
      showFullscreenControl = true,
      smartPaste = true,
      headingIdPrefix,
      headingOffset,
      onImageUpload,
      onImageUploadError,
      onReset,
    } = props;

    const editor = useMarkdownEditorState({ value, defaultValue, onChange });
    const [mode, setMode] = useControllableState<EditorMode>(modeProp, defaultMode, onModeChange);
    const [fullscreen, setFullscreen] = useControllableState<boolean>(
      fullscreenProp,
      defaultFullscreen,
      onFullscreenChange,
    );
    const [theme, setTheme] = useControllableState<EditorTheme>(themeProp, defaultTheme, onThemeChange);
    const [mobilePane, setMobilePane] = useState<"edit" | "preview">("edit");

    // Captured once, on mount, so the "reset" button has an original value to return to.
    const initialValueRef = useRef<string>(value ?? defaultValue);

    const getHtml = useCallback(
      () =>
        markdownToHtml(
          editor.value,
          { headingIds },
          { highlighter, openExternalLinksInNewTab, headingIdPrefix, headingOffset },
        ),
      [editor.value, headingIds, highlighter, openExternalLinksInNewTab, headingIdPrefix, headingOffset],
    );

    // Always points at the latest render's editor API, so async work (image
    // uploads) never acts on a stale closure and clobbers what was typed since.
    const editorRef = useRef(editor);
    editorRef.current = editor;

    // Typing stays responsive on big documents: the preview and statistics may
    // lag a frame behind the textarea instead of blocking it.
    const deferredValue = useDeferredValue(editor.value);
    const stats = useMemo(() => getTextStats(deferredValue), [deferredValue]);
    const caret = useMemo(
      () => getCaretPosition(editor.value, editor.selection.end),
      [editor.value, editor.selection.end],
    );

    const downloadMarkdown = useCallback((filename = "document.md") => {
      downloadTextFile(filename, editorRef.current.value, "text/markdown");
    }, []);
    const downloadHtml = useCallback(
      (filename = "document.html") => {
        downloadTextFile(
          filename,
          markdownToHtmlDocument(editorRef.current.value, {
            headingIds,
            highlighter,
            openExternalLinksInNewTab,
            headingIdPrefix,
          }),
          "text/html",
        );
      },
      [headingIds, highlighter, openExternalLinksInNewTab, headingIdPrefix],
    );

    const uploadImages = useCallback(
      (files: File[]) => {
        if (!onImageUpload) return;
        for (const file of files) {
          const label = file.name.replace(/[*_`[\]]/g, "");
          const token = `*Uploading ${label}…*`;
          editorRef.current.runCommand((s) => insertText(s, files.length > 1 ? `${token}\n` : token));
          void (async () => {
            try {
              const result = await onImageUpload(file);
              const url = typeof result === "string" ? result : result.url;
              const alt = (
                (typeof result === "string" ? undefined : result.alt) ?? file.name.replace(/\.[^.]+$/, "")
              ).replace(/[[\]]/g, "");
              const safeUrl = url.replace(/ /g, "%20").replace(/\(/g, "%28").replace(/\)/g, "%29");
              editorRef.current.runCommand((s) => replaceText(s, token, `![${alt}](${safeUrl})`));
            } catch (error) {
              editorRef.current.runCommand((s) => replaceText(s, token, ""));
              onImageUploadError?.(error, file);
            }
          })();
        }
      },
      [onImageUpload, onImageUploadError],
    );

    const handlePaste = useCallback(
      (e: ClipboardEvent<HTMLTextAreaElement>) => {
        if (readOnly || disabled) return;
        const data = e.clipboardData;
        if (onImageUpload) {
          const images = Array.from(data.files ?? []).filter((f) => f.type.startsWith("image/"));
          if (images.length > 0) {
            e.preventDefault();
            uploadImages(images);
            return;
          }
        }
        if (smartPaste) {
          const text = data.getData("text/plain").trim();
          const { selectionStart, selectionEnd, value: current } = e.currentTarget;
          if (
            selectionStart !== selectionEnd &&
            /^https?:\/\/\S+$/i.test(text) &&
            !current.slice(selectionStart, selectionEnd).includes("\n")
          ) {
            e.preventDefault();
            editorRef.current.runCommand((s) => linkSelection(s, text));
          }
        }
      },
      [readOnly, disabled, onImageUpload, smartPaste, uploadImages],
    );

    const hasImageFiles = (e: DragEvent<HTMLTextAreaElement>) =>
      Array.from(e.dataTransfer?.items ?? []).some((item) => item.kind === "file" && item.type.startsWith("image/"));
    const handleDragOver = useCallback(
      (e: DragEvent<HTMLTextAreaElement>) => {
        if (onImageUpload && !readOnly && !disabled && hasImageFiles(e)) e.preventDefault();
      },
      [onImageUpload, readOnly, disabled],
    );
    const handleDrop = useCallback(
      (e: DragEvent<HTMLTextAreaElement>) => {
        if (!onImageUpload || readOnly || disabled) return;
        const images = Array.from(e.dataTransfer?.files ?? []).filter((f) => f.type.startsWith("image/"));
        if (images.length === 0) return;
        e.preventDefault();
        uploadImages(images);
      },
      [onImageUpload, readOnly, disabled, uploadImages],
    );

    const handleReset = useCallback(() => {
      editor.setValue(initialValueRef.current);
      onReset?.();
    }, [editor, onReset]);

    // Printing (used for "download as PDF"): there is no bundled PDF library
    // (this package ships with zero runtime dependencies), so this uses the
    // browser's own print dialog — which every browser can also "Save as PDF"
    // from — against a dedicated, always-up-to-date render of the preview.
    //
    // That render is portaled straight to document.body (see printContainer
    // below) instead of being mounted inside .rmds-root like everything else
    // in this component. This matters because .rmds-root can sit anywhere in
    // a host page's own layout — below a page heading, above a footer, inside
    // a sidebar, and so on. Print CSS can only hide elements it knows about,
    // so hiding just .rmds-root's own siblings (as an earlier version of this
    // did) leaves every *other* ancestor's content fully visible on the
    // printed page. Rendering the print-only content outside that layout
    // entirely, then hiding everything else in the page during print (see
    // the `body > *:not(.rmds-print-root)` rule in styles.css), is what
    // guarantees the printed output is only ever this editor's own content.
    //
    // The container is only created for the brief duration of a print, not
    // kept alive on every keystroke, so it doesn't cost anything otherwise.
    const [printing, setPrinting] = useState(false);
    const [printContainer, setPrintContainer] = useState<HTMLDivElement | null>(null);
    const printTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const handleDownloadPdf = useCallback(() => setPrinting(true), []);

    // Create/remove the body-level print container exactly while printing.
    useEffect(() => {
      if (!printing || typeof document === "undefined") return;
      const node = document.createElement("div");
      node.className = "rmds-print-root";
      document.body.appendChild(node);
      // The stylesheet hides the rest of the page only while this class is present, so an
      // ordinary Ctrl+P anywhere else in the host app still prints that app normally.
      document.body.classList.add("rmds-printing");
      setPrintContainer(node);
      return () => {
        node.remove();
        document.body.classList.remove("rmds-printing");
        setPrintContainer(null);
      };
    }, [printing]);

    // Once the container exists and the portaled preview below has had a
    // chance to commit and paint into it, trigger the actual print. Gating
    // on `printContainer` (not just `printing`) avoids ever calling print()
    // against an empty container.
    useEffect(() => {
      if (!printing || !printContainer) return;
      // A short delay so the print-only preview is guaranteed to have
      // painted before print() fires.
      printTimerRef.current = setTimeout(() => window.print(), 50);
      const handleAfterPrint = () => setPrinting(false);
      window.addEventListener("afterprint", handleAfterPrint);
      return () => {
        clearTimeout(printTimerRef.current);
        window.removeEventListener("afterprint", handleAfterPrint);
      };
    }, [printing, printContainer]);

    const gutterRef = useRef<HTMLDivElement>(null);
    const handleTextareaScroll = useCallback((e: UIEvent<HTMLTextAreaElement>) => {
      if (gutterRef.current) gutterRef.current.scrollTop = e.currentTarget.scrollTop;
    }, []);
    const lineCount = useMemo(() => editor.value.split("\n").length, [editor.value]);
    const currentLine = useMemo(
      () => editor.value.slice(0, editor.selection.start).split("\n").length,
      [editor.value, editor.selection.start],
    );

    const rootRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
      if (!syncScroll || mode !== "split") return;
      const textarea = editor.textareaRef.current;
      const pane = rootRef.current?.querySelector<HTMLElement>(".rmds-preview-pane");
      if (!textarea || !pane) return;

      // `driver` names whichever side the user is scrolling, so the scroll event
      // our own assignment triggers on the other side is recognised and ignored.
      let driver: "editor" | "preview" | null = null;
      let frame = 0;
      const link = (from: HTMLElement, to: HTMLElement, who: "editor" | "preview") => () => {
        if (driver !== null && driver !== who) return;
        const range = from.scrollHeight - from.clientHeight;
        if (range <= 0) return;
        driver = who;
        to.scrollTop = (from.scrollTop / range) * (to.scrollHeight - to.clientHeight);
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          driver = null;
        });
      };
      const fromEditor = link(textarea, pane, "editor");
      const fromPreview = link(pane, textarea, "preview");
      textarea.addEventListener("scroll", fromEditor, { passive: true });
      pane.addEventListener("scroll", fromPreview, { passive: true });
      return () => {
        cancelAnimationFrame(frame);
        textarea.removeEventListener("scroll", fromEditor);
        pane.removeEventListener("scroll", fromPreview);
      };
    }, [syncScroll, mode, editor.textareaRef]);

    useImperativeHandle(
      ref,
      () => ({
        getMarkdown: () => editor.value,
        getHTML: () => getHtml(),
        focus: () => editor.textareaRef.current?.focus(),
        undo: editor.undo,
        redo: editor.redo,
        setMode: (m: EditorMode) => setMode(m),
        reset: handleReset,
        setMarkdown: (markdown: string) => editor.setValue(markdown),
        insertText: (text: string) => editor.runCommand((s) => insertText(s, text)),
        downloadMarkdown,
        downloadHtml,
      }),
      [editor, getHtml, setMode, handleReset, downloadMarkdown, downloadHtml],
    );

    const handleToggleCheckbox = useCallback(
      (index: number, checked: boolean) => {
        editor.setValue(toggleCheckboxInMarkdown(editor.value, index, checked));
      },
      [editor],
    );

    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLTextAreaElement>) => {
        const cmdId = matchShortcut(e);
        if (cmdId === "undo") {
          e.preventDefault();
          editor.undo();
          return;
        }
        if (cmdId === "redo") {
          e.preventDefault();
          editor.redo();
          return;
        }
        if (cmdId && SHORTCUT_COMMANDS[cmdId]) {
          e.preventDefault();
          editor.runCommand(SHORTCUT_COMMANDS[cmdId]);
          return;
        }

        if (e.key === "Tab" && tabIndentation) {
          const ta = e.currentTarget;
          const hasSelection = ta.selectionStart !== ta.selectionEnd;
          const lineStart = ta.value.lastIndexOf("\n", ta.selectionStart - 1) + 1;
          const isListLine = /^\s*([-*+]|\d+[.)])\s+/.test(ta.value.slice(lineStart, ta.selectionEnd));
          if (hasSelection || isListLine) {
            e.preventDefault();
            editor.runCommand(e.shiftKey ? outdentLines : indentLines);
          }
          // Otherwise let Tab move focus normally, so keyboard users are never trapped.
          return;
        }

        if (e.key === "Enter" && !e.shiftKey && autoContinueList) {
          const ta = e.currentTarget;
          const state: EditorState = { value: ta.value, selection: { start: ta.selectionStart, end: ta.selectionEnd } };
          const next = continueList(state);
          if (next) {
            e.preventDefault();
            editor.runCommand(() => next);
          }
        }
      },
      [editor, tabIndentation, autoContinueList],
    );

    const toggleFullscreenHandler = useCallback(() => setFullscreen(!fullscreen), [fullscreen, setFullscreen]);
    const toggleThemeHandler = useCallback(() => setTheme(theme === "dark" ? "light" : "dark"), [theme, setTheme]);

    // Fullscreen is a fixed overlay covering the viewport; without this, the
    // page behind it can still scroll, showing a second scrollbar alongside
    // the editor's own. Lock body scroll for as long as we're fullscreen.
    useEffect(() => {
      if (!fullscreen || typeof document === "undefined") return;
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }, [fullscreen]);

    const rootStyle: CSSProperties = {
      height: fullscreen ? undefined : height,
      minHeight: fullscreen ? undefined : minHeight,
    };

    const showEdit = mode === "edit" || mode === "split";
    const showPreview = mode === "preview" || mode === "split";
    const showHtmlPane = mode === "html";

    const htmlOutput = useMemo(() => (showHtmlPane ? getHtml() : ""), [showHtmlPane, getHtml]);

    return (
      <div
        ref={rootRef}
        className={`rmds-root${fullscreen ? " rmds-fullscreen" : ""}${className ? ` ${className}` : ""}`}
        data-theme={theme}
        style={rootStyle}
      >
        {toolbar !== false && (
          <Toolbar
            runCommand={editor.runCommand}
            undo={editor.undo}
            redo={editor.redo}
            canUndo={editor.canUndo}
            canRedo={editor.canRedo}
            disabled={disabled || readOnly}
            buttons={toolbar === undefined ? undefined : toolbar}
            labels={labels}
            mode={mode}
            onModeChange={setMode}
            fullscreen={fullscreen}
            onToggleFullscreen={toggleFullscreenHandler}
            theme={theme}
            onToggleTheme={toggleThemeHandler}
            onReset={handleReset}
            onDownloadPdf={handleDownloadPdf}
            onDownloadMarkdown={downloadMarkdown}
            onDownloadHtml={downloadHtml}
            showModeControls={showModeControls}
            showFullscreenControl={showFullscreenControl}
            showThemeToggle={showThemeToggle}
            showResetButton={showResetButton}
            showHtmlView={showHtmlView}
            showDownloadButton={showDownloadButton}
            showHelpButton={showHelpButton}
          />
        )}
        <div className={`rmds-body rmds-mode-${mode}`} data-mobile-pane={mode === "split" ? mobilePane : undefined}>
          {mode === "split" && (
            <div className="rmds-mobile-tabs" data-visible="true">
              <button
                type="button"
                className={`rmds-toolbar-btn rmds-text-btn${mobilePane === "edit" ? " rmds-active" : ""}`}
                onClick={() => setMobilePane("edit")}
                aria-pressed={mobilePane === "edit"}
              >
                Edit
              </button>
              <button
                type="button"
                className={`rmds-toolbar-btn rmds-text-btn${mobilePane === "preview" ? " rmds-active" : ""}`}
                onClick={() => setMobilePane("preview")}
                aria-pressed={mobilePane === "preview"}
              >
                Preview
              </button>
            </div>
          )}
          {showEdit && (
            <div className="rmds-edit-pane">
              {showTableTools && !readOnly && !disabled && (
                <TableTools value={editor.value} selection={editor.selection} runCommand={editor.runCommand} />
              )}
              <div className="rmds-textarea-wrap">
                {showLineNumbers && (
                  <div className="rmds-gutter" ref={gutterRef} aria-hidden="true">
                    {Array.from({ length: lineCount }, (_, i) => (
                      <div
                        key={i}
                        className={`rmds-gutter-line${i + 1 === currentLine ? " rmds-gutter-line-active" : ""}`}
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                )}
                <textarea
                  ref={editor.textareaRef}
                  className={`rmds-textarea${showLineNumbers ? " rmds-textarea-nowrap" : ""}`}
                  wrap={showLineNumbers ? "off" : undefined}
                  value={editor.value}
                  onChange={editor.handleTextareaChange}
                  onSelect={editor.handleSelect}
                  onKeyDown={handleKeyDown}
                  onPaste={handlePaste}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onScroll={showLineNumbers ? handleTextareaScroll : undefined}
                  placeholder={placeholder}
                  readOnly={readOnly}
                  disabled={disabled}
                  spellCheck
                  aria-label="Markdown source"
                />
                {showEditorCopyButton && !readOnly && <CopyMarkdownButton value={editor.value} />}
              </div>
            </div>
          )}
          {showPreview && (
            <Preview
              value={deferredValue}
              highlighter={highlighter}
              openExternalLinksInNewTab={openExternalLinksInNewTab}
              interactiveChecklists={interactiveChecklists && !readOnly}
              onToggleCheckbox={handleToggleCheckbox}
              headingIds={headingIds}
              headingIdPrefix={headingIdPrefix}
              headingOffset={headingOffset}
              className="rmds-preview-pane"
            />
          )}
          {showHtmlPane && (
            <div className="rmds-html-pane">
              <CopyHtmlButton html={htmlOutput} />
              <pre className="rmds-html-view">
                <code>{htmlOutput}</code>
              </pre>
            </div>
          )}
        </div>
        {showStatusBar && (
          <StatusBar stats={stats} caret={caret} selected={Math.abs(editor.selection.end - editor.selection.start)} />
        )}
        {printContainer &&
          createPortal(
            // rmds-theme-scope re-establishes the --rmds-* variable scope outside
            // .rmds-root's own DOM subtree (see styles.css), the same pattern
            // Popover.tsx uses for its own document.body portals. The print
            // media query then forces these to plain light-on-white values
            // regardless of `theme`, so data-theme here is just for
            // consistency, not because the printed result depends on it.
            <div className="rmds-print-only rmds-theme-scope" data-theme={theme}>
              <Preview
                value={editor.value}
                highlighter={highlighter}
                openExternalLinksInNewTab={openExternalLinksInNewTab}
                headingIds={headingIds}
                headingIdPrefix={headingIdPrefix}
                headingOffset={headingOffset}
                className="rmds-preview-pane"
              />
            </div>,
            printContainer,
          )}
      </div>
    );
  },
);

function CopyMarkdownButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const label = copied ? "Copied" : "Copy markdown";
  return (
    <button
      type="button"
      className={`rmds-copy-btn rmds-editor-copy-btn${copied ? " rmds-copied" : ""}`}
      aria-label={label}
      title={label}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* clipboard unavailable; ignore */
        }
      }}
    >
      {copied ? <CheckIconSmall /> : <CopyIconSmall />}
    </button>
  );
}

function CopyHtmlButton({ html }: { html: string }) {
  const [copied, setCopied] = useState(false);
  const label = copied ? "Copied" : "Copy HTML";
  return (
    <button
      type="button"
      className={`rmds-copy-btn rmds-html-copy-btn${copied ? " rmds-copied" : ""}`}
      aria-label={label}
      title={label}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(html);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* clipboard unavailable; ignore */
        }
      }}
    >
      {copied ? <CheckIconSmall /> : <CopyIconSmall />}
    </button>
  );
}
