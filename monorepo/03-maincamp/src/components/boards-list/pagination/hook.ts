import { useState } from "react";
import { IPaginationProps } from "./type";


export const usePagination = (props:IPaginationProps) => {
  const [activePage,setActivePage] = useState(1);



  const [startPage, setStartPage] = useState(1);

  const onClickPage = (event: React.MouseEvent<HTMLButtonElement>) => {
    props.refetch({ page: Number(event.currentTarget.id) });
    setActivePage(Number(event.currentTarget.id));
    props.setCurrentPage(Number(event.currentTarget.id));
  };

  const onClickPrev = () => {
    if (startPage === 1) return;
    // early exit 패턴을 추천함 가독성이 좋아서
    setStartPage(startPage - 10);
    setActivePage(startPage - 10);
    props.refetch({ page: startPage - 10 });
    props.setCurrentPage(props.currentPage - 10)
  };
  const onClickNext = () => {
    if (startPage + 10 <= props.lastPage) {
      setStartPage(startPage + 10);
      setActivePage(startPage + 10);
      props.refetch({ page: startPage + 10 });
      props.setCurrentPage(props.currentPage + 1)
    }
  };

  return {
    startPage,
    onClickNext,
    onClickPage,
    onClickPrev,
    activePage
  };
};
