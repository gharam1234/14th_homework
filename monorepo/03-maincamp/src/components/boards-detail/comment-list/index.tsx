import { gql, useQuery } from "@apollo/client";
import { useParams } from "next/navigation";
import style from './styles.module.css'
import { FETCH_COMMENTS } from './queries'
import { FetchBoardCommentsListQuery } from "@/gql/graphql";

import InfiniteScroll from 'react-infinite-scroll-component';
import { Rate } from 'antd';
import { useState } from "react";

import CommentListItem from "../comment-list-item"


export default function CommentList(){
    const [hasMore,setHasMore] = useState(true)
    const { boardId } = useParams()
    const { data,fetchMore } = useQuery(FETCH_COMMENTS,{
        variables:{
            page:1,
            boardId : boardId
        }
    }
)

    const onNext = () => {
        if(data ===undefined) return;
        fetchMore({
            variables:{page: Math.ceil((data.fetchBoardComments.length ?? 10) / 10) + 1},
            updateQuery:(prev, {fetchMoreResult}) => {
                if(!fetchMoreResult.fetchBoardComments?.length){
                    setHasMore(false)
                    return;
                }
                return{
                    fetchBoardComments: [...prev.fetchBoardComments, ...fetchMoreResult.fetchBoardComments]
                }
            }
        })
    }

    return(
        <InfiniteScroll
        dataLength={data?.fetchBoardComments?.length ?? 0}
        hasMore={hasMore}
        next={onNext}
        loader={<div>로딩중입니다</div>}
      >
        {data?.fetchBoardComments?.map((el:FetchBoardCommentsListQuery["fetchBoardComments"][number])=>(
            <CommentListItem el={el} key={el._id}/>
        ))
        }
        </InfiniteScroll>
    )
}