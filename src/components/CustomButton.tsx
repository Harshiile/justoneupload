"use client";
import { Loader } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  title: string;
  className?: string;
  cb: () => void;
}
export const CustomButton = ({ title, cb, className }: Props) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  return (
    <Button
      className={`${className} text-primary hover:cursor-pointer font-bold`}
      disabled={isLoading}
      onClick={async () => {
        setIsLoading(true);
        try {
          await cb();
        } catch (error) {
          if (error instanceof Error) {
            setIsLoading(false);
            toast.error(error.message);
          }
        } finally {
          setIsLoading(false);
        }
      }}
    >
      <div className="flex item-center gap-x-2">
        {isLoading && <Loader className="animate-spin" />}
        {title}
      </div>
    </Button>
  );
};
