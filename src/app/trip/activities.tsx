import { useState } from "react"
import { Keyboard, Text, View } from "react-native"
import { PlusIcon, Tag, Calendar as IconCalendar, Clock } from "lucide-react-native"

import { Button } from "@/components/Button"
import { Modal } from "@/components/Modal/modal"

import { TripData } from "./[id]"
import { colors } from "@/styles/colors"
import { Input } from "@/components/Input"

import dayjs from "dayjs"
import { Calendar } from "@/components/Calendar/calendar"

type Props = {
  tripDetails: TripData
}

enum MODAL {
  NONE = 0,
  CALENDAR = 1,
  NEW_ACTIVITY = 2,
}

export function Activities({ tripDetails }: Props) {
  // MODAL
  const [showModal, setShowModal] = useState(MODAL.NONE)

  // DATA
  const [activityTitle, setActivityTitle] = useState("")
  const [activityDate, setActivityDate] = useState("")
  const [activityHour, setActivityHour] = useState("")

  return (
    <View className="flex-1">
      <View className="mb-6 mt-5 w-full flex-row items-center">
        <Text className="flex-1 font-semibold text-2xl text-zinc-50">Atividades</Text>

        <Button onPress={() => setShowModal(MODAL.NEW_ACTIVITY)}>
          <PlusIcon color={colors.lime[950]} />
          <Button.Title>Nova atividade</Button.Title>
        </Button>
      </View>

      <Modal
        visible={showModal === MODAL.NEW_ACTIVITY}
        onClose={() => setShowModal(MODAL.NONE)}
        title="Cadastrar atividade"
        subtitle="Todos os convidados podem visualizar as atividades"
      >
        <View className="mb-3 mt-4">
          <Input variant="secondary">
            <Tag color={colors.zinc[400]} size={20} />
            <Input.Field placeholder="Qual atividade?" onChangeText={setActivityTitle} value={activityTitle} />
          </Input>

          <View className="mt-2 w-full flex-row gap-2">
            <Input variant="secondary" className="flex-1">
              <IconCalendar color={colors.zinc[400]} size={20} />
              <Input.Field
                placeholder="Data"
                onChangeText={setActivityTitle}
                value={activityDate ? dayjs(activityDate).format("DD [de] MMMM") : ""}
                onFocus={() => Keyboard.dismiss()} // rejeita a abertura do teclado quando o input for pressionado
                showSoftInputOnFocus={false} // faz com que a animação do teclado subindo não apareça quando o input for pressionado
                onPressIn={() => setShowModal(MODAL.CALENDAR)}
              />
            </Input>

            <Input variant="secondary" className="flex-1">
              <Clock color={colors.zinc[400]} size={20} />
              <Input.Field
                placeholder="Horário"
                onChangeText={text => setActivityHour(text.replace(".", "").replace(",", ""))}
                value={activityHour}
                keyboardType="numeric"
                maxLength={2}
              />
            </Input>
          </View>
        </View>
      </Modal>

      <Modal
        title="Selecione a data"
        subtitle="Selecione a data da atividade"
        visible={showModal === MODAL.CALENDAR}
        onClose={() => setShowModal(MODAL.NONE)}
      >
        <View className="mt-4 gap-4">
          <Calendar
            onDayPress={day => setActivityDate(day.dateString)}
            markedDates={{ [activityDate]: { selected: true } }}
            initialDate={tripDetails.starts_at.toString()}
            minDate={tripDetails.starts_at.toString()}
            maxDate={tripDetails.ends_at.toString()}
          />

          <Button onPress={() => setShowModal(MODAL.NEW_ACTIVITY)}>
            <Button.Title>Confirmar</Button.Title>
          </Button>
        </View>
      </Modal>
    </View>
  )
}
