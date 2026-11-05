import { describe, expect, it } from 'vitest'

import { getBrickMeta, type BrickId } from '@/data/foundation'
import {
  completeBrick,
  finishPlacement,
  markRowTested,
  markWelcomeSeen,
  mergeFoundation,
  resumeFoundation,
  skipFoundation,
} from '@/lib/foundation'
import { PLACEMENT_HREF } from '@/lib/foundation/row-test'
import { applyStartLesson, readPlacement, recordPlacementAttempt, setHouse, type PartScores } from '@/lib/placement'
import { setLessonCompleted } from '@/lib/roadmap-progress'
import { sessionPlan } from '@/lib/sessions'
import { CURRENT_VERSION, type Store } from '@/lib/storage'
import type { AuthState, SyncStatus } from '@/lib/sync'

import { owlPostReady } from './owl-post-gate'
import {
  shouldShowWelcome,
  showMeasureLink,
  sortingHatNextAction,
  todayView,
  welcomeFinalAction,
  type TodayView,
} from './today-view'

const day = (d: number, h = 20) => new Date(2026, 10, d, h)
const empty = (): Store => ({ schemaVersion: CURRENT_VERSION, data: {} })
/** Nội dung giả: F01–F06 đã soạn, F07+ "Đang soạn" (như hiện tại). */
const CONTENT = new Set<string>(['F01', 'F02', 'F03', 'F04', 'F05', 'F06'])
const hasContent = (id: BrickId) => CONTENT.has(id)
const none = () => false
const PARTS: PartScores = { p1: 3, p2: 10, p3: 12, p4: 9, p5: 12, p6: 6, p7: 20 }

function foundationView(view: TodayView) {
  if (view.mode !== 'foundation') throw new Error(`mode ${view.mode}`)
  return view
}

function roadmapView(view: TodayView) {
  if (view.mode !== 'roadmap') throw new Error(`mode ${view.mode}`)
  return view
}

/** Dữ liệu cũ (v12 vừa nâng cấp): có Nhà, có điểm ETS (bài bắt đầu tự xếp), đang học T1; không có key `foundation`. */
function legacyStore(): Store {
  let s = recordPlacementAttempt(empty(), PARTS, day(1, 9)).store
  s = setHouse(s, 'ravenclaw', day(1, 9))
  s = applyStartLesson(s, 's1-t1-w1', day(1, 9))
  return setLessonCompleted(s, 's1-t1-w1', true, day(2))
}

