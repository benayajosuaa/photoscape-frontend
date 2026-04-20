import { STUDIO_LABEL_BY_TYPE, STUDIO_TYPE_ORDER, type StudioType } from '@/lib/studio'

export type ManagerFilterStudio = {
  id: string
  name: string
  type: StudioType
  locationId: string
  locationName: string
}

export type ManagerFilterLocation = {
  id: string
  name: string
}

export type ManagerFilterOptions = {
  locations: ManagerFilterLocation[]
  serviceTypes: StudioType[]
  paymentMethods: string[]
  bookingStatuses: string[]
  studios: ManagerFilterStudio[]
}

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  qris: 'QRIS',
  bca_va: 'BCA VA',
  mandiri_va: 'Mandiri VA',
  gopay: 'GoPay',
  ovo: 'OVO',
  cash: 'Cash',
}

export function serviceTypeLabel(value: string) {
  if (value in STUDIO_LABEL_BY_TYPE) {
    return STUDIO_LABEL_BY_TYPE[value as StudioType]
  }
  return value
}

export function paymentMethodLabel(value: string) {
  return PAYMENT_METHOD_LABEL[value] || value
}

export function toServiceTypeSelectOptions() {
  return [{ label: 'Semua Layanan', value: '' }].concat(
    STUDIO_TYPE_ORDER.map((type) => ({
      label: STUDIO_LABEL_BY_TYPE[type],
      value: type,
    })),
  )
}

export function toStudioSelectOptions(studios: ManagerFilterStudio[]) {
  return [{ label: 'Semua Studio', value: '' }].concat(
    studios.map((studio) => ({
      label: `${studio.name} (${serviceTypeLabel(studio.type)})`,
      value: studio.id,
    })),
  )
}
