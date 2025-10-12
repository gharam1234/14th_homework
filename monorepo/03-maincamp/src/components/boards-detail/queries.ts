import { gql } from "@apollo/client";

export const FETCH_BOARD = gql`
  query fetchBoardDetail($boardId: ID!) {
    fetchBoard(boardId: $boardId) {
      _id
      writer
      title
      contents
      createdAt
      youtubeUrl
      boardAddress{
        zipcode
        address
        addressDetail
      }
      images
    }
  }
`;
