import { FetchBoardCommentsWriteQuery } from "@/gql/graphql";
import { Dispatch, SetStateAction } from "react";
import { FetchBoardCommentsListQuery } from "@/gql/graphql";


export interface IMyvariables {
    boardCommentId: string
    password: string
    
    updateBoardCommentInput: {
      contents?: string
      rating?: number
    }
  
  }

  export interface IUseCommentWriteProps {
  setIsEdit: Dispatch<SetStateAction<boolean>>;
  el?: NonNullable<FetchBoardCommentsWriteQuery["fetchBoardComments"]>[number] | null;
  isEdit: boolean;
}

export interface IComment {
  _id?: string;
  writer?: string;
  contents?: string;
  createdAt?: string;
  rating?: number;
}

export interface IProps {
  setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
  isEdit: boolean;
  el?: NonNullable<FetchBoardCommentsListQuery["fetchBoardComments"]>[number] | null;
}
