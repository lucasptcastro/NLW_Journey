// uma forma interessante de organizar as importações é separar as bibliotecas dos componentes criados deixando as do react/react native primeiro
import { useEffect, useState } from "react"
import { Input } from "@/components/Input"
import { Alert, Image, Keyboard, Text, View } from "react-native"
import { MapPin, Calendar as IconCalendar, Settings2, UserRoundPlus, ArrowRight, AtSign } from "lucide-react-native"
import { DateData } from "react-native-calendars"
import dayjs from "dayjs"

import { colors } from "@/styles/colors"
import { tripStorage } from "@/storage/trip"
import { validateInput } from "@/utils/validateInput"
import { calendarUtils, DatesSelected } from "@/utils/calendarUtils"

import { Button } from "@/components/Button"
import { Modal } from "@/components/Modal/modal"
import { Calendar } from "@/components/Calendar/calendar"
import { GuestEmail } from "@/components/Email/email"

import { router } from "expo-router"
import { tripServer } from "@/server/trip-server"
import { Loading } from "@/components/Loading"

// Cria meio que uma tipagem enumerada, muito útil para usar com estados que possuem estágios para exibir um componente (por exemplo um preenchimento de formulário)
enum StepForm {
  TRIP_DETAILS = 1,
  ADD_EMAIL = 2,
}

enum MODAL {
  NONE = 0,
  CALENDAR = 1,
  GUESTS = 2,
}

