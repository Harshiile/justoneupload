import Link from "next/link";
import React from "react";

const Prevention = ({ title }: { title: string }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-y-3">
      <p className="text-lg">{title}</p>
      <Link
        href={"/dashboard"}
        className="group relative flex h-[50px] w-[50px] items-center justify-center rounded-full border-none bg-[#141414] font-semibold shadow-[0_0_0_4px_rgba(180,160,255,0.253)] transition-all duration-300 overflow-hidden cursor-pointer hover:w-[140px] hover:rounded-full hover:bg-[#b5a0ff]"
      >
        <svg
          className="w-[12px] transition-all duration-300 group-hover:-translate-y-full"
          viewBox="0 0 384 512"
        >
          <path
            d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"
            fill="white"
          ></path>
        </svg>
        <span className="absolute bottom-[-20px] text-white text-[0px] transition-all duration-300 group-hover:bottom-auto group-hover:text-[13px] mt-3">
          Back to Dashboard
        </span>
      </Link>
    </div>
  );
};

export default Prevention;
