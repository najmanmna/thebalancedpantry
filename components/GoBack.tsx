"use client";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

const GoBack = () => {
  const router = useRouter();
  return (
    <div className="absolute top-5 left-5 md:top-10 md:left-10">
      <button
        onClick={() => router?.back()}
        className="flex items-center gap-0.5 hover:text-tech_orange hover:cursor-pointer duration-300"
      >
        <ChevronLeft size={18} />{" "}
        <span className="text-sm font-semibold">Go back</span>
      </button>
    </div>
  );
};

export default GoBack;
