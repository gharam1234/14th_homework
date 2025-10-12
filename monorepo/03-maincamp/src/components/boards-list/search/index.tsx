"use client";

// import _ from "lodash";
import styles from './styles.module.css'
import React from 'react';
import { ISearchProps } from "./types";
import UseSearch from "./hook";
import { MyButton } from '@commons/ui';
import {useForm} from 'react-hook-form'



export default function Search(props: ISearchProps) {
  const { onChangeKeyword, onClickMove } = UseSearch(props);
  const { formState } = useForm();

  return (
    <>
    <div className={styles.box}>
    <h1 className={styles.title}>트립토크 게시판</h1>
    <div className={styles.wrapper}>
        <div className={styles.search}>
            <img src="/images/search.png" className={styles.searchIcon} /><input placeholder="제목을 검색해 주세요" type="text" onChange={onChangeKeyword} />
            <button className={styles.searchBtn}>검색</button>
        </div>
        {/* <button className={styles.registerBtn} onClick={onClickMove}><img src="/images/registerBtn.png" alt="" />트립토크 등록</button> */}
        <MyButton variant="primary" onClick={onClickMove}><img src="/images/registerBtn.png" alt="" />트립토크 등록</MyButton>
    </div>
    </div>
    </>
  );
}
