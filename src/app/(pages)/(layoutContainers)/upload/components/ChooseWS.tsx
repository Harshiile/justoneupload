"use client";
import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "sonner";
import { Loader } from "@/components/Loader";
import { Workspace } from "@/app/(pages)/types/workspace";

interface ChooseWSProps {
  setChosenWs: Dispatch<SetStateAction<Workspace | null>>;
  workspacesForChooseWS: [string, Workspace][] | null;
}
const ChooseWS = ({ setChosenWs, workspacesForChooseWS }: ChooseWSProps) => {
  const [isSelected, setIsSelected] = useState<Workspace | null>(null);
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary px-4 sm:px-8 md:px-10 border border-secondary rounded-xl w-[95vw] sm:w-[80vw] md:w-[65vw] lg:w-[50vw] xl:w-[40vw]">
      <p className="text-lg sm:text-xl font-semibold text-center my-5">
        Choose Workspace
      </p>

      <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-8 mb-20">
        {!workspacesForChooseWS ? (
          <Loader />
        ) : workspacesForChooseWS.length <= 0 ? (
          <p className="text-center text-sm sm:text-base">
            No workspace, Join Any Workspace
          </p>
        ) : (
          workspacesForChooseWS.map((workspace, index) => {
            const ws = workspace[1];
            return (
              <div
                key={index}
                onClick={() =>
                  setIsSelected((prev) => (prev?.id === ws.id ? null : ws))
                }
                className={`
                                    flex items-center gap-3 sm:gap-4 border border-secondary py-3 px-4 rounded-xl
                                    hover:scale-105 transition-all duration-300 ease-in-out group cursor-pointer
                                    ${
                                      isSelected?.userHandle === ws.userHandle
                                        ? "bg-[#222224]"
                                        : ""
                                    }
                                    w-full sm:w-[46%] md:w-[45%] lg:w-[40%]
                                `}
              >
                <img
                  src={ws.avatar}
                  className="rounded-full w-12 h-12 sm:w-14 sm:h-14 object-cover"
                  alt="Channel Avatar"
                />

                <div
                  className={`leading-tight opacity-60 group-hover:opacity-100 transition-all duration-300 ${
                    isSelected?.handle === ws.handle ? "opacity-100" : ""
                  }`}
                >
                  <p className="text-base sm:text-lg font-semibold">
                    {ws.name}
                  </p>
                  <p className="text-sm text-gray-500">{ws.userHandle}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div
        onClick={() => {
          if (!isSelected) toast.warning("Please Select Any Workspace");
          setChosenWs(isSelected);
        }}
        className="bg-white text-black w-max py-2 px-5 rounded-md text-base font-semibold absolute bottom-4 right-4 hover:scale-105 transition-transform"
      >
        Next
      </div>
    </div>
  );
};

export default ChooseWS;
