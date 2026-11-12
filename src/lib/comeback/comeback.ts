import { BRICK_IDS, brickIdFromLessonId, brickLessonId, getBrickMeta, type BrickId } from '@/data/foundation'
import { FOUNDATION_QUESTIONS, getQuestion, QUESTION_BANK, quizHref, type Question } from '@/data/questions'
import { allLessons, getLesson, lessonHref, SECTION_TITLES, sectionHref, type SectionId } from '@/data/roadmap'
import { brickHref, foundationState, isInFoundation, nextBrickIdFromState, readFoundation } from '@/lib/foundation'
import { listAttempts, listMistakes, readMistakes, recordAttempt, seededRandom, shuffle, isMastered } from '@/lib/quiz'
import { addDays, currentLessonId, daysBetween, sessionDates, startOfLocalDay } from '@/lib/schedule'
import { localDayKey } from '@/lib/sessions'
import type { Store } from '@/lib/storage'

/**
 * Quay lại sau nghỉ (story 11, CAP-6): phát hiện nghỉ > 7 ngày, chọn câu test 5', chỉ tới đoạn hổng.
 * Hàm thuần: thời gian qua `now`, ngẫu nhiên qua `seed`. Lần làm nằm trong `quizzes.attempts` (`kind: 'comeback'`).
 * Story 47: khi đang ở Sân ga, đề lấy câu kiểm tra hàng của các viên đã học xong (không lấy câu bài lộ trình chưa học) và
 * kết quả trỏ về viên chứa lỗ hổng (`comebackTarget`).
 */

/** Ngân hàng của test quay lại: câu bài lộ trình và câu kiểm tra hàng Sân ga (story 47). */
export const COMEBACK_BANK: readonly Question[] = [...QUESTION_BANK, ...FOUNDATION_QUESTIONS]

export const COMEBACK_QUIZ_ID = 'comeback'
/** Trang làm test quay lại (dùng chung trang làm bài của story 9). */
export const COMEBACK_HREF = quizHref(COMEBACK_QUIZ_ID)
/** Nghỉ hơn ngần này ngày (tính từ buổi gần nhất) thì mời test quay lại. */
export const COMEBACK_GAP_DAYS = 7
export const COMEBACK_SIZE = 8
export const COMEBACK_MAX_MISTAKES = 3
/** Số bài gần nhất (có câu hỏi) trước bài hiện tại. */
export const COMEBACK_RECENT_LESSONS = 4

export type ComebackBreak = {
  /** Ngày học gần nhất (nửa đêm giờ máy). */
  lastStudied: Date
  /** Số ngày từ buổi gần nhất tới hôm nay. */
  days: number
}

/**
 * Đợt nghỉ đang chờ test quay lại, hoặc null. Null khi: chưa học buổi nào, nghỉ ≤ 7 ngày, hoặc đợt nghỉ đã được xử lý.
 * Chỉ lần làm `comeback` ghi **sau khi** đợt nghỉ đã quá 7 ngày mới tính là xử lý. Lần gần nhất là làm xong → ẩn
 * tới đợt nghỉ sau; là "Để sau" → ẩn thêm 7 ngày, quá 7 ngày từ lần bỏ qua mà vẫn chưa học thì mời lại.
 */
export function pendingComeback(store: Store, now: Date): ComebackBreak | null {
  const dates = sessionDates(store)
  const lastStudied = dates[dates.length - 1]
  if (!lastStudied) return null
  const days = daysBetween(lastStudied, now)
  if (days <= COMEBACK_GAP_DAYS) return null
  const eligibleKey = localDayKey(addDays(lastStudied, COMEBACK_GAP_DAYS + 1))
  const latest = listAttempts(store).find(
    (a) => a.kind === 'comeback' && localDayKey(new Date(a.finishedAt)) >= eligibleKey,
  )
  if (!latest) return { lastStudied, days }
  if (!latest.skipped) return null
  const sinceSkip = daysBetween(startOfLocalDay(new Date(latest.finishedAt)), now)
  return sinceSkip > COMEBACK_GAP_DAYS ? { lastStudied, days } : null
}

export function needsComeback(store: Store, now: Date): boolean {
  return pendingComeback(store, now) !== null
}

/** Ghi "Để sau": một lần làm `comeback` rỗng có cờ `skipped` (đồng bộ được, thẻ ẩn cho đợt nghỉ này). */
export function skipComeback(store: Store, id: string, now: Date): Store {
  return recordAttempt(
    store,
    { id, quizId: COMEBACK_QUIZ_ID, seed: '', startedAt: now, answers: [], kind: 'comeback', skipped: true },
    now,
  )
}

export type PickComebackOptions = { canSpeak: boolean }

