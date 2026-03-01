import {createClient} from "@supabase/supabase-js"

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY!

console.log(supabaseUrl, supabaseAnonKey)


export const supabaseClient  = createClient(supabaseUrl, supabaseAnonKey)
