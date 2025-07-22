import { create } from "zustand";

interface User {
  id: string;
  userType: "youtuber" | "editor";
  name: string;
}

interface UserStore {
  user: User | null;
  setUser: (user: User) => void;
}
export const useUser = create<UserStore>((set) => ({
  user: null,
  setUser: (_user: User) => set({ user: _user }),
}));
