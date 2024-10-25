import { Button } from "@/components/Button"
import { Modal } from "@/components/Modal/modal"
import { colors } from "@/styles/colors"
import { Plus } from "lucide-react-native"
import { useState } from "react"
import { Text, View } from "react-native"

export function Details({ tripId }: { tripId: string }) {
  // MODAL
  const [showModal, setShowModal] = useState(false)

  return (
    <View className="mt-10 flex-1">
      <Text className="mb-2 font-semibold text-2xl text-zinc-50">Links importantes</Text>

      <View className="flex-1">
        <Button variant="secondary">
          <Plus color={colors.zinc[200]} size={20} />

          <Button.Title>Cadastrar novo link</Button.Title>
        </Button>
      </View>

      <Modal title="Cadastrar link" subtitle="Todos os convidados podem visualizar os links importantes." visible={showModal} onClose={() => setShowModal(false)}></Modal>
    </View>
  )
}