describe('todayView — I/O Matrix', () => {
  it('Hôm nay ngày 1: store mới → thẻ Sân ga 0/18, F01 (6\'), link Soát vé, lời mời Mũ; không lịch / Đo trình độ / kỹ năng', () => {
    const view = foundationView(todayView(empty(), hasContent))
    expect(view.hero).toEqual({
      taughtCount: 0,
      totalBricks: 18,
      brickId: 'F01',
      review: false,
      placementHref: PLACEMENT_HREF,
      placementContinueRow: null,
    })
    expect(getBrickMeta('F01')).toMatchObject({ minutes: 6 })
    expect(getBrickMeta('F01')!.goalVi.length).toBeGreaterThan(0)
    expect(view.showSortingHat).toBe(true)
    expect(view.showStudyClock).toBe(false)
    expect(view).not.toHaveProperty('showMeasureInvite')
    expect(view).not.toHaveProperty('showSkillGap')
  })

  it('Hôm nay dữ liệu cũ: có Nhà + điểm ETS + đang học T1 → thẻ Sân ga, đồng hồ giờ học; Nhà, điểm, bài bắt đầu y nguyên', () => {
    const s = legacyStore()
    const before = readPlacement(s)
    const view = foundationView(todayView(s, hasContent))
    expect(view.hero.brickId).toBe('F01')
    expect(view.showSortingHat).toBe(false)
    expect(view.showStudyClock).toBe(true)
    expect(readPlacement(s)).toEqual(before)
    expect(before).toMatchObject({ house: 'ravenclaw', startLessonId: 's1-t1-w1' })
  })

  it('Hàng qua Soát vé: rows.A đạt, chưa xong viên nào, F07+ đang soạn → 6/18, ôn lại F01 (giống sessionPlan)', () => {
    const s = markRowTested(empty(), 'A', 8, 8, day(2))
    const view = foundationView(todayView(s, hasContent))
    expect(view.hero).toMatchObject({ taughtCount: 6, totalBricks: 18, brickId: 'F01', review: true })
    expect(sessionPlan(s, hasContent)).toMatchObject({ brickId: view.hero.brickId, review: view.hero.review })
  })

  it('Hàng qua Soát vé, không viên nào có nội dung → brickId null ("đang soạn"), vẫn là thẻ Sân ga', () => {
    const view = foundationView(todayView(markRowTested(empty(), 'A', 8, 8, day(2)), none))
    expect(view.hero).toMatchObject({ taughtCount: 6, brickId: null, review: false })
  })

  it('thẻ Sân ga hiện đúng viên mà buổi 30\' sẽ chạy: F01, F02 xong → F03', () => {
    const s = completeBrick(completeBrick(empty(), 'F01', day(2)), 'F02', day(3))
    expect(foundationView(todayView(s, hasContent)).hero).toMatchObject({ taughtCount: 2, brickId: 'F03', review: false })
  })

  it('Soát vé xong (`done`) → không có link Soát vé', () => {
    expect(foundationView(todayView(finishPlacement(empty(), 'done', day(2)), hasContent)).hero.placementHref).toBeNull()
    expect(foundationView(todayView(finishPlacement(empty(), 'skipped', day(2)), hasContent)).hero.placementHref).toBeNull()
  })

  it('Soát vé mới làm hàng A → link "Tiếp tục Soát vé · hàng B"; chưa làm hàng nào → "4 bài ngắn"', () => {
    expect(foundationView(todayView(empty(), hasContent)).hero.placementContinueRow).toBeNull()
    const s = markRowTested(empty(), 'A', 8, 8, day(2))
    expect(foundationView(todayView(s, hasContent)).hero).toMatchObject({ placementHref: PLACEMENT_HREF, placementContinueRow: 'B' })
  })

  it('Soát vé còn pending nhưng không còn hàng cần soát → không có link', () => {
    let s = empty()
    for (const r of ['A', 'B', 'C'] as const) s = markRowTested(s, r, 2, 8, day(2))
    expect(foundationView(todayView(s, hasContent)).hero.placementHref).toBe(PLACEMENT_HREF)
    // Đã làm dở (A–C có kết quả) → link "Tiếp tục Soát vé · hàng D", không còn "4 bài ngắn".
    expect(foundationView(todayView(s, hasContent)).hero.placementContinueRow).toBe('D')
    s = markRowTested(s, 'D', 2, 8, day(2))
    expect(foundationView(todayView(s, hasContent)).hero.placementHref).toBeNull()
  })

  it('Hôm nay sau Sân ga: đã bỏ qua, có Nhà, chưa có ETS → bố cục cũ + "Đo trình độ"; không thẻ Sân ga', () => {
    const s = setHouse(skipFoundation(empty(), day(2)), 'gryffindor', day(2))
    expect(roadmapView(todayView(s, hasContent))).toEqual({
      mode: 'roadmap',
      showSortingHat: false,
      showMeasureInvite: true,
      showSkillGap: false,
      showStudyClock: false,
    })
  })

  it('Hôm nay sau Sân ga, chưa có Nhà → thêm lời mời Mũ', () => {
    const view = roadmapView(todayView(skipFoundation(empty(), day(2)), hasContent))
    expect(view).toMatchObject({ showSortingHat: true, showMeasureInvite: true })
  })

  it('Hôm nay sau Sân ga, có điểm ETS → bảng kỹ năng + đồng hồ như cũ, không Đo trình độ', () => {
    const view = roadmapView(todayView(skipFoundation(legacyStore(), day(3)), hasContent))
    expect(view).toEqual({
      mode: 'roadmap',
      showSortingHat: false,
      showMeasureInvite: false,
      showSkillGap: true,
      showStudyClock: true,
    })
  })

  it('quay lại Sân ga sau khi bỏ qua → lại là thẻ Sân ga', () => {
    const s = resumeFoundation(skipFoundation(empty(), day(2)), day(5))
    expect(todayView(s, hasContent).mode).toBe('foundation')
  })
})

