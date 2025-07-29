import { supabase } from "./utils";

export type ServerActionState = {
    message: string,
    success: boolean
}

export async function Login(prevState: ServerActionState, formData: FormData): Promise<ServerActionState> {
    const email = formData.get('email')
    const password = formData.get('password')
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email as string,
            password: password as string
        })
        if (error) {
            console.log(error)
            throw error
        }
        return {
            message:"با موفقیت وارد شدید.",
            success: true
        }
    } catch (e) {
        const { data, error } = await supabase.auth.signUp({
            email: email as string,
            password: password as string
        })
        if (error) {
            console.log(error)
        return {
            message:"ورود موفقیت آمیز نبود دوباره تلاش کنید.",
            success: false
        }
        }
        return {
            message:"با موفقیت وارد شدید.",
            success: true
        }
    }
}

export async function Logout(): Promise<ServerActionState> {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.log(error)
        return {
            message:"خروج موفقیت آمیز نبود دوباره تلاش کنید.",
            success: false
        }
    }
    return {
        message:"با موفقیت خارج شدید.",
        success: true
    }
}