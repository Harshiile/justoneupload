"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CustomButton } from "@/components/CustomButton";
import { Loader } from "@/components/Loader";

import { AsyncFetcher } from "@/lib/fetcher";
import { useUser } from "@/hooks/store/user";
import { useVideos } from "@/hooks/store/videos";
import { useWorkspaces } from "@/hooks/store/workspaces";

import { ChannelDrawer, Contribution, VideoCard } from "./components";
import { EditorContribution } from "./components/Contribution";

import { User } from "../../types/user";
import { Workspace } from "../../types/workspace";
import { Video } from "./components/VideoCard";

interface PendingVideosProps {
  videos: Array<Video>;
  isReviewVideos: boolean;
  user: User;
  channel?: Workspace;
}

const PendingVideos = ({
  videos,
  isReviewVideos,
  user,
  channel,
}: PendingVideosProps) => {
  return videos.length > 0 ? (
    videos.map((video) => (
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
          userType={user.userType}
          showChangeScheduleButton={true}
          isForDrawer={false}
          channel={channel}
        />
        <Separator className="bg-secondary" />
      </motion.div>
    ))
  ) : (
    <motion.div
      className="text-muted-foreground text-center h-full grid place-items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      No {isReviewVideos ? "Review" : "Upload"} Pending Videos
    </motion.div>
  );
};

