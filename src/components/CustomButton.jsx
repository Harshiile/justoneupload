"use client"
import { Loader } from 'lucide-react'
import { Button } from './ui/button'
import { useState } from 'react'
import { toast } from 'sonner'

export const CustomButton = ({ title, cb, className }) => {
    const [isLoading, setIsLoading] = useState(null)
    return (
        <Button
            className={`bg-white text-primary hover:bg-[#fffffffd] hover:cursor-pointer font-bold hover:text-black !${className}`}
            disabled={isLoading}
            onClick={async () => {
                setIsLoading(true)
                try {
                    // await cb()
                } catch (error) {
                    setIsLoading(false)
                    toast.error(error.message)
                } finally {
                    setTimeout(() => {
                        setIsLoading(false)
                    }, 6000);
                }
            }}
        >
            <div className='flex item-center gap-x-2'>
                {isLoading && <Loader className='animate-spin' />}
                {title}
            </div>
        </Button >
    )
}