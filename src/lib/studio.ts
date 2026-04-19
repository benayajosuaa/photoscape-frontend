export type StudioType = 'K1' | 'K2' | 'PHOTO_BOX' | 'SELF_PHOTO'

export const STUDIO_TYPE_ORDER: StudioType[] = ['K1', 'K2', 'PHOTO_BOX', 'SELF_PHOTO']

export const STUDIO_LABEL_BY_TYPE: Record<StudioType, string> = {
  K1: 'Studio K1',
  K2: 'Studio K2',
  PHOTO_BOX: 'Photo Box',
  SELF_PHOTO: 'Self-Photo Studio',
}

export function normalizeStudioType(value?: string): StudioType | null {
  const v = (value || '').trim().toUpperCase()
  if (v === 'K1' || v === 'K2' || v === 'PHOTO_BOX' || v === 'SELF_PHOTO') return v
  if (v.includes('PHOTOBOX')) return 'PHOTO_BOX'
  if (v.includes('PHOTO_BOX')) return 'PHOTO_BOX'
  if (v.includes('SELF-PHOTO') || v.includes('SELF_PHOTO') || v.includes('SELF PHOTO')) return 'SELF_PHOTO'
  if (v.includes('K1')) return 'K1'
  if (v.includes('K2')) return 'K2'
  return null
}

export function inferStudioTypeFromName(name?: string): StudioType | null {
  return normalizeStudioType(name)
}
