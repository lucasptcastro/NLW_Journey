import { useEffect, useState } from "react"
import { Plus } from "lucide-react-native"
import { Alert, FlatList, Text, View } from "react-native"

import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { Modal } from "@/components/Modal"
import { Participant, ParticipantProps } from "@/components/Participant/participant"
import { TripLink, TripLinkProps } from "@/components/TripLink/tripLink"

import { linksServer } from "@/server/links-server"

import { validateInput } from "@/utils/validateInput"
import { colors } from "@/styles/colors"
import { participantsServer } from "@/server/participants-server"

export default function Details({ tripId }: { tripId: string }) {
  // MODAL
  const [showNewLinkModal, setShowNewLinkModal] = useState(false)

  // LOADING
  const [isCreatingLinkTrip, setIsCreatingLinkTrip] = useState(false)

  // LISTS
  const [links, setLinks] = useState<TripLinkProps[]>([])
  const [participants, setParticipants] = useState<ParticipantProps[]>([])

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

      await getTripLinks()
    } catch (error) {
      console.log(error)
    } finally {
      setIsCreatingLinkTrip(false)
    }
  }

  async function getTripLinks() {
    try {
      const links = await linksServer.getLinksByTripId(tripId)
      setLinks(links)
    } catch (error) {
      console.log(error)
    }
  }

  async function getTripParticipants() {
    try {
      const participants = await participantsServer.getByTripId(tripId)
      setParticipants(participants)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getTripLinks()
    getTripParticipants()
  }, [])

  return (
    <View className="mt-10 flex-1">
      <Text className="mb-2 font-semibold text-2xl text-zinc-50">Links importantes</Text>

      <View className="flex-1">
        <FlatList
          data={links}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <TripLink data={item} />}
          contentContainerClassName="gap-4"
          ListEmptyComponent={<Text className="mb-6 mt-2 font-regular text-base text-zinc-400">Nenhum link adicionado.</Text>}
        />

        <Button variant="secondary" onPress={() => setShowNewLinkModal(true)}>
          <Plus color={colors.zinc[200]} size={20} />

          <Button.Title>Cadastrar novo link</Button.Title>
        </Button>
      </View>

      <View className="mt-6 flex-1 border-t border-zinc-800">
        <Text className="my-6 font-semibold text-2xl text-zinc-50">Convidados</Text>

        <FlatList
          data={participants}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <Participant data={item} />}
          contentContainerClassName="gap-4 pb-44"
        />
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
