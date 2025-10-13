"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/commons/libraries/supabaseClient"
import { useRouter } from 'next/navigation';
import { Idata } from "./types"


export default function useUtubeList() {

const router = useRouter()
    const [utubes, setUtubes] = useState<Idata[]>([])
    const [page,setPage] = useState(1)
    const pageGroup = Math.ceil(page / 3)
    const startPage = (pageGroup -1) * 3 + 1
    const limit = 10
    const [totalCount, setTotalCount] = useState(0)
    const totalPages = Math.ceil(totalCount / limit)
    const endPage = startPage+2 > totalPages ? totalPages : startPage +2 
    
    useEffect(()=>{
        const fetchData = async () =>{
            const start = (page -1) * limit // 0 10,20
            const end = start + limit -1  // 9 , 19
            const { data, error, count } = await supabase
                .from("utubes")
                .select("*",{count : "exact"})
                .order("created_at", { ascending: false })
                .range(start,end)
            if(error) console.log(error)
            else{
                setTotalCount(count || 0);
                setUtubes(data || []);
        }
        
        }
        
        fetchData()
    },[page])

    const onClickToNew = () =>{
        router.push("/myapis/new")
    }


    const onclickNext =()=>{
        if(page >= totalPages) return
        setPage(page+1)
    }
    const onClickPrev = () =>{
        if(page <= 1) return
        setPage(page-1)
    }

    return{
        limit,
        utubes,
        page,
        setPage,
        totalCount,
        totalPages,
        startPage,
        endPage,
        pageGroup,
        onClickToNew,
        onclickNext,
        onClickPrev

    }
}