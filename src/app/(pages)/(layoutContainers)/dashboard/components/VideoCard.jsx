"use client"
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

import { Clock, Eye } from 'lucide-react'
import { Duration } from 'luxon'
import { AsyncFetcher } from '@/lib/fetcher'
import { motion } from 'framer-motion'
import { useState } from 'react'
import Schedule from '../../upload/components/Schedule'
import { toast } from 'sonner'
import Image from 'next/image'


export const getTypeBadgeStyle = (type) => {
    switch (type.toLowerCase()) {
        case "private":
            return "bg-red-500/20 text-red-500";
        case "unlisted":
            return "bg-gray-700/50 text-gray-300";
        case "public":
            return "bg-blue-500/20 text-blue-400";
        default:
            return "bg-gray-600 text-white";
    }
}

const getStatusBadgeStyle = (status) => {
    switch (status) {
        case "uploaded":
            return "bg-[#04210f] text-green-500"
        case "uploadPending":
            return "bg-amber-500/20 text-amber-500"
        case "reviewPending":
            return "bg-blue-500/20 text-blue-500"
        default:
            return "bg-gray-500/20 text-gray-400"
    }
}

const getStatusLabel = (status) => {
    switch (status) {
        case "uploadPending":
            return "Uploading Pending"
        case "reviewPending":
            return "Review Pending"
        case "uploaded":
            return "Uploaded"
        default:
            return status
    }
}

