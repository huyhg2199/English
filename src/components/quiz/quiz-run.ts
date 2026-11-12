import { getBrickMeta, type BrickId } from '@/data/foundation'

/** Phần ngẫu nhiên của seed / id lần làm. */
export function randomPart(): string {
  const c = globalThis.crypto
  if (c && typeof c.randomUUID === 'function') return c.randomUUID().slice(0, 8)
  return Math.random().toString(36).slice(2, 10)
}

/** Một lượt làm test: seed chốt đề, `startedAt` ghi vào lần làm. */
export type Run = { seed: string; startedAt: Date }

export function newRun(): Run {
  return { seed: randomPart(), startedAt: new Date() }
}

/** Nhãn viên gạch "F03 · IPA là gì". */
export const brickLabel = (id: BrickId) => `${id} · ${getBrickMeta(id)?.title ?? id}`
