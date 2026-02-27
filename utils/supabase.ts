import {createClient} from "@supabase/supabase-js"

const supabaseUrl = ""
const supabaseAnonKey = ""


export const supabaseClient  = createClient(supabaseUrl, supabaseAnonKey, {

})
