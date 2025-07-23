"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CustomButton } from "@/components/CustomButton";

import { Clock, Eye } from "lucide-react";
import { Duration } from "luxon";
import { AsyncFetcher } from "@/lib/fetcher";
import { motion } from "framer-motion";
import { useState } from "react";
import Schedule from "../../upload/components/Schedule";
import { toast } from "sonner";
import { Workspace } from "@/app/(pages)/types/workspace";
import Image from "next/image";

export const getTypeBadgeStyle = (type: string) => {
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
};

const getStatusBadgeStyle = (status: string) => {
  switch (status) {
    case "uploaded":
      return "bg-[#04210f] text-green-500";
    case "uploadPending":
      return "bg-amber-500/20 text-amber-500";
    case "reviewPending":
      return "bg-blue-500/20 text-blue-500";
    default:
      return "bg-gray-500/20 text-gray-400";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "uploadPending":
      return "Uploading Pending";
    case "reviewPending":
      return "Review Pending";
    case "uploaded":
      return "Uploaded";
    default:
      return status;
  }
};

export const convertViews = (views: number) => {
  if (views < 1000) return views.toString();
  if (views < 1_000_000)
    return (views / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  if (views < 1_000_000_000)
    return (views / 1_000_000).toFixed(2).replace(/\.0+$/, "") + "M";
  return (views / 1_000_000_000).toFixed(2).replace(/\.0+$/, "") + "B";
};

const convertPublishTime = (date: Date) => {
  const now = new Date();
  const past = new Date(date);
  const seconds = Math.floor((Number(now) - Number(past)) / 1000);

  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
    { label: "second", seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1)
      return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
  }

  return "Just now";
};

export const convertDate = (dateInNumbers: string) => {
  const date = new Date(Number(dateInNumbers));
  return `${date.toDateString()} - ${date.toLocaleTimeString()}`;
};

export const convertDuration = (duration: string) => {
  let formattedDuration = " ";
  const dur = Duration.fromISO(duration);
  if (dur.hours > 0)
    formattedDuration += `${
      dur.hours < 10 ? "0" + dur.hours.toString() : dur.hours.toString()
    }:`;
  if (dur.minutes > 0)
    formattedDuration += `${
      dur.minutes < 10 ? "0" + dur.minutes.toString() : dur.minutes.toString()
    }:`;
  if (dur.seconds > 0)
    formattedDuration += `${
      dur.seconds < 10 ? "0" + dur.seconds.toString() : dur.seconds.toString()
    }`;
  return formattedDuration;
};

