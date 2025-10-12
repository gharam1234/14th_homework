"use client"
import React from "react"
import { withAuthLogin } from "@/commons/hocs/auth-hoc-login"

export default withAuthLogin(function PublicLayout({children}:{children:React.ReactNode}){

    return children
})