import { useEffect, useState } from "react"
import { TouchableOpacity, View } from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import { CalendarRange, Info, MapPin, Settings2 } from "lucide-react-native"

import dayjs from "dayjs"

import { colors } from "@/styles/colors"

import { TripDetails, tripServer } from "@/server/trip-server"

import { Input } from "@/components/Input"
import { Button } from "@/components/Button"
import { Loading } from "@/components/Loading"

type TripeData = TripDetails & { when: string }

export default function Trip() {
  // LOADING
  const [isLoadingTrip, setIsLoadingTrip] = useState(true)

  // DATA
  const [tripDetails, setTripDetails] = useState({} as TripeData)
  const [option, setOption] = useState<"activity" | "details">("activity")

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

  useEffect(() => {
    getTripDetails()
  }, [])

  if (isLoadingTrip) return <Loading />

  return (
    <View className="flex-1 px-5 pt-16">
      <Input variant="tertiary">
        <MapPin color={colors.zinc[400]} size={20} />
        <Input.Field value={tripDetails.when} readOnly />

        <TouchableOpacity activeOpacity={0.6} className="h-9 w-9 items-center justify-center rounded bg-zinc-800">
          <Settings2 color={colors.zinc[400]} size={20} />
        </TouchableOpacity>
      </Input>

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
    </View>
  )
}
