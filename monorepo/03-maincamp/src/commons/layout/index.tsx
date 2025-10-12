"use client";
import LayoutBanner from "./banner";
import LayoutNavigation from "./navigation";
import { IProps } from "./type"
import { usePathname } from "next/navigation";

const HIDDEN_BANNER = [
  "/", //
  "/signup",
];


export default function Layout({ children }: IProps) {

  const pathname = usePathname();
  const isHiddenBanner = HIDDEN_BANNER.includes(pathname);
  
  return (
    <>
      
      <LayoutNavigation />
       {!isHiddenBanner && <LayoutBanner />}
      
      <div>{children}</div>
      
      
    </>
  );
}
