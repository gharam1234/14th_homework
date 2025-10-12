"use client";

import React, { useEffect , useState } from "react";
import { Modal } from "antd";
import DaumPostcodeEmbed from "react-daum-postcode";

import styles from './styles.module.css'
import Image from 'next/image';
import {ChangeEvent} from 'react';
import useBoardWrite from './hook'
import { IBoardWriteProps } from './types';
import { MyButton, MyInput } from "@commons/ui";
import { useForm } from "react-hook-form";
import { ISchema } from "@/commons/libraries/schema";






export default function BoardsWrite(props:IBoardWriteProps) {
  // const { formState } = useForm();
  const {
    handleSubmit,
    register,
    // onChangeInputs,
    onClickMoveList,
    // onChangePassword,
    // validation,
    onClickSubmit,
    onClickUpdate,
    isActive,
    // errorContents,
    // errorPassword,
    // errorTitle,
    // errorWriter,
    zipcode,
    address,
    isModalOpen,
    onToggleModal,
    handleComplete,
    // onChangeAddressDetail,
    // onChangeYoutubeUrl,
    onChangeFile,
    imageUrls,
    onClickDeleteFile,
    setImageUrls,
    // setInputs,
    // setYoutubeUrl,
    // setZonecode,
    // setAddress,
    // setDetailAddress,
    fileRefs,
    onClickGrayBox,
    formState,
    typedFormState,

  } = useBoardWrite(props)


  
  
  return (  <div className={styles.container}>
      <header>
          <h1>게시물{props.isEdit ? "수정" : "등록"}</h1>
      </header>
      <form onSubmit={handleSubmit(props.isEdit ? onClickUpdate : onClickSubmit)}>
          
          <section className={styles.메인__작성자비밀번호섹션}>
              <section className={styles.메인__작성자비밀번호섹션__작성자섹션}>
                  <h2>작성자<img
                          src={"/images/별표.png"}
                          alt="별표"
                        /></h2>
                  {/* <input {...register("writer")} id={"writer"}  type="text" placeholder="작성자 명을 입력해주세요" defaultValue={props.data?.fetchBoard?.writer ?? ""}/> */}
                  <MyInput<ISchema> register={register} name="writer" type="text" placeholder="작성자 명을 입력해주세요" defaultValue={props.data?.fetchBoard?.writer ?? ""}/>
                  <div className={`${styles['color-red']} ${styles['Font-h2']}`}>{formState.errors.writer?.message}</div>
              </section>
              <section className={styles.메인__작성자비밀번호섹션__비밀번호섹션}>
                  <h2>비밀번호<img
                          src={"/images/별표.png"}
                          alt="별표"
                        /></h2>
                  {/* <input {...register("password")} id={"password"} type="password" placeholder="비밀번호를 입력해주세요"/> */}
                  <MyInput<ISchema> register={register} name="password" type="password" placeholder="비밀번호를 입력해주세요" />
                 <div className={`${styles['color-red']} ${styles['Font-h2']}`}>{formState.errors.password?.message}</div>
              </section>
          </section>
          <hr/>
          <section className={styles.메인__제목섹션}>
              <h2>제목<img
                      src={"/images/별표.png"}
                      alt="별표"
                      width={8}
                      height={8}
                    /></h2>
              {/* <input {...register("title")} id={"title"} type="text" placeholder="제목 입력해주세요" defaultValue={props.data?.fetchBoard?.title ?? ""}/> */}
              <MyInput<ISchema> register={register} name="title" type="text" placeholder="제목 입력해주세요" defaultValue={props.data?.fetchBoard?.title?? ""}/>
              <div className={`${styles['color-red']} ${styles['Font-h2']}`}>{formState.errors.title?.message}</div>
          </section>
          <hr/>
          <section className={styles.메인__내용섹션}>
              <h2>내용<img
                      src={"/images/별표.png"}
                      alt="별표"
                      width={8}
                      height={8}
                    /></h2>
              {/* <input {...register("contents")} id={"contents"} type="text" placeholder="내용을 입력해주세요" defaultValue={props.data?.fetchBoard?.contents ?? ""}/> */}
              <MyInput<ISchema> register={register} name="contents" type="text" placeholder="내용을 입력해주세요" defaultValue={props.data?.fetchBoard?.contents ?? ""}/>
              <div className={`${styles['color-red']} ${styles['Font-h2']}`}>{formState.errors.contents?.message}</div>
          </section>
          <section className={styles.메인__주소섹션}>
              <article className={styles.메인__주소섹션__상단아티클}>
                  <h2>주소</h2>
                  <div className={styles.메인__주소섹션__상단아티클__내용}>
                      {/* <input readOnly value={zipcode || props.data?.fetchBoard?.boardAddress?.zipcode || ""} type="text" disabled/> */}
                      <MyInput<ISchema> readonly register={register} name="boardAddress.zipcode"type="text" disabled={true}/>
                       <button type="button" onClick={onToggleModal} >우편번호 검색</button>
    
      {isModalOpen === true && (
        <Modal
          title="우편번호 & 주소찾기"
          open={true}
          onOk={onToggleModal}
          onCancel={onToggleModal}
        > 
          <DaumPostcodeEmbed onComplete={handleComplete}/>
        </Modal>
      )}
                  </div>
              </article>
              {/* <input readOnly type="text" placeholder="주소를 입력해주세요" value={address || props.data?.fetchBoard?.boardAddress?.address || ""} /> */}
              <MyInput<ISchema> readonly register={register} name="boardAddress.address" type="text" placeholder="주소를 입력해주세요"/>
              {/* <input {...register("boardAddress.addressDetail")} type="text" placeholder="상세주소를 입력해주세요" defaultValue={props.data?.fetchBoard?.boardAddress?.addressDetail ?? ""}/> */}
              <MyInput<ISchema> register={register} name="boardAddress.addressDetail" type="text" placeholder="상세주소를 입력해주세요" defaultValue={props.data?.fetchBoard?.boardAddress?.addressDetail ?? ""}/>
          </section>
          <hr/>
          <section className={styles.메인__유튜브링크섹션}>
              <h2>유튜브링크</h2>
              {/* <input {...register("youtubeUrl")} id={"youtubeUrl"}type="text" placeholder="링크를 입력해주세요" defaultValue={props.data?.fetchBoard?.youtubeUrl ?? ""}/> */}
              <MyInput<ISchema> register={register} name="youtubeUrl" type="text" placeholder="링크를 입력해주세요" defaultValue={props.data?.fetchBoard?.youtubeUrl ?? ""}/>
          </section>
          <hr/>
      <section className={styles.메인__사진첨부섹션}>
  <h2>사진첨부</h2>
    <article className={styles.메인__사진첨부섹션__아티클}>
      {imageUrls.map((url, index) => (
        <div key={index} style={{ display: "flex", marginRight: "10px" }}>
          <div
            style={{
              width: "200px",
              height: "200px",
              backgroundColor: "gray",
              cursor: "pointer",
            }}
            onClick={(event) => onClickGrayBox(index,event)}
          >
          
            {url ? (
              <div className={styles.imageBox}>
              <img
                src={url}
                alt={`업로드된 이미지 ${index + 1}`}
                width={200}
                height={200}
                style={{ objectFit: "contain" }}
              />
              <button type="button" className={styles.deleteBtn} onClick={(event) => onClickDeleteFile(index,event)}>X</button>
              </div>
              
            ) : (
                <Image
                  src={"/images/사진업로드.png"}
                  alt="사진업로드"
                  width={200}
                  height={200}
                />
            )}
          </div>
            
          <input
            id={`fileInput_${index}`}
            style={{ display: "none" }}
            type="file"
            ref={fileRefs[index]}
            accept="image/jpeg, image/png"
            onChange={(event) => onChangeFile(index, event)}
            
          />
        </div>
      ))}
    </article>
</section>
          <section className={styles.메인__등록하기섹션}>
              <MyButton<ISchema> formState={formState} variant="secondary" onClick={onClickMoveList}>취소</MyButton>
              <MyButton<ISchema> formState={formState} variant="primary" type="submit">{props.isEdit ? "수정하기" : "등록하기"}</MyButton>

              {/* <button type="button" onClick={onClickMoveList} className={styles.메인__등록하기섹션__취소버튼}>취소</button> */}
              {/* <button type="submit" >{props.isEdit ? "수정하기" : "등록하기"}</button> */}
              
          </section>

      </form>
   </div>
      
  );
}
