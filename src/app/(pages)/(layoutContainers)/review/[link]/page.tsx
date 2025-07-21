"use client";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CustomButton } from "@/components/CustomButton";

import { useState, useEffect, use, Usable } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { motion } from "framer-motion";
import { AsyncFetcher } from "@/lib/fetcher";
import { toast } from "sonner";
import { useUser } from "@/hooks/store/user";
import Prevention from "@/components/Prevention";
import { PageProps } from "../../../../../../.next/types/app/layout";

interface VideoDetails {
  channel: {
    id: string;
    name: string;
    avatar: string;
    userHandle: string;
  };
  video: {
    title: string;
    fileId: string;
    willUploadAt: string | null;
  };
}
export default function Review({ params }: PageProps) {
  const user = useUser((state) => state.user);
  const [isVideoProcessDone, setIsVideoProcessDone] = useState(false);
  const [isVideoHovered, setIsVideoHovered] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [open, setOpen] = useState(false);
  const [dialogData, setDialogData] = useState<{
    title: string;
    desc: string;
    cta: "Reject" | "Approve";
  }>();
  const [isLoading, setisLoading] = useState(true);
  const [video, setVideo] = useState<VideoDetails | null>(null);
  const resolvedParams = params;

  useEffect(() => {
    (async () => {
      const link = (await resolvedParams).link;
      if (link) {
        AsyncFetcher({
          url: `/api/videos/review/validate?link=${link}`,
          cb: ({
            error,
            videoDetails,
          }: {
            error: boolean;
            videoDetails: VideoDetails;
          }) => {
            console.log(videoDetails);

            if (error) setIsVideoProcessDone(true);
            else setVideo(videoDetails);
          },
        });
      }
    })();
  }, []);

  const handleApprove = (isApprove: boolean) => {
    setConfirmDialog(false);

    AsyncFetcher({
      url: "/api/youtube/video-approval",
      methodType: "POST",
      body: {
        isApprove,
        schedule: video?.video.willUploadAt,
        fileId: video?.video.fileId,
        workspaceId: video?.channel.id,
      },
      cb: ({ message }: { message: string }) => toast.success(message),
    });
  };

  return (
    <>
      {isVideoProcessDone ? (
        <Prevention title={"Video Process Already Done ..."} />
      ) : (
        <>
          {!video ? (
            <p>Full Loading ...</p>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full h-full bg-primary rounded-xl shadow-lg overflow-hidden"
            >
              {user?.userType == "editor" ? (
                <p>No Editor Here ...</p>
              ) : (
                <>
                  {/* Header */}
                  <div className="bg-primary h-16 border-b border-secondary flex items-center p-3 space-x-3">
                    {/* Channel Avatar */}
                    <div className="h-10 w-10 flex-shrink-0">
                      <img
                        src={video?.channel?.avatar}
                        alt={video?.channel?.name}
                        className="w-full h-full rounded-full object-cover border border-secondary"
                      />
                    </div>

                    {/* Channel Info */}
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="flex items-center space-x-1">
                        <span className="font-bold text-gray-100">
                          {video?.channel?.name}
                        </span>
                        <span className="text-gray-400 text-sm">
                          {video?.channel?.userHandle}
                        </span>
                      </div>
                      <div className="text-gray-400 text-xs line-clamp-1">
                        {video?.video?.title}
                      </div>
                    </div>

                    {/* Review Status */}
                    <div className="px-3 py-1 bg-amber-600/30 text-amber-400 text-xs rounded-full font-medium">
                      Pending Review
                    </div>
                  </div>

                  {isLoading && <p>Full Loading...</p>}
                  {/* Video */}
                  <div
                    className="relative w-full h-[85vh] group"
                    onMouseEnter={() => setIsVideoHovered(true)}
                    onMouseLeave={() => setIsVideoHovered(false)}
                  >
                    {/* Video Player or Fallback Image */}
                    <video
                      controls
                      controlsList="nodownload"
                      disablePictureInPicture
                      className="w-full h-full object-cover"
                      onLoadedData={(_) => setisLoading(false)}
                    >
                      <source
                        src={`http://localhost:3000/api/drive?type=video&id=${video?.video?.fileId}`}
                        type="video/mp4"
                      />
                    </video>

                    {/* Title Overlay - shown when video is paused or on hover */}
                    <motion.div
                      initial={{ y: -50, opacity: 0 }}
                      animate={
                        isVideoHovered
                          ? { y: 0, opacity: 1 }
                          : { y: -50, opacity: 0 }
                      }
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                      className="absolute top-0 left-0 m-4 p-2 rounded-md text-white font-bold text-lg max-w-[90%]"
                    >
                      {video?.video?.title}
                    </motion.div>
                  </div>

                  {/* MetaData */}

                  {/* Footer */}
                  <div className="p-4 bg-primary border-t border-secondary flex justify-between items-center">
                    <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                      <button
                        // onClick={onRejectClick}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 
                                bg-red-900 text-white 
                                hover:bg-red-600  hover:text-gray-200 hover:font-bold`}
                      >
                        <div
                          className="flex items-center gap-x-2"
                          onClick={() => {
                            setDialogData({
                              title: "Video Rejection",
                              desc: "Are you sure to reject this video?",
                              cta: "Reject",
                            });
                            setConfirmDialog(true);
                          }}
                        >
                          <ThumbsDown size={18} />
                          <span>Reject</span>
                        </div>
                      </button>

                      <button
                        // onClick={onApproveClick}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300
                            bg-white/90 text-black   animate-pulse'
                                 hover:bg-white hover:font-bold`}
                      >
                        <div
                          className="flex items-center gap-x-2"
                          onClick={() => {
                            setDialogData({
                              title: "Video Upload Approval",
                              desc: "Once Approves, then no getting back",
                              cta: "Approve",
                            });
                            setConfirmDialog(true);
                          }}
                        >
                          <ThumbsUp size={18} />
                          <span>Approve</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  <Dialog open={confirmDialog} onOpenChange={setConfirmDialog}>
                    <DialogContent className="bg-primary border-none">
                      <DialogHeader>
                        <DialogTitle>{dialogData?.title}</DialogTitle>
                      </DialogHeader>
                      <p>{dialogData?.desc}</p>
                      <DialogFooter className="mt-4">
                        <Button
                          variant="outline"
                          onClick={() => setConfirmDialog(false)}
                          className="text-black"
                        >
                          Cancel
                        </Button>
                        <CustomButton
                          className={`${
                            dialogData?.cta == "Approve"
                              ? "bg-green-500 hover:bg-green-500"
                              : "bg-red-500 hover:bg-red-500"
                          }`}
                          title={dialogData?.cta!}
                          cb={() =>
                            handleApprove(
                              dialogData?.cta == "Approve" ? true : false
                            )
                          }
                        />
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </motion.div>
          )}
        </>
      )}
    </>
  );
}
