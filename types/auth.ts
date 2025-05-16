export type User = {
  id: string
  email: string
  nome?: string
  empresa?: string
  role: "admin" | "user"
  created_at: string
}

export type Session = {
  user: User | null
  isLoading: boolean
  error: string | null
}
