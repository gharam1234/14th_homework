"use client"
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useState } from "react";
import { useRef } from "react";


export const withAuthLogin = <P extends object>(Component:React.FC<P>) => (props:P)=> {
 const router = useRouter();
  const [isAuthChecked, setIsAuthChecked] = useState(true);
  const hasChecked = useRef(false);

  useEffect(() => {
    if (hasChecked.current) return; 

    const token = localStorage.getItem("accessToken");
    if (token) {
      
      router.push("/boards");
    } else {
      setIsAuthChecked(false); 
    }  
  
    hasChecked.current = true;
  }, []);
  if (isAuthChecked) return <div>로딩중...</div>;

  return <Component {...props}/>
}