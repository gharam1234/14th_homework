"use client"
import useUtubeEdit from "./hook"
import styles from "./styles.module.css"

export default function UtubeEdit(){
    const {title, url, onChangeTitle, onChangeUrl, onClickSubmit} = useUtubeEdit()

    return(

         <div className={styles.container}>
            <h1 className={styles.title}>유튜브 링크 수정</h1>
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

                <button className={styles.save} type="submit">수정</button>

                </div>
            </form>
        </div>
    )
}