"use client"
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

import { AsyncFetcher } from '@/lib/fetcher';
import { useEffect, useState } from 'react';
import { Loader } from '@/components/Loader';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { useUser } from '@/hooks/store/user'
import { useVideos } from '@/hooks/store/videos'
import { useWorkspaces } from '@/hooks/store/workspaces'

import { ChannelDrawer, VideoCard, WorkspaceSlider } from './components';
import Image from 'next/image';


const PendingVideos = ({ videos, isReviewVideos, user, channel }) => {
    return (
        videos?.length > 0 ?
            videos?.map(video => (
                <motion.div
                    key={video.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                >
                    <VideoCard
                        video={video}
                        userType={user?.userType}
                        isForDialog={false}
                        isForDrawer={false}
                        channel={channel}
                    />
                    <Separator className="bg-secondary" />
                </motion.div>
            ))
            :
            <motion.div
                className="text-muted-foreground text-center col-span-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                No {isReviewVideos ? 'Review' : 'Upload'} Pending Videos
            </motion.div>
    )
}


const Dashboard = () => {
    const user = useUser(state => state.user);
    const videos = useVideos(state => state.videos);
    const setVideos = useVideos(state => state.setVideos);
    const workspaces = useWorkspaces(state => state.workspaces);
    const setWorkspaces = useWorkspaces(state => state.setWorkspaces);
    // const navigate = useNavigate()
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [filterVideos, setFilterVideos] = useState();
    const [pendingVideos, setPendingVideos] = useState({
        review: null,
        upload: null
    });
    const [channel, setChannel] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [hoveredWorkspace, setHoveredWorkspace] = useState(null);
    const [isReviewVideos, setisReviewVideos] = useState(null)

    useEffect(() => {
        AsyncFetcher({
            url: '/api/fetch/workspaces',
            cb: ({ workspaces }) => {
                const tmpVideos = []
                new Map(Object.entries(workspaces)).forEach(v => tmpVideos.push(v))
                setWorkspaces(tmpVideos);
            }
        });
        AsyncFetcher({
            url: '/api/fetch/videos',
            cb: ({ videos }) => {
                const reviewPendingVideos = []
                const uploadPendingVideos = []
                videos.filter(v => {
                    if (v.status == 'reviewPending') reviewPendingVideos.push(v);
                    else if (v.status == 'uploadPending') uploadPendingVideos.push(v);
                })
                setPendingVideos({
                    review: reviewPendingVideos,
                    upload: uploadPendingVideos
                });
                setisReviewVideos(true);
            },
        });
    }, [])

    return (
        <>
            {hoveredWorkspace && <WorkspaceSlider workspace={hoveredWorkspace} />}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className='bg-primary border-none py-10'>
                    <DialogHeader className='mx-auto mb-3'>
                        <DialogTitle>Connect Youtube Account</DialogTitle>
                    </DialogHeader>
                    <Button
                        className='border border-secondary text-md bg-red-600 font-semibold hover:bg-red-600 py-5 w-3/4 mx-auto'
                        onClick={() => AsyncFetcher({
                            url: '/api/youtube/connect',
                            cb: ({ url }) => { window.location.href = url }
                        })
                        }
                    >
                        Connect
                    </Button>
                </DialogContent>
            </Dialog >

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center justify-center w-full h-full px-8 gap-y-6 my-7"
            >
                <ChannelDrawer
                    open={isDrawerOpen}
                    onOpenChange={setIsDrawerOpen}
                    filterVideos={filterVideos}
                    setFilterVideos={setFilterVideos}
                    videos={videos}
                    channel={channel}
                />

                {/* Top Panels */}
                <div className="w-full h-[30vh] flex gap-x-6">
                    {/* WorkSpaces Panel */}
                    <motion.div
                        className="relative group w-[50%] border-2 border-secondary rounded-md p-4"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        {
                            user?.userType == 'youtuber' &&
                            <motion.button
                                className="absolute top-2 right-2 bg-white text-primary p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Add New WorkSpace"
                                whilegover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={_ => setIsDialogOpen(true)}
                            >
                                <Plus size={16} />
                            </motion.button>
                        }
                        <p className="text-lg font-semibold mb-3">Workspaces</p>


                        <div className="flex flex-wrap gap-4 h-full">
                            {
                                !workspaces ?
                                    <Loader />
                                    :
                                    workspaces.length > 0 ?
                                        (
                                            workspaces?.map((workspace, idx) => {
                                                const ws = workspace;
                                                const wsAvatar = ws.disconnected ? '/invalid.jpg' : ws.avatar;

                                                return <motion.div
                                                    key={idx}
                                                    whilehover={{ scale: 1.05 }}
                                                    transition={{ type: 'spring', stiffness: 180 }}
                                                    className={`relative w-24 h-24 rounded-full overflow-hidden border-4 ${ws.disconnected ? 'border-red-500 cursor-pointer' : 'cursor-pointer border-secondary '}`}
                                                    onClick={() => {
                                                        if (ws.disconnected) {
                                                            toast.error(
                                                                <div className="flex items-center justify-between gap-4">
                                                                    <span>Workspace is Inactive</span>
                                                                    <Button
                                                                        className="px-3 py-1 h-auto bg-white text-black font-semibold hover:bg-white hover:text-black hover:font-semibold hover:cursor-pointer"
                                                                        onClick={() => {
                                                                            AsyncFetcher({
                                                                                url: `/api/youtube/reconnect?ws=${ws.id}`,
                                                                                cb: ({ url }) => window.location.href = url
                                                                            })
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
                                                        setIsDrawerOpen(!isDrawerOpen);
                                                        setChannel(ws);
                                                        AsyncFetcher({
                                                            url: `/api/fetch/workspaces/videos?ws=${ws.id}`,
                                                            cb: ({ metadata }) => {
                                                                setVideos(metadata);
                                                                setFilterVideos(metadata);
                                                            },
                                                        });
                                                    }}
                                                    onMouseEnter={() => !ws.disconnected && setHoveredWorkspace(ws)}
                                                    onMouseLeave={() => setHoveredWorkspace(null)}
                                                >
                                                    <Image
                                                        src={wsAvatar}
                                                        alt={ws.name}
                                                        width={100}
                                                        height={100}
                                                        className={`w-full h-full object-cover`}
                                                    />
                                                </motion.div>
                                            })
                                        )
                                        :
                                        <motion.div
                                            className="text-muted-foreground text-center col-span-full"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                        >
                                            No Workspace
                                        </motion.div>
                            }
                        </div>
                    </motion.div>

                    {/* Calendar Panel */}
                    <motion.div
                        className="w-[50%] border-2 border-secondary rounded-md p-4 text-xl"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <p className="text-lg font-semibold mb-2">Schedule</p>
                    </motion.div>
                </div >

                {/* Pending Videos */}
                <motion.div
                    className="w-full h-[63vh] border-2 border-secondary rounded-md p-4 relative"
                    initial={{ opacity: 0, y: 20 }
                    }
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className='flex items-start gap-x-5'>
                        <p className="text-lg font-semibold mb-3">Pending Videos</p>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        className='bg-white text-black font-bold hover:bg-white hover:text-black hover:ont-bold hover:cursor-pointer'
                                        onClick={_ => setisReviewVideos(!isReviewVideos)}
                                    >{isReviewVideos ? 'Review Pending' : 'Upload Pending'}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                    <p>Switch to {!isReviewVideos ? 'Review' : 'Upload'} Pending Videos</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                    </div>
                    <div className="w-full h-[95%] overflow-y-auto custom-scroll">
                        <AnimatePresence>
                            {
                                isReviewVideos == null ?
                                    <Loader />
                                    :
                                    <PendingVideos
                                        user={user}
                                        channel={channel}
                                        isReviewVideos={isReviewVideos}
                                        videos={isReviewVideos ? pendingVideos.review : pendingVideos.upload}
                                    />
                            }
                        </AnimatePresence>
                    </div>
                </motion.div >
            </motion.div >


        </>
    );
};

export default Dashboard;
