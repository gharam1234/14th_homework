"use client"
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from '@/commons/libraries/supabaseClient'


export const withAuthLogin = <P extends object>(Component:React.FC<P>) => (props:P)=> {
 const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;

      if (data.session) {
        router.push("/boards");
        return;
      }

      setIsChecking(false);
    };

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      if (session) {
        router.push("/boards");
      } else {
        setIsChecking(false);
      }
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, [router]);

  if (isChecking) return <div>로딩중...</div>;

  return <Component {...props}/>
}
