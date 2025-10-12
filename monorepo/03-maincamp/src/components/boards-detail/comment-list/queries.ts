import { gql } from "@apollo/client";


export const FETCH_COMMENTS = gql`
  query fetchBoardCommentsList($page: Int, $boardId: ID!) {
    fetchBoardComments(page: $page, boardId: $boardId) {
      _id
      writer
      contents
      createdAt
      rating
    }
  }
`;

