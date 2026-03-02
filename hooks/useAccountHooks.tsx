import { RegisterFormType, RegisterFormSchema } from "@/schema/loginSchema"
import {supabaseClient} from "@/utils/supabase"
import { zodResolver } from "@hookform/resolvers/zod"
import { SubmitHandler } from "react-hook-form"
import {useState} from "react"
import { AuthError } from "@supabase/supabase-js"


type supabaseError = AuthError | null

export default function useAccount ()  {
    const [data, setData] = useState<any>()
    const [error, setError] = useState<supabaseError>(null)

    const SignInWithPassword: SubmitHandler<RegisterFormType> = async ({email, password} : RegisterFormType) => {
    try {
        const {data, error} = await supabaseClient.auth.signInWithPassword({email, password}) 
        if (error) {
        setError(error)
        return
        }

        setData(data)
        setError(null)
    } catch (err) {
        setError(err as AuthError )
    } 
    }

    const SignUpWithEmailAndPassword: SubmitHandler<RegisterFormType> = async ({email, password} : RegisterFormType) => {
        try {
        const {data, error} = await supabaseClient.auth.signUp({email, password}) 
        if (error) {
        setError(error)
        return
        }
        setData(data)
        setError(null)
        } catch (err) {
        setError(err as AuthError )
        } 
    }

    const ResetEmailPassword: SubmitHandler<RegisterFormType> = async ({email} : RegisterFormType) => {
        try {
        const {data, error} = await supabaseClient.auth.resetPasswordForEmail(email) 
        if (error) {
        setError(error)
        return
        }
        setData(data)
        setError(null)
        } catch (err) {
        setError(err as AuthError )
        } 
    }

    const SignOut : SubmitHandler<RegisterFormType> = async ({email} : RegisterFormType) => {
        try {
        const { error} = await supabaseClient.auth.signOut() 
        if (error) {
        setError(error)
        return
        }
        } catch (err) {
        setError(err as AuthError )
        } 
    }

    const Resend : SubmitHandler<RegisterFormType> = async ({email } : RegisterFormType) => {
        try {
        const { data, error} = await supabaseClient.auth.resend({
            type : "signup",
            email, 
        }) 
        if (error) {
        setError(error)
        return
        }
        } catch (err) {
        setError(err as AuthError )
        } 
    }

    return {Resend,setData, setError, SignOut, ResetEmailPassword,SignUpWithEmailAndPassword, SignInWithPassword, data, error}
}