"use client"

import useUtubeNew from "./hook"
import styles from "./styles.module.css"
import { useRouter } from "next/navigation"


export default function UtubeNew(){
    const router = useRouter()
    const {
        title,
        url,
        onChangeTitle,
        onChangeUrl,
        onClickSubmit,
        
    } = useUtubeNew()

    return(
        <div className={styles.container}>
            <h1 className={styles.title}>유튜브 링크 추가</h1>
            <form onSubmit={onClickSubmit}>
                <input 
                    placeholder="영상 제목" 
                    value={title} 
                    onChange={onChangeTitle} 
                />
                <textarea 
                    placeholder="유튜브 링크 URL" 
                    value={url} 
                    onChange={onChangeUrl}
                ></textarea>
                <div className={styles.btnbox}>

                <button type="button" onClick={()=>{router.push("/myapis")}} className={styles.cancel}>취소</button>
                <button className={styles.save} type="submit">저장</button>

                </div>
            </form>
        </div>
    )
}