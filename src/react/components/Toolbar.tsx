"use client";
import { useRef, useState } from "react";
import type { EditorState } from "../../editor/types";
import {
  toggleBold,
  toggleItalic,
  toggleUnderline,
  toggleStrikethrough,
  toggleSubscript,
  toggleSuperscript,
  toggleInlineCode,
  toggleUnorderedList,
  toggleOrderedList,
  toggleChecklist,
  toggleBlockquote,
  setHeadingLevel,
  insertHorizontalRule,
  insertCodeBlock,
  insertCodeGroup,
  insertLink,
  insertImage,
  insertTable,
  insertAlert,
  insertDetails,
  type AlertKind,
} from "../../editor/commands";
import {
  UndoIcon,
  RedoIcon,
  LinkIcon,
  ImageIcon,
  UnorderedListIcon,
  OrderedListIcon,
  ChecklistIcon,
  QuoteIcon,
  HrIcon,
  CodeIcon,
  CodeGroupIcon,
  SubscriptIcon,
  SuperscriptIcon,
  DetailsIcon,
  FullscreenEnterIcon,
  FullscreenExitIcon,
  EditModeIcon,
  SplitModeIcon,
  PreviewModeIcon,
  SunIcon,
  MoonIcon,
  ResetIcon,
  HtmlViewIcon,
  DownloadIcon,
} from "./Icons";
import { TableGridPicker } from "./TableGridPicker";
import { ExportMenu } from "./ExportMenu";
import { useRovingTabindex } from "../hooks/useRovingTabindex";
import { AlertMenu } from "./AlertMenu";
import { HeadingMenu } from "./HeadingMenu";
import { CodeLangMenu } from "./CodeLangMenu";
import { HelpMenu } from "./HelpMenu";

export type EditorMode = "edit" | "split" | "preview" | "html";
export type EditorTheme = "light" | "dark" | "auto";

export interface ToolbarLabels {
  bold?: string;
  italic?: string;
  underline?: string;
  strikethrough?: string;
  subscript?: string;
  superscript?: string;
  inlineCode?: string;
  link?: string;
  image?: string;
  unorderedList?: string;
  orderedList?: string;
  checklist?: string;
  blockquote?: string;
  alert?: string;
  details?: string;
  codeBlock?: string;
  codeGroup?: string;
  table?: string;
  horizontalRule?: string;
  undo?: string;
  redo?: string;
  heading?: string;
  editMode?: string;
  splitMode?: string;
  previewMode?: string;
  htmlMode?: string;
  fullscreen?: string;
  reset?: string;
  theme?: string;
  download?: string;
  help?: string;
}

export interface ToolbarProps {
  runCommand: (fn: (s: EditorState) => EditorState) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  disabled?: boolean;
  buttons?: string[];
  labels?: ToolbarLabels;
  mode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
  theme: EditorTheme;
  onToggleTheme: () => void;
  onReset?: () => void;
  onDownloadPdf?: () => void;
  /** When either of these is provided, the download button becomes an Export menu. */
  onDownloadMarkdown?: () => void;
  onDownloadHtml?: () => void;
  showModeControls?: boolean;
  showFullscreenControl?: boolean;
  showThemeToggle?: boolean;
  showResetButton?: boolean;
  showHtmlView?: boolean;
  showDownloadButton?: boolean;
  showHelpButton?: boolean;
}

const DEFAULT_BUTTONS = [
  "undo",
  "redo",
  "heading",
  "bold",
  "italic",
  "underline",
  "strikethrough",
  "subscript",
  "superscript",
  "inlineCode",
  "link",
  "image",
  "unorderedList",
  "orderedList",
  "checklist",
  "blockquote",
  "alert",
  "details",
  "codeBlock",
  "codeGroup",
  "table",
  "horizontalRule",
];

