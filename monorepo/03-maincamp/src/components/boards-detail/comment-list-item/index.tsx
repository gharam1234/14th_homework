 "use client"

import { Modal, Rate } from "antd"
import style from './styles.module.css'
import { useState } from "react"
import CommentWrite from "../comment-write"
   
import { CommentListItemProps } from "./types"
import { gql, useMutation } from "@apollo/client"
import { useParams } from "next/navigation"

const DELETE_COMMENT = gql`
   mutation deleteBoardComment($password:String,$boardCommentId:ID!){
      deleteBoardComment(password:$password,boardCommentId:$boardCommentId)
   }
`
const FETCH_COMMENTS = gql`
   query fetchBoardCommentsListItem($page: Int, $boardId: ID!) {
      fetchBoardComments(page: $page, boardId: $boardId){
         _id
         writer
         contents
         rating
         createdAt
      }
   }
`



 export default function CommentListItem({ el }: CommentListItemProps){
   const {boardId} = useParams()
   console.log("boardId:", boardId)
   const [deleteComment] = useMutation(DELETE_COMMENT)
   const [isEdit,setIsEdit] = useState(false)
   const onClickEdit = () => {
      setIsEdit(true)
   }
   const onClickDelete = async () => {
      const checkPassword = prompt("비밀번호를 입력해주세요")
      if (!checkPassword) return 
        try {
         await deleteComment({
            variables:{
               password: checkPassword,
               boardCommentId:el._id
            },
            refetchQueries:[{
               query:FETCH_COMMENTS,variables:{
                  page:1,
                  boardId:String(boardId)
               }
            }],
            awaitRefetchQueries: true,
            
         
         })
        }catch(error:any){
         Modal.error({
            content: error.message || "댓글 삭제중 오류가 발생했습니다"
         })
        }
   }
    return(
              isEdit ? <CommentWrite isEdit={isEdit} setIsEdit={setIsEdit} el={el}/> :
                       <div className={style.comment}>
                           <div className={style.header}>
                             <div className={style.headerLeft}>
                                <div className={style.writer}><img src="/images/user.png" alt="" />{el.writer}</div>
                                <div className={style.rating}>
                                <Rate disabled defaultValue={el.rating} />
                                </div>

                             </div>
                             <div className={style.headerRight}>
                                <button onClick={onClickEdit} className={style.edit}>
                                 <img src="/images/comment_edit.png" alt="" />
                                 </button>
                                 <button onClick={onClickDelete} className={style.delete}>
                                <img src="/images/comment_close.png" alt="" />
                                 </button>
                                
                             </div>
                           </div>
                           <div className={style.contents}>{el.contents}</div>
                           <div className={style.createdAt}>{new Date(el.createdAt).toISOString().split("T")[0]}</div>
                       </div>

              
                  

    )


 }
 