/**
 * 8 câu: tối đa 3 câu trong Sổ lỗi (ưu tiên câu chưa thuộc) + câu của tối đa 4 bài có câu hỏi gần nhất trước bài
 * hiện tại (theo thứ tự lộ trình, chia đều các bài). Thiếu câu thì lấy thêm từ các bài trước đó, rồi mới tới bài
 * hiện tại. Không trùng câu; không có TTS thì bỏ câu nghe. Thứ tự xáo theo seed.
 *
 * Đang ở Sân ga (story 47): thay cho bài là các viên đã học xong (`doneBrickIds`), xếp theo `lastDoneAt` mới nhất trước:
 * 4 viên gần nhất chia đều, thiếu thì viên cũ hơn. Câu của viên là câu kiểm tra hàng (`FOUNDATION_QUESTIONS`, `lessonId`
 * `fNN`, cần có trong `bank`); câu luyện trong viên không phải câu của Quiz engine nên không vào đề. Câu bài lộ trình chỉ
 * vào đề khi nằm trong Sổ lỗi. Chưa xong viên nào và Sổ lỗi trống → `[]`.
 */
export function pickComebackTest(
  store: Store,
  bank: readonly Question[],
  seed: string,
  opts: PickComebackOptions,
): Question[] {
  const random = seededRandom(`${seed}|comeback`)
  const inBank = new Map(bank.map((q) => [q.id, q]))
  const usable = (q: Question) => opts.canSpeak || q.kind !== 'listening'
  const chosen = new Map<string, Question>()

  const mistakes = shuffle(listMistakes(readMistakes(store)), random)
    .sort((a, b) => Number(isMastered(a)) - Number(isMastered(b)))
    .map((m) => inBank.get(m.id))
    .filter((q): q is Question => q !== undefined && usable(q))
  for (const q of mistakes.slice(0, COMEBACK_MAX_MISTAKES)) chosen.set(q.id, q)

  const byLesson = new Map<string, Question[]>()
  for (const q of bank) if (usable(q)) byLesson.set(q.lessonId, [...(byLesson.get(q.lessonId) ?? []), q])

  const fill = (lessonIds: readonly string[]) => {
    const groups = lessonIds.map((id) => shuffle((byLesson.get(id) ?? []).filter((q) => !chosen.has(q.id)), random))
    // Lần lượt từng bài một câu để chia đều.
    for (let round = 0; chosen.size < COMEBACK_SIZE && groups.some((g) => g.length > round); round++) {
      for (const g of groups) {
        if (chosen.size >= COMEBACK_SIZE) break
        const q = g[round]
        if (q && !chosen.has(q.id)) chosen.set(q.id, q)
      }
    }
  }
  /** 4 nguồn đầu chia đều, thiếu thì lần lượt từng nguồn sau. */
  const fillRecentThenOlder = (ids: readonly string[]) => {
    fill(ids.slice(0, COMEBACK_RECENT_LESSONS))
    for (const id of ids.slice(COMEBACK_RECENT_LESSONS)) {
      if (chosen.size >= COMEBACK_SIZE) break
      fill([id])
    }
  }

  if (isInFoundation(store)) {
    const bricks = readFoundation(store).bricks
    // Viên xong gần nhất trước (lastDoneAt mới hơn, so theo thời điểm chứ không theo chuỗi); bằng nhau thì viên đứng sau trước.
    const doneAt = (id: BrickId) => Date.parse(bricks[id]?.lastDoneAt ?? '') || 0
    const recentBricks = [...foundationState(store).doneBrickIds]
      .sort((a, b) => doneAt(b) - doneAt(a) || BRICK_IDS.indexOf(b) - BRICK_IDS.indexOf(a))
      .map(brickLessonId)
      .filter((id) => byLesson.has(id))
    fillRecentThenOlder(recentBricks)
    return shuffle([...chosen.values()], random)
  }

  const lessons = allLessons()
  const currentId = currentLessonId(store)
  const currentIndex = currentId ? lessons.findIndex((l) => l.id === currentId) : lessons.length
  const before = lessons
    .slice(0, Math.max(0, currentIndex))
    .reverse()
    .filter((l) => byLesson.has(l.id))
    .map((l) => l.id)
  const current = currentId && byLesson.has(currentId) ? [currentId] : []

  fillRecentThenOlder(before)
  if (chosen.size < COMEBACK_SIZE) fill(current)
  return shuffle([...chosen.values()], random)
}

/**
 * Đề test quay lại dùng ở cả thẻ Hôm nay (`useComeback`, đếm câu) lẫn trang làm test (`ComebackRun`, chốt đề): luôn lấy từ
 * `COMEBACK_BANK` (câu bài lộ trình + câu kiểm tra hàng Sân ga, story 47) để hai nơi không lệch nhau.
 */
export function comebackQuestions(store: Store, seed: string, opts: PickComebackOptions): Question[] {
  return pickComebackTest(store, COMEBACK_BANK, seed, opts)
}

