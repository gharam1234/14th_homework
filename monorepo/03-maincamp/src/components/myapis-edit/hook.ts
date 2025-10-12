"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/commons/libraries/supabaseClient"
import { useParams, useRouter } from "next/navigation"

export default function useUtubeEdit(){

    const params = useParams()
    const router = useRouter()
    const [title, setTitle] = useState("")
    const [url, setUrl] = useState("")
    
    useEffect(()=>{
        const fetchData = async () =>{
            const { data } = await supabase
                .from("utubes")
                .select("*")
                .eq("id", params.id)
                .single()
            if(data){
                setTitle(data.title)
                setUrl(data.url)
            }
        }  
        fetchData()
    }, [params.id])

    const onClickSubmit = async (e: React.FormEvent<HTMLFormElement>) =>{
        e.preventDefault()
        const { error } = await supabase
            .from("utubes")
            .update({ title, url })
            .eq("id", params.id)
        if(error){
            console.log(error)
            return
        }
        router.push(`/myapis/${params.id}`)
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