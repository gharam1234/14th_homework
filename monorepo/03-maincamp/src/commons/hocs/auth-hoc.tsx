"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/commons/libraries/supabaseClient";
import { message } from "antd";
import { isTestEnv } from "@/commons/utils/is-test-env";

export const withAuth = <P extends object>(Component: React.FC<P>) => (props: P) => {
  const router = useRouter();
  const [isAuthChecked, setIsAuthChecked] = useState(() => isTestEnv());

  useEffect(() => {
    const bypassLogin = isTestEnv();
    if (bypassLogin) {
      setIsAuthChecked(true);
      return;
    }

    let isMounted = true;

    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;

      if (!data.session) {
        message.warning("로그인 후 이용 가능합니다!");
        router.push("/");
        return;
      }

      setIsAuthChecked(true);
    };

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      if (!session) {
        message.warning("로그인이 만료되었습니다.");
        router.push("/");
      } else {
        setIsAuthChecked(true);
      }
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, [router]);

  if (!isAuthChecked) return <div>로딩중...</div>;

  return <Component {...props} />;
};
