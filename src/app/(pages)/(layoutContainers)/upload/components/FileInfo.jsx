"use client"
import { motion } from 'framer-motion';
import { X, FileText } from 'lucide-react';

const fadeSlide = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.25, ease: 'easeIn' } },
};

const FileInfo = ({ file, setFile, setVideoPreviewUrl, type }) => {
    return (
        <motion.div
            variants={fadeSlide}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative bg-[#18181b] border border-secondary rounded-xl p-4 shadow-lg flex flex-col sm:flex-row items-start sm:items-center gap-4 text-sm text-[#d4d4d8] mt-4 hover:shadow-xl transition-shadow duration-300"
        >
            <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-white flex-shrink-0" />

            <div className="flex flex-col gap-1 overflow-hidden flex-1">
                <p className="text-sm sm:text-md font-medium text-[#f4f4f5] truncate">
                    {file.name}
                </p>
                <p
                    className={`text-xs sm:text-sm font-medium ${type === "thumbnail" && file.size >= 2097152 ? "text-red-500" : "text-white"
                        }`}
                >
                    Size: {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
            </div>

            <X
                className="w-6 h-6 cursor-pointer absolute top-2 right-2 text-[#a1a1aa] hover:text-red-500 transition-colors rounded-full p-1 hover:bg-secondary"
                onClick={() => {
                    setFile(null);
                    setVideoPreviewUrl(null);
                }}
                title="Remove file"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        setFile(null);
                        setVideoPreviewUrl(null);
                    }
                }}
            />
        </motion.div>

    );
};

export default FileInfo;
