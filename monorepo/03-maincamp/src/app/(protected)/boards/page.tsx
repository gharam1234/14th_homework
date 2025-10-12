"use client"

import BoardsList from '@/components/boards-list/list';
import Pagination from '@/components/boards-list/pagination';
import Search from '@/components/boards-list/search';
import { FetchBoardsSearchQuery, FetchBoardsSearchQueryVariables } from '@/gql/graphql';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { useState } from 'react';


const FETCH_BOARDS_COUNT = gql`
  query {
    fetchBoardsCount
  }
`

export const FETCH_BOARDS = gql`
  query fetchBoardsSearch($page: Int, $search: String) {
    fetchBoards(page: $page, search: $search) {
        writer
        title
        contents
        createdAt
        _id
    }
  }
`;


export default function BoardsPage() {
  const [keyword, setKeyword] = useState("");
  const { data, refetch } = useQuery<
    FetchBoardsSearchQuery,
    FetchBoardsSearchQueryVariables
  >(FETCH_BOARDS, {
    variables: {
      page: 1,
    },
  });
  const { data: dataBoardsCount } = useQuery(FETCH_BOARDS_COUNT);
  const lastPage = Math.ceil((dataBoardsCount?.fetchBoardsCount ?? 10) / 10);
  console.log(data)
  const [currentPage, setCurrentPage] = useState(1);
  // const [startPage, setStartPage] = useState(1);
  return (
    <div style={{position : "relative"}}>
      <Search refetch={refetch} setKeyword={setKeyword}/>
    <BoardsList data={data?.fetchBoards} currentPage={currentPage} setCurrentPage={setCurrentPage} keyword={keyword} setKeyword={setKeyword}/>
    <Pagination refetch={refetch} lastPage={lastPage} currentPage={currentPage} setCurrentPage={setCurrentPage}/>
    </div>
  )
}