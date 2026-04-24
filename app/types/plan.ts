export interface Activity {
  id: string
  title: string
  startTime?: string
  endTime?: string
  location?: string
  notes?: string
}

export interface Plan {
  id: string
  title: string
  date: string
  startTime?: string
  endTime?: string
  location?: string
  mapLink?: string
  budget?: number
  mood?: 'romantic' | 'fun' | 'chill'
  notes?: string
  status: 'planned' | 'ongoing' | 'done' | 'cancelled'
  activities: Activity[]
}