export interface Video {
  id: string;
  thumbnail: string;
  willUploadAt: string;
  title: string;
  duration: string;
  views: number;
  userHandle: string;
  publishedAt: Date;
  fileId: string;
  channelHandle: string;
  editor: string;
  status: "uploaded" | "reviewPending" | "uploadPending";
  videoType: "public" | "private" | "unlisted";
}
interface VideoCardProps {
  video: Video;
  userType: "youtuber" | "editor";
  showChangeScheduleButton?: boolean;
  isForDrawer?: boolean;
  isForDialog?: boolean;
  channel?: Workspace;
  className?: string;
}
const VideoCard = ({
  video,
  userType,
  showChangeScheduleButton,
  isForDrawer,
  channel,
  className,
}: VideoCardProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [date, setDate] = useState<Date | null>(null);
  const thumbnailUrl = video.thumbnail
    ? video.status !== "uploaded"
      ? `/api/drive?type=image&id=${video.thumbnail}`
      : video.thumbnail
    : "/invalid.jpg";

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-primary border-none py-40 px-120">
          <DialogHeader className="absolute top-5 left-1/2 -translate-x-1/2 text-center">
            <DialogTitle className="text-2xl">Change Schedule Time</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center gap-y-2 mt-20 absolute left-1/2 -translate-x-1/2 w-full px-60">
            <Schedule date={date} setDate={setDate} />

            <VideoCard
              video={video}
              userType={userType}
              showChangeScheduleButton={false}
              className={"w-[45vw]"}
            />

            <CustomButton
              title={"Change"}
              cb={() => {
                if (date!.getTime() == Number(video.willUploadAt))
                  toast.warning("Time is as same as Previous");
                if (date!.getTime() < Date.now())
                  toast.error(
                    "New Schedule Time must be ahead of current time"
                  );

                AsyncFetcher({
                  url: `/api/videos / update - schedule ? id = ${
                    video.id
                  } & schedule= ${date?.getTime()}`,
                  cb: ({ message }: { message: string }) => {
                    toast.success(message);
                    setIsDialogOpen(false);
                  },
                });
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.4,
          ease: "easeOut",
          type: "spring",
          stiffness: 200,
          damping: 20,
        }}
        key={video.id}
        onClick={(e) => video.status !== "uploaded" && e.preventDefault()}
        whileHover={{ scale: 1.01 }}
        className={`flex flex-col md:flex-row items-start md:items-center justify-between rounded-lg overflow-hidden shadow-sm transition-shadow hover:shadow-xl text-white cursor-auto p-3 gap-x-4 md:gap-6 ${className}`}
      >
        {/* Left Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-x-4 md:gap-6 flex-1 w-full">
          <div className="relative flex-shrink-0 w-full max-w-xs md:w-[140px] md:h-[80px] rounded-md overflow-hidden group">
            <Image
              src={thumbnailUrl}
              alt={video.title}
              width={1280}
              height={720}
              quality={100}
              placeholder="empty"
              className="w-full h-auto md:h-full object-cover rounded-md group-hover:scale-105 transition-transform duration-300"
            />
            {video.duration && (
              <span className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                {convertDuration(video.duration)}
              </span>
            )}
          </div>

          {/* Video info */}
          <div className="flex flex-col justify-between flex-1 w-full">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold line-clamp-2 max-w-full">
                {video.title}
              </h3>
              {video.videoType && (
                <span
                  className={`text-xs font-bold rounded px-2 py-0.5 ${getTypeBadgeStyle(
                    video.videoType
                  )}`}
                >
                  {video.videoType.toUpperCase()}
                </span>
              )}
            </div>

            {(!isForDrawer ||
              (userType === "editor" && video.status === "uploaded")) &&
              !isForDrawer && (
                <span className="text-sm text-muted-foreground truncate">
                  {video.userHandle || video.channelHandle}
                </span>
              )}

            {video.status === "uploaded" ? (
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                <div className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  <span>{convertViews(video.views)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{convertPublishTime(video.publishedAt)}</span>
                </div>
              </div>
            ) : video.willUploadAt ? (
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-1">
                <Clock className="h-3.5 w-3.5" />
                {showChangeScheduleButton ? (
                  <span>
                    Scheduled to upload on {convertDate(video.willUploadAt)}
                  </span>
                ) : (
                  <span>
                    Previous Schedule Time: {convertDate(video.willUploadAt)}
                  </span>
                )}
                {showChangeScheduleButton && (
                  <button
                    className="border border-secondary px-2 py-1 rounded-md ml-4 text-white hover:border-white"
                    onClick={() => {
                      setDate(new Date());
                      setIsDialogOpen(true);
                    }}
                  >
                    Change Schedule Time
                  </button>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mt-1">
                Will upload immediately after YouTuber approval
              </p>
            )}
          </div>
        </div>

        {/* Right Badge + Button */}
        <div className="flex flex-wrap items-center gap-4 mt-2 md:mt-0">
          <span
            className={`text-xs rounded-md px-3 py-1 flex items-center gap-x-2 ${getStatusBadgeStyle(
              video.status
            )}`}
          >
            <p className="font-bold text-md">@{video.editor}</p>
          </span>
          <span
            className={`text-xs rounded-md px-3 py-2 flex items-center gap-x-2 ${getStatusBadgeStyle(
              video.status
            )}`}
          >
            <Clock className="w-4 h-4" />
            <p className="font-bold text-md">{getStatusLabel(video.status)}</p>
          </span>

          {isForDrawer &&
            userType === "youtuber" &&
            video.status === "reviewPending" && (
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 250 }}
              >
                <CustomButton
                  title={"Review"}
                  cb={() =>
                    AsyncFetcher({
                      url: "/api/videos/review/generate",
                      methodType: "POST",
                      body: {
                        channelName: channel?.name,
                        channelAvatar: channel?.avatar,
                        channalUserHandle: channel?.userHandle,
                        channelId: channel?.id,
                        videoId: video.id,
                      },
                      cb: ({ link }: { link: string }) => {
                        window.open(link, "_blank");
                      },
                    })
                  }
                />
              </motion.div>
            )}
        </div>
      </motion.div>
    </>
  );
};

export default VideoCard;
