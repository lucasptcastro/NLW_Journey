import { api } from "./api"

export type TripDetails = {
  id: string
  destination: string
  starts_at: string
  ends_at: string
  is_confirmed: boolean
}

// o "Omit" retira variáveis de uma tipagem que será reutilizada fazendo com que sejam usadas apenas as necessárias (bastante útil)
type TripCreate = Omit<TripDetails, "id" | "is_confirmed"> & {
  emails_to_invite: string[]
}

async function getByID(id: string) {
  try {
    const { data } = await api.get<{ trip: TripDetails }>(`/trips/${id}`)

    return data.trip
  } catch (error) {
    throw error
  }
}

async function create({ destination, starts_at, ends_at, emails_to_invite }: TripCreate) {
  try {
    const { data } = await api.post<{ tripId: string }>("/trips", {
      destination,
      starts_at,
      ends_at,
      emails_to_invite,
      owner_name: "Lucas Peixoto",
      owner_email: "lucasptcastro@gmail.com",
    })

    return data
  } catch (error) {
    throw error
  }
}

export const tripServer = { getByID, create }
