import {createContext, useContext, useState} from "react"

interface AccountContextType {
    gmail : string | null
    setGmail : React.Dispatch<React.SetStateAction<string | null>>
    password : string | null
    setPassword : React.Dispatch<React.SetStateAction<string | null>>
}

export const AccountContext = createContext<AccountContextType | undefined>(undefined) 

export const AccountContextProvider = ({children}  : {children : React.ReactNode}) => {
    const [gmail, setGmail] = useState<string | null>(null)
    const [password, setPassword] = useState<string | null>(null)
    
    return <AccountContext.Provider value={{gmail, password, setPassword, setGmail}}>
        {children}
    </AccountContext.Provider>
}


export default function useAccount() {
    const accountContext  =useContext(AccountContext)
    if (!accountContext) return
    const {gmail, setGmail, password, setPassword} =  accountContext

    

    return 
}