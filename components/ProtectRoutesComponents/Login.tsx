import {useForm, SubmitHandler} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"

import {RegisterFormType, RegisterFormSchema} from "@/schema/loginSchema"
import useAccount from "@/hooks/useAccountHooks"

export default function Login() {
    const {register, handleSubmit,formState: {errors}} = useForm<RegisterFormType>({
        resolver : zodResolver(RegisterFormSchema)
    })

    const {SignUpWithEmailAndPassword, SignInWithPassword, Resend} = useAccount() 

    


    return 


}