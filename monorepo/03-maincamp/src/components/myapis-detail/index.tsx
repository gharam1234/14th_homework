"use client"
import YouTube from "react-youtube";
import styles from "./styles.module.css"
import useUtubeDetail from "./hook"




export default function UtubeDetail(){
    const {
        utube,
        onClickToEdit,
        onClickDelete,
        videoId
    } = useUtubeDetail()
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>{utube?.title}</h1>
            <div className={styles.video}>
            <YouTube videoId={videoId} opts={{ width: "822", height: "464" }} />
            </div>

            <div className={styles.btnbox}>
            <button className={styles.edit} onClick={onClickToEdit}>수정</button>
            <button className={styles.delete} onClick={onClickDelete}>삭제</button>

            </div>
        </div>
    )
}