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
      <motion.div
        variants={drawerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <Drawer open={isUploading} onOpenChange={onDrawerChange}>
          <DrawerContent className="bg-primary w-[95%] sm:w-[85%] md:w-[65%] lg:w-[55%] mx-auto flex flex-col gap-y-4 rounded-lg shadow-lg border border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between px-6 sm:px-12 md:px-20 items-center text-white text-center text-base sm:text-xl mb-2 gap-2 sm:gap-0">
              <DrawerTitle className="text-white font-semibold">
                Uploading
              </DrawerTitle>
              <DrawerTitle className="text-white font-semibold flex items-center gap-2">
                {progress} %
                {progress < 100 && (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-white" />
                )}
              </DrawerTitle>
            </div>

            <Progress
              value={progress}
              className="h-3 w-[90%] sm:w-[85%] mx-auto mb-5 bg-[#39393b] [&>*]:bg-white rounded-full"
            />
          </DrawerContent>
        </Drawer>
      </motion.div>
    </AnimatePresence>

  );
};

export default UploaderDrawer;