export const convertViews = (views) => {
    if (views < 1000) return views.toString();
    if (views < 1_000_000) return (views / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
    if (views < 1_000_000_000) return (views / 1_000_000).toFixed(2).replace(/\.0+$/, '') + 'M';
    return (views / 1_000_000_000).toFixed(2).replace(/\.0+$/, '') + 'B';
}


const convertPublishTime = (date) => {
    const now = new Date();
    const past = new Date(date);
    const seconds = Math.floor((now - past) / 1000);

    const intervals = [
        { label: 'year', seconds: 31536000 },
        { label: 'month', seconds: 2592000 },
        { label: 'week', seconds: 604800 },
        { label: 'day', seconds: 86400 },
        { label: 'hour', seconds: 3600 },
        { label: 'minute', seconds: 60 },
        { label: 'second', seconds: 1 }
    ];

    for (const interval of intervals) {
        const count = Math.floor(seconds / interval.seconds);
        if (count >= 1) return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }

    return 'Just now';
}

export const convertDate = (date) => {
    date = new Date(Number(date))
    return `${date.toDateString()} - ${date.toLocaleTimeString()}`
}

export const convertDuration = (duration) => {
    let formattedDuration = ' ';
    const dur = Duration.fromISO(duration);
    if (dur.hours > 0) formattedDuration += `${dur.hours < 10 ? '0' + dur.hours.toString() : dur.hours.toString()}:`
    if (dur.minutes > 0) formattedDuration += `${dur.minutes < 10 ? '0' + dur.minutes.toString() : dur.minutes.toString()}:`
    if (dur.seconds > 0) formattedDuration += `${dur.seconds < 10 ? '0' + dur.seconds.toString() : dur.seconds.toString()}`
    return formattedDuration
}

const VideoCard = ({ video, userType, isForDialog, isForDrawer, channel, className }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [date, setDate] = useState(null)
    const thumbnailUrl = video.thumbnail
        ? video.status !== 'uploaded'
            ? `http://localhost:3000/api/drive?type=image&id=${video.thumbnail}`
            : video.thumbnail
        : '/invalid.jpg';

    return (
        <>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-primary border-none py-40 px-120">
                    <DialogHeader className="absolute top-5 left-1/2 -translate-x-1/2 text-center">
                        <DialogTitle className="text-2xl">Change Schedule Time</DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col items-center justify-center gap-y-2 mt-20 absolute left-1/2 -translate-x-1/2 w-full px-10">
                        <Schedule id="schedule" date={date} setDate={setDate} />

                        <VideoCard
                            video={video}
                            isForDialog={true}
                            className={'w-[45vw]'}
                        />

                        <Button
                            className="border border-secondary bg-white text-black hover:bg-white hover:text-black px-20 font-semibold text-md"
                            onClick={_ => AsyncFetcher({
                                url: `/video/update/schedule?id=${video.id}&schedule=${date.getTime()}`,
                                cb: ({ message }) => { toast.success(message); setIsDialogOpen(false) }
                            })}
                        >
                            Change
                        </Button>
                    </div>

                </DialogContent>
            </Dialog>

            <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className='my-4'
            >
                <div
                    key={video.id}
                    onClick={e => video.status !== 'uploaded' && e.preventDefault()}
                    whilehover={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className={`flex items-center justify-between rounded-lg overflow-hidden bg-primary shadow-sm transition-shadow over:shadow-xl text-white cursor-auto py-3 px-3 ${className}`}
                >

                    {/* Left Section */}
                    <div className="flex items-start gap-x-4 flex-1">
                        <div className="relative h-[80px] w-[140px] flex-shrink-0 overflow-hidden rounded-md group">
                            <Image
                                src={thumbnailUrl}
                                alt={video.title}
                                width={100}
                                height={100}
                                className="h-full w-full object-cover rounded-md group-hover:scale-105 transition-transform duration-300"
                            />
                            {video.duration && (
                                <span className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                                    {convertDuration(video.duration)}
                                </span>
                            )}
                        </div>
                        {/* Video info */}
                        <div className="flex flex-col justify-between flex-1 gap-y-1">
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-semibold line-clamp-2">{video.title}</h3>
                                {video.videoType && (
                                    <span className={`text-xs font-bold rounded px-2 py-0.5 ${getTypeBadgeStyle(video.videoType)}`}>
                                        {video.videoType.toUpperCase()}
                                    </span>
                                )}
                            </div>
                            {(!isForDrawer || (userType === 'editor' && video.status == 'uploaded')) && (
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    {isForDrawer
                                        &&
                                        <img
                                            src={video.channel?.avatar || "/placeholder.svg"}
                                            alt={video.channelHandle}
                                            className="w-5 h-5 rounded-full"
                                        />
                                    }
                                    <span>{!isForDrawer ? video.userHandle : video.channelHandle}</span>
                                </div>
                            )}
                            {video.status === 'uploaded' ? (
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Eye className="h-3.5 w-3.5" />
                                        <span>{convertViews(video.views)}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5" />
                                        <span>{convertPublishTime(video.publishedAt)}</span>
                                    </div>

                                </div>
                            ) : (
                                video.willUploadAt ?
                                    <div className="flex items-center gap-x-2 text-sm text-muted-foreground">
                                        <Clock className="h-3.5 w-3.5" />
                                        {
                                            isForDialog ?
                                                <span>
                                                    Previous Scheudle Time : {convertDate(video.willUploadAt)}
                                                </span>
                                                :
                                                <span>
                                                    Scheduled to upload on {convertDate(video.willUploadAt)}
                                                </span>
                                        }
                                        {
                                            !isForDialog &&
                                            <button
                                                className='border border-secondary px-2 py-1 rounded-md ml-4 text-white hover:border-white'
                                                onClick={_ => {
                                                    setDate(new Date())
                                                    setIsDialogOpen(true)
                                                }}
                                            >Change Schedule Time</button>
                                        }
                                    </div>
                                    :
                                    <p className='text-sm text-muted-foreground'>Will Upload immediately after youtuber approval</p>

                            )}
                        </div>
                    </div>

                    {/* Right Badge + Button */}
                    <div className='flex gap-x-4 items-center'>
                        <span
                            className={`text-xs rounded-md px-3 py-1 flex items-center gap-x-2 ${getStatusBadgeStyle(video.status)}`}
                        >
                            <p className="font-bold text-md">@{video.editor}</p>
                        </span>
                        <span
                            className={`text-xs rounded-md px-3 py-2 flex items-center gap-x-2 ${getStatusBadgeStyle(video.status)}`}
                        >
                            <Clock className="w-4 h-4" />
                            <p className="font-bold text-md">{getStatusLabel(video.status)}</p>
                        </span>

                        {
                            (isForDrawer && userType === 'youtuber' && video.status === 'reviewPending') && (
                                <motion.div
                                    whilehover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 250 }}
                                >
                                    <Button
                                        onClick={() => {
                                            AsyncFetcher({
                                                url: '/api/fetch/videos/review/generate',
                                                methodType: 'POST',
                                                body: {
                                                    name: channel.name,
                                                    avatar: channel.avatar,
                                                    userHandle: channel.userHandle,
                                                    id: video.id,
                                                    title: video.title,
                                                    fileId: video.fileId,
                                                    willUploadAt: video.willUploadAt
                                                },
                                                cb: ({ link }) => {
                                                    window.open(link, '_blank')
                                                }
                                            })
                                        }
                                        }
                                        className="bg-white text-black hover:bg-white/80 hover:text-black hover:cursor-pointer shadow-sm"
                                    >
                                        Review
                                    </Button>
                                </motion.div>
                            )}
                    </div>
                </div >
            </motion.div >
        </>
    );
}

export default VideoCard;
