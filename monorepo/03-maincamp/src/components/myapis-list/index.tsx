"use client"
import styles from "./styles.module.css"
import useUtubeList from "./hook"
import { useRouter } from "next/navigation"



export default function UtubeList(){
    const router = useRouter()
    const {
        utubes,
        page,
        setPage,
        startPage,
        limit,
        totalCount,
        endPage,
        onClickToNew,
        onclickNext,
        onClickPrev,

    } = useUtubeList()


    return(
          <div className={styles.container}>
            <h1 className={styles.title}>유튜브 링크 모음집</h1>
            
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>번호</th>
                        <th>제목</th>
                        <th>링크</th>
                    </tr>
                </thead>
                <tbody>
                    {utubes.map((el,index)=>
                    <tr key={el.id} onClick={()=>{router.push(`/myapis/${el.id}`)}}>
                        <td>{totalCount-((page-1)*limit+index)}</td>
                        <td className={styles.title}>{el.title}</td>
                        <td>{el.url.slice(0, 30)}</td>
                        
                    </tr>
                )}
                </tbody>
            </table>
            <div className={styles.pagination}>
                    <button onClick={onClickPrev}>이전</button>
                {Array.from({length: endPage - startPage +1}, (_,index)=>(
                        <button onClick={()=>{setPage(startPage+index)}} key={index}>{startPage+index}</button>
                    ))}
                    <button  onClick={onclickNext}>다음</button>
            </div>
            <div className={styles.btnbox}>
            <button className={styles.btn} onClick={onClickToNew}>글 올리기</button>
            </div>
                
            
        </div>
    )
}