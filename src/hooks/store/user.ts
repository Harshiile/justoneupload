import { create } from 'zustand'

interface User {
    id: string,
    userType: string,
    name: string,
}

export const useUser = create(set => ({
    user: null,
    setUser: (_user: User) => set({ user: _user })
}))