import { User } from "@supabase/supabase-js";
import { createClient } from "./supabase/client";

export async function Login(formData: FormData): Promise<User | null> {
    const supabase = createClient()
    const email = formData.get('email')
    const password = formData.get('password')
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email as string,
        password: password as string
    })
    if (error) {
        console.log(error)
    }
    return data.user
}

export async function Register(formData: FormData): Promise<User | null> {
    const supabase = createClient()
    const email = formData.get('email')
    const password = formData.get('password')
    const { data, error } = await supabase.auth.signUp({
        email: email as string,
        password: password as string
    })
    if (error) {
        console.log(error)
    }
    return data.user
}