import type { SessionStep } from './plan'

/** Trạng thái một bước trong stepper dọc của buổi học (story 30). Không khoá bước nào: mọi bước đều bấm được. */
export type StepperState = 'done' | 'current' | 'upcoming'

export type StepperItem = SessionStep & { state: StepperState }

/** Bước trước `index` là `done`, bước `index` là `current`, sau đó là `upcoming`. */
export function stepperItems(steps: readonly SessionStep[], index: number): StepperItem[] {
  return steps.map((step, i) => ({ ...step, state: i < index ? 'done' : i === index ? 'current' : 'upcoming' }))
}
