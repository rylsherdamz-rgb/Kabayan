import {storage} from "@/utils/MMKVConfig"


export default function useLandingPage() {

    const getIsFirstOpened = () => {
    const hasOpened =  storage.getBoolean("isFirstOpened")
    return hasOpened  === undefined ? true : !hasOpened
    }  
   
    const setIsFirstOpened = () => {
        storage.set("isFirstOpened", true)
    }

    return {getIsFirstOpened, setIsFirstOpened}
}