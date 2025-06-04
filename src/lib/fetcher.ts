import { toast } from "sonner";

interface Fetcher {
    url: string
    methodType?: 'GET' | 'POST' | 'DELETE' | 'HEAD' | 'PATCH',
    body?: object,
    cb?: Function
}
const EXPIRED_CODE = 306;
export const AsyncFetcher = async ({ url, cb, methodType = 'GET', body }: Fetcher): Promise<any> => {
    try {
        const fetchOptions = methodType != 'GET' ? {
            method: methodType,
            body: JSON.stringify(body)
        } : {}

        const res = await fetch(url, fetchOptions);

        if (res.status === EXPIRED_CODE) {
            // Token expired — Renew the token
            const renewed = await AsyncFetcher({ url: '/api/auth/renew-token' });

            if (renewed) {
                // Original Request
                AsyncFetcher({ url, cb, methodType, body });
            } else {
                throw new Error('Please Login Again');
            }
        }

        const data = await res.json();
        if (!res.ok) { throw new Error(data.error || 'Unknown error') }

        cb?.(data); // call your callback if provided
        return data;
    } catch (err) {
        if (err instanceof Error) toast.error(err.message)
    }
};