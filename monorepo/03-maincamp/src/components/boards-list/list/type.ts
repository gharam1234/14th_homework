import { FetchBoardsQuery } from "@/gql/graphql";
import React from "react";

export interface IBoardsListProps {
  data?: FetchBoardsQuery['fetchBoards']; 
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  keyword?: string;
  setKeyword?: React.Dispatch<React.SetStateAction<string>>;
}
