import { VideoMetaData } from '@/app/api/fetch/workspaces/videos/route'
import { create } from 'zustand'

export const useVideos = create(set => ({
    videos: null,
    setVideos: (_videos: Array<VideoMetaData>) => set({ videos: _videos })
}))