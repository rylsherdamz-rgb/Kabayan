import {Stack} from "expo-router"
import {SafeAreaProvider} from "react-native-safe-area-context"


export default function ProtectedRouteLayout() {
    
    return <Stack screenOptions={{
        headerTitle: () => null,
        headerStyle: {
            backgroundColor: "#000",
        }

    }} />
}


