"use client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { Dispatch, SetStateAction, useState } from "react";
import { CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import CustomCalendar from "./Calender";
import { motion, AnimatePresence } from "framer-motion";
import { integer } from "drizzle-orm/gel-core";
import { PageProps } from "../../../../../../.next/types/app/layout";

const fadeInUp = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: 15,
    scale: 0.98,
    transition: { duration: 0.25, ease: "easeIn" },
  },
};
interface ScheduleProps {
  date: Date | null;
  setDate: Dispatch<SetStateAction<Date | null>>;
  className?: string;
}
const Schedule = ({ date, setDate, className }: ScheduleProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);

  const handleTimeChange = (type: string, value: string) => {
    if (date) {
      const newDate = new Date(date);
      if (type === "hour") {
        newDate.setHours(
          (parseInt(value) % 12) + (newDate.getHours() >= 12 ? 12 : 0)
        );
      } else if (type === "minute") {
        newDate.setMinutes(parseInt(value));
      } else if (type === "ampm") {
        const hours = newDate.getHours();
        if (value === "AM" && hours >= 12) newDate.setHours(hours - 12);
        if (value === "PM" && hours < 12) newDate.setHours(hours + 12);
      }
      setDate(newDate);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal bg-primary border border-secondary hover:bg-primary hover:text-white transition",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            `${date.toDateString()} - ${date.toLocaleTimeString()}`
          ) : (
            <span>MM/DD/YYYY hh:mm aa</span>
          )}
        </Button>
      </SheetTrigger>

      {/* Responsive SheetContent */}
      <SheetContent
        side={
          typeof window !== "undefined" && window.innerWidth < 640
            ? "bottom"
            : "right"
        }
        className="w-full sm:w-[50vw] h-[70vh] sm:h-screen border-secondary rounded-t-xl sm:rounded-xl p-0"
      >
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="h-full flex flex-col bg-primary text-white rounded-t-xl sm:rounded-xl"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Calendar Picker */}
              <div className="p-4 overflow-auto justify-center mt-2.5">
                <CustomCalendar selectedDate={date} onDateSelect={setDate} />
              </div>

              <Separator className="bg-secondary" />

              {/* Time Picker */}
              <div className="flex flex-col">
                <p className="text-center py-2 font-medium flex items-center justify-center gap-1 pb-3">
                  <Clock className="w-4 h-4" /> Time
                </p>

                <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x">
                  {["hour", "minute", "ampm"].map((type) => (
                    <ScrollArea
                      key={type}
                      className="bg-primary text-white flex-1 h-auto"
                    >
                      <div className="flex sm:flex-col flex-wrap p-2 gap-2 justify-center">
                        {(type === "hour"
                          ? hours.slice().reverse()
                          : type === "minute"
                          ? Array.from({ length: 12 }, (_, i) => i * 5)
                          : ["AM", "PM"]
                        ).map((val) => {
                          const isSelected =
                            date &&
                            ((type === "hour" &&
                              date.getHours() % 12 === Number(val) % 12) ||
                              (type === "minute" &&
                                date.getMinutes() === val) ||
                              (type === "ampm" &&
                                ((val === "AM" && date.getHours() < 12) ||
                                  (val === "PM" && date.getHours() >= 12))));

                          return (
                            <Button
                              key={val}
                              size="icon"
                              variant="ghost"
                              className={cn(
                                "sm:w-full aspect-square transition",
                                isSelected
                                  ? "bg-white text-black font-semibold"
                                  : "hover:bg-secondary/50 hover:text-white"
                              )}
                              onClick={() =>
                                handleTimeChange(type, val.toString())
                              }
                            >
                              {val}
                            </Button>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  );
};

export default Schedule;
