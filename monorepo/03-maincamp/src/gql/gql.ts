/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  query fetchBoard($boardId: ID!) {\n    fetchBoard(boardId: $boardId) {\n      _id\n      writer\n      title\n      contents\n      createdAt\n      youtubeUrl\n      boardAddress{\n        zipcode\n        address\n        addressDetail\n      }\n      images\n    }\n  }\n": typeof types.FetchBoardDocument,
    "\n  query fetchBoardsSearch($page: Int, $search: String) {\n    fetchBoards(page: $page, search: $search) {\n        writer\n        title\n        contents\n        createdAt\n        _id\n    }\n  }\n": typeof types.FetchBoardsSearchDocument,
    "\n   mutation deleteBoardComment($password:String,$boardCommentId:ID!){\n      deleteBoardComment(password:$password,boardCommentId:$boardCommentId)\n   }\n": typeof types.DeleteBoardCommentDocument,
    "\n   query fetchBoardCommentsListItem($page: Int, $boardId: ID!) {\n      fetchBoardComments(page: $page, boardId: $boardId){\n         _id\n         writer\n         contents\n         rating\n         createdAt\n      }\n   }\n": typeof types.FetchBoardCommentsListItemDocument,
    "\n  query fetchBoardCommentsList($page: Int, $boardId: ID!) {\n    fetchBoardComments(page: $page, boardId: $boardId) {\n      _id\n      writer\n      contents\n      createdAt\n      rating\n    }\n  }\n": typeof types.FetchBoardCommentsListDocument,
    "\n  query fetchBoardCommentsWrite ($page: Int, $boardId: ID!) {\n    fetchBoardComments(page: $page, boardId: $boardId) {\n      _id\n      writer\n      contents\n      createdAt\n      rating\n    }\n  }\n": typeof types.FetchBoardCommentsWriteDocument,
    "\n  mutation createBoardComment(\n    $createBoardCommentInput: CreateBoardCommentInput!\n    $boardId: ID!\n  ) {\n    createBoardComment(\n      createBoardCommentInput: $createBoardCommentInput\n      boardId: $boardId\n    ) {\n      _id\n      writer\n      contents\n      createdAt\n      rating\n    }\n  }\n": typeof types.CreateBoardCommentDocument,
    "\n  mutation updateBoardComment(\n    $updateBoardCommentInput: UpdateBoardCommentInput!\n    $password: String\n    $boardCommentId: ID!\n  ) {\n    updateBoardComment(\n      updateBoardCommentInput: $updateBoardCommentInput\n      password: $password\n      boardCommentId: $boardCommentId\n    ) {\n      _id\n      writer\n      contents\n      createdAt\n      rating\n    }\n  }\n": typeof types.UpdateBoardCommentDocument,
    "\n  query fetchBoardDetail($boardId: ID!) {\n    fetchBoard(boardId: $boardId) {\n      _id\n      writer\n      title\n      contents\n      createdAt\n      youtubeUrl\n      boardAddress{\n        zipcode\n        address\n        addressDetail\n      }\n      images\n    }\n  }\n": typeof types.FetchBoardDetailDocument,
    "\n  mutation deleteBoard($boardId: ID!){\n  deleteBoard(boardId:$boardId)\n  }\n\n": typeof types.DeleteBoardDocument,
    "\n  query fetchBoardWrite($boardId: ID!) {\n    fetchBoard(boardId: $boardId) {\n      _id\n      writer\n      title\n      contents\n      createdAt\n      images\n\n    }\n  }\n": typeof types.FetchBoardWriteDocument,
    "\n  # 변수의 타입 적는곳\n  mutation createBoard($createBoardInput: CreateBoardInput!) {\n    # 우리 실제 전달할 변수 적는곳\n    createBoard(createBoardInput: $createBoardInput) {\n      _id\n      writer\n      title\n      contents\n      createdAt\n      youtubeUrl\n      boardAddress{\n        zipcode\n        address\n        addressDetail\n      }\n      images\n    }\n  }\n": typeof types.CreateBoardDocument,
    "\n  # 변수의 타입 적는곳\n  mutation updateBoard(\n    $updateBoardInput: UpdateBoardInput!\n    $password: String\n    $boardId: ID!\n  ) {\n    # 우리 실제 전달할 변수 적는곳\n    updateBoard(boardId: $boardId, password: $password, updateBoardInput: $updateBoardInput\n    ) {\n      _id\n      writer\n      title\n      contents\n      youtubeUrl\n      boardAddress{\n        zipcode\n        address\n        addressDetail\n      }\n      images\n    }\n  }\n": typeof types.UpdateBoardDocument,
    "\n  mutation uploadFile($file: Upload!) {\n    uploadFile(file: $file) {\n      url\n    }\n  }\n": typeof types.UploadFileDocument,
    "\n    mutation loginUser($email: String!, $password: String!){\n        loginUser(email: $email, password: $password){\n            accessToken\n        }\n    }\n": typeof types.LoginUserDocument,
    "\n    mutation createUser($createUserInput: CreateUserInput!){\n       createUser(createUserInput: $createUserInput){\n        _id\n        email\n        name\n       } \n    }\n": typeof types.CreateUserDocument,
    "\n  query FetchUserLoggedIn {\n    fetchUserLoggedIn {\n      _id\n      name\n      picture\n      email\n      userPoint {\n        amount\n      }\n    }\n  }\n": typeof types.FetchUserLoggedInDocument,
    "\n  mutation createPointTransactionOfLoading($paymentId: ID!) {\n    createPointTransactionOfLoading(paymentId: $paymentId) {\n      _id\n      amount\n      balance\n      status\n      impUid\n    }\n  }\n": typeof types.CreatePointTransactionOfLoadingDocument,
};
const documents: Documents = {
    "\n  query fetchBoard($boardId: ID!) {\n    fetchBoard(boardId: $boardId) {\n      _id\n      writer\n      title\n      contents\n      createdAt\n      youtubeUrl\n      boardAddress{\n        zipcode\n        address\n        addressDetail\n      }\n      images\n    }\n  }\n": types.FetchBoardDocument,
    "\n  query fetchBoardsSearch($page: Int, $search: String) {\n    fetchBoards(page: $page, search: $search) {\n        writer\n        title\n        contents\n        createdAt\n        _id\n    }\n  }\n": types.FetchBoardsSearchDocument,
    "\n   mutation deleteBoardComment($password:String,$boardCommentId:ID!){\n      deleteBoardComment(password:$password,boardCommentId:$boardCommentId)\n   }\n": types.DeleteBoardCommentDocument,
    "\n   query fetchBoardCommentsListItem($page: Int, $boardId: ID!) {\n      fetchBoardComments(page: $page, boardId: $boardId){\n         _id\n         writer\n         contents\n         rating\n         createdAt\n      }\n   }\n": types.FetchBoardCommentsListItemDocument,
    "\n  query fetchBoardCommentsList($page: Int, $boardId: ID!) {\n    fetchBoardComments(page: $page, boardId: $boardId) {\n      _id\n      writer\n      contents\n      createdAt\n      rating\n    }\n  }\n": types.FetchBoardCommentsListDocument,
    "\n  query fetchBoardCommentsWrite ($page: Int, $boardId: ID!) {\n    fetchBoardComments(page: $page, boardId: $boardId) {\n      _id\n      writer\n      contents\n      createdAt\n      rating\n    }\n  }\n": types.FetchBoardCommentsWriteDocument,
    "\n  mutation createBoardComment(\n    $createBoardCommentInput: CreateBoardCommentInput!\n    $boardId: ID!\n  ) {\n    createBoardComment(\n      createBoardCommentInput: $createBoardCommentInput\n      boardId: $boardId\n    ) {\n      _id\n      writer\n      contents\n      createdAt\n      rating\n    }\n  }\n": types.CreateBoardCommentDocument,
    "\n  mutation updateBoardComment(\n    $updateBoardCommentInput: UpdateBoardCommentInput!\n    $password: String\n    $boardCommentId: ID!\n  ) {\n    updateBoardComment(\n      updateBoardCommentInput: $updateBoardCommentInput\n      password: $password\n      boardCommentId: $boardCommentId\n    ) {\n      _id\n      writer\n      contents\n      createdAt\n      rating\n    }\n  }\n": types.UpdateBoardCommentDocument,
    "\n  query fetchBoardDetail($boardId: ID!) {\n    fetchBoard(boardId: $boardId) {\n      _id\n      writer\n      title\n      contents\n      createdAt\n      youtubeUrl\n      boardAddress{\n        zipcode\n        address\n        addressDetail\n      }\n      images\n    }\n  }\n": types.FetchBoardDetailDocument,
    "\n  mutation deleteBoard($boardId: ID!){\n  deleteBoard(boardId:$boardId)\n  }\n\n": types.DeleteBoardDocument,
    "\n  query fetchBoardWrite($boardId: ID!) {\n    fetchBoard(boardId: $boardId) {\n      _id\n      writer\n      title\n      contents\n      createdAt\n      images\n\n    }\n  }\n": types.FetchBoardWriteDocument,
    "\n  # 변수의 타입 적는곳\n  mutation createBoard($createBoardInput: CreateBoardInput!) {\n    # 우리 실제 전달할 변수 적는곳\n    createBoard(createBoardInput: $createBoardInput) {\n      _id\n      writer\n      title\n      contents\n      createdAt\n      youtubeUrl\n      boardAddress{\n        zipcode\n        address\n        addressDetail\n      }\n      images\n    }\n  }\n": types.CreateBoardDocument,
    "\n  # 변수의 타입 적는곳\n  mutation updateBoard(\n    $updateBoardInput: UpdateBoardInput!\n    $password: String\n    $boardId: ID!\n  ) {\n    # 우리 실제 전달할 변수 적는곳\n    updateBoard(boardId: $boardId, password: $password, updateBoardInput: $updateBoardInput\n    ) {\n      _id\n      writer\n      title\n      contents\n      youtubeUrl\n      boardAddress{\n        zipcode\n        address\n        addressDetail\n      }\n      images\n    }\n  }\n": types.UpdateBoardDocument,
    "\n  mutation uploadFile($file: Upload!) {\n    uploadFile(file: $file) {\n      url\n    }\n  }\n": types.UploadFileDocument,
    "\n    mutation loginUser($email: String!, $password: String!){\n        loginUser(email: $email, password: $password){\n            accessToken\n        }\n    }\n": types.LoginUserDocument,
    "\n    mutation createUser($createUserInput: CreateUserInput!){\n       createUser(createUserInput: $createUserInput){\n        _id\n        email\n        name\n       } \n    }\n": types.CreateUserDocument,
    "\n  query FetchUserLoggedIn {\n    fetchUserLoggedIn {\n      _id\n      name\n      picture\n      email\n      userPoint {\n        amount\n      }\n    }\n  }\n": types.FetchUserLoggedInDocument,
    "\n  mutation createPointTransactionOfLoading($paymentId: ID!) {\n    createPointTransactionOfLoading(paymentId: $paymentId) {\n      _id\n      amount\n      balance\n      status\n      impUid\n    }\n  }\n": types.CreatePointTransactionOfLoadingDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query fetchBoard($boardId: ID!) {\n    fetchBoard(boardId: $boardId) {\n      _id\n      writer\n      title\n      contents\n      createdAt\n      youtubeUrl\n      boardAddress{\n        zipcode\n        address\n        addressDetail\n      }\n      images\n    }\n  }\n"): (typeof documents)["\n  query fetchBoard($boardId: ID!) {\n    fetchBoard(boardId: $boardId) {\n      _id\n      writer\n      title\n      contents\n      createdAt\n      youtubeUrl\n      boardAddress{\n        zipcode\n        address\n        addressDetail\n      }\n      images\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query fetchBoardsSearch($page: Int, $search: String) {\n    fetchBoards(page: $page, search: $search) {\n        writer\n        title\n        contents\n        createdAt\n        _id\n    }\n  }\n"): (typeof documents)["\n  query fetchBoardsSearch($page: Int, $search: String) {\n    fetchBoards(page: $page, search: $search) {\n        writer\n        title\n        contents\n        createdAt\n        _id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n   mutation deleteBoardComment($password:String,$boardCommentId:ID!){\n      deleteBoardComment(password:$password,boardCommentId:$boardCommentId)\n   }\n"): (typeof documents)["\n   mutation deleteBoardComment($password:String,$boardCommentId:ID!){\n      deleteBoardComment(password:$password,boardCommentId:$boardCommentId)\n   }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n   query fetchBoardCommentsListItem($page: Int, $boardId: ID!) {\n      fetchBoardComments(page: $page, boardId: $boardId){\n         _id\n         writer\n         contents\n         rating\n         createdAt\n      }\n   }\n"): (typeof documents)["\n   query fetchBoardCommentsListItem($page: Int, $boardId: ID!) {\n      fetchBoardComments(page: $page, boardId: $boardId){\n         _id\n         writer\n         contents\n         rating\n         createdAt\n      }\n   }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query fetchBoardCommentsList($page: Int, $boardId: ID!) {\n    fetchBoardComments(page: $page, boardId: $boardId) {\n      _id\n      writer\n      contents\n      createdAt\n      rating\n    }\n  }\n"): (typeof documents)["\n  query fetchBoardCommentsList($page: Int, $boardId: ID!) {\n    fetchBoardComments(page: $page, boardId: $boardId) {\n      _id\n      writer\n      contents\n      createdAt\n      rating\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query fetchBoardCommentsWrite ($page: Int, $boardId: ID!) {\n    fetchBoardComments(page: $page, boardId: $boardId) {\n      _id\n      writer\n      contents\n      createdAt\n      rating\n    }\n  }\n"): (typeof documents)["\n  query fetchBoardCommentsWrite ($page: Int, $boardId: ID!) {\n    fetchBoardComments(page: $page, boardId: $boardId) {\n      _id\n      writer\n      contents\n      createdAt\n      rating\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation createBoardComment(\n    $createBoardCommentInput: CreateBoardCommentInput!\n    $boardId: ID!\n  ) {\n    createBoardComment(\n      createBoardCommentInput: $createBoardCommentInput\n      boardId: $boardId\n    ) {\n      _id\n      writer\n      contents\n      createdAt\n      rating\n    }\n  }\n"): (typeof documents)["\n  mutation createBoardComment(\n    $createBoardCommentInput: CreateBoardCommentInput!\n    $boardId: ID!\n  ) {\n    createBoardComment(\n      createBoardCommentInput: $createBoardCommentInput\n      boardId: $boardId\n    ) {\n      _id\n      writer\n      contents\n      createdAt\n      rating\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation updateBoardComment(\n    $updateBoardCommentInput: UpdateBoardCommentInput!\n    $password: String\n    $boardCommentId: ID!\n  ) {\n    updateBoardComment(\n      updateBoardCommentInput: $updateBoardCommentInput\n      password: $password\n      boardCommentId: $boardCommentId\n    ) {\n      _id\n      writer\n      contents\n      createdAt\n      rating\n    }\n  }\n"): (typeof documents)["\n  mutation updateBoardComment(\n    $updateBoardCommentInput: UpdateBoardCommentInput!\n    $password: String\n    $boardCommentId: ID!\n  ) {\n    updateBoardComment(\n      updateBoardCommentInput: $updateBoardCommentInput\n      password: $password\n      boardCommentId: $boardCommentId\n    ) {\n      _id\n      writer\n      contents\n      createdAt\n      rating\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query fetchBoardDetail($boardId: ID!) {\n    fetchBoard(boardId: $boardId) {\n      _id\n      writer\n      title\n      contents\n      createdAt\n      youtubeUrl\n      boardAddress{\n        zipcode\n        address\n        addressDetail\n      }\n      images\n    }\n  }\n"): (typeof documents)["\n  query fetchBoardDetail($boardId: ID!) {\n    fetchBoard(boardId: $boardId) {\n      _id\n      writer\n      title\n      contents\n      createdAt\n      youtubeUrl\n      boardAddress{\n        zipcode\n        address\n        addressDetail\n      }\n      images\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation deleteBoard($boardId: ID!){\n  deleteBoard(boardId:$boardId)\n  }\n\n"): (typeof documents)["\n  mutation deleteBoard($boardId: ID!){\n  deleteBoard(boardId:$boardId)\n  }\n\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query fetchBoardWrite($boardId: ID!) {\n    fetchBoard(boardId: $boardId) {\n      _id\n      writer\n      title\n      contents\n      createdAt\n      images\n\n    }\n  }\n"): (typeof documents)["\n  query fetchBoardWrite($boardId: ID!) {\n    fetchBoard(boardId: $boardId) {\n      _id\n      writer\n      title\n      contents\n      createdAt\n      images\n\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  # 변수의 타입 적는곳\n  mutation createBoard($createBoardInput: CreateBoardInput!) {\n    # 우리 실제 전달할 변수 적는곳\n    createBoard(createBoardInput: $createBoardInput) {\n      _id\n      writer\n      title\n      contents\n      createdAt\n      youtubeUrl\n      boardAddress{\n        zipcode\n        address\n        addressDetail\n      }\n      images\n    }\n  }\n"): (typeof documents)["\n  # 변수의 타입 적는곳\n  mutation createBoard($createBoardInput: CreateBoardInput!) {\n    # 우리 실제 전달할 변수 적는곳\n    createBoard(createBoardInput: $createBoardInput) {\n      _id\n      writer\n      title\n      contents\n      createdAt\n      youtubeUrl\n      boardAddress{\n        zipcode\n        address\n        addressDetail\n      }\n      images\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  # 변수의 타입 적는곳\n  mutation updateBoard(\n    $updateBoardInput: UpdateBoardInput!\n    $password: String\n    $boardId: ID!\n  ) {\n    # 우리 실제 전달할 변수 적는곳\n    updateBoard(boardId: $boardId, password: $password, updateBoardInput: $updateBoardInput\n    ) {\n      _id\n      writer\n      title\n      contents\n      youtubeUrl\n      boardAddress{\n        zipcode\n        address\n        addressDetail\n      }\n      images\n    }\n  }\n"): (typeof documents)["\n  # 변수의 타입 적는곳\n  mutation updateBoard(\n    $updateBoardInput: UpdateBoardInput!\n    $password: String\n    $boardId: ID!\n  ) {\n    # 우리 실제 전달할 변수 적는곳\n    updateBoard(boardId: $boardId, password: $password, updateBoardInput: $updateBoardInput\n    ) {\n      _id\n      writer\n      title\n      contents\n      youtubeUrl\n      boardAddress{\n        zipcode\n        address\n        addressDetail\n      }\n      images\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation uploadFile($file: Upload!) {\n    uploadFile(file: $file) {\n      url\n    }\n  }\n"): (typeof documents)["\n  mutation uploadFile($file: Upload!) {\n    uploadFile(file: $file) {\n      url\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation loginUser($email: String!, $password: String!){\n        loginUser(email: $email, password: $password){\n            accessToken\n        }\n    }\n"): (typeof documents)["\n    mutation loginUser($email: String!, $password: String!){\n        loginUser(email: $email, password: $password){\n            accessToken\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation createUser($createUserInput: CreateUserInput!){\n       createUser(createUserInput: $createUserInput){\n        _id\n        email\n        name\n       } \n    }\n"): (typeof documents)["\n    mutation createUser($createUserInput: CreateUserInput!){\n       createUser(createUserInput: $createUserInput){\n        _id\n        email\n        name\n       } \n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query FetchUserLoggedIn {\n    fetchUserLoggedIn {\n      _id\n      name\n      picture\n      email\n      userPoint {\n        amount\n      }\n    }\n  }\n"): (typeof documents)["\n  query FetchUserLoggedIn {\n    fetchUserLoggedIn {\n      _id\n      name\n      picture\n      email\n      userPoint {\n        amount\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation createPointTransactionOfLoading($paymentId: ID!) {\n    createPointTransactionOfLoading(paymentId: $paymentId) {\n      _id\n      amount\n      balance\n      status\n      impUid\n    }\n  }\n"): (typeof documents)["\n  mutation createPointTransactionOfLoading($paymentId: ID!) {\n    createPointTransactionOfLoading(paymentId: $paymentId) {\n      _id\n      amount\n      balance\n      status\n      impUid\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;