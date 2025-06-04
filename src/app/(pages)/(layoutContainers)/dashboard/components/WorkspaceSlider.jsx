"use client"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "@/components/ui/tooltip"

import { motion } from 'framer-motion';
import { Users, Hash } from 'lucide-react';


const fadeIn = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const WorkspaceSlider = ({ workspace }) => {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <motion.div
                        initial={{ x: '-100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '-100%', opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 180, damping: 22 }}
                        className="fixed bottom-5 left-[8vw] w-[40%] bg-gradient-to-r from-primary via-primary/90 to-primary/80 shadow-2xl rounded-xl px-6 py-4 z-50 text-white border border-secondary ml-6"
                    >
                        <div className="flex items-center gap-6">
                            {/* Avatar */}
                            <motion.img
                                whileHover={{ scale: 1.1 }}
                                src={workspace.disconnected ? '/invalid.jpg' : workspace.avatar}
                                alt={workspace.name}
                                className="w-20 h-20 object-cover rounded-full border-4 border-secondary shadow-md transition-transform"
                            />

                            {/* Metadata */}
                            <motion.div
                                variants={fadeIn}
                                initial="hidden"
                                animate="visible"
                                className="flex flex-col gap-1 flex-1"
                            >
                                <div className='flex justify-between'>
                                    <div>
                                        <h4 className="text-xl font-bold tracking-tight">{workspace.name}</h4>
                                        <p className="text-sm text-dull line-clamp-2">{workspace.desc}</p>
                                    </div>
                                    {
                                        workspace.disconnected ?
                                            <p className='h-max px-2 py-0.5 text-sm rounded-sm bg-red-500/20 text-red-500'>Inactive</p>
                                            :
                                            <p className='h-max px-2 py-0.5 text-sm rounded-sm bg-[#04210f] text-green-500'>Active</p>
                                    }
                                </div>

                                {/* Extra Info */}
                                <div className="mt-2 text-sm text-white/90 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Hash className="w-4 h-4 opacity-80" />
                                        <span className="truncate">{workspace.userHandle}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 opacity-80" />
                                        <span>
                                            <span className="inline-flex items-center justify-center px-2 py-0.5 bg-secondary text-xs rounded-full font-medium">
                                                {workspace.totalVideos}
                                            </span>{' '}
                                            videos uploaded
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </TooltipTrigger>
                <TooltipContent side="top">
                    <p>Switch to Pending Videos</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>

    );
};

export default WorkspaceSlider;
