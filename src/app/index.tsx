import { useState } from "react"
import { Input } from "@/components/Input"
import { Image, Text, View } from "react-native"
import { colors } from "@/styles/colors"
import { Button } from "@/components/Button"
import { MapPin, Calendar as IconCalendar, Settings2, UserRoundPlus, ArrowRight } from "lucide-react-native"

enum StepForm {
  TRIP_DETAILS = 1,
  ADD_EMAIL = 2,
}

export default function Index() {
  const [stepForm, setStepForm] = useState(StepForm.TRIP_DETAILS)

  // quando a função for chamada/disparada a partir de uma interação do usuário, utiliza-se o handle
  function handleNextStepForm() {
    if (stepForm === StepForm.TRIP_DETAILS) {
      return setStepForm(StepForm.ADD_EMAIL)
    }
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
          <Input.Field placeholder="Quando?" editable={stepForm === StepForm.TRIP_DETAILS} />
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

        <Input>
          <UserRoundPlus color={colors.zinc[400]} size={20} />
          <Input.Field placeholder="Quem estará na viagem?" />
        </Input>

        <Button onPress={handleNextStepForm}>
          <Button.Title>{stepForm === StepForm.TRIP_DETAILS ? "Continuar" : "Confirmar Viagem"}</Button.Title>
          <ArrowRight color={colors.lime[950]} size={20} />
        </Button>
      </View>

      <Text className="text-center font-regular text-base text-zinc-500">
        Ao planejar sua viagem pela Plann.er você automaticamente concorda com nossos{" "}
        <Text className="text-zinc-300 underline">termos de uso e políticas de privacidade.</Text>
      </Text>
    </View>
  )
}
