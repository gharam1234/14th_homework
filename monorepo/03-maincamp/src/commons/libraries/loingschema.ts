import z, { email } from "zod";

export const Loginschema = z.object({
    email:z
    .string()
    .min(1,{message:"이메일을 입력해주세요"}),
    password:z
    .string()
    .min(1,{message:"비밀번호를 입력해주세요"})
})

export type ILoginSchema = z.infer<typeof Loginschema>;