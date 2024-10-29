import { Text, TouchableOpacity, View } from "react-native"
import { Link2 } from "lucide-react-native"

import { colors } from "@/styles/colors"

import * as WebBrowser from "expo-web-browser"

export type TripLinkProps = {
  id: string
  title: string
  url: string
}

type Props = {
  data: TripLinkProps
}

export function TripLink({ data }: Props) {
  const _handlePressButtonAsync = async () => {
    await WebBrowser.openBrowserAsync(data.url)
  }

  return (
    <View className="w-full flex-row items-center gap-4">
      <View className="flex-1">
        <Text className="font-semibold text-base text-zinc-100">{data.title}</Text>
        <Text className="text-sm text-zinc-400" numberOfLines={1}>
          {data.url}
        </Text>
      </View>

      <TouchableOpacity activeOpacity={0.7} onPress={_handlePressButtonAsync}>
        <Link2 color={colors.zinc[400]} size={20} />
      </TouchableOpacity>
    </View>
  )
}
