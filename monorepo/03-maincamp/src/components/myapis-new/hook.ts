"use client"

import { useState } from "react"
import { supabase } from "@/commons/libraries/supabaseClient"
import { useRouter } from "next/navigation"

export default function useUtubeNew(){
     const [title, setTitle] = useState("")
    const [url, setUrl] = useState("")
    const router = useRouter()

    const onClickSubmit = async (e: React.FormEvent<HTMLFormElement>) =>{
        e.preventDefault()
        const { data, error } = await supabase
            .from("utubes")
            .insert([{ title, url }])
        if(error) {
            console.log(error)
            return
        }
        router.push("/myapis")
    }

    const onChangeTitle = (e:React.ChangeEvent<HTMLInputElement>) =>{
        setTitle(e.target.value)
    }
    const onChangeUrl = (e:React.ChangeEvent<HTMLTextAreaElement>) =>{
        setUrl(e.target.value)
    }

    return{
        title,
        url,
        onChangeTitle,
        onChangeUrl,
        onClickSubmit
    }

}