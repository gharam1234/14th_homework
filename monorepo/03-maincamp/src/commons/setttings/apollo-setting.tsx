
"use client";

import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  InMemoryCache,
} from "@apollo/client";
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";
import { useAccessTokenStore } from "@/stores/use-access-token";

interface IApolloSetting {
  children: React.ReactNode;
}

// 이 컴포넌트로 다른 컴포넌트들을 감싸주면, 자식 컴포넌트들이 모두 ApolloClient를 사용할 수 있게 됩니다.
export default function ApiHeaderProvider(props: IApolloSetting) {
  // createUploadLink는 파일 업로드에 특화된 링크를 만들어줘요.
  const { accessToken } = useAccessTokenStore();
  const uploadLink = createUploadLink({
    uri: "http://main-practice.codebootcamp.co.kr/graphql",
    headers:{
      Authorization: `Bearer ${accessToken}`,
    }
  });

  // ApolloClient를 생성하면서 파일 업로드 링크를 넣어줍니다.
  const client = new ApolloClient({
    link: ApolloLink.from([uploadLink]), // from을 사용해 여러 링크를 체인처럼 연결할 수 있어요.
    cache: new InMemoryCache(),
  });

  return <ApolloProvider client={client}>{props.children}</ApolloProvider>;
}
