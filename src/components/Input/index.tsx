import { ReactNode } from "react"
import { Platform, TextInput, TextInputProps, View } from "react-native"
import { colors } from "@/styles/colors"
import clsx from "clsx"

type Variants = "primary" | "secondary" | "tertiary"

type InputProps = {
  children: ReactNode
  variant?: Variants
}

function Input({ children, variant = "primary" }: InputProps) {
  return (
    <View
      className={clsx("h-16 w-full flex-row items-center gap-2", {
        "h-14 rounded-lg border border-zinc-800 px-4": variant !== "primary",
        "bg-zinc-950": variant === "secondary",
        "bg-zinc-900": variant === "tertiary",
      })}
    >
      {children}
    </View>
  )
}

function Field({ ...rest }: TextInputProps) {
  return (
    <TextInput
      className="flex-1 font-regular text-lg text-zinc-100"
      placeholderTextColor={colors.zinc[400]}
      cursorColor={colors.zinc[100]}
      selectionColor={Platform.OS === "ios" ? colors.zinc[100] : undefined}
      {...rest}
    />
  )
}

Input.Field = Field
export { Input }
