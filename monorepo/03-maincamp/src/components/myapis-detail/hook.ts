"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/commons/libraries/supabaseClient"



export default function useUtubeDetail(){

     const params = useParams()
    const router = useRouter()
    const [utube, setUtube] = useState<any | null>(null)
    // const videoId = (data?.url?.match(/v=([a-zA-Z0-9_-]+)/)?.[1]);

    useEffect(()=>{
        const fetchData = async () =>{
            const { data, error } = await supabase
                .from("utubes")
                .select("*")
                .eq("id", params.id)
                .single()
            if(error) console.log(error)
            else setUtube(data || {})
        }
        fetchData()
    }, [params.id])

    const onClickToEdit = () =>{
        router.push(`/myapis/${params.id}/edit`)
    }

    const onClickDelete = async () =>{
        if(!confirm("정말 삭제하시겠습니까?")) return
        const { data: deleted, error: deleteError } = await supabase
            .from("utubes")
            .delete()
            .eq("id", params.id)
        if(deleteError) console.log(deleteError)
        else router.push("/myapis")
    }

    // if(!utube) return <div>로딩중...</div>
    const videoId = (utube?.url?.match(/v=([a-zA-Z0-9_-]+)/)?.[1]);

    return{
        utube,
        onClickToEdit,
        onClickDelete,
        videoId
    }
    
}