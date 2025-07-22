import { Video } from "@/app/(pages)/(layoutContainers)/dashboard/components/VideoCard";
import { create } from "zustand";

interface VideoStore {
  videos: Array<Video> | null;
  setVideos: (videos: Array<Video> | null) => void;
}
export const useVideos = create<VideoStore>((set) => ({
  videos: null,
  setVideos: (_videos: Array<Video> | null) => set({ videos: _videos }),
}));