const Dashboard = () => {
  const user = useUser((state) => state.user);
  const videos = useVideos((state) => state.videos);
  const setVideos = useVideos((state) => state.setVideos);
  const workspaces = useWorkspaces((state) => state.workspaces);
  const setWorkspaces = useWorkspaces((state) => state.setWorkspaces);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [chartData, setChartData] = useState<
    Workspace[] | EditorContribution[] | null
  >(null);
  const [filterVideos, setFilterVideos] = useState<Array<Video> | null>(null);
  const [pendingVideos, setPendingVideos] = useState({
    review: null as Array<Video> | null,
    upload: null as Array<Video> | null,
  });
  const [channel, setChannel] = useState<Workspace | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isReviewVideos, setIsReviewVideos] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) return;

    AsyncFetcher({
      url: "/api/fetch/workspaces",
      cb: ({ workspaces }: { workspaces: Workspace[] }) => {
        const tmpVideos: Array<Workspace> = [];
        new Map(Object.entries(workspaces)).forEach((v) => tmpVideos.push(v));
        setWorkspaces(tmpVideos);
      },
    });

    AsyncFetcher({
      url: `/api/fetch/chart?chart=1`,
      cb: (data: Workspace[] | EditorContribution[]) => {
        setChartData(data);
      },
    });

    AsyncFetcher({
      url: "/api/videos",
      cb: ({ videos }: { videos: Video[] }) => {
        const review = videos.filter((v) => v.status === "reviewPending");
        const upload = videos.filter((v) => v.status === "uploadPending");
        setPendingVideos({ review: review, upload: upload });
        setIsReviewVideos(true);
      },
    });
  }, [user]);

  return (
    <>
      {/* Connect Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-primary border-none py-10 px-6 w-[90vw] max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader className="mx-auto mb-3">
            <DialogTitle className="text-center">
              Connect YouTube Account
            </DialogTitle>
          </DialogHeader>
          <CustomButton
            title="Connect"
            className="bg-white hover:bg-red-600 text-white text-md hover:text-white w-full"
            cb={() =>
              AsyncFetcher({
                url: "/api/youtube/connect",
                cb: ({ url }: { url: string }) => {
                  window.location.href = url;
                },
              })
            }
          />
        </DialogContent>
      </Dialog>

      {/* Main Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center w-full h-full px-8 gap-y-6 my-7"
      >
        <ChannelDrawer
          open={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          filterVideos={filterVideos!}
          setFilterVideos={setFilterVideos!}
          videos={videos}
          channel={channel}
        />

        {/* Workspaces and Contributions */}
        <div className="w-full h-[30vh] flex gap-x-6">
          {/* Workspaces */}
          <motion.div
            className="relative group w-full lg:w-1/3 border-2 border-secondary rounded-md p-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {user?.userType === "youtuber" && (
              <motion.button
                className="absolute top-2 right-2 bg-white text-primary p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                title="Add New Workspace"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus size={16} />
              </motion.button>
            )}
            <p className="text-lg font-semibold mb-3">Workspaces</p>
            <div className="flex flex-wrap gap-4 h-full justify-center">
              {!workspaces ? (
                <Loader />
              ) : workspaces.length > 0 ? (
                workspaces.map((ws) => {
                  const wsAvatar = ws.disconnected ? "/invalid.jpg" : ws.avatar;

                  return (
                    <TooltipProvider key={ws.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 180 }}
                            className={`relative w-24 h-24 rounded-full overflow-hidden border-4 ${
                              ws.disconnected
                                ? "border-red-500 cursor-pointer"
                                : "cursor-pointer border-secondary"
                            }`}
                            onClick={() => {
                              if (ws.disconnected) {
                                toast.error(
                                  <div className="flex items-center justify-between gap-4">
                                    <span>Workspace is Inactive</span>
                                    <Button
                                      className="px-3 py-1 h-auto bg-white text-black font-semibold"
                                      onClick={() => {
                                        AsyncFetcher({
                                          url: `/api/youtube/reconnect?ws=${ws.id}`,
                                          cb: ({ url }: { url: string }) => {
                                            window.location.href = url;
                                          },
                                        });
                                      }}
                                    >
                                      Reconnect
                                    </Button>
                                  </div>
                                );
                                return;
                              }

                              setVideos(null);
                              setFilterVideos(null);
                              setIsDrawerOpen(true);
                              setChannel(ws);

                              AsyncFetcher({
                                url: `/api/fetch/workspaces/videos?ws=${ws.id}`,
                                cb: ({ metadata }: { metadata: Video[] }) => {
                                  setVideos(metadata);
                                  setFilterVideos(metadata);
                                },
                              });
                            }}
                          >
                            <Image
                              src={wsAvatar}
                              alt={ws.name!}
                              width={100}
                              height={100}
                              className="w-full h-full object-cover"
                            />
                          </motion.div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          <p>Click to show all videos</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })
              ) : (
                <motion.div
                  className="text-muted-foreground text-center col-span-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  No Workspace
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Contributions */}
          <motion.div
            className="w-full lg:w-2/3 border-2 border-secondary rounded-md p-4 text-xl relative"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-lg font-semibold mb-2">Contribution</p>
            <Contribution chartData={chartData!} user={user!} />
          </motion.div>
        </div>

        {/* Pending Videos */}
        <motion.div
          className="w-full min-h-[60vh] border-2 border-secondary rounded-md p-4 relative mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-start gap-x-5">
            <p className="text-lg font-semibold mb-3">Pending Videos</p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className={`bg-white text-black font-bold hover:bg-white hover:text-black hover:font-bold ${
                      isReviewVideos === null && "hover:cursor-not-allowed"
                    }`}
                    onClick={() =>
                      isReviewVideos !== null &&
                      setIsReviewVideos(!isReviewVideos)
                    }
                  >
                    {isReviewVideos ? "Review Pending" : "Upload Pending"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>
                    Switch to {!isReviewVideos ? "Review" : "Upload"} Pending
                    Videos
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="w-full max-h-[50vh] overflow-y-auto custom-scroll">
            <AnimatePresence>
              {isReviewVideos === null || !user ? (
                <Loader />
              ) : (
                <PendingVideos
                  user={user}
                  isReviewVideos={isReviewVideos}
                  videos={
                    isReviewVideos
                      ? pendingVideos.review!
                      : pendingVideos.upload!
                  }
                />
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};

export default Dashboard;
