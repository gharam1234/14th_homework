import { gql } from "@apollo/client";

export const FETCH_BOARDS = gql`
  query{
  fetchBoards(
    page:1
  ){
    writer
    title
    contents
    createdAt
    _id
  }
}
`;
export const DELETE_BOARD = gql`
  mutation deleteBoard($boardId: ID!){
  deleteBoard(boardId:$boardId)
  }

`;

export const FETCH_BOARD_COUNT = gql`
  query{
  fetchBoardsCount
  }
`;