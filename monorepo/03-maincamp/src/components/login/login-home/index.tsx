"use client"

import { ChangeEvent, useEffect, useState } from 'react'
import styles from './styles.module.css'
import { gql, useMutation } from '@apollo/client'
import { result, set } from 'lodash'
import { useRouter } from 'next/navigation'
import { useAccessTokenStore } from '@/stores/use-access-token'
import { MyInput } from '@commons/ui'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loginschema } from '@/commons/libraries/loingschema'
import { ILoginSchema } from '@/commons/libraries/loingschema'


const LOGIN_USER = gql`
    mutation loginUser($email: String!, $password: String!){
        loginUser(email: $email, password: $password){
            accessToken
        }
    }
`



export default function LoginHome(){
     const {register , handleSubmit ,formState: { errors }, watch, setValue} = useForm<ILoginSchema>({
        resolver:zodResolver(Loginschema),
        mode:"onChange"
      
      })

      const email = watch("email")
    const password = watch("password")
    
    // const [errors, setErrors] = useState({
    //     email: "",
    //     password: ""
    // })
    // const [email, setEmail] = useState("")
    // const [password, setPassword] = useState("")
    const [loginUser] = useMutation(LOGIN_USER)
    const router = useRouter()
    const { accessToken, setAccessToken } = useAccessTokenStore()
    
    
    const onChangeEmail = (event: ChangeEvent<HTMLInputElement>) => {
        setValue("email", event.target.value)
    }

    const onChangePassword = (event: ChangeEvent<HTMLInputElement>) => {
        setValue("password", event.target.value)
    }

    const onClickLogin = async () => {
        // let newErrors = {
        //     email: "",
        //     password: ""
        // }
        // if(!email) newErrors.email = "이메일을 입력해주세요"
        // if(!password) newErrors.password = "비밀번호를 입력해주세요"
        // setErrors(newErrors)
        // const hasError = Object.values(newErrors).some((error)=> error !== "")
        // if (hasError) return

        try{
             const result = await loginUser(
            { variables: { email, password } }
        )
        const AccessTokenByApi = result.data?.loginUser.accessToken;
        setAccessToken(AccessTokenByApi);
        localStorage.setItem("accessToken", AccessTokenByApi)
        
        router.push('/boards')

        }catch(error:unknown){
            if(error instanceof Error){
                alert(error.message)
            }
            else{
                alert("알 수 없는 에러가 발생했습니다.")
            }
        }
       
    }
    const onClickToSignUp = () => {
        router.push('/signup')
    }

    return(
        <div className={styles.container}>
            <div className={styles.loginHeader}>
              <div className={styles.loginBox}>
                <div className={styles.loginBox__input}>
                    <div className={styles.loginBox__input__logo}>
                        <img src="/images/logo.png" alt="logo" />
                        <h1>트립트립에 오신 것을 환영합니다.</h1>
                    </div>
                    <div className={styles.loginBox__input__form}>
                        <h2>트립트립에 로그인 하세요</h2>
                        {/* <input className={errors.email ? styles.red : ""} onChange={onChangeEmail} placeholder='이메일을 입력해 주세요' type="text" /> */}
                        <MyInput register={register} name="email" placeholder='이메일을 입력해 주세요' type="text" error={errors.email}/>
                        {/* <input className={errors.password ? styles.red : ""}  onChange={onChangePassword} placeholder='비밀번호를 입력해 주세요' type="password" /> */}
                        <MyInput register={register} name="password" placeholder='비밀번호를 입력해주세요' type="password" error={errors.password} />

                        {/* {(errors.email || errors.password) && <div className={styles.error}> 아이디 또는 비밀번호를 확인해주세요 </div>} */}
                    </div>
                </div>
                <div className={styles.loginBox__button}>
                    <button className={styles.loginBox__button__login} onClick={onClickLogin}>로그인</button>
                    <button onClick={onClickToSignUp}>회원가입</button>
                </div>
            </div>

            </div>
            <img className={styles.loginBg} src="/images/loginBg.png" alt="" />
        </div>
    )
        
            
}
    