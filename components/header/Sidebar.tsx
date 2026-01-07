import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Logo from "../LogoWhite";
import Link from "next/link";
import { useOutsideClick } from "@/hooks";
import { quickLinksDataMenu } from "@/constants";
import { Crown } from "lucide-react";


import { Category } from "@/sanity.types";
import { statuses } from "@/constants";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  categories?: Category[];
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, categories }) => {
  const pathname = usePathname();
  const sidebarRef = useOutsideClick<HTMLDivElement>(onClose);

  const [hovered, setHovered] = useState<"bags" | "accessories" | "premium" | null>(null);

  return (
    <div
      className={`fixed inset-y-0 h-screen left-0 z-50 w-72 sm:w-full bg-primary/50 shadow-xl transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform ease-in-out duration-300`}
      ref={sidebarRef}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="min-w-72 max-w-96 bg-tech_black z-50 h-screen p-10 border-r border-r-tech_white flex flex-col gap-7"
      >
        {/* Logo + Close */}
        <div className="flex items-center justify-between">
          <Logo />
          <button
            onClick={onClose}
            className="hover:text-tech_white hoverEffect text-gray-300"
          >
            <X />
          </button>
        </div>

        {/* Categories */}
        {categories && categories.length > 0 && (
          <div>
            {/* BAGS */}
            <div
              className="cursor-pointer"
              onMouseEnter={() => setHovered("bags")}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="flex items-center font-bold gap-8 text-xl uppercase hover:text-white hover:[text-shadow:0_0_10px_rgba(255,255,255,0.6)] tracking-wide text-gray-200 mb-7">
                <span>BAGS<span className="text-3xl ml-5 font-bold">→</span></span>
                
              </div>

              <AnimatePresence>
                {hovered === "bags" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col gap-2 pl-6 overflow-hidden mb-6"
                  >
                    {categories.map((cat) => (
                      <Link
                        onClick={onClose}
                        key={cat._id}
                        href={`/category/${cat.slug?.current}`}
                        className={`hover:text-white hover:[text-shadow:0_0_10px_rgba(255,255,255,0.6)] transition text-gray-300 ${
                          pathname === `/category/${cat.slug?.current}` &&
                          "text-gray-100"
                        }`}
                      >
                        {cat.title}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
                {/* ELVYN PREMIUM */}
            <div
              className="flex items-center font-bold gap-2 text-xl tracking-wide text-gray-200 hover:text-white hover:[text-shadow:0_0_10px_rgba(255,255,255,0.6)] cursor-pointer mb-7"
              onMouseEnter={() => setHovered("premium")}
              onMouseLeave={() => setHovered(null)}
            >
              <span className="flex items-center gap-2">
                ELVYN PREMIUM
                <Crown className="h-5 w-4 text-white fill-current" />
              </span>
            </div>
            <AnimatePresence>
              {hovered === "premium" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="pl-6 text-gray-500 text-sm mb-6"
                >
                  (Coming Soon)
                </motion.div>
              )}
            </AnimatePresence>
            {/* ACCESSORIES */}
            <div
              className="flex items-center font-bold gap-2 text-xl tracking-wide text-gray-200 hover:text-white hover:[text-shadow:0_0_10px_rgba(255,255,255,0.6)] cursor-pointer"
              onMouseEnter={() => setHovered("accessories")}
              onMouseLeave={() => setHovered(null)}
            >
              <span>ACCESSORIES</span>
            </div>

            <AnimatePresence>
              {hovered === "accessories" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="pl-6 pt-6 text-gray-500 text-sm"
                >
                  (Coming Soon)
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Statuses */}
        <div>
          <div className="flex flex-col gap-8 text-xl font-bold">
            {statuses.map((status) => (
              <Link
                onClick={onClose}
                key={status.value}
                href={`/deal/${status.value}`}
                className={`hover:text-white transition hover:[text-shadow:0_0_10px_rgba(255,255,255,0.6)] text-gray-200 ${
                  pathname === `/deal/status/${status.value}` &&
                  "text-tech_orange"
                }`}
              >
                {status.title}
              </Link>
            ))}
          </div>
          <ul className="space-y-3 mt-10">
                        {quickLinksDataMenu?.map((item) => (
                          <li key={item?.title}>
                            <Link
                              href={item?.href}
                              className="text-gray-300 hover:text-white text-sm font-normal transition-colors"
                            >
                              {item?.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default Sidebar;
