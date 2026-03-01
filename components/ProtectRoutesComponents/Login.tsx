import {useForm, SubmitHandler} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {RegisterFormType, RegisterFormSchema} from "@/schema/loginSchema"
import {supabaseClient} from "@/utils/supabase"

export default function Login() {
    const {register, handleSubmit,formState: {errors}} = useForm<RegisterFormType>({
        resolver : zodResolver(RegisterFormSchema)
    })

    const onSubmit: SubmitHandler<RegisterFormType> = async ({email, password} : RegisterFormType) => {
    }


}