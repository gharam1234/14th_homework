import styles from './styles.module.css'
import useCommentWrite from './hook'
import React, { useState } from "react";
import { Rate } from "antd";
import { IProps } from "./types";
import { MyInput, MyButton } from "@commons/ui";
import { useForm } from "react-hook-form";
import { ICommentSchema, commentSchema } from "@/commons/libraries/schema";
import { zodResolver } from "@hookform/resolvers/zod";







export default function CommentWrite(props:IProps) {
  const{
    // onChangeWriter,
    // onChangePassword,
    // onChangeContents,
    onSubmit,
    writer,
    password,
    contents,
    rating,
    setRating,
    isComments,
    setIsComments,
    onClickCancel,
    onClickUpdate,
    isActive,
    formState,
    handleSubmit,
    register,
    
  } = useCommentWrite(props)
  
  
  
  return (
    <div className={styles.container}>
      <div className={styles.comment__write}>
        <h2 className={styles.comment__write__title}>
          <img src="/images/chat.png" alt="" /> 댓글
        </h2>
        
        <form onSubmit={handleSubmit(props.isEdit ? onClickUpdate : onSubmit)} >
        <div className={styles.comment__write__rate}>
            <Rate onChange={setRating} value={rating} />
        </div>
        <div className={styles.comment__write__form}>
          <div className={styles.comment__write__form__input}>
            <div className={styles.comment__write__form__input__top}>
              <div className={styles.comment__write__form__input__top__left}>
                <h3>
                  작성자 <span style={{ color: 'red' }}>*</span>
                </h3>
                {/* <input
                  onChange={onChangeWriter}
                  type="text"
                  placeholder="작성자를 입력해주세요"
                  disabled={!!props.el}
                  value={props.el?.writer ?? writer}
                /> */}
                <MyInput<ICommentSchema> register={register} name="writer" type="text" placeholder="작성자를 입력해주세요" disabled={!!props.el}/>
              </div>

              <div className={styles.comment__write__form__input__top__right}>
                <h3>
                  비밀번호 <span style={{ color: 'red' }}>*</span>
                </h3>
                {/* <input
                  value={password}
                  onChange={onChangePassword}
                  type="password"
                  placeholder="비밀번호를 입력해주세요"
                  disabled={!!props.el}
                /> */}
                <MyInput<ICommentSchema> register={register} name="password" type="password" placeholder="비밀번호를 입력해주세요" disabled={!!props.el}/>
              </div>
            </div>

            <div className={styles.comment__write__form__input__bottom}>  
              <MyInput<ICommentSchema> register={register} name="contents" type='text' placeholder='댓글을 입력해주세요' defaultValue={props.el?.contents ?? contents}/>
              <div>{contents?.length}/100</div>
            </div>
          </div>
          <div className={styles.comment__write__form__buttons}>
          {props.isEdit ? <MyButton<ICommentSchema> type='button' variant="secondary" onClick={onClickCancel}>취소</MyButton> : ""}
          
          <MyButton<ICommentSchema> type='submit' disabled={!formState.isValid} formState={formState} variant="primary" >{props.isEdit ? '수정하기' : "댓글등록"}
          </MyButton>

          </div>
        </div>

        </form>
      </div>

      <p className={isComments ? styles.comment__write__none__hidden : styles.comment__write__none}>
        등록된 댓글이 없습니다
      </p>
    </div>
  )
}
