import { useEffect, useState } from "react"
import { Alert, Keyboard, TouchableOpacity, View } from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import { Calendar as IconCalendar, CalendarRange, Info, MapPin, Settings2 } from "lucide-react-native"

import dayjs from "dayjs"

import { colors } from "@/styles/colors"

import { TripDetails, tripServer } from "@/server/trip-server"

import { Input } from "@/components/Input"
import { Button } from "@/components/Button"
import { Loading } from "@/components/Loading"
import { Modal } from "@/components/Modal/modal"

import { Activities } from "./activities"
import { Details } from "./details"
import { Calendar } from "@/components/Calendar/calendar"
import { DateData } from "react-native-calendars"
import { calendarUtils, DatesSelected } from "@/utils/calendarUtils"

export type TripData = TripDetails & { when: string }

enum MODAL {
  NONE = 0,
  UPDATE_TRIP = 1,
  CALENDAR = 2,
}

export default function Trip() {
  // LOADING
  const [isLoadingTrip, setIsLoadingTrip] = useState(true)
  const [isUpdatingTrip, setIsUpdatingTrip] = useState(false)

  // MODAL
  const [showModal, setShowModal] = useState(MODAL.NONE)

  // DATA
  const [tripDetails, setTripDetails] = useState({} as TripData)
  const [option, setOption] = useState<"activity" | "details">("activity")
  const [destination, setDestination] = useState("")
  const [selectedDates, setSelectedDates] = useState({} as DatesSelected)

  const tripId = useLocalSearchParams<{ id: string }>().id

  async function getTripDetails() {
    try {
      setIsLoadingTrip(true)

      if (!tripId) {
        return router.back()
      }

      const trip = await tripServer.getByID(tripId)

      const maxLengthDestination = 14
      const destination = trip.destination.length > maxLengthDestination ? trip.destination.slice(0, maxLengthDestination) + "..." : trip.destination

      const starts_at = dayjs(trip.starts_at).format("DD")
      const ends_at = dayjs(trip.ends_at).format("DD")
      const month = dayjs(trip.starts_at).format("MMM") // nome do mês abreviado (jul, set, ago)

      setDestination(trip.destination)

      setTripDetails({
        ...trip,
        when: `${destination} de ${starts_at} a ${ends_at} de ${month}.`,
      })
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoadingTrip(false)
    }
  }

  function handleSelectDate(selectedDay: DateData) {
    const dates = calendarUtils.orderStartsAtAndEndsAt({
      startsAt: selectedDates.startsAt,
      endsAt: selectedDates.endsAt,
      selectedDay,
    })

    setSelectedDates(dates)
  }

  async function handleUpdateTrip() {
    try {
      if (!tripId) return

      if (!destination || !selectedDates.startsAt || !selectedDates.endsAt) {
        return Alert.alert("Atualizar viagem", "Lembre-se de, além de preencher o destino, selecione data de início e fim de viagem.")
      }

      setIsUpdatingTrip(true)

      await tripServer.update({
        id: tripId,
        destination,
        starts_at: dayjs(selectedDates.startsAt.dateString).toString(),
        ends_at: dayjs(selectedDates.endsAt.dateString).toString(),
      })

      Alert.alert("Atualizar viagem", "Viagem atualizada com sucesso!", [
        {
          text: "OK",
          onPress: () => {
            setShowModal(MODAL.NONE)
            getTripDetails()
          },
        },
      ])
    } catch (error) {
      console.log(error)
    } finally {
      setIsUpdatingTrip(false)
    }
  }

  useEffect(() => {
    getTripDetails()
  }, [])

  if (isLoadingTrip) return <Loading />

  return (
    <View className="flex-1 px-5 pt-16">
      <Input variant="tertiary">
        <MapPin color={colors.zinc[400]} size={20} />
        <Input.Field value={tripDetails.when} readOnly />

        <TouchableOpacity
          activeOpacity={0.6}
          className="h-9 w-9 items-center justify-center rounded bg-zinc-800"
          onPress={() => setShowModal(MODAL.UPDATE_TRIP)}
        >
          <Settings2 color={colors.zinc[400]} size={20} />
        </TouchableOpacity>
      </Input>

      {option === "activity" ? <Activities tripDetails={tripDetails} /> : <Details tripId={tripDetails.id} />}

      <View className="absolute -bottom-1 z-10 w-full justify-end self-center bg-zinc-950 pb-5">
        <View className="w-full flex-row gap-2 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <Button className="flex-1" onPress={() => setOption("activity")} variant={option === "activity" ? "primary" : "secondary"}>
            <CalendarRange color={option === "activity" ? colors.lime[950] : colors.zinc[200]} size={20} />
            <Button.Title>Atividades</Button.Title>
          </Button>

          <Button className="flex-1" onPress={() => setOption("details")} variant={option === "details" ? "primary" : "secondary"}>
            <Info color={option === "details" ? colors.lime[950] : colors.zinc[200]} size={20} />

            <Button.Title>Detalhes</Button.Title>
          </Button>
        </View>
      </View>

      <Modal
        title="Atualizar viagem"
        subtitle="Somente quem criou a viagem pode editar."
        visible={showModal === MODAL.UPDATE_TRIP}
        onClose={() => setShowModal(MODAL.NONE)}
      >
        <View className="my-4 gap-2">
          <Input variant="secondary">
            <MapPin color={colors.zinc[400]} size={20} />
            <Input.Field placeholder="Para onde?" onChangeText={setDestination} value={destination} />
          </Input>

          <Input variant="secondary">
            <IconCalendar color={colors.zinc[400]} size={20} />
            <Input.Field
              placeholder="Quando?"
              value={selectedDates.formatDatesInText}
              onPressIn={() => setShowModal(MODAL.CALENDAR)}
              onFocus={() => Keyboard.dismiss()}
            />
          </Input>

          <Button onPress={handleUpdateTrip} isLoading={isUpdatingTrip}>
            <Button.Title>Atualizar</Button.Title>
          </Button>
        </View>
      </Modal>

      {/* MODAL CALENDÁRIO */}
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

          <Button onPress={() => setShowModal(MODAL.UPDATE_TRIP)}>
            <Button.Title>Confirmar</Button.Title>
          </Button>
        </View>
      </Modal>
    </View>
  )
}
