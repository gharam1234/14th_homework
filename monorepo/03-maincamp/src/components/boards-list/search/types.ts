import {
  FetchBoardsSearchQuery,
  FetchBoardsSearchQueryVariables,
} from "@/gql/graphql";

export interface ISearchProps {
    refetch: (variables: FetchBoardsSearchQueryVariables) => void;
    setKeyword: React.Dispatch<React.SetStateAction<string>>;
}