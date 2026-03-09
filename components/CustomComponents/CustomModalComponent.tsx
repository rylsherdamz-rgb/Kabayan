import {Modal, View, Pressable } from "react-native"


interface CustomModalComponentProp {
    visible : boolean
    setVisible : React.Dispatch<React.SetStateAction<boolean>>
}
export default function CustomModalComponent({visible, setVisible} : CustomModalComponentProp) {
    return <Modal
    animationType="slide" 
    visible={visible}
    onRequestClose={() => setVisible(!visible)} 
    >
    <View className="flex flex-1">
        <View>

        </View>
        <Pressable>

        </Pressable>
    </View>

    </Modal>
}
