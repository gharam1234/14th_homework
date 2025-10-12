import { CreateBoardInput } from "@/gql/graphql"
import { min } from "lodash"
import z from "zod"

// export type ISchema = z.infer<typeof schema>;

export interface ISchema extends Pick<CreateBoardInput, "title" | "contents" | "writer" | "password"|"boardAddress"|"youtubeUrl"|"images"> {
    
}


export const schema = z.object({
    title: z.string().min(2,{message:"제목은 2자 이상 입력해 주세요."}).or(z.literal("")).optional(),
    contents: z.string().min(1,{message:"내용을 입력해주세요"}).or(z.literal("")).optional(),
    writer: z.string().min(1,{message:"작성자를 입력해주세요"}).or(z.literal("")).optional(),
    password: z.string().min(8,{message:"비밀번호는 최소 8자 이상 입력해주세요"}).max(16,{message:"비밀번호는 16자 이하로 입력해주세요"}).or(z.literal("")).optional(),
    youtubeUrl: z.string().or(z.literal("")).optional(),
    boardAddress: z.object({
        zipcode: z.string().optional().or(z.literal("")),
        address: z.string().optional().or(z.literal("")),
        addressDetail: z.string().optional().or(z.literal("")),
    }).optional(),
    images: z.array(z.string()).or(z.literal("")).optional(),
})
export type ICommentSchema = z.infer<typeof commentSchema>;

export const commentSchema = z.object({
    writer: z.string().min(1,{message:"작성자를 입력해주세요"}).or(z.literal("")),
    password: z.string().min(1,{message:"비밀번호를 입력해주세요"}).or(z.literal("")),
    contents: z.string().min(1,{message:"내용을 입력해주세요"}).or(z.literal("")).optional(),
    rating: z.number().min(1,{message:"별점을 입력해주세요"}).or(z.literal("")).optional(),

})