const user = { id: 'u1', email: 'a@b.c' }
const signedIn: AuthState = { status: 'signed-in', user, offline: false }
const snap = (status: SyncStatus, auth: AuthState = signedIn, enabled = true) => ({ enabled, auth, status })

describe('shouldShowWelcome — Thư nhập học', () => {
  it('Thư lần đầu: welcomeSeenAt null, đồng bộ xong → hiện; ghi welcomeSeenAt rồi thì không hiện lại', () => {
    expect(shouldShowWelcome(empty(), true)).toBe(true)
    const seen = markWelcomeSeen(empty(), day(1))
    expect(shouldShowWelcome(seen, true)).toBe(false)
  })

  it('Dữ liệu cũ (v12 nâng cấp) → thư hiện một lần', () => {
    expect(shouldShowWelcome(legacyStore(), true)).toBe(true)
    expect(shouldShowWelcome(markWelcomeSeen(legacyStore(), day(3)), true)).toBe(false)
  })

  it('Thư máy thứ hai: đồng bộ chưa xong → chưa quyết; kéo về welcomeSeenAt của máy A → không hiện', () => {
    const deviceB = empty()
    expect(shouldShowWelcome(deviceB, owlPostReady(snap('off', { status: 'loading' }), false))).toBe(false)
    expect(shouldShowWelcome(deviceB, owlPostReady(snap('syncing'), false))).toBe(false)
    const deviceA = markWelcomeSeen(empty(), day(1)).data.foundation
    const pulled: Store = { ...deviceB, data: { ...deviceB.data, foundation: mergeFoundation(deviceB.data.foundation, deviceA) } }
    expect(shouldShowWelcome(pulled, owlPostReady(snap('idle'), false))).toBe(false)
  })

  it('Thư máy thứ hai: quá 8 s → quyết dù còn đang đồng bộ', () => {
    expect(shouldShowWelcome(empty(), owlPostReady(snap('syncing'), true))).toBe(true)
  })

  it('Không cấu hình Supabase → quyết ngay', () => {
    expect(shouldShowWelcome(empty(), owlPostReady(snap('off', { status: 'disabled' }, false), false))).toBe(true)
  })
})

describe('welcomeFinalAction — nút màn cuối của thư', () => {
  it('chưa có Nhà → Mũ Phân Loại (4 câu)', () => {
    expect(welcomeFinalAction(empty())).toEqual({ label: 'Đội Mũ Phân Loại (4 câu)', to: '/sorting-hat' })
    expect(welcomeFinalAction(skipFoundation(empty(), day(2)))).toEqual({ label: 'Đội Mũ Phân Loại (4 câu)', to: '/sorting-hat' })
  })

  it('có Nhà, đang ở Sân ga → Vào Sân ga 9¾', () => {
    expect(welcomeFinalAction(legacyStore())).toEqual({ label: 'Vào Sân ga 9¾', to: '/foundation' })
  })

  it('có Nhà, sau Sân ga → Về Hôm nay', () => {
    expect(welcomeFinalAction(skipFoundation(legacyStore(), day(3)))).toEqual({ label: 'Về Hôm nay', to: '/' })
  })
})

describe('Mũ Phân Loại — nút đi tiếp và link Đo trình độ', () => {
  it('sau khi Mũ chọn Nhà: đang ở Sân ga → Vào Sân ga 9¾; sau Sân ga → Về Hôm nay', () => {
    expect(sortingHatNextAction(setHouse(empty(), 'hufflepuff', day(1)))).toEqual({ label: 'Vào Sân ga 9¾', to: '/foundation' })
    expect(sortingHatNextAction(skipFoundation(empty(), day(2)))).toEqual({ label: 'Về Hôm nay', to: '/' })
  })

  it('link Đo trình độ: ẩn khi ở Sân ga chưa có điểm; hiện khi sau Sân ga hoặc đã có điểm ETS', () => {
    expect(showMeasureLink(empty())).toBe(false)
    expect(showMeasureLink(legacyStore())).toBe(true)
    expect(showMeasureLink(skipFoundation(empty(), day(2)))).toBe(true)
  })
})
