"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Drawer, DrawerContent, DrawerHeader } from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomButton } from "@/components/CustomButton";

import { Loader } from "@/components/Loader";
import { ArrowUpDown } from "lucide-react";
import VideoCard, { convertViews, Video } from "./VideoCard";
import { ChangeEvent, Dispatch, SetStateAction, useState } from "react";
import { AsyncFetcher } from "@/lib/fetcher";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";

import { useUser } from "@/hooks/store/user";
import { Workspace } from "@/app/(pages)/types/workspace";

interface ChannelDrawerProps {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  videos: Array<Video> | null;
  filterVideos: Array<Video> | null;
  setFilterVideos: Dispatch<SetStateAction<Array<Video> | null>>;
  channel: Workspace | null;
}
export const ChannelDrawer = ({
  open,
  onOpenChange,
  videos,
  filterVideos,
  setFilterVideos,
  channel,
}: ChannelDrawerProps) => {
  const user = useUser((state) => state.user);

  const searchOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (videos)
      setFilterVideos(videos.filter((v) => v.title.startsWith(e.target.value)));
  };

  if (!channel) return null;

  return (
    <AnimatePresence>
      {open && (
        <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            aria-modal="true"
            role="dialog"
          >
            <DrawerContent className="h-[80vh] w-screen max-w-full border-none bg-primary text-white flex flex-col">
              <DrawerHeader>
                <div className="flex flex-col md:flex-row items-center justify-between border-b border-border/40 px-6 py-4 bg-primary gap-4">
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <Avatar className="h-12 w-12 flex-shrink-0">
                      <AvatarImage
                        src={channel.avatar || "/placeholder.svg"}
                        alt={channel.name}
                      />
                      <AvatarFallback>
                        {channel?.name?.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h2 className="text-xl font-bold truncate">
                        {channel.name}
                      </h2>
                      <p className="text-sm text-muted-foreground truncate">
                        {channel.userHandle} •{" "}
                        {convertViews(channel?.subscribers!)} subscribers
                      </p>
                    </div>
                  </div>

                  {user?.userType === "youtuber" && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <CustomButton
                        title="Generate Link"
                        className="bg-white hover:bg-amber-50"
                        cb={() =>
                          AsyncFetcher({
                            url: `/api/fetch/workspaces/join/link/generate?ws=${channel.id}`,
                            cb: ({ link }: { link: string }) => {
                              navigator.clipboard.writeText(link);
                              toast.success("Link Copied");
                            },
                          })
                        }
                      />
                    </motion.div>
                  )}
                </div>
              </DrawerHeader>

              <div className="overflow-auto flex-1 p-6 flex flex-col">
                {/* Header + Controls */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-7 gap-4 md:gap-0">
                  <h3 className="text-lg font-semibold flex-shrink-0">
                    Channel Videos
                  </h3>

                  <div className="flex items-center gap-4 w-full md:w-auto">
                    {user?.userType === "editor" && (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Link href="/upload" passHref>
                          <Button className="bg-white text-black font-bold">
                            New Upload
                          </Button>
                        </Link>
                      </motion.div>
                    )}

                    {/* FILTER */}
                    {/* <DropdownMenu>
                                            <DropdownMenuTrigger>
                                                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                                    <Button className="bg-white text-black font-bold rounded-md hover:bg-white hover:text-black">
                                                        Filter
                                                    </Button>
                                                </motion.div>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="text-[#e3e3e3] border-secondary shadow-lg translate-y-3 bg-primary flex flex-col gap-y-4 p-6 rounded-lg max-w-xs w-full md:max-w-md">
                                                <DropdownMenuGroup className="flex gap-x-3 justify-center flex-wrap">
                                                    {["time", "views"].map((param) => (
                                                        <motion.div key={param} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                            <DropdownMenuItem
                                                                onClick={() => toggleParams(param)}
                                                                className={`border border-secondary cursor-pointer px-3 py-1 rounded-md ${filterParams[param] ? "bg-green-400 text-black font-bold" : ""
                                                                    }`}
                                                            >
                                                                {param.charAt(0).toUpperCase() + param.slice(1)}
                                                            </DropdownMenuItem>
                                                        </motion.div>
                                                    ))}
                                                </DropdownMenuGroup>

                                                <DropdownMenuGroup className="flex gap-x-3 justify-center flex-wrap">
                                                    {["public", "private", "unlisted"].map((type) => (
                                                        <motion.div key={type} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                            <DropdownMenuItem
                                                                onClick={() => setVideoType(type)}
                                                                className={`border border-secondary cursor-pointer px-3 py-1 rounded-md ${filterParams.videoType === type ? "bg-green-400 text-black font-bold" : ""
                                                                    }`}
                                                            >
                                                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                                            </DropdownMenuItem>
                                                        </motion.div>
                                                    ))}
                                                </DropdownMenuGroup>

                                                <DropdownMenuGroup className="flex gap-x-3 justify-center flex-wrap">
                                                    {["reviewPending", "uploadPending", "uploaded"].map((status) => (
                                                        <motion.div key={status} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                            <DropdownMenuItem
                                                                onClick={() => setVideoStatus(status)}
                                                                className={`border border-secondary cursor-pointer px-3 py-1 rounded-md ${filterParams.status === status ? "bg-green-400 text-black font-bold" : ""
                                                                    }`}
                                                            >
                                                                {status.replace(/([A-Z])/g, " $1").trim()}
                                                            </DropdownMenuItem>
                                                        </motion.div>
                                                    ))}
                                                </DropdownMenuGroup>
                                            </DropdownMenuContent>
                                        </DropdownMenu> */}

                    <Input
                      placeholder="Search"
                      className="font-bold w-full max-w-xs md:max-w-[25vw]"
                      onChange={searchOnChange}
                      aria-label="Search videos"
                    />

                    {/* <ArrowUpDown
                                            onClick={() => setIsAscending((prev) => !prev)}
                                            className={`w-12 h-8 cursor-pointer transition-all p-1 rounded ${isAscending ? "bg-white text-black" : ""
                                                }`}
                                            aria-pressed={isAscending}
                                            role="button"
                                            tabIndex={0}
                                        /> */}
                  </div>
                </div>

                {/* VIDEO LIST */}
                <div className="flex-1 overflow-auto">
                  {filterVideos != null ? (
                    filterVideos.length > 0 ? (
                      <AnimatePresence>
                        {filterVideos.map((video: Video) => (
                          <motion.div
                            key={video.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-x-hidden"
                          >
                            <VideoCard
                              video={video}
                              userType={user!.userType}
                              channel={channel}
                              isForDialog={false}
                              isForDrawer={true}
                              showChangeScheduleButton={true}
                            />
                            <Separator className="bg-secondary" />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    ) : (
                      <p className="text-muted-foreground text-center mt-[25vh]">
                        Workspace does not contain any videos
                      </p>
                    )
                  ) : (
                    <Loader className="absolute top-1/2 left-1/2 text-center" />
                  )}
                </div>
              </div>
            </DrawerContent>
          </motion.div>
        </Drawer>
      )}
    </AnimatePresence>
  );
};
