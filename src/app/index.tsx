// uma forma interessante de organizar as importações é separar as bibliotecas dos componentes criados deixando as do react/react native primeiro
import { useState } from "react"
import { Input } from "@/components/Input"
import { Image, Keyboard, Text, View } from "react-native"
import { MapPin, Calendar as IconCalendar, Settings2, UserRoundPlus, ArrowRight } from "lucide-react-native"
import { DateData } from "react-native-calendars"

import { calendarUtils, DatesSelected } from "@/utils/calendarUtils"
import { colors } from "@/styles/colors"

import { Button } from "@/components/Button"
import { Modal } from "@/components/Modal/modal"
import { Calendar } from "@/components/Calendar/calendar"
import dayjs from "dayjs"

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
  // DATA
  const [stepForm, setStepForm] = useState(StepForm.TRIP_DETAILS)
  const [selectedDates, setSelectedDates] = useState({} as DatesSelected)

  // MODAL
  const [showModal, setShowModal] = useState(MODAL.NONE)

  // quando a função for chamada/disparada a partir de uma interação do usuário, utiliza-se o handle
  function handleNextStepForm() {
    if (stepForm === StepForm.TRIP_DETAILS) {
      return setStepForm(StepForm.ADD_EMAIL)
    }
  }

  function handleSeletecDate(selectedDay: DateData) {
    const dates = calendarUtils.orderStartsAtAndEndsAt({
      startsAt: selectedDates.startsAt,
      endsAt: selectedDates.endsAt,
      selectedDay,
    })

    setSelectedDates(dates)
  }

  return (
    <View className="flex-1 items-center justify-center px-5">
      <Image source={require("@/assets/logo.png")} className="h-8" resizeMode="contain" />

      <Image source={require("@/assets/bg.png")} className="absolute" />

      <Text className="mt-3 text-center font-regular text-lg text-zinc-400">Convide seus amigos e planeje sua{"\n"}próxima viagem</Text>

      <View className="my-8 w-full rounded-xl border border-zinc-800 bg-zinc-900 p-4">
        <Input>
          <MapPin color={colors.zinc[400]} size={20} />
          <Input.Field placeholder="Para onde?" editable={stepForm === StepForm.TRIP_DETAILS} />
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
          </>
        )}

        {stepForm === StepForm.ADD_EMAIL && (
          <>
            <Input>
              <UserRoundPlus color={colors.zinc[400]} size={20} />
              <Input.Field placeholder="Quem estará na viagem?" />
            </Input>
          </>
        )}

        <Button onPress={handleNextStepForm}>
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
          <Calendar minDate={dayjs().toISOString()} onDayPress={handleSeletecDate} markedDates={selectedDates.dates} />

          <Button onPress={() => setShowModal(MODAL.NONE)}>
            <Button.Title>Confirmar</Button.Title>
          </Button>
        </View>
      </Modal>
    </View>
  )
}
