export type Role = 'administrator' | 'manager' | 'partner'

export type Locale = 'en' | 'ru' | 'zh'

export type Translations = Partial<Record<Locale, string>>

export interface User {
  id: number
  name: string
  email: string
  username: string | null
  role: Role
  isActive: boolean
  createdAt: string
}

export interface ActivityLog {
  id: number
  action: string
  description: string
  user: { id: number; name: string; email: string; role: Role } | null
  subjectType: string | null
  subjectId: number | null
  properties: Record<string, unknown> | null
  ip: string | null
  createdAt: string
}

export interface AdminCategory {
  id: number
  parentId: number | null
  slug: string
  title: Translations
  illustration: string | null
  illustrationUrl: string | null
  position: number
  isActive: boolean
  seoTitle: Translations
  seoDescription: Translations
  vehiclesCount: number
  children: AdminCategory[]
}

export interface Brand {
  id: number
  slug: string
  name: string
  logo: string | null
  isPopular: boolean
}

export interface CharacteristicValue {
  id: number
  value: Translations
  label: string
  position: number
}

export interface Characteristic {
  id: number
  groupId: number
  name: Translations
  label: string
  useInFilters: boolean
  position: number
  values: CharacteristicValue[]
}

export interface CharacteristicGroup {
  id: number
  name: Translations
  label: string
  position: number
  characteristics: Characteristic[]
}

export interface VehiclePhoto {
  id: number
  url: string
  thumbUrl: string
  position: number
}

export interface VehicleCharacteristicValue {
  characteristicId: number
  valueId: number
  label: string | null
  value: string | null
  group: string | null
}

export type VehicleStatus = 'active' | 'sold' | 'draft'
export type EngineType = 'petrol' | 'diesel' | 'hybrid' | 'electric' | 'gas'
export type Transmission = 'manual' | 'automatic' | 'robot' | 'variator'
export type Drive = 'fwd' | 'rwd' | 'awd'

export interface AdminVehicle {
  id: number
  slug: string
  categoryId: number
  category: { id: number; slug: string; title: string } | null
  brandId: number
  brand: { id: number; slug: string; name: string } | null
  model: string
  generation: string | null
  year: number
  mileage: number | null
  price: number
  currency: 'RUB' | 'USD' | 'TJS'
  bodyType: string | null
  engineType: EngineType | null
  engineVolume: number | null
  power: number | null
  transmission: Transmission | null
  drive: Drive | null
  color: string | null
  vin: string | null
  description: Translations
  status: VehicleStatus
  isNew: boolean
  isPopular: boolean
  removedFromSale: boolean
  onOrder: boolean
  onOrderAbroad: boolean
  seoTitle: Translations
  seoDescription: Translations
  characteristics: VehicleCharacteristicValue[]
  photos: VehiclePhoto[]
  createdBy: number | null
  creatorName: string | null
  createdAt: string
  updatedAt: string
}

export type OrderStatus = 'new' | 'in_progress' | 'processed' | 'declined'

export interface AdminOrder {
  id: number
  name: string
  phone: string
  email: string | null
  message: string | null
  type: string
  status: OrderStatus
  vehicle: { id: number; slug: string; brand: string | null; model: string } | null
  createdAt: string
}

export interface AdminNewsPost {
  id: number
  slug: string
  title: Translations
  excerpt: Translations
  body: Translations
  cover: string | null
  coverUrl: string | null
  author: string | null
  isPublished: boolean
  publishedAt: string | null
  seoTitle: Translations
  seoDescription: Translations
  createdAt: string
  updatedAt: string
}

export interface PageMeta {
  total: number
  page: number
  perPage: number
}

export interface Paginated<T> {
  data: T[]
  meta: PageMeta
}
