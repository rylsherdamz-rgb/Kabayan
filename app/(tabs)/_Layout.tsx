import {Tabs} from "expo-router"



export default function TabsLayout() {
    // add components here for the components to be reusable in here 
    return <Tabs screenOptions={{headerTitle : "",
        headerRight: () => null,
        headerLeft: () => null,
        headerStyle :  {
            backgroundColor: "#000"
        }, 
        tabBarActiveTintColor: "#000", // change the color of this to math the color pallete of the logo
        tabBarInactiveTintColor : "#ff0"
     }}>
        <Tabs.Screen options={{}}>

        </Tabs.Screen>
    </Tabs>
}