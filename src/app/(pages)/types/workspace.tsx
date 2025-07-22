export interface EditorContribution {
  editorId: string;
  editorName: string;
  videoUploaded: number;
}
export interface Workspace {
  id: string;
  avatar: string;
  userHandle: string;
  name?: string;
  handle?: string;
  subscribers?: number;
  disconnected?: boolean;
  editors?: Array<EditorContribution>;
}
