"use client"

import Image from 'next/image';
import styles from './styles.module.css';
import useBoardsDetail from './hook';
import { use } from 'react';
import YouTube from "react-youtube";
import { useState } from "react";

import { Tooltip } from 'antd';
import { DislikeOutlined } from '@ant-design/icons'; 
import { LikeOutlined } from '@ant-design/icons';
import { MyButton, MyInput } from "@commons/ui";
import {useForm} from 'react-hook-form'


export default function BoardsDetail() {
  const { register, formState } = useForm();
  const {onClickMove,onclickMoveList,data,videoId,imageUrls} = useBoardsDetail();

  return (
    <div className={styles.바디}>
      <div className={styles.컨테이너}>
        <main className={styles.메인}>
        <div className={styles['메인-타이틀']}>{data?.fetchBoard?.title || "로딩중..."}</div>
          <section className={styles['메인-작성자섹션']}>
            <div className={styles['메인-작성자섹션-이름날짜디브']}>
                <div className={styles['메인-작성자섹션-이름날짜디브-이름디브']}>
                    <Image
        src={"/images/프로필아이콘.png"}
        alt="프로필아이콘"
        width={24}
        height={24}
      />
                    <h2>{data?.fetchBoard?.writer || "로딩중..."}</h2>
                </div>
          
                <h2>{data?.fetchBoard?.createdAt 
    ? new Date(data.fetchBoard.createdAt).toISOString().split("T")[0]
    : "로딩중..."}</h2>
            </div>
            <hr className={styles.수평선}/>
            <div className={styles['메인-작성자섹션-아이콘디브']}>
                <Image
        src={"/images/링크아이콘.png"}
        alt="링크아이콘"
        width={24}
        height={24}
      />
                
        <Tooltip title={data?.fetchBoard?.boardAddress?.address || ""}>
          <span><Image
        src={"/images/로케이션아이콘.png"}
        alt="로케이션아이콘"
        width={24}
        height={24}
      /></span>
        </Tooltip>
            </div>
          </section>
          <section className={styles['메인-사진섹션']}>
            {[0,1,2].map((_, index)=> {
              return (
                imageUrls[index] && <Image
                  key={index}
                  src={imageUrls[index] || ""}
                  alt='샘플'
                  width={400}
                  height={531}
                />
              )
            })}
          </section>
          <section className={styles['메인-내용섹션']}>
          <div>
  {data?.fetchBoard?.contents || "로딩중..."}
</div>
          </section>
          <section className={styles['메인-동영상섹션']}>
      <YouTube videoId={videoId} opts={{ width: "822", height: "464" }} />
          </section>
          <section className={styles['메인-좋아요섹션']} >
            <div className={styles['메인-좋아요섹션-배드디브'] } >
              <DislikeOutlined />
                <span>32</span>
            </div>
            <div className={styles['메인-좋아요섹션-굿디브']}>
              <LikeOutlined  />

                <span>24</span>
                
            </div>
          </section>
          <section className={styles['메인-수정하기섹션']}>
            <MyButton variant='secondary' onClick={onclickMoveList}><img src="/images/목록으로아이콘.png" alt="삭제" />목록으로</MyButton>
            <MyButton variant="secondary" onClick={onClickMove}><img src="/images/수정하기아이콘.png" alt="수정" />수정하기</MyButton>
            
          </section>
        </main>
      </div>
    </div>
  )
}