export type WeakSection = { lessonId: string; sectionId: string; wrong: number }

/**
 * Đoạn bài có nhiều câu sai nhất trong lần làm (hoà thì bài sớm hơn trên lộ trình, rồi đoạn sớm hơn trong bài).
 * Câu viên gạch (`lessonId` `fNN`) tính như một "bài" đứng sau mọi bài lộ trình, theo thứ tự F01 → F18 (story 47); id lạ
 * đứng cuối. Không sai câu nào (hoặc không tra được câu nào) → null (về bài hiện tại).
 */
export function weakestSectionFrom(
  attempt: { answers: readonly { questionId: string; correct: boolean }[] },
  lookup: (id: string) => Question | undefined = getQuestion,
): WeakSection | null {
  const counts = new Map<string, WeakSection>()
  for (const a of attempt.answers) {
    if (a.correct) continue
    const q = lookup(a.questionId)
    if (!q) continue
    const key = `${q.lessonId}\u0000${q.sectionId}`
    const entry = counts.get(key) ?? { lessonId: q.lessonId, sectionId: q.sectionId, wrong: 0 }
    entry.wrong++
    counts.set(key, entry)
  }
  const lessons = allLessons()
  const lessonOrder = new Map(lessons.map((l, i) => [l.id, i]))
  const lastIfMissing = (i: number | undefined) => (i === undefined || i < 0 ? Number.MAX_SAFE_INTEGER : i)
  const lessonRank = (lessonId: string) => {
    const brick = brickIdFromLessonId(lessonId)
    return brick ? lessons.length + BRICK_IDS.indexOf(brick) : lastIfMissing(lessonOrder.get(lessonId))
  }
  const order = (s: WeakSection) => [
    lessonRank(s.lessonId),
    lastIfMissing(getLesson(s.lessonId)?.sections.findIndex((x) => x.id === s.sectionId)),
  ]
  let best: WeakSection | null = null
  for (const s of counts.values()) {
    if (!best || s.wrong > best.wrong) {
      best = s
      continue
    }
    if (s.wrong < best.wrong) continue
    const [li, si] = order(s)
    const [bl, bs] = order(best)
    if (li < bl || (li === bl && si < bs)) best = s
  }
  return best
}

/** Chỗ học tiếp khi không có lỗ hổng, chốt lúc bắt đầu test quay lại (story 47). */
export type ComebackHome =
  | { kind: 'brick'; brickId: BrickId }
  /** Đang ở Sân ga mà hết viên tiếp theo (đã xong / thuộc hàng đã xong). */
  | { kind: 'foundation' }
  | { kind: 'lesson'; lessonId: string }

/**
 * Đích "Học tiếp" khi đúng hết: đang ở Sân ga → viên tiếp theo (hết viên → trang Sân ga); sau Sân ga → bài hiện tại; đã đi
 * hết lộ trình → null.
 */
export function comebackHome(store: Store, hasContent: (id: BrickId) => boolean): ComebackHome | null {
  if (isInFoundation(store)) {
    const next = nextBrickIdFromState(foundationState(store), hasContent)
    return next ? { kind: 'brick', brickId: next } : { kind: 'foundation' }
  }
  const lessonId = currentLessonId(store)
  return lessonId ? { kind: 'lesson', lessonId } : null
}

const FOUNDATION_HREF = '/foundation'

const brickTargetLabel = (id: BrickId) => `${id} · ${getBrickMeta(id)?.title ?? id}`

/**
 * Nút "Học tiếp" sau test quay lại (story 47): có lỗ hổng → viên chứa nó (`/foundation/Fxx`, "Fxx · tên viên") hoặc đoạn
 * bài ("Tên bài · Ngữ pháp"); không có → `home` (viên tiếp theo, Sân ga, bài hiện tại); không có cả hai → Lộ trình.
 */
export function comebackTarget(weak: WeakSection | null, home: ComebackHome | null): { href: string; label: string } {
  if (weak) {
    const brick = brickIdFromLessonId(weak.lessonId)
    if (brick) return { href: brickHref(brick), label: brickTargetLabel(brick) }
    const title = getLesson(weak.lessonId)?.title ?? weak.lessonId
    const section = SECTION_TITLES[weak.sectionId as SectionId] ?? weak.sectionId
    return { href: sectionHref(weak.lessonId, weak.sectionId), label: `${title} · ${section}` }
  }
  if (!home) return { href: '/roadmap', label: 'Lộ trình' }
  switch (home.kind) {
    case 'brick':
      return { href: brickHref(home.brickId), label: brickTargetLabel(home.brickId) }
    case 'foundation':
      return { href: FOUNDATION_HREF, label: 'Sân ga 9¾' }
    case 'lesson':
      return { href: lessonHref(home.lessonId), label: getLesson(home.lessonId)?.title ?? home.lessonId }
  }
}
