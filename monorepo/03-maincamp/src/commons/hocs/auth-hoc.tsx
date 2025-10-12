"use client"
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useState } from "react";
import { useRef } from "react";


export const withAuth = <P extends object>(Component:React.FC<P>) => (props:P)=> {
 const router = useRouter();
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const hasChecked = useRef(false);

  useEffect(() => {
    if (hasChecked.current) return; 

    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("로그인 후 이용 가능합니다!");
      router.push("/");
    } else {
      setIsAuthChecked(true); 
    }
    if (isAuthChecked){
      router.push("/board")
    }
    hasChecked.current = true; 
  }, []);

  if (!isAuthChecked) return <div>로딩중...</div>;

  return <Component {...props}/>
}