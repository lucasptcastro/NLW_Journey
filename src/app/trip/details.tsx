import { useState } from "react"
import { Plus } from "lucide-react-native"
import { Alert, Text, View } from "react-native"

import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { Modal } from "@/components/Modal/modal"

import { linksServer } from "@/server/links-server"

import { validateInput } from "@/utils/validateInput"
import { colors } from "@/styles/colors"

export function Details({ tripId }: { tripId: string }) {
  // MODAL
  const [showNewLinkModal, setShowNewLinkModal] = useState(false)

  // LOADING
  const [isCreatingLinkTrip, setIsCreatingLinkTrip] = useState(false)

  // DATA
  const [linkTitle, setLinkTitle] = useState("")
  const [linkURL, setLinkURL] = useState("")

  function resetNewLinkFields() {
    setLinkTitle("")
    setLinkURL("")
    setShowNewLinkModal(false)
  }

  async function handleCreateTripLink() {
    try {
      if (!validateInput.url(linkURL.trim())) return Alert.alert("Link", "Link inválido")

      if (!linkTitle.trim()) return Alert.alert("Link", "Informe o título do link.")

      setIsCreatingLinkTrip(true)

      await linksServer.create({ tripId, title: linkTitle, url: linkURL })

      Alert.alert("Link", "Link criado com sucesso!")

      resetNewLinkFields()
    } catch (error) {
      console.log(error)
    } finally {
      setIsCreatingLinkTrip(false)
    }
  }

  return (
    <View className="mt-10 flex-1">
      <Text className="mb-2 font-semibold text-2xl text-zinc-50">Links importantes</Text>

      <View className="flex-1">
        <Button variant="secondary" onPress={() => setShowNewLinkModal(true)}>
          <Plus color={colors.zinc[200]} size={20} />

          <Button.Title>Cadastrar novo link</Button.Title>
        </Button>
      </View>

      <Modal
        title="Cadastrar link"
        subtitle="Todos os convidados podem visualizar os links importantes."
        visible={showNewLinkModal}
        onClose={() => setShowNewLinkModal(false)}
      >
        <View className="mb-3 gap-2">
          <Input variant="secondary">
            <Input.Field placeholder="Título do link" onChangeText={setLinkTitle} />
          </Input>

          <Input variant="secondary">
            <Input.Field placeholder="URL" onChangeText={setLinkURL} />
          </Input>
        </View>

        <Button isLoading={isCreatingLinkTrip} onPress={handleCreateTripLink}>
          <Button.Title>Salvar link</Button.Title>
        </Button>
      </Modal>
    </View>
  )
}
