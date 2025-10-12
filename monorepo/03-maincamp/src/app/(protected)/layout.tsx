"use client"

import { withAuth } from "@/commons/hocs/auth-hoc"

export default withAuth(function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
    </>
  );
});