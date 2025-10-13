import { FetchBoardCommentsListQuery } from "@/gql/graphql";

export interface CommentListItemProps {
  el: NonNullable<FetchBoardCommentsListQuery["fetchBoardComments"]>[number];
}