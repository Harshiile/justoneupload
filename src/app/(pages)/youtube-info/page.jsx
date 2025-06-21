"use client"
import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner'
import { AsyncFetcher } from '@/lib/fetcher';

const YoutubeInfo = () => {
    const params = useParams();
    const router = useRouter()
    useEffect(() => {
        const code = params['code']
        if (code) {
            AsyncFetcher({
                url: `/api/youtube/connect?code=${code}`,
                methodType: "POST",
                cb: ({ message }) => {
                    toast.success(message)
                    router.push('/dashboard')
                }
            })
        }
    }, [])
    return (
        <>
            <p className='mt-16'>Wait for Authentication ...</p>
        </>
    )
}

export default YoutubeInfo