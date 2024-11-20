import { useEffect, useState } from "react"
import { Alert, Keyboard, SectionList, Text, View } from "react-native"
import { PlusIcon, Tag, Calendar as IconCalendar, Clock } from "lucide-react-native"

import { Input } from "@/components/Input"
import { Button } from "@/components/Button"
import { Loading } from "@/components/Loading"
import { Modal } from "@/components/Modal"
import { Calendar } from "@/components/Calendar"
import { Activity, ActivityProps } from "@/components/Activity/activity"

import { TripData } from "./[id]"

import { colors } from "@/styles/colors"
import { activitiesServer } from "@/server/activities-server"

import dayjs from "dayjs"

type Props = {
  tripDetails: TripData
}

enum MODAL {
  NONE = 0,
  CALENDAR = 1,
  NEW_ACTIVITY = 2,
}

type TripActivities = {
  title: {
    dayNumber: number
    dayName: string
  }
  data: ActivityProps[]
}

export default function Activities({ tripDetails }: Props) {
  // MODAL
  const [showModal, setShowModal] = useState(MODAL.NONE)

  // LOADING
  const [isCreatingActivity, setIsCreatingActivity] = useState(false)
  const [isLoadingActivities, setIsLoadingActivities] = useState(true)

  // DATA
  const [activityTitle, setActivityTitle] = useState("")
  const [activityDate, setActivityDate] = useState("")
  const [activityHour, setActivityHour] = useState("")

  // LISTS
  const [tripActivities, setTripActivities] = useState<TripActivities[]>([])

  function resetNewActivityFields() {
    setActivityDate("")
    setActivityTitle("")
    setActivityHour("")
    setShowModal(MODAL.NONE)
  }

  async function handleCreateTripActivity() {
    try {
      if (!activityTitle || !activityDate || !activityHour) {
        return Alert.alert("Cadastrar atividade", "Preencha todos os campos!")
      }

      console.log(tripDetails.id + " | " + dayjs(activityDate).add(Number(activityHour), "h").toString())

      setIsCreatingActivity(true)

      await activitiesServer.create({
        tripId: tripDetails.id,
        occurs_at: dayjs(activityDate).add(Number(activityHour), "h").toString(),
        title: activityTitle,
        done: false,
      })

      Alert.alert("Nova atividade", "Nova atividade cadastrada com sucesso!")

      await getTripActivities()
      resetNewActivityFields()
    } catch (error) {
      console.log(error)
    } finally {
      setIsCreatingActivity(false)
    }
  }

  async function getTripActivities() {
    try {
      // TODO: corrigir a data que está vindo com um dia a mais do que foi salvo (ex.: salvei dia 30, mas tá trazendo dia 31)

      const activities = await activitiesServer.getActivitiesByTripId(tripDetails.id)

      const activitiesToSectionList = activities.map(dayActivity => ({
        title: {
          dayNumber: dayjs(dayActivity.date).date(),
          dayName: dayjs(dayActivity.date).format("dddd").replace("-feira", ""), // format com 4 "d" mostra o nome do dia por extenso
        },
        data: dayActivity.activities.map(activity => ({
          id: activity.id,
          title: activity.title,
          hour: dayjs(activity.occurs_at).format("hh[:]mm[h]"), // esse formato mostra as horas + : + minutos + h (ex.: 12:00h)
          isBefore: dayjs(activity.occurs_at).isBefore(dayjs()), // verifica se a data da atividade é antes da data atual
          done: activity.done,
        })),
      }))

      setTripActivities(activitiesToSectionList)
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoadingActivities(false)
    }
  }

  async function handleOpenModal(modal: number) {
    setShowModal(MODAL.NONE)
    setTimeout(() => {
      setShowModal(modal)
    }, 500)
  }

  useEffect(() => {
    getTripActivities()
  }, [])

  return (
    <View className="flex-1">
      <View className="mb-6 mt-5 w-full flex-row items-center">
        <Text className="flex-1 font-semibold text-2xl text-zinc-50">Atividades</Text>

        <Button onPress={() => setShowModal(MODAL.NEW_ACTIVITY)}>
          <PlusIcon color={colors.lime[950]} />
          <Button.Title>Nova atividade</Button.Title>
        </Button>
      </View>

      {isLoadingActivities ? (
        <Loading />
      ) : (
        <SectionList // componente que carrega listas, parecido com o flatlist, porém junto de seções. MUITO INTERESSANTE
          sections={tripActivities}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <Activity data={item} />}
          renderSectionHeader={({ section }) => (
            <View className="w-full">
              <Text className="py-2 font-semibold text-2xl text-zinc-50">
                Dia {section.title.dayNumber + " "}
                <Text className="font-regular text-base capitalize text-zinc-500">{section.title.dayName} </Text>
              </Text>

              {section.data.length === 0 && <Text className="mb-8 font-regular text-sm text-zinc-500">Nenhuma atividade cadastrada nessa data.</Text>}
            </View>
          )}
          contentContainerClassName="gap-3 pb-48"
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal
        title="Cadastrar atividade"
        subtitle="Todos os convidados podem visualizar as atividades"
        visible={showModal === MODAL.NEW_ACTIVITY}
        onClose={() => setShowModal(MODAL.NONE)}
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
                onPressIn={() => handleOpenModal(MODAL.CALENDAR)}
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

        <Button onPress={handleCreateTripActivity} isLoading={isCreatingActivity}>
          <Button.Title>Salvar atividade</Button.Title>
        </Button>
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

          <Button onPress={() => handleOpenModal(MODAL.NEW_ACTIVITY)}>
            <Button.Title>Confirmar</Button.Title>
          </Button>
        </View>
      </Modal>
    </View>
  )
}