export default function Index() {
  // LOADING
  const [isCreatingTrip, setIsCreatingTrip] = useState(false)
  const [isGettingTrip, setIsGettingTrip] = useState(true)

  // DATA
  const [stepForm, setStepForm] = useState(StepForm.TRIP_DETAILS)
  const [selectedDates, setSelectedDates] = useState({} as DatesSelected)
  const [destination, setDestination] = useState("")
  const [emailToInvite, setEmailToInvite] = useState("")
  const [emailsToInvite, setEmailsToInvite] = useState<string[]>([])

  // MODAL
  const [showModal, setShowModal] = useState(MODAL.NONE)

  // quando a função for chamada/disparada a partir de uma interação do usuário, utiliza-se o handle
  function handleNextStepForm() {
    if (destination.trim().length === 0 || !selectedDates.startsAt || !selectedDates.endsAt) {
      return Alert.alert("Detalhes da viagem", "Preencha todas as informações da viagem para seguir.")
    }

    if (destination.length < 4) {
      return Alert.alert("Detalhes da viagem", "O destino deve ter pelo menos 4 caracteres.")
    }

    if (stepForm === StepForm.TRIP_DETAILS) {
      return setStepForm(StepForm.ADD_EMAIL)
    }

    Alert.alert("Nova viagem", "Confirmar viagem?", [
      {
        text: "Não",
        style: "cancel",
      },
      {
        text: "Sim",
        onPress: createTrip,
      },
    ])
  }

  function handleSelectDate(selectedDay: DateData) {
    const dates = calendarUtils.orderStartsAtAndEndsAt({
      startsAt: selectedDates.startsAt,
      endsAt: selectedDates.endsAt,
      selectedDay,
    })

    setSelectedDates(dates)
  }

  function handleRemoveEmail(emailToRemove: string) {
    // prevState coleta todos os dados que estão no estado e o filter vai trazer apenas os e-mails diferentes do e-mail do parâmetro. Ou seja, o e-mail passado como parâmetro vai ser descartado ("removido")
    setEmailsToInvite(prevState => prevState.filter(email => email !== emailToRemove))
  }

  function handleAddEmail() {
    if (!validateInput.email(emailToInvite)) {
      return Alert.alert("Convidado", "E-mail inválido!")
    }

    const emailAlreadyExists = emailsToInvite.find(email => email === emailToInvite)

    if (emailAlreadyExists) {
      return Alert.alert("Convidado", "E-mail já foi adicionado!")
    }

    setEmailsToInvite(prevState => [...prevState, emailToInvite])
    setEmailToInvite("")
  }

  async function saveTrip(tripId: string) {
    try {
      await tripStorage.save("65128303-fa0a-4ae8-9bc5-6daf6f52f63a") //TODO: adicionar trip dinâmico (resolver erro que tá dando no back)
      router.navigate(`./trip/${tripId}`)
    } catch (error) {
      Alert.alert("Salvar viagem", "Não foi possível salvar o id da viagem no dispositivo")
      console.log(error)
    }
  }

  async function createTrip() {
    try {
      setIsCreatingTrip(true)

      const newTrip = await tripServer.create({
        destination,
        starts_at: dayjs(selectedDates.startsAt?.dateString).toString(),
        ends_at: dayjs(selectedDates.endsAt?.dateString).toString(),
        emails_to_invite: emailsToInvite,
      })

      Alert.alert("Nova viagem", "Viagem criada com sucesso!", [
        {
          text: "OK. Continuar.",
          onPress: () => saveTrip(newTrip.tripId),
        },
      ])
    } catch (error) {
      console.log(error)
    } finally {
      setIsCreatingTrip(false)
    }
  }

  async function getTrip() {
    try {
      const tripID = await tripStorage.get()

      if (!tripID) {
        return setIsGettingTrip(false)
      }

      const trip = await tripServer.getByID(tripID)

      if (trip) {
        return router.navigate(`./trip/${trip.id}`)
      }
    } catch (error) {
      setIsCreatingTrip(false)
      console.log(error)
    }
  }

  useEffect(() => {
    getTrip()
  }, [])

  if (isGettingTrip) return <Loading />

  return (
    <View className="flex-1 items-center justify-center px-5">
      <Image source={require("@/assets/logo.png")} className="h-8" resizeMode="contain" />

      <Image source={require("@/assets/bg.png")} className="absolute" />

      <Text className="mt-3 text-center font-regular text-lg text-zinc-400">Convide seus amigos e planeje sua{"\n"}próxima viagem</Text>

      <View className="my-8 w-full rounded-xl border border-zinc-800 bg-zinc-900 p-4">
        <Input>
          <MapPin color={colors.zinc[400]} size={20} />
          <Input.Field placeholder="Para onde?" editable={stepForm === StepForm.TRIP_DETAILS} onChangeText={setDestination} value={destination} />
        </Input>
        <Input>
          <IconCalendar color={colors.zinc[400]} size={20} />
          <Input.Field
            placeholder="Quando?"
            editable={stepForm === StepForm.TRIP_DETAILS}
            onFocus={() => Keyboard.dismiss()} // rejeita a abertura do teclado quando o input for pressionado
            showSoftInputOnFocus={false} // faz com que a animação do teclado subindo não apareça quando o input for pressionado
            onPressIn={() => stepForm === StepForm.TRIP_DETAILS && setShowModal(MODAL.CALENDAR)}
            value={selectedDates.formatDatesInText}
          />
        </Input>

        {stepForm === StepForm.ADD_EMAIL && (
          <>
            <View className="border-b border-zinc-800 py-3">
              <Button variant="secondary" onPress={() => setStepForm(StepForm.TRIP_DETAILS)}>
                <Button.Title>Alterar local/data</Button.Title>
                <Settings2 color={colors.zinc[200]} size={20} />
              </Button>
            </View>
            <Input>
              <UserRoundPlus color={colors.zinc[400]} size={20} />
              <Input.Field
                placeholder="Quem estará na viagem?"
                autoCorrect={false}
                value={emailsToInvite.length > 0 ? `${emailsToInvite.length} pessoa(s) foram convidada(s)` : ""}
                onPress={() => {
                  Keyboard.dismiss()
                  setShowModal(MODAL.GUESTS)
                }}
                showSoftInputOnFocus={false}
              />
            </Input>
          </>
        )}

        <Button onPress={handleNextStepForm} isLoading={isCreatingTrip}>
          <Button.Title>{stepForm === StepForm.TRIP_DETAILS ? "Continuar" : "Confirmar Viagem"}</Button.Title>
          <ArrowRight color={colors.lime[950]} size={20} />
        </Button>
      </View>

      <Text className="text-center font-regular text-base text-zinc-500">
        Ao planejar sua viagem pela Plann.er você automaticamente concorda com nossos{" "}
        <Text className="text-zinc-300 underline">termos de uso e políticas de privacidade.</Text>
      </Text>

      <Modal
        title="Selecionar datas"
        subtitle="Selecione a data de ida e volta da viagem"
        visible={showModal === MODAL.CALENDAR}
        onClose={() => {
          setShowModal(MODAL.NONE)
        }}
      >
        <View className="mt-4 gap-4">
          <Calendar minDate={dayjs().toISOString()} onDayPress={handleSelectDate} markedDates={selectedDates.dates} />

          <Button onPress={() => setShowModal(MODAL.NONE)}>
            <Button.Title>Confirmar</Button.Title>
          </Button>
        </View>
      </Modal>

      <Modal
        title="Selecionar convidados"
        subtitle="Os convidados irão receber e-mails para confirmar a participação na viagem."
        visible={showModal === MODAL.GUESTS}
        onClose={() => setShowModal(MODAL.NONE)}
      >
        <View className="my-2 flex-wrap items-start gap-2 border-b border-zinc-800 py-5">
          {emailsToInvite.length > 0 ? (
            emailsToInvite.map(email => <GuestEmail key={email} email={email} onRemove={() => handleRemoveEmail(email)} />)
          ) : (
            <Text className="font-regular text-base text-zinc-600">Nenhum e-mail adicionado</Text>
          )}
        </View>

        <View className="mt-4 gap-4">
          <Input variant="secondary">
            <AtSign color={colors.zinc[400]} size={20} />
            <Input.Field
              placeholder="Digite o e-mail do convidado"
              keyboardType="email-address"
              onChangeText={text => setEmailToInvite(text.toLocaleLowerCase().trim())}
              value={emailToInvite}
              returnKeyType="send"
              onSubmitEditing={handleAddEmail}
            />
          </Input>

          <Button onPress={handleAddEmail}>
            <Button.Title>Convidar</Button.Title>
          </Button>
        </View>
      </Modal>
    </View>
  )
}
