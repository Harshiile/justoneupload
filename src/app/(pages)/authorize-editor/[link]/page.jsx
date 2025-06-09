"use client"
import { use, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { AsyncFetcher } from '@/lib/fetcher';
import { useRouter } from 'next/navigation';
import { CustomButton } from '@/components/CustomButton';

const Authorize = ({ params }) => {
    const [data, setData] = useState(null);
    const router = useRouter()
    const resolvedParams = use(params)

    useEffect(() => {
        const link = resolvedParams.link
        AsyncFetcher({
            url: `/api/auth/authorize-editor/validate?link=${link}`,
            cb: ({ decryptData }) => {
                setData(decryptData)
            }
        });
    }, []);

    const handleAuthorize = (approve) => {
        AsyncFetcher({
            url: `/api/fetch/workspaces/join/final?id=${data.editorId}&ws=${data.wsId}&approve=${approve}`,
            cb: ({ message }) => {
                toast.success(message);
                router.push('/dashboard');
            }
        });
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    if (!data) return <p>Loading ...</p>

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="min-h-screen flex items-center justify-center p-4"
        >
            <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="w-[95vw] sm:w-[90vw] md:w-[75vw] lg:w-[60vw] xl:w-[40vw] mx-auto mt-10 bg-secondary shadow-xl rounded-2xl overflow-hidden text-white"
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.3 }}
            >
                <div className="relative">
                    <motion.div
                        className="h-24 sm:h-28 bg-gradient-to-r from-primary to-white/70"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    />

                    <motion.div
                        className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 top-24"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white bg-white">
                            <motion.img
                                src={data.wsAvatar}
                                alt="Workspace Avatar"
                                className="w-full h-full object-cover rounded-full"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            />
                        </div>
                    </motion.div>
                </div>

                <div className="px-4 sm:px-6 md:px-12 lg:px-24 xl:px-32 pt-20 pb-8 text-center text-dull">
                    <motion.h1
                        variants={itemVariants}
                        className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 text-dull"
                    >
                        {data.wsName}
                    </motion.h1>

                    <motion.p
                        variants={itemVariants}
                        className="text-sm sm:text-base font-medium mb-3 text-dull"
                    >
                        {data.wsUserHandle}
                    </motion.p>

                    <motion.div
                        variants={itemVariants}
                        className="border-t border-gray-700/30 my-6 pt-6"
                    >
                        <h2 className="text-lg sm:text-xl font-semibold text-dull mb-3">Authorize Editor</h2>
                        <div className="text-sm sm:text-base">
                            <span>{data.editorName} - </span>
                            <span className='text-blue-500'>{data.editorMail}</span>
                        </div>
                        <span className="text-sm sm:text-base"> has requested permission to join your workspace <strong>{data.wsName}</strong></span>
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        className="text-sm sm:text-base text-dull mb-6 leading-relaxed bg-white/5 p-4 sm:p-6 rounded-lg border border-white/10"
                    >
                        <p className="mb-2">
                            Once you <strong>authorize</strong> <span className="text-white">{data.editorName}</span>, they will be granted access to your workspace
                        </p>
                        <p className="mb-2">
                            Editors can <strong>upload & schedule videos</strong> directly to your YouTube channel
                        </p>
                        <p className="mb-2">
                            You’ll receive notifications when a video is ready, and you can <strong>review & approve it</strong> before it goes live
                        </p>
                        <p className="text-red-400 mt-2">
                            If you decline this request, the editor will not be able to access your workspace
                        </p>
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        className="flex flex-col sm:flex-row justify-center gap-4 mt-4"
                    >
                        <CustomButton
                            className='bg-green-500 text-white hover:text-white text-md h-12 px-6 sm:px-7'
                            title='Authorize'
                            cb={() => handleAuthorize(true)}
                        />
                        <CustomButton
                            className='bg-red-500 text-white hover:text-white text-md h-12 px-6 sm:px-7'
                            title='Decline'
                            cb={() => handleAuthorize(false)}
                        />
                    </motion.div>
                </div>
            </motion.div>
        </motion.div>

    );
};

export default Authorize;