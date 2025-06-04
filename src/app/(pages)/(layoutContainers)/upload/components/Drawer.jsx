"use client"
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const drawerVariants = {
  hidden: { x: '100%' },
  visible: { x: '0%', transition: { type: 'spring', stiffness: 250, damping: 30 } },
  exit: { x: '100%', transition: { ease: 'easeInOut' } },
};

const UploaderDrawer = ({ isUploading, setIsUploading, progress }) => {
  const onDrawerChange = () => {
    if (isUploading) return;
    setIsUploading(true);
  };

  return (
    <AnimatePresence>
      {/* {isUploading && ( */}
      <motion.div
        variants={drawerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <Drawer open={isUploading} onOpenChange={onDrawerChange}>
          <input
            type="submit"
            value="Upload"
            className="w-full bg-white text-black px-2 py-2 rounded-md mt-4 font-semibold mb-8 hover:bg-gray-200 transition"
          />
          <DrawerContent className="bg-primary w-[55%] mx-auto flex flex-col gap-y-4 rounded-lg shadow-lg border border-gray-700">
            <div className="flex justify-between px-20 items-center text-center text-white text-xl mb-2">
              <DrawerTitle className="text-white font-semibold">Uploading</DrawerTitle>
              <DrawerTitle className="text-white font-semibold flex items-center gap-2">
                {progress} %{' '}
                {progress < 100 && <Loader2 className="w-5 h-5 animate-spin text-white" />}
              </DrawerTitle>
            </div>
            <Progress
              value={progress}
              className="h-3 w-[85%] mx-auto mb-5 bg-[#39393b] [&>*]:bg-white rounded-full"
            />
          </DrawerContent>
        </Drawer>
      </motion.div>
      {/* )} */}
    </AnimatePresence >
  );
};

export default UploaderDrawer;