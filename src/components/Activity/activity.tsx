import { useEffect, useState } from "react"
import { Alert, Dimensions, Pressable, Text, View } from "react-native"
import { CircleDashed, CircleCheck, Trash } from "lucide-react-native"
import { router } from "expo-router"

import clsx from "clsx"
import * as Haptics from "expo-haptics"

import { activitiesServer } from "@/server/activities-server"
import { tripStorage } from "@/storage/trip"
import { colors } from "@/styles/colors"

import { GestureHandlerRootView, PanGestureHandler, PanGestureHandlerGestureEvent } from "react-native-gesture-handler"
import Animated, { runOnJS, useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"

export type ActivityProps = {
  id: string
  title: string
  hour: string
  isBefore: boolean
  done: boolean
}

type Props = {
  data: ActivityProps
}

export function Activity({ data }: Props) {
  // TRIP
  const [trip, setTrip] = useState<string | null>("")

  const translateX = useSharedValue(0)

  const { width: SCREEN_WIDTH } = Dimensions.get("window")
  const TRANSLATE_X_TRESHOLD = -SCREEN_WIDTH * 0.3

  // Faz a animação de swipe (deslizar) para o lado
  const panGesture = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    // onActive -> faz com que o componente se mova na horizontal de acordo com a interação do usuário
    onActive: event => {
      // Permite deslizar até certo ponto pra esquerda

      // if (translateX.value <= -100 && translateX.value < 0) {
      //   translateX.value = -100
      // } else {
      //   translateX.value = event.translationX < 0 ? event.translationX : 0 // não permite deslizar pra direita
      // }

      const swipedToRight = event.translationX > 0

      translateX.value = !swipedToRight ? event.translationX : 0
    },

    // onEnd -> faz com que o componente volte para o estado inicial quando o usuário o soltar (finalizar a ação de swipe)
    onEnd: () => {
      // se as coordenadas do movimento de deslize for maior que 0.3 do total da tela do aparelho faz a animação do componente sumir
      const shouldBeDismissed = translateX.value < TRANSLATE_X_TRESHOLD

      if (shouldBeDismissed) {
        translateX.value = withTiming(-SCREEN_WIDTH, undefined, isDone => {
          if (isDone) {
            runOnJS(removeActivity)()
          }
        })
      } else {
        translateX.value = withTiming(0)
      }
    },
  })

  const style = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: translateX.value,
      },
    ],
  }))

  async function getTripData() {
    const trip = await tripStorage.get()
    setTrip(trip)
  }

  async function removeActivity() {
    try {
      Alert.alert("Remover atividade", "Tem certeza que deseja remover a atividade?", [
        {
          text: "Não",
          style: "cancel",
        },
        {
          text: "Sim",
          onPress: async () => {
            await activitiesServer.remove(trip!, data.id)
            return router.back()
          },
        },
      ])
    } catch (error) {
      console.log("Ocorreu um erro ao tentar deletar a atividade! Erro:" + error)
    }
  }

  async function handleCheckActivity() {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      await activitiesServer.check(trip!, data.id)
      return router.back()
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getTripData()
  }, [])

  console.log(data)

  return (
    <GestureHandlerRootView>
      <View
        className={clsx("absolute z-0 h-full w-full items-end justify-center rounded-lg bg-red-500 pr-10", {
          hidden: data.isBefore || data.done,
        })}
      >
        <Trash color={"white"} size={20} />
      </View>
      <PanGestureHandler onGestureEvent={panGesture}>
        <Animated.View style={style}>
          <Pressable
            className={clsx("z-10 w-full flex-row items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3", {
              "opacity-50": data.isBefore || data.done,
            })}
            onPress={handleCheckActivity}
          >
            {/* se a data da atividade for antes da data atual mostra um ícone concluído. Senão, mostra um ícone pendente */}
            {data.isBefore ? (
              <CircleCheck color={colors.lime[300]} size={20} />
            ) : data.done ? (
              <CircleCheck color={colors.lime[300]} size={20} />
            ) : (
              <CircleDashed color={colors.zinc[400]} size={20} />
            )}

            <Text
              className={clsx("flex-1 font-regular text-base text-zinc-100", {
                "line-through": data.isBefore || data.done,
              })}
            >
              {data.title}
            </Text>

            <Text className="font-regular text-sm text-zinc-400">{data.hour}</Text>
          </Pressable>
        </Animated.View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  )
}
