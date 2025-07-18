"use client";
import { useState, useEffect, use, Usable } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Users } from "lucide-react";
import { AsyncFetcher } from "@/lib/fetcher";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { convertViews } from "../../(layoutContainers)/dashboard/components/VideoCard";
import { CustomButton } from "@/components/CustomButton";

interface Params {
  [key: string]: Usable<string>;
}
interface Workspace {
  avatar: string;
  name: string;
  description: string;
  subscribers: number;
  id: string;
  userHandle: string;
  totalVideos: number;
}
const JoinWs = ({ params }: Params) => {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const router = useRouter();
  const resolvedParams = use(params);
  useEffect(() => {
    const link = resolvedParams;
    console.log("Link : ", link);

    // AsyncFetcher({
    //   url: `/api/fetch/workspaces/join/link/validate?link=${link}`,
    //   cb: ({ workspace }) => {
    //     setWorkspace(workspace);
    //   },
    // });
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const handleReject = (id: React.MouseEvent<HTMLButtonElement>) => {
    toast.error("Request Decline");
    router.push("/dashboard");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      {!workspace ? (
        <p>Loading ...</p>
      ) : (
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="w-[95vw] sm:w-[90vw] md:w-[75vw] lg:w-[60vw] xl:w-[45vw] mx-auto mt-10 bg-secondary shadow-xl rounded-2xl overflow-hidden text-white"
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
                  src={workspace.avatar}
                  alt={`${workspace.name}'s avatar`}
                  className="w-full h-full object-cover rounded-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                />
              </div>
            </motion.div>
          </div>

          <div className="px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 pt-20 pb-10 text-center text-dull">
            <motion.h1
              variants={itemVariants}
              className="text-xl sm:text-2xl md:text-3xl font-bold mb-1"
            >
              {workspace.name}
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-sm sm:text-base font-medium mb-3"
            >
              {workspace.userHandle}
            </motion.p>

            <motion.p
              variants={itemVariants}
              className="text-sm sm:text-base mb-6 max-w-lg mx-auto"
            >
              {workspace.description}
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 gap-4 mb-8"
            >
              <motion.div
                className="flex flex-col items-center"
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center text-dull mb-1">
                  <Users size={18} className="mr-1" />
                </div>
                <motion.p
                  className="text-dull font-semibold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {convertViews(workspace.subscribers)}
                </motion.p>
                <p className="text-dull text-sm">Subscribers</p>
              </motion.div>

              <motion.div
                className="flex flex-col items-center"
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center text-dull mb-1">
                  <Building2 size={18} className="mr-1" />
                </div>
                <motion.p
                  className="text-dull font-semibold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {workspace.totalVideos}
                </motion.p>
                <p className="text-dull text-sm">Videos</p>
              </motion.div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row justify-center gap-4 mt-6"
            >
              <motion.button
                className="bg-white text-black px-6 py-3 rounded-lg font-medium"
                whileHover={{
                  scale: 1.05,
                  backgroundColor: "white",
                  color: "white",
                  cursor: "pointer",
                }}
                whileTap={{ scale: 0.95 }}
              >
                <CustomButton
                  title="Join Workspace"
                  cb={() => {
                    AsyncFetcher({
                      url: `/api/fetch/workspaces/join/initial?ws=${workspace.id}`,
                      cb: ({ message }: { message: string }) => {
                        toast.success(message);
                      },
                    });
                  }}
                />
              </motion.button>
              <motion.button
                onClick={handleReject}
                className="bg-white text-black px-6 py-3 rounded-lg font-medium"
                whileHover={{
                  scale: 1.05,
                  backgroundColor: "red",
                  color: "white",
                  cursor: "pointer",
                }}
                whileTap={{ scale: 0.95 }}
              >
                Decline
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default JoinWs;
