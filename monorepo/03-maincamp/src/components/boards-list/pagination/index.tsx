"use client";

import { usePagination } from "./hook";
import styles from "./styles.module.css";
import { IPaginationProps } from "./type";


export default function Pagination(props:IPaginationProps) {
  const { startPage, onClickNext, onClickPage, onClickPrev , activePage } =
    usePagination(props);
  return (
    <div className={styles.container}>
      <button className={startPage === 1 ? styles.prev : "" } onClick={onClickPrev}>{}{`<`}</button>
      
      {new Array(10).fill("box").map(
        (_, index) =>
          index + startPage <= props.lastPage && (
            <button
              id={String(index + startPage)}
              onClick={onClickPage}
              key={index + startPage}
              className={startPage+ index === activePage ? styles.IsActive : styles.notActive}
            >
              {index + startPage}
            </button>
          )
      )}
      <button className={startPage + 10 > props.lastPage ? styles.next : ""} onClick={onClickNext}>{`>`}</button>
    </div>
  );
}
