// DotLoader.tsx
import { motion } from "framer-motion";

const dotTransition = {
  duration: 0.6,
  repeat: Infinity,
  ease: "easeInOut",
};

export const Loader = ({ className }: { className?: string }) => {
  return (
    <div
      className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${className} flex gap-x-1.5`}
    >
      {[0, 1, 2].map((index) => (
        <motion.span
          key={index}
          className="w-2.5 h-2.5 rounded-full bg-white"
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            ...dotTransition,
            delay: index * 0.2,
          }}
        />
      ))}
    </div>
  );
};
