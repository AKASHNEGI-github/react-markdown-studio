export interface EditorSelection {
  start: number;
  end: number;
}

export interface EditorState {
  value: string;
  selection: EditorSelection;
}
