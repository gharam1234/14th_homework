"use client";


import { ApolloError, useMutation } from "@apollo/client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {ChangeEvent} from 'react';
import { CREATE_BOARD, UPDATE_BOARD } from "./queres";
import { IMyvariables,Idata } from "./types";
import {
  CreateBoardMutation,
  CreateBoardMutationVariables,
  UpdateBoardMutation,
  UpdateBoardMutationVariables,
} from "@/gql/graphql";
import { Modal } from "antd";
import { IBoardWriteProps } from "@/components/boards-write/types";
import { checkFileValidation } from "@/commons/libraries/image-validation";
import { UPLOAD_FILE } from "./queres";
// import { useForm } from "react-hook-form";
import { schema,ISchema } from "@/commons/libraries/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormState } from "react-hook-form";
import { FETCH_BOARDS } from "../boards-list/list/queries";
// import z from "zod"


// interface FormValues{
//   writer: string;
//   password: string;
//   title: string;
//   contents: string;
//   youtubeUrl: string;
//   boardAddress: {
//     zipcode: string;
//     address: string;
//     addressDetail: string;
//   };
//   images: string[];
// }

export default function useBoardsWrite(props:IBoardWriteProps) {
  const {register , handleSubmit ,formState, watch, setValue} = useForm<ISchema>({
    resolver:zodResolver(schema),
    mode:"onChange"
  
  })
  const typedFormState: FormState<ISchema> = formState;
  // type FormValues = z.infer<typeof schema>;
  const writer = watch("writer")
  const password = watch("password")
  const title = watch("title")
  const contents = watch("contents")
  const boardAddress = watch("boardAddress")
  const youtubeUrl = watch("youtubeUrl")
  const {address, addressDetail, zipcode} = boardAddress || {}
  // const address = watch("address")
  // const addressDetail = watch("addressDetail")
  // const zipcode = watch("zipcode")
  // const youtubeUrl = watch("youtubeUrl")
  
  

  // const [zipcode, setZonecode] = useState("");
  // const [address, setAddress] = useState("");
  // const [detailAddress, setDetailAddress] = useState("");
  // const [addressDetail, setAddressDetail] = useState("");
  // const [youtubeUrl, setYoutubeUrl] = useState<string>("");
  // const [imageUrl, setImageUrl] = useState("");

  const [uploadFile] = useMutation(UPLOAD_FILE)

      const [isModalOpen, setIsModalOpen] = useState(false);
      // const [password, setPassword] = useState<string>("")
      // const [inputs, setInputs] = useState({
      //   writer: "",
      //   title: "",
      //   contents: "",
      // })
      // // const { writer, title, contents } = inputs;
      // const [errorWriter, setErrorWriter] = useState<string>("")
      // const [errorPassword, setErrorPassword] = useState<string>("")
      // const [errorTitle, setErrorTitle] = useState<string>("")
      // const [errorContents, setErrorContents] = useState<string>("")
  
      const [isActive, setIsActive] = useState<boolean>(false)
      
      const router = useRouter();
      const [createBoard] = useMutation<CreateBoardMutation, CreateBoardMutationVariables>(CREATE_BOARD,{
        refetchQueries:[{query:FETCH_BOARDS,
          variables:{
            page:1,
            search:""
          }
        }]
      });
      const [updateBoard] = useMutation<UpdateBoardMutation, UpdateBoardMutationVariables>(UPDATE_BOARD);
      const { boardId } = useParams()
      const [imageUrls, setImageUrls] = useState<string[]>(["", "", ""]);
      
      const fileRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
      const onClickGrayBox = (index: number, event: React.MouseEvent<HTMLDivElement>) => {
          event.stopPropagation();
          fileRefs[index].current?.click();
      };
    

      const onClickMoveList = () =>{
        router.push("/boards")
      }


       const onChangeFile = async (index: number, event: ChangeEvent<HTMLInputElement>) => {
        
  const file = event.target.files?.[0];
  if (!file) return;
  if (!checkFileValidation(file)) return;

    const result = await uploadFile({ variables: { file } });
    const fileUrl = result.data?.uploadFile.url;

    const newImageUrls = [...imageUrls];
    newImageUrls[index] = `https://storage.googleapis.com/${fileUrl}`;
    setImageUrls(newImageUrls);
    event.target.value = ""
};

const onClickDeleteFile = (index: number,event: React.MouseEvent<HTMLButtonElement>) => {
  event.stopPropagation();
  const newImageUrls = [...imageUrls];
  newImageUrls[index] = "";
  setImageUrls(newImageUrls);
};

      const handleComplete = (data : Idata) => {
    setValue("boardAddress.zipcode", data.zonecode);
    
    setValue("boardAddress.address", data.address);   
    setIsModalOpen((prev) => !prev);      
  };
      const onToggleModal = () => {
    setIsModalOpen((prev) => !prev);
  };
  //    const onChangeYoutubeUrl = (e:ChangeEvent<HTMLInputElement>) =>{
  //      setYoutubeUrl(e.target.value)
  // }

  //     const onChangeAddressDetail = (e:ChangeEvent<HTMLInputElement>) =>{
  //      setAddressDetail(e.target.value)
  // }
  // const onChangePassword = (event:ChangeEvent<HTMLInputElement>) => {
  //     setPassword(event.target.value)
  // }


 useEffect(() => {
  if (props.isEdit && props.data?.fetchBoard) {
    const images = props.data.fetchBoard.images || [];
    setImageUrls([
      images[0] || "",
      images[1] || "",
      images[2] || "",
    ]);

    // setInputs({
    //   writer: props.data.fetchBoard.writer || "",
    //   title: props.data.fetchBoard.title || "",
    //   contents: props.data.fetchBoard.contents || "",
    // });
    // setYoutubeUrl(props.data.fetchBoard.youtubeUrl || "");
    // setZonecode(props.data.fetchBoard.boardAddress?.zipcode || "");
    // setAddress(props.data.fetchBoard.boardAddress?.address || "");
    // setDetailAddress(props.data.fetchBoard.boardAddress?.addressDetail || "");
  }
}, [props.isEdit, props.data]);

  
  // useEffect(()=>{
  //   if(props.isEdit){
  //     if(inputs.contents && inputs.title) setIsActive(true)
  //     else setIsActive(false)
  //   }else{
  //     if(inputs.writer && inputs.title && inputs.contents && password){
  //       setIsActive(true)
  //     }else{setIsActive(false)
  //     }

  //   }
  // },[])
  
  // const onChangeInputs = (event:ChangeEvent<HTMLInputElement>) =>{
  //   setInputs({
  //       ...inputs,
  //       [event.target.id]: event.target.value
  //     })
  //   };
  //         const validation = () => {
  //         if (writer === "") setErrorWriter("필수입력사항입니다");
  //         else setErrorWriter("");

  //         if (password === "") setErrorPassword("필수입력사항입니다");
  //         else setErrorPassword("");
        
  //         if (title === "") setErrorTitle("필수입력사항입니다");
  //         else setErrorTitle("");
        
  //         if (contents === "") setErrorContents("필수입력사항입니다");
  //         else setErrorContents("");

  //       };

  //이벤트 핸들러

  

  const onClickSubmit = async (data:any) => {
    const {writer , password, title, contents, youtubeUrl, boardAddress:{zipcode, address, addressDetail}} = data 
    console.log(data);
    
    if (writer !=="" && password !=="" && title !=="" && contents !=="" ){
      Modal.success({ content: "게시글등록에 성공했습니다" });
    }else return
    console.log({
  writer,
  password,
  title,
  contents,
  youtubeUrl,
  images : imageUrls,
  boardAddress: { zipcode, address, addressDetail },
});
      
    const result = await createBoard({
  variables: {
    createBoardInput: {
      writer,
      password,
      title,
      contents,
      youtubeUrl,
      boardAddress:{
        zipcode,
        address,
        addressDetail,
      },
      images : imageUrls
    },
  },
});

    console.log(result);
    router.push(
      `/boards/${result.data.createBoard._id}`
    );
  };

  const onClickUpdate = async (data) => {
      console.log("폼에서 넘어온 값:", data);
      console.log("폼 에러:", formState.errors)


    const {writer, password, title, contents, youtubeUrl, boardAddress} = data
   const {zipcode, address, addressDetail} = boardAddress || {} 
    const checkPassword = prompt("비밀번호를 입력해주세요.");
    if (!checkPassword) return;

   
    const myvariables:IMyvariables = {
  boardId: String(boardId),
  password: checkPassword,
  updateBoardInput: {},
  };

if (title !== "") {
  myvariables.updateBoardInput.title = title;
}
if (contents !== "") {
  myvariables.updateBoardInput.contents = contents;
}
if (youtubeUrl !== "") {
  myvariables.updateBoardInput.youtubeUrl = youtubeUrl; 
}
if (boardAddress && (boardAddress.address || boardAddress.zipcode || boardAddress.addressDetail)) {
  myvariables.updateBoardInput.boardAddress = {
    zipcode: boardAddress.zipcode || "",
    address: boardAddress.address || "",
    addressDetail: boardAddress.addressDetail || "",
  };
}
if (imageUrls.some((url) => url !== "")) {
  myvariables.updateBoardInput.images = imageUrls;
}


try {
  const result = await updateBoard({
    variables: myvariables
  });
  Modal.success({ content: "게시글이 수정되었습니다" });
  router.push(`/boards/${result.data.updateBoard._id}`);
} catch (error: unknown) {
  if (error instanceof ApolloError) {
    if (error.graphQLErrors?.[0]) {
      // alert(error.graphQLErrors[0].message);
      Modal.error({ content: error.graphQLErrors[0].message });
    } else {
      Modal.error({ content: "알 수 없는 에러가 발생했습니다" });
    }
  } else {
    Modal.error({ content: "알 수 없는 에러가 발생했습니다" });
  }
}
   
    
  };

  return{
    // onChangeInputs,
    // onChangePassword,
    onClickSubmit,
    onClickUpdate,
    // validation,
    isActive,
    // errorContents,
    // errorPassword,
    // errorTitle,
    // errorWriter,
    
    
    
    
    onClickMoveList,
    onToggleModal,
    handleComplete,
    isModalOpen,
    
    // onChangeAddressDetail,
    
    // onChangeYoutubeUrl,
    imageUrls,
    onChangeFile,
    onClickDeleteFile,
    setImageUrls,
    
    
    zipcode,
    address,
    fileRefs,
    onClickGrayBox,
    handleSubmit,
    register,
    formState,
    typedFormState,
    
  }
}