export function Toolbar(props: ToolbarProps) {
  const {
    runCommand,
    undo,
    redo,
    canUndo,
    canRedo,
    disabled,
    buttons = DEFAULT_BUTTONS,
    labels = {},
    mode,
    onModeChange,
    fullscreen,
    onToggleFullscreen,
    theme,
    onToggleTheme,
    onReset,
    onDownloadPdf,
    onDownloadMarkdown,
    onDownloadHtml,
    showModeControls = true,
    showFullscreenControl = true,
    showThemeToggle = true,
    showResetButton = true,
    showHtmlView = true,
    showDownloadButton = true,
    showHelpButton = true,
  } = props;
  const [codeLang, setCodeLang] = useState("js");
  const rootRef = useRef<HTMLDivElement>(null);
  useRovingTabindex(rootRef);

  const show = (id: string) => buttons.includes(id);
  const isDark = theme === "dark";

  return (
    <div ref={rootRef} className="rmds-toolbar" role="toolbar" aria-label="Formatting">
      {/* Row 1: formatting plugins */}
      <div className="rmds-toolbar-row">
        <div className="rmds-toolbar-group">
          {show("undo") && (
            <button
              type="button"
              className="rmds-toolbar-btn"
              title={labels.undo ?? "Undo (Ctrl+Z)"}
              aria-label="Undo"
              disabled={disabled || !canUndo}
              onClick={undo}
            >
              <UndoIcon />
            </button>
          )}
          {show("redo") && (
            <button
              type="button"
              className="rmds-toolbar-btn"
              title={labels.redo ?? "Redo (Ctrl+Shift+Z)"}
              aria-label="Redo"
              disabled={disabled || !canRedo}
              onClick={redo}
            >
              <RedoIcon />
            </button>
          )}
        </div>

        {show("heading") && (
          <div className="rmds-toolbar-group">
            <HeadingMenu
              disabled={disabled}
              title={labels.heading ?? "Heading level"}
              theme={theme}
              onPick={(level) => runCommand((s) => setHeadingLevel(s, level))}
            />
          </div>
        )}

        <div className="rmds-toolbar-group">
          {show("bold") && (
            <button
              type="button"
              className="rmds-toolbar-btn rmds-glyph-btn"
              title={labels.bold ?? "Bold (Ctrl+B)"}
              aria-label="Bold"
              disabled={disabled}
              onClick={() => runCommand(toggleBold)}
            >
              <strong>B</strong>
            </button>
          )}
          {show("italic") && (
            <button
              type="button"
              className="rmds-toolbar-btn rmds-glyph-btn"
              title={labels.italic ?? "Italic (Ctrl+I)"}
              aria-label="Italic"
              disabled={disabled}
              onClick={() => runCommand(toggleItalic)}
            >
              <em>I</em>
            </button>
          )}
          {show("underline") && (
            <button
              type="button"
              className="rmds-toolbar-btn rmds-glyph-btn"
              title={labels.underline ?? "Underline (Ctrl+U)"}
              aria-label="Underline"
              disabled={disabled}
              onClick={() => runCommand(toggleUnderline)}
            >
              <u>U</u>
            </button>
          )}
          {show("strikethrough") && (
            <button
              type="button"
              className="rmds-toolbar-btn rmds-glyph-btn"
              title={labels.strikethrough ?? "Strikethrough (Ctrl+Shift+X)"}
              aria-label="Strikethrough"
              disabled={disabled}
              onClick={() => runCommand(toggleStrikethrough)}
            >
              <s>S</s>
            </button>
          )}
        </div>

        <div className="rmds-toolbar-group">
          {show("subscript") && (
            <button
              type="button"
              className="rmds-toolbar-btn"
              title={labels.subscript ?? "Subscript"}
              aria-label="Subscript"
              disabled={disabled}
              onClick={() => runCommand(toggleSubscript)}
            >
              <SubscriptIcon />
            </button>
          )}
          {show("superscript") && (
            <button
              type="button"
              className="rmds-toolbar-btn"
              title={labels.superscript ?? "Superscript"}
              aria-label="Superscript"
              disabled={disabled}
              onClick={() => runCommand(toggleSuperscript)}
            >
              <SuperscriptIcon />
            </button>
          )}
          {show("inlineCode") && (
            <button
              type="button"
              className="rmds-toolbar-btn"
              title={labels.inlineCode ?? "Inline code (Ctrl+E)"}
              aria-label="Inline code"
              disabled={disabled}
              onClick={() => runCommand(toggleInlineCode)}
            >
              <CodeIcon />
            </button>
          )}
        </div>

        <div className="rmds-toolbar-group">
          {show("link") && (
            <button
              type="button"
              className="rmds-toolbar-btn"
              title={labels.link ?? "Link (Ctrl+K)"}
              aria-label="Insert link"
              disabled={disabled}
              onClick={() => runCommand(insertLink)}
            >
              <LinkIcon />
            </button>
          )}
          {show("image") && (
            <button
              type="button"
              className="rmds-toolbar-btn"
              title={labels.image ?? "Image"}
              aria-label="Insert image"
              disabled={disabled}
              onClick={() => runCommand(insertImage)}
            >
              <ImageIcon />
            </button>
          )}
        </div>

        <div className="rmds-toolbar-group">
          {show("unorderedList") && (
            <button
              type="button"
              className="rmds-toolbar-btn"
              title={labels.unorderedList ?? "Bulleted list"}
              aria-label="Bulleted list"
              disabled={disabled}
              onClick={() => runCommand(toggleUnorderedList)}
            >
              <UnorderedListIcon />
            </button>
          )}
          {show("orderedList") && (
            <button
              type="button"
              className="rmds-toolbar-btn"
              title={labels.orderedList ?? "Numbered list"}
              aria-label="Numbered list"
              disabled={disabled}
              onClick={() => runCommand(toggleOrderedList)}
            >
              <OrderedListIcon />
            </button>
          )}
          {show("checklist") && (
            <button
              type="button"
              className="rmds-toolbar-btn"
              title={labels.checklist ?? "Checklist"}
              aria-label="Checklist"
              disabled={disabled}
              onClick={() => runCommand(toggleChecklist)}
            >
              <ChecklistIcon />
            </button>
          )}
        </div>

        <div className="rmds-toolbar-group">
          {show("blockquote") && (
            <button
              type="button"
              className="rmds-toolbar-btn"
              title={labels.blockquote ?? "Quote"}
              aria-label="Quote"
              disabled={disabled}
              onClick={() => runCommand(toggleBlockquote)}
            >
              <QuoteIcon />
            </button>
          )}
          {show("alert") && (
            <AlertMenu
              disabled={disabled}
              title={labels.alert ?? "Insert alert"}
              theme={theme}
              onPick={(kind: AlertKind) => runCommand((s) => insertAlert(s, kind))}
            />
          )}
          {show("details") && (
            <button
              type="button"
              className="rmds-toolbar-btn"
              title={labels.details ?? "Collapsible section (dropdown)"}
              aria-label="Insert collapsible section"
              disabled={disabled}
              onClick={() => runCommand(insertDetails)}
            >
              <DetailsIcon />
            </button>
          )}
        </div>

        <div className="rmds-toolbar-group">
          {show("codeBlock") && (
            <div className="rmds-code-lang-group">
              <button
                type="button"
                className="rmds-toolbar-btn"
                title={labels.codeBlock ?? "Code block"}
                aria-label="Insert code block"
                disabled={disabled}
                onClick={() => runCommand((s) => insertCodeBlock(s, codeLang))}
              >
                <CodeIcon />
              </button>
              <CodeLangMenu value={codeLang} onChange={setCodeLang} disabled={disabled} theme={theme} />
            </div>
          )}
          {show("codeGroup") && (
            <button
              type="button"
              className="rmds-toolbar-btn"
              title={labels.codeGroup ?? "Tabbed code group"}
              aria-label="Insert tabbed code group"
              disabled={disabled}
              onClick={() => runCommand(insertCodeGroup)}
            >
              <CodeGroupIcon />
            </button>
          )}
        </div>

        <div className="rmds-toolbar-group">
          {show("table") && (
            <TableGridPicker
              disabled={disabled}
              title={labels.table ?? "Insert table"}
              theme={theme}
              onPick={(rows, cols) => runCommand((s) => insertTable(s, rows, cols))}
            />
          )}
          {show("horizontalRule") && (
            <button
              type="button"
              className="rmds-toolbar-btn"
              title={labels.horizontalRule ?? "Horizontal rule"}
              aria-label="Horizontal rule"
              disabled={disabled}
              onClick={() => runCommand(insertHorizontalRule)}
            >
              <HrIcon />
            </button>
          )}
        </div>
      </div>

      {/* Row 2: editor-level controls (reset, theme, view mode, fullscreen) */}
      <div className="rmds-toolbar-row rmds-toolbar-row-utility">
        {showResetButton && onReset && (
          <div className="rmds-toolbar-group">
            <button
              type="button"
              className="rmds-toolbar-btn"
              title={labels.reset ?? "Reset to original content"}
              aria-label="Reset content"
              disabled={disabled}
              onClick={onReset}
            >
              <ResetIcon />
            </button>
          </div>
        )}

        {showThemeToggle && (
          <div className="rmds-toolbar-group">
            <button
              type="button"
              className="rmds-toolbar-btn"
              title={labels.theme ?? (isDark ? "Switch to light theme" : "Switch to dark theme")}
              aria-label="Toggle theme"
              aria-pressed={isDark}
              onClick={onToggleTheme}
            >
              {isDark ? <MoonIcon /> : <SunIcon />}
            </button>
          </div>
        )}

        {showDownloadButton && (onDownloadMarkdown || onDownloadHtml) && (
          <div className="rmds-toolbar-group">
            <ExportMenu
              onPdf={onDownloadPdf}
              onMarkdown={onDownloadMarkdown}
              onHtml={onDownloadHtml}
              disabled={disabled}
              title={labels.download ?? "Export"}
              theme={theme}
            />
          </div>
        )}
        {showDownloadButton && !onDownloadMarkdown && !onDownloadHtml && onDownloadPdf && (
          <div className="rmds-toolbar-group">
            <button
              type="button"
              className="rmds-toolbar-btn"
              title={labels.download ?? "Download / print preview as PDF"}
              aria-label="Download preview as PDF"
              disabled={disabled}
              onClick={onDownloadPdf}
            >
              <DownloadIcon />
            </button>
          </div>
        )}

        {showHelpButton && (
          <div className="rmds-toolbar-group">
            <HelpMenu disabled={disabled} title={labels.help ?? "Markdown syntax guide"} theme={theme} />
          </div>
        )}

        <div className="rmds-toolbar-spacer" />

        {showModeControls && (
          <div className="rmds-toolbar-group rmds-view-controls" role="group" aria-label="View mode">
            <button
              type="button"
              className={`rmds-toolbar-btn${mode === "edit" ? " rmds-active" : ""}`}
              title={labels.editMode ?? "Edit only"}
              aria-label="Edit only"
              aria-pressed={mode === "edit"}
              onClick={() => onModeChange("edit")}
            >
              <EditModeIcon />
            </button>
            <button
              type="button"
              className={`rmds-toolbar-btn${mode === "split" ? " rmds-active" : ""}`}
              title={labels.splitMode ?? "Split view"}
              aria-label="Split view"
              aria-pressed={mode === "split"}
              onClick={() => onModeChange("split")}
            >
              <SplitModeIcon />
            </button>
            <button
              type="button"
              className={`rmds-toolbar-btn${mode === "preview" ? " rmds-active" : ""}`}
              title={labels.previewMode ?? "Preview only"}
              aria-label="Preview only"
              aria-pressed={mode === "preview"}
              onClick={() => onModeChange("preview")}
            >
              <PreviewModeIcon />
            </button>
            {showHtmlView && (
              <button
                type="button"
                className={`rmds-toolbar-btn${mode === "html" ? " rmds-active" : ""}`}
                title={labels.htmlMode ?? "View rendered HTML source"}
                aria-label="View HTML source"
                aria-pressed={mode === "html"}
                onClick={() => onModeChange("html")}
              >
                <HtmlViewIcon />
              </button>
            )}
          </div>
        )}

        {showFullscreenControl && (
          <div className="rmds-toolbar-group">
            <button
              type="button"
              className="rmds-toolbar-btn"
              title={fullscreen ? "Exit fullscreen" : (labels.fullscreen ?? "Fullscreen")}
              aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
              aria-pressed={fullscreen}
              onClick={onToggleFullscreen}
            >
              {fullscreen ? <FullscreenExitIcon /> : <FullscreenEnterIcon />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
