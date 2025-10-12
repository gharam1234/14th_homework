import React from "react";

export interface IPaginationProps {
  refetch : (variable:{page:number})=> void;
  lastPage : number;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}