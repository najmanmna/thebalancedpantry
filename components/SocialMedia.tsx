import { Facebook, Instagram } from "lucide-react";
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  iconClassName?: string;
  tooltipClassName?: string;
}

const socialLink = [

  {
    title: "Instagram",
    href: "https://www.instagram.com/elvyn_official/#",
    icon: <Instagram className="w-5 h-5" />,
  },
  {
    title: "Facebook",
    href: "https://www.facebook.com/share/1CK6tFGjwJ/?mibextid=wwXIfr",
    icon: <Facebook className="w-5 h-5" />,
  },

];

const SocialMedia = ({ className, iconClassName, tooltipClassName }: Props) => {
  return (
    <TooltipProvider>
      <div
        className={cn(
          "flex items-center gap-3.5 text-tech_white/60",
          className
        )}
      >
        {socialLink.map((item) => (
          <Tooltip key={item.title}>
            <TooltipTrigger asChild>
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "p-2  rounded-full hover:text-tech_white hover:scale-[1.05] hoverEffect",
                  iconClassName
                )}
              >
                {item.icon}
              </a>
            </TooltipTrigger>
            <TooltipContent
              className={cn(
                "bg-black text-white font-semibold",
                tooltipClassName
              )}
            >
              {item.title}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};

export default SocialMedia;
