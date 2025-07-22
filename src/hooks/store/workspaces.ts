import { Workspace } from "@/app/(pages)/types/workspace";
import { create } from "zustand";

interface WorkSpaceStore {
  workspaces: null | Array<Workspace>;
  setWorkspaces: (workspaces: Array<Workspace>) => void;
}
export const useWorkspaces = create<WorkSpaceStore>((set) => ({
  workspaces: null,
  setWorkspaces: (_workspaces: Array<Workspace>) =>
    set({ workspaces: _workspaces }),
}));
