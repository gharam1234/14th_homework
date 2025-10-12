import { gql } from "@apollo/client";


export const FETCH_BOARD = gql`
  query fetchBoardWrite($boardId: ID!) {
    fetchBoard(boardId: $boardId) {
      _id
      writer
      title
      contents
      createdAt
      images

    }
  }
`;

export const CREATE_BOARD = gql`
  # 변수의 타입 적는곳
  mutation createBoard($createBoardInput: CreateBoardInput!) {
    # 우리 실제 전달할 변수 적는곳
    createBoard(createBoardInput: $createBoardInput) {
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
export const UPDATE_BOARD = gql`
  # 변수의 타입 적는곳
  mutation updateBoard(
    $updateBoardInput: UpdateBoardInput!
    $password: String
    $boardId: ID!
  ) {
    # 우리 실제 전달할 변수 적는곳
    updateBoard(boardId: $boardId, password: $password, updateBoardInput: $updateBoardInput
    ) {
      _id
      writer
      title
      contents
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


export const UPLOAD_FILE = gql`
  mutation uploadFile($file: Upload!) {
    uploadFile(file: $file) {
      url
    }
  }
`;