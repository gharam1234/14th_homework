"use client"

import {useRouter, useParams } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { FETCH_BOARD } from './queries';
import { useEffect, useState } from 'react';





export default function useBoardsDetail() {
  // const [checkBoardPassword] = useMutation(CHECK_BOARD_PASSWORD);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const params = useParams()
  console.log(useParams())
  console.log(params)
  const { data } = useQuery(FETCH_BOARD,{
    variables:{
     boardId: String(params.boardId)
    }
  })
  console.log(data)
  const router = useRouter()
  
const onClickMove = () => {
  router.push(`/boards/${params.boardId}/edit`);
  }
const onclickMoveList = () => {
  router.push(`/boards`);
  }
  const videoId = (data?.fetchBoard?.youtubeUrl?.match(/v=([a-zA-Z0-9_-]+)/)?.[1]);

useEffect(() => {
  const images = data?.fetchBoard?.images as (string | null | undefined)[] | undefined;

  if (images) {
    const urls = images
      .filter((img): img is string => !!img)
      .map((imageUrl) =>
        imageUrl.startsWith("http")
          ? imageUrl
          : `https://storage.googleapis.com/${imageUrl}`
      );
    setImageUrls(urls);
  }
}, [data]);
  return{
    onclickMoveList,
    onClickMove,
    data,
    videoId,
    imageUrls,
  }
}