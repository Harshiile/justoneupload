import { AsyncFetcher } from "@/lib/fetcher";

export const fetchMe = (setUser: any) => {
    AsyncFetcher({
        url: `/api/fetch/me`,
        cb: ({ user }: any) => setUser(user)
    })
}