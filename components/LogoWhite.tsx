import { logo_white } from "@/images";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import React from "react";
interface Props {
  className?: string;
}

const Logo = ({ className }: Props) => {
  return (
    <Link href={"/"} className="sm:w-40">
      <Image src={logo_white} alt="logo" className={cn("w-35 sm:w-40", className)} />
    </Link>
  );
};

export default Logo;
