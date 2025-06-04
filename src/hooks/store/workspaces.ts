import { create } from 'zustand'

interface Workspace {
    id: string
    userHandle: string
    name: string
    avatar: string
    subscribers: string
    desc: string
    totalVideos: string
    disconnected: boolean
    email: string
}

export const useWorkspaces = create(set => ({
    workspaces: null,
    setWorkspaces: (_workspaces: Array<Workspace>) => set({ workspaces: _workspaces })
}))