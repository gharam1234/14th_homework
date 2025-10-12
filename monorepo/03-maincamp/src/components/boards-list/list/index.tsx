"use client"

import styles from './styles.module.css'
import useBoardsList from './hook'
import { FetchBoardQuery } from '@/gql/graphql'
import { IBoardsListProps } from './type'
import { usePagination } from '../pagination/hook'
import { FETCH_BOARD_COUNT } from './queries'
import { useQuery } from '@apollo/client'

export default function BoardsList(props:IBoardsListProps) {


  const {
    onClickDelete,
    onClickMove,
  } = useBoardsList()
  const { data } = useQuery(FETCH_BOARD_COUNT)
  const totalCount = data?.fetchBoardsCount ?? 0 
  const startNumber = totalCount - (props?.currentPage - 1) * 10

  return (

    <div className={styles.box}>
        <div className={styles.container}>
            <div className={styles.board_container}>
                <div className={styles.board}>
                    <div className={styles.board__main}>
                        <div className={styles.board__main__titlebox}>
                            <div className={styles.board__main__titlebox__number}>번호</div>
                            <div className={styles.board__main__titlebox__title}>제목 </div>
                            <div className={styles.board__main__titlebox__writer}>작성자</div>
                            <div className={styles.board__main__titlebox__date}>날짜</div>
                        </div>
                        <div className={styles.board__main__articlebox}>
                            {props.data?.map((el: FetchBoardQuery['fetchBoard'], index:number) => (
                                <div key={el._id} className={styles.board__main__articlebox__item} onClick={() => onClickMove(el._id)}>
                                    <div className={styles.board__main__articlebox__item__number}>  {startNumber - index} </div>
                                    <div className={styles.board__main__articlebox__item__title} >
                                          {el.title
              .replaceAll(`${props.keyword}`, `$%^${props.keyword}$%^`)
              .split("$%^")
              .map((el, index) => (
                <span
                  key={`${el}_${index}`}
                  style={{ color: el === `${props.keyword}` ? "red" : "black" }}
                >
                  {el}
                </span>
              ))}
                                    </div>
                                    <div className={styles.board__main__articlebox__item__writer}>{el.writer}</div>
                                    <div className={styles.board__main__articlebox__item__date}>{new Date(el.createdAt).toISOString().split("T")[0]}</div>
                                    <button className={styles.board__main__articlebox__item__delete} id={el._id} onClick={onClickDelete}>
                                                        <img
                                                        src={"/images/delete.png"}
                                                          alt="삭제"
                                                        />
                                                        </button>
                                                        
                                </div>
                            ))}
                        </div>
                    </div>


                </div>
            </div>
        </div>
    </div>
  )
}