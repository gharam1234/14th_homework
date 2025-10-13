"use client"

// import Image from 'next/image';
// import styles from './styles.module.css';
// import {useRouter, useParams } from 'next/navigation';
// import {gql, useQuery, useMutation} from '@apollo/client';
import BoardsDetail from '@/components/boards-detail';
import CommentList from '@/components/boards-detail/comment-list';
import CommentWrite from '@/components/boards-detail/comment-write';
import { IProps } from '@/components/boards-detail/comment-write/types';

import { useState } from 'react';


export default function BoardsDetailPage() {

  const [isEdit, setIsEdit] = useState(false);
   const [el, setEl] = useState<IProps["el"]>(null);
  return (
    <>
    <BoardsDetail/>
    <CommentWrite setIsEdit={setIsEdit} isEdit={isEdit} el={el}/>
    <CommentList/>
    
    </>
  )
   
}