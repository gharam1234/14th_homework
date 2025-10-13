"use client";

import { ChangeEvent } from "react";
import _ from "lodash";
import { useRouter } from "next/navigation";
import { ISearchProps } from "./types";

export default function UseSearch(props: ISearchProps) {
    const getDebounce = _.debounce((value) => {
    props.refetch({page:1, search: value})
    props.setKeyword(value);
}, 500);

const router = useRouter();
const onChangeKeyword = (event: ChangeEvent<HTMLInputElement>) => {
    getDebounce(event.target.value);
}
const onClickMove = () => {
    router.push("/boards/new")
}

    return{
        onChangeKeyword,
        onClickMove,
    }
}
