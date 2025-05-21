export type User = {
  id: string
  email: string
  nome?: string
  cpnj?: string
  created_at: string
}

export type Session = {
  user: User | null
  isLoading: boolean
  error: string | null
}
