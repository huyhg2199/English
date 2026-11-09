---
title: 'Máy tính D3: phím tắt và lưới cho Hôm nay, Lộ trình (SPEC Constraints, stack.md UI)'
type: 'feature'
created: '2026-11-06'
status: 'done'
baseline_commit: 'a19ede58eb593743f461317a4c8c17f6c4bd55be'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stack.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/29-desktop-shell-topbar.md'
  - '{project-root}/_bmad-output/specs/spec-english-learning-website/stories/30-desktop-two-column-study-pages.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Decisions:** (Huy trả lời 4 câu hỏi mở ngày 2026-11-06; Huy cho phép chạy liên tục, Claude chọn chi tiết)
- **Máy tính (câu 4):** Huy chọn phương án tối giản: thanh trên cùng từ 1024px (story 29), Viên gạch / Bài học / Buổi học hai cột (story 30), phím tắt và lưới Hôm nay / Lộ trình (story này, D3). Thanh bên trái và master–detail cho Sổ lỗi / Sổ tay để sau.
- **Kiểm tra cả 4 hàng trước (câu 2):** bài kiểm tra hàng dùng `QuestionCard` (`RowTestRun`), nên cũng có phím 1–4 / Enter. Câu sai vẫn không ghi Sổ lỗi; story này không đổi gì về chấm hay ghi.
- **Nhịp 1 viên/buổi (câu 3), mốc 750 (câu 1):** story này không đụng lịch, buổi học hay store. Nút "Học tiếp viên sau" không có phím tắt.
- Claude chọn:
  - **Phím tắt chạy ở mọi bề rộng** (sự kiện bàn phím chỉ có khi có bàn phím). **Gợi ý `<kbd>`** chỉ hiện với `pointer-fine:`, nên iPhone / iPad cảm ứng không thấy gì mới.
  - **`shouldHandleKey`** bỏ qua phím khi: `defaultPrevented`; đang gõ IME (`isComposing` hoặc `keyCode` 229); `repeat`; giữ Ctrl / Meta / Alt / Shift; đang mở dialog (`[role="dialog"]`, `[role="alertdialog"]`, `dialog[open]`); đang bôi đen chữ (selection có chữ khác khoảng trắng); target là `input` / `textarea` / `select` / contenteditable. Riêng Space / Enter khi target là `button` / `a[href]` / `summary` / `[role=button|link|checkbox|radio|switch|tab|menuitem|option]` chưa `disabled` thì để trình duyệt xử lý. Số và mũi tên vẫn chạy ở đó.
  - **Một phím, một hành động:** binding nào chạy thì gọi `preventDefault()`, nên listener sau thấy `defaultPrevented` và bỏ qua. Phím không có binding thì không chặn (Space vẫn cuộn trang như thường).
  - **Thẻ từ** (`FlashcardSession`, nên có ở Luyện tập, Buổi học, ngày lười):
    - Space: lật thẻ khi chưa lật.
    - 1–4: Quên / Khó / Nhớ / Dễ, chỉ khi đã lật và không phải thẻ "Làm quen".
    - Enter: "Đã xem" trên thẻ "Làm quen" (cùng `onGrade('good')` với nút). Thẻ khác Enter không làm gì. *(Thêm khi review, xem Spec Change Log.)*
    - K: "Đã biết", chỉ khi nút đó đang hiện.
    - L: nghe từ, chỉ khi có nút nghe từ đang hiện. Mặt trước thẻ hư từ không có L, để không lộ đáp án. Thẻ quy tắc không có K và L.
  - **`QuestionCard`** (Quiz, O.W.L., ôn Sổ lỗi, kiểm tra hàng): khi chưa chọn, 1–4 chọn lựa chọn thứ n (n ≤ số lựa chọn). Khi đã chọn, Enter gọi prop mới `onNext`, cùng handler với nút "Câu tiếp" / "Xem kết quả" / "Xong" của nơi gọi.
  - **`BrickPlayer`:**
    - Câu check `choice` / `listen` đang trả lời: 1–4 chọn.
    - Câu check đã xong (đúng hoặc đã xem đáp án): Enter bấm nút footer ("Câu tiếp" / "Xem kết quả" / "Xong").
    - Màn khác, khi "Tiếp" bấm được và chưa phải màn cuối: Enter = "Tiếp".
    - Màn cuối và lúc đang mời "2 câu dễ hơn": Enter không làm gì. Phần check bị ẩn (khi quay lại màn trước) không nhận phím.
  - **Buổi học:** → sang bước sau, ← về bước trước. Ở bước cuối → không làm gì (không tự "Xong buổi"). View "Xong buổi" không có phím.
  - **Hôm nay** và **Lộ trình** chuyển sang `handle: { layout: 'wide' }` (1024px):
    - Hôm nay: lưới 2 cột theo thứ tự DOM. Header, dải nhắc, Chào mừng quay lại, kế hoạch ôn O.W.L., Qua bức tường, thẻ Sân ga và lời mời ôn viên gạch trải 2 cột. Các thẻ còn lại mỗi thẻ một ô.
    - Lộ trình: trong mỗi chặng, thẻ chặng trải 2 cột, các tháng xếp 2 cột.
  - **`layout:check`:**
    - Route `wide` phải có cột phụ hoặc lưới ≥ 2 cột.
    - Thêm bước thử phím ở 1280px:
      - `/foundation/F01`: Enter qua màn. Ở màn ví dụ một chỗ trống, gõ "chào 1" + Enter trong ô → vẫn ở màn 4.
      - `/session`: → rồi ←.
      - `/notebook`: tạo một ghi chú có chữ "chào" để ô tìm kiếm hiện ra, rồi gõ "chào" vào ô tìm kiếm → giá trị đúng "chào", không đổi trang, không cuộn.

**Problem:** Trên laptop, học thẻ từ, quiz, viên gạch và chuyển bước buổi học đều phải dùng chuột. Hôm nay và Lộ trình vẫn là một cột 768px, nhiều khoảng trống hai bên mà phải cuộn dài.

**Approach:** Thêm hàm thuần `shouldHandleKey` + `hotkeyName` cùng các hàm chọn hành động theo màn, có unit test, và hook `useHotkeys` lắng nghe trên `window`. Gắn hook vào thẻ từ, `QuestionCard`, `CheckItemView`/`BrickPlayer`, `Session`. Gợi ý `<kbd>` nằm trong component `Kbd` có marker, chỉ hiện với `pointer-fine`. Hôm nay và Lộ trình thêm lưới chỉ với class `lg:`. Ảnh 375px phải trùng với bản gốc.

## Boundaries & Constraints

**Always:**
- Dưới 1024px giao diện không đổi từng pixel. Ảnh 375px chụp với touch emulation (`pointer: coarse`), nên `Kbd` ẩn. File có sẵn chỉ được thêm class có tiền tố `lg:` / `xl:` / `pointer-fine:` và các phần tử không có class (vd `<Kbd>1</Kbd>`). Không đổi thứ tự DOM. Class không tiền tố chỉ được nằm trong file có marker `mobile-guard: desktop-only`.
- Mọi hành động phím gọi đúng handler mà nút tương ứng đang dùng: `setFlipped`, `onGrade`, `onKnown`, `speak`, `onChoose`, `onNext`, `go`, `goTo`. Không có đường ghi dữ liệu mới.
- Logic phím là hàm thuần trong `src/lib/hotkeys.ts`, có unit test cho mọi dòng matrix có thể test thuần. Hook gọi trước mọi `return` sớm, tắt bằng `enabled`.
- `Kbd` có `aria-hidden="true"`. Nút có phím tắt thêm `aria-keyshortcuts`.

**Never:**
- Không phím tắt cho Bài học, `WordReviewCard`, phần đọc O.W.L., `SpeakPractice`, `FadedBody`, "Học tiếp viên sau", "Xong buổi". Câu `order` / `sort` / `tapSyllable` không có phím trả lời; khi câu đã xong, Enter "Câu tiếp" vẫn chạy như mọi câu check. *(Làm rõ khi review, xem Spec Change Log.)* Không bảng trợ giúp phím (`?`), không thanh bên trái, không master–detail.
- Không sửa store, schema, sync, dữ liệu, `sessionPlan`, `SplitLayout`, `TopBar`, `AppShell`, `nav-items`, `sheet.tsx`, `OwlPost.tsx`, `ReadableText.tsx`. Không thêm dependency.
- Không xoá hay sửa class không tiền tố có sẵn. Không gắn `wide` cho route nào khác ngoài `/` và `/roadmap`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Phím thường | Space, target `body`, không dialog, không bôi đen | `shouldHandleKey` = true | N/A |
| IME | `isComposing` true hoặc `keyCode` 229 (Telex "chào") | false | N/A |
| Ô nhập | target `input` / `textarea` / `select` / contenteditable, mọi phím | false | N/A |
| Dialog / bôi đen | Sheet ghi chú đang mở; selection "hello" | false | Selection chỉ có khoảng trắng → không tính |
| Phím bổ trợ / giữ phím | Cmd+1, Ctrl+K, Shift+Space, Alt+→; `repeat` true | false | N/A |
| Space/Enter trên nút | target `button` / `a[href]` / `[role=button]`; `button[disabled]` | Space/Enter → false (trình duyệt bấm); số, mũi tên → true; nút `disabled` → true | N/A |
| Đã chặn | `defaultPrevented` (Space trên từ của `ReadableText`) | false | N/A |
| `hotkeyName` | `' '`, `'Enter'`, `'ArrowRight'`, `'3'`, `'K'`, `'l'`, `'5'`, `'a'` | `Space`, `Enter`, `ArrowRight`, `3`, `k`, `l`, null, null | N/A |
| Thẻ mặt trước | `{ flipped: false, intro: false, knownVisible: true, listenText: 'people' }` | Space → lật; 1–4 → null; K → đã biết; L → nghe "people" | N/A |
| Thẻ đã lật | `flipped: true` | 1/2/3/4 → again/hard/good/easy; Space → null (trang cuộn) | N/A |
| Thẻ "Làm quen" | `flipped: true, intro: true` | 1–4 → null; Space → null; Enter → "Đã xem" (`good`); K → đã biết | Thẻ khác: Enter → null |
| Hư từ / quy tắc | Hư từ mặt trước `listenText: null`; thẻ quy tắc `knownVisible: false, listenText: null` | L → null; K → null | Không đọc TTS được → `listenText` null |
| Lựa chọn | `choiceForKey('3', 4)` / `('4', 3)` / `('1', 0)` | 2 / null / null | N/A |
| QuestionCard | Chưa chọn: phím 2; đã chọn: Enter | Chọn lựa chọn thứ 2 (như bấm); Enter → `onNext` (câu cuối → "Xem kết quả") | Đã chọn: 1–4 → không đổi |
| Viên gạch | F01 màn 1–3 Enter; câu check đã xong Enter; check chưa xong / đang mời câu dễ / màn cuối Enter | Sang màn sau; câu tiếp; không làm gì | Check ẩn khi quay lại màn trước → không nhận phím |
| Gõ trong ô | F01 màn 4, gõ "chào 1" + Enter trong ô "Từ còn thiếu" | Form chấm ("Chưa đúng, gõ lại nhé."), vẫn "Màn 4/6" | N/A |
| Buổi học | `stepForKey('ArrowRight', 0, 3)` / `('ArrowRight', 2, 3)` / `('ArrowLeft', 0, 3)` / `('ArrowLeft', 2, 3)` | 1 / null / null / 1 | N/A |
| Gợi ý phím | 375px iPhone (coarse); laptop có chuột (fine) | Không thấy `kbd`; thấy `Space`, `1`–`4`, `K`, `Enter`, `←` `→` | N/A |
| Hôm nay máy tính | 1280px, `/` người mới (Sân ga) | `main` 1024px; thẻ Sân ga trải 2 cột; Streak và nhóm nút cùng một hàng | N/A |
| Lộ trình máy tính | 1280px, `/roadmap` | Thẻ chặng trải 2 cột; tháng 1 \| tháng 2, tháng 3 \| … | Số tháng lẻ → tháng cuối nằm cột trái |
| Kiểm lưới | Route `wide` có `grid.columns` 2 / 1 / không rail và không grid | Đạt / lỗi "lưới chỉ có 1 cột" / lỗi "thiếu cột phụ" | exit 1 |
| Thử phím | Kết quả probe: F01 sau Enter vẫn "Màn 1/6"; `/session` → không đổi bước; ô tìm kiếm Sổ tay ≠ "chào" hoặc hash đổi | Mỗi trường hợp một lỗi tiếng Việt | exit 1 |

</frozen-after-approval>

## Code Map

- `src/components/flashcards/FlashcardSession.tsx` -- `GRADE_BUTTONS` (32, thứ tự Quên/Khó/Nhớ/Dễ), `GradeButtons` (154), `CustomFlashcard` (174, có nghe + "Đã biết cụm này" chỉ khi đã lật), `RuleFlashcard` (251, không K/L), `Flashcard` (316: `intro` lật sẵn, `functionWordCloze` mặt trước không có nút nghe, có `return` sớm sang thẻ riêng / thẻ quy tắc).
- `src/components/ListenButton.tsx` -- dùng chung; `speak`, `canSpeak` ở `src/lib/speech.ts`.
- `src/components/quiz/QuestionCard.tsx` -- nút lựa chọn (99–121), `footer`. Nơi gọi: `src/pages/Quiz.tsx:108`, `src/pages/Owl.tsx:70` (`TensesPart`), `src/pages/Mistakes.tsx:81` (`nextButton`), `src/components/foundation/RowTestRun.tsx:89`.
- `src/components/foundation/CheckItemView.tsx` -- `ChoiceBody` (36), `status`, `footer` khi `resolved`. `src/components/foundation/BrickScreen.tsx` -- `CheckScreen` (196; footer "Câu tiếp"/"Xem kết quả"/"Xong" gọi `onNext`), `ApplyBody` có `CheckItemView` không footer. `FadedBody` có `form` + `input`.
- `src/components/foundation/BrickPlayer.tsx` -- `go`, `canNext`, `isLast`; phần check luôn gắn nhưng `hidden` khi màn khác.
- `src/pages/Session.tsx` -- `goTo` (285), `finished` return sớm (303), hàng nút đáy `lg:hidden`. `src/components/session/SessionRail.tsx` (marker) -- nút Tiếp/Quay lại máy tính.
- `src/pages/Today.tsx` -- `section.flex.flex-col.gap-6` (128) và thứ tự con. Gốc của `ComebackCard`, `OwlPlanCard` (`src/components/owl/ReviewPlan.tsx:56`), `WallPassedCard`, `FoundationHero`, `BrickReviewInvite` chưa nhận `className`.
- `src/pages/Roadmap.tsx`, `src/components/roadmap/StageMap.tsx` -- `section.flex.flex-col.gap-4` > Card chặng + `div` mỗi tháng.
- `src/app/routes.tsx` (37, 47) + `src/app/route-handle.test.ts` (route `wide` và "chỉ đúng 3 route").
- `scripts/layout/check-lib.mjs` (+ `.d.mts`) -- `WIDE_ROUTES`, `RAIL_LANDMARKS`, `layoutProblems` ("thiếu cột phụ" khi `wide` và `railCount === 0`). `scripts/layout/check.mjs` -- `measureExpression`, `openPage` (touch emulation ở 375px cho `pointer: coarse`, đã thử bằng CDP), vòng đo `main`.
- `scripts/layout/guard-lib.mjs` -- marker `mobile-guard: desktop-only`; tiền tố được phép `lg:`/`xl:`/`2xl:`/`pointer-fine:`. `src/index.css:5` đã có `@custom-variant pointer-fine`.
- Mẫu hook: `src/app/use-now.ts`, `use-online.ts`. React 19.3 có `useEffectEvent` (eslint `react-hooks` v7 cấm gán ref trong render).

## Tasks & Acceptance

**Execution:**
- [x] `src/lib/hotkeys.ts` -- `HotkeyName` (`Space | Enter | ArrowLeft | ArrowRight | 1 | 2 | 3 | 4 | k | l`), `hotkeyName(key)`, `KeyLike` / `KeyEnv` (target: `tagName`, `isContentEditable`, `role`, `hasHref`, `disabled`; env: `dialogOpen`, `selectedText`), `shouldHandleKey(e, env)` theo Decisions, `choiceForKey(name, count)`, `flashcardKeyAction(name, card)` → `{ type: 'flip' } | { type: 'grade', grade } | { type: 'known' } | { type: 'listen', text } | null`, `stepForKey(name, index, count)`.
- [x] `src/lib/hotkeys.test.ts` -- mọi dòng matrix từ "Phím thường" tới "Buổi học" (trừ dòng cần DOM), dựng `KeyLike` bằng tay.
- [x] `src/app/use-hotkeys.ts` -- `useHotkeys(bindings: Partial<Record<HotkeyName, () => void>>, enabled = true)`. Listener `keydown` trên `window` (pha nổi bọt, sau `onKeyDown` của phần tử). Đọc target / dialog / selection từ DOM thành `KeyLike`/`KeyEnv`. Nếu có binding thì `preventDefault()` rồi gọi. Bindings mới nhất qua `useEffectEvent`.
- [x] `src/components/Kbd.tsx` (marker `mobile-guard: desktop-only`) -- `Kbd({ children })` = `<kbd aria-hidden="true" className="hidden pointer-fine:inline-flex …">` (chữ nhỏ, viền, `font-normal`, khoảng cách `pointer-fine:` khi cần).
- [x] `src/components/ListenButton.tsx` -- prop tuỳ chọn `hotkey?: string` → `aria-keyshortcuts` + `title` "… (phím L)". Không truyền thì như cũ.
- [x] `src/components/flashcards/FlashcardSession.tsx` -- mỗi loại thẻ dựng `card` state (`flipped`, `intro`, `knownVisible`, `listenText` = null khi `!canSpeak()` hoặc nút nghe từ chưa hiện) và gọi `useHotkeys` qua `flashcardKeyAction`. `Flashcard` gọi hook trước `return` sớm với `enabled` = là thẻ từ. Thêm `<Kbd>` vào "Lật thẻ" (Space), nút chấm (1–4), "Đã biết" (K); nút nghe từ truyền `hotkey="L"`.
- [x] `src/components/quiz/QuestionCard.tsx` -- prop `onNext?: () => void`. 1–4 qua `choiceForKey` khi `!answered`; Enter → `onNext` khi `answered`. `<Kbd>{i + 1}</Kbd>` trong span chữ của 4 lựa chọn đầu.
- [x] `src/pages/Quiz.tsx`, `src/pages/Owl.tsx`, `src/pages/Mistakes.tsx`, `src/components/foundation/RowTestRun.tsx` -- tách handler nút tiếp thành hằng, truyền cho cả nút (thêm `<Kbd>Enter</Kbd>`) và `onNext`.
- [x] `src/components/foundation/CheckItemView.tsx` -- props `active?: boolean` (mặc định true) và `onContinue?: () => void`. 1–4 cho `choice`/`listen` khi `answering`; Enter → `onContinue` khi `resolved`. `<Kbd>` trong lựa chọn.
- [x] `src/components/foundation/BrickScreen.tsx` -- `CheckScreen` nhận `active` và truyền `active` + `onContinue={onNext}` cho `CheckItemView`. Footer thêm `<Kbd>Enter</Kbd>`.
- [x] `src/components/foundation/BrickPlayer.tsx` -- truyền `active={screen.kind === 'check'}`. `useHotkeys({ Enter: () => go(index + 1) }, canNext && !isLast)`. Trên màn check, `canNext` chỉ đúng khi `flow.stage === 'finished'`, lúc đó không còn `CheckItemView` nào, nên hai Enter không cùng bật. Nút "Tiếp" thêm `<Kbd>Enter</Kbd>`.
- [x] `src/pages/Session.tsx` -- `useHotkeys` với `ArrowRight`/`ArrowLeft` qua `stepForKey` → `goTo`, gọi trước `if (finished)`, `enabled = !finished`. Hàng nút đáy thêm `<Kbd>←</Kbd>` / `<Kbd>→</Kbd>`. `src/components/session/SessionRail.tsx`: thêm `Kbd` tương tự.
- [x] `src/components/ComebackCard.tsx`, `src/components/owl/ReviewPlan.tsx` (`OwlPlanCard`), `src/components/foundation/WallPassedCard.tsx` (`WallPassedCard`), `src/components/foundation/FoundationHero.tsx`, `src/components/foundation/BrickReviewInvite.tsx` -- prop `className?: string` ghép bằng `cn(<class cũ>, className)` ở phần tử gốc.
- [x] `src/pages/Today.tsx` -- section thêm `lg:grid lg:grid-cols-2 lg:items-start`. Header, div của `ReminderBanner` và 5 component trên nhận `lg:col-span-2`.
- [x] `src/components/roadmap/StageMap.tsx` -- section thêm `lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-6`; Card thêm `lg:col-span-2`; div tháng thêm `lg:min-w-0`.
- [x] `src/app/routes.tsx` -- `handle: { layout: 'wide' } satisfies RouteHandle` cho index `/` và `roadmap`. `src/app/route-handle.test.ts`: `/`, `/roadmap` → `wide`; đếm 5 route `wide`.
- [x] `scripts/layout/check-lib.mjs` + `.d.mts` -- `WIDE_ROUTES` thêm `/`, `/roadmap`. `GRID_LANDMARKS = { '/': 'main > section', '/roadmap': 'main section[aria-labelledby^="stage-"]' }`; metric `grid: { selector, columns } | null` (số giá trị `left` làm tròn khác nhau của con trực tiếp đang hiện, phần tử khớp đầu tiên). `layoutProblems`: lỗi "thiếu cột phụ" chỉ khi `wide` và không rail và không `grid`; desktop + `grid.columns < 2` → "lưới chỉ có N cột". `hotkeyProblems(probe)` → lỗi tiếng Việt theo dòng "Thử phím".
- [x] `scripts/layout/check.mjs` -- đo `grid` trong `measureExpression`. Sau vòng đo, ở 1280×800 trên bản hiện tại chạy probe phím:
  - Phím thường gửi qua `Input.dispatchKeyEvent`.
  - Chữ có dấu gửi qua `Input.imeSetComposition` + `Input.insertText`, mô phỏng Telex.
  - Các bước: F01 (Enter ×3 → "Màn 4/6"; focus ô, gõ "chào 1" + Enter → vẫn "Màn 4/6" và có "Chưa đúng"; sau review: bỏ focus, Enter → "Màn 5/6", quay lại màn 4 bấm 1, Enter về màn 5 → câu 1 chưa trả lời, bấm 1 → đã chọn); `/foundation/kiem-tra/A` (sau review: bấm 2 → đã chọn, Enter → "Câu 2/8"); `/session` (→ bước 2 `aria-current="step"`, ← bước 1); `/notebook` ("Thêm ghi chú", gõ "chào" vào ô "Quy tắc", "Lưu ghi chú", gõ "chào" vào `input[type=search]` → value "chào", hash `#/notebook`, `scrollY` không đổi).
  - Lỗi probe vào bảng kết quả, exit 1.
- [x] `src/lib/layout-check.test.ts` -- các dòng "Kiểm lưới", "Thử phím" và dòng route `wide` cũ vẫn báo "thiếu cột phụ" khi không có cả rail lẫn grid.
- [x] `_bmad-output/specs/spec-english-learning-website/stack.md` -- dòng UI thêm:
  - Hôm nay và Lộ trình là `wide` và dùng lưới 2 cột.
  - Phím tắt dùng `useHotkeys` (`src/app/use-hotkeys.ts`) với chốt `shouldHandleKey` (`src/lib/hotkeys.ts`).
  - Gợi ý phím là `Kbd`, chỉ hiện với `pointer-fine`.

**Acceptance Criteria:**
- Given laptop có bàn phím đang ôn flashcard, when bấm Space rồi 3, then thẻ lật và được chấm "Nhớ" y như bấm chuột, và thẻ sau hiện ra.
- Given đang làm quiz bài trên laptop, when bấm 2 rồi Enter, then lựa chọn thứ 2 được chấm và sang câu tiếp. Ở câu cuối, Enter mở màn kết quả.
- Given buổi học Sân ga ở bước Lý thuyết, when bấm →, then sang "Ôn & từ mới". Bấm ← thì quay lại, giống hệt khi bấm nút "Quay lại".
- Given đang gõ Telex trong ô tìm kiếm Sổ tay hay ô ghi chú, when gõ "chào 1 k", then chữ vào ô đúng như gõ, và không phím tắt nào chạy.
- Given iPhone 375px, when mở mọi trang sau story này, then giao diện y như trước, không thấy gợi ý phím.
- Given laptop 1280px, when mở Hôm nay và Lộ trình, then nội dung chia 2 cột trong khung 1024px. Kéo cửa sổ dưới 1024px thì trở về một cột như điện thoại.

## Implementation Notes

- **Logic phím** ở `src/lib/hotkeys.ts` (thuần) + `src/lib/hotkeys.test.ts` (mọi dòng matrix từ "Phím thường" tới "Buổi học", dựng `KeyLike` bằng tay). Ngoài matrix: `hotkeyName` nhận cả `'Spacebar'` (trình duyệt cũ); `aria-disabled="true"` được coi như `disabled` khi đọc target trong hook; `CHOICE_KEYS` / `GRADE_KEYS` dùng chung cho nút và phím.
- **`useHotkeys`** (`src/app/use-hotkeys.ts`): listener `keydown` trên `window` (nổi bọt), `useEffectEvent` giữ bindings mới nhất, effect chỉ phụ thuộc `enabled`. Mỗi nơi gọi chỉ truyền binding đang hợp lệ, nên phím không có binding không bị `preventDefault`.
- **Thẻ từ:** `useFlashcardKeys` dựng bindings từ `flashcardKeyAction`. `Flashcard` gọi hook trước hai `return` sớm với `enabled` = thẻ NGSL/TSL; `CustomFlashcard` (K chỉ khi đã lật và `kind === 'new'`; L luôn có vì nút nghe ở header) và `RuleFlashcard` (không K/L) có hook riêng. Hư từ: `listenText` null khi chưa lật. Nút "Lật thẻ" / "Đã biết" tách thành `FlipButton` / `KnownButton` (cùng class, thêm `aria-keyshortcuts` + `Kbd`).
- **QuestionCard / CheckItemView / BrickPlayer / Session** làm đúng như Tasks. `Owl.tsx` (`TensesPart`): `next` giữ chốt `if (!answered) return`, nút vẫn `disabled={!answered}`. `Mistakes.tsx`: `nextButton` cũ giữ nguyên cho `WordReviewCard` (không phím), câu trắc nghiệm dùng nút mới có `Kbd`.
- **Lưới:** Hôm nay (`lg:grid lg:grid-cols-2 lg:items-start`, header / dải nhắc / 5 thẻ lớn `lg:col-span-2`), Lộ trình (`StageMap`). `layout:guard` đạt (chỉ thêm token `lg:` / `pointer-fine:`; `Kbd.tsx` có marker).
- **`layout:check` — sửa thêm hai lỗi chờ của script cũ (lộ ra khi `/` thành `wide`):**
  - `page.load`: sau khi đặt lại `location.hash`, SETTLE trả ngay (lần đổi DOM cuối đã lâu) trước khi router vẽ lại, nên `/` (lần đầu bị chuyển sang `/welcome`) thỉnh thoảng bị đo khi còn là trang Thư nhập học → "main rộng 768px", "lưới chỉ có 1 cột" ngẫu nhiên ở 1024/1280/1920. Giờ đặt lại mốc `__layoutLastMutation` cùng lúc đổi hash.
  - Khi đã chờ đúng thì `/session` (tự ghi `?brick=F01&step=theory`) bị báo "redirect", nên so hash chỉ theo phần đường dẫn trước `?`.
  - Probe phím: `settle` đặt lại mốc trước khi chờ (cùng lỗi trên làm `/session` ← đọc bước quá sớm, báo sai "không về bước 1").
- **Đã kiểm:** `npm run lint && npm test && npm run build` đạt (75 file, 1696 test). `npm run layout:guard -- --base a19ede5…` exit 0. `npm run layout:check -- --base a19ede5…` exit 0: mọi route × 5 bề rộng ok, ảnh 375px trùng bản gốc 12/12, `/` và `/roadmap` lưới 2 cột ở 1024/1280/1920, probe phím đạt (F01, `/session`, `/notebook`); chạy thêm 2 lượt `--skip-diff` liên tiếp đều đạt. Đã xem `1280-home.png`, `1280-roadmap.png`: thẻ Sân ga / thẻ chặng trải 2 cột, Streak và nhóm nút cùng hàng.
- **Chưa kiểm:** mục kiểm tay trên laptop thật với bộ gõ Telex thật và trên iPhone thật (probe chỉ mô phỏng IME qua CDP). Không có test component (Vitest env `node`), phần nối UI chỉ được kiểm qua probe `layout:check`; phím thẻ từ chưa có probe tự động (chỉ unit test `flashcardKeyState` / `flashcardBindings`).
- **Sau review (vòng 0):**
  - Binding dựng bằng hàm thuần có test: `flashcardKeyState` (mỗi loại thẻ một nhánh: từ / thẻ riêng / quy tắc), `flashcardBindings`, `choiceBindings` (dùng chung cho `QuestionCard` và `CheckItemView`). `HotkeyBindings` chuyển vào `src/lib/hotkeys.ts` (hook re-export).
  - Nút chấm lặp theo `GRADE_KEYS` + `GRADE_STYLES` (thứ tự nút và phím 1–4 cùng một nguồn).
  - Thẻ "Làm quen": Enter → "Đã xem", nút có `<Kbd>Enter</Kbd>` + `aria-keyshortcuts`.
  - `Session.goTo` bỏ focus sau khi đổi bước: nút "Tiếp" ở cột phụ / hàng đáy là cùng nút sau khi đổi bước, nên trước đó Space (lật thẻ) bấm lại nút và nhảy qua bước thẻ từ.
  - Probe phím thêm: F01 Enter sang màn 5, quay lại màn 4 bấm 1 (phần luyện tập ẩn không được trả lời), Enter về màn 5, bấm 1 (phải chọn); `/foundation/kiem-tra/A` bấm 2 (chọn) rồi Enter (sang "Câu 2/8"). Đã thử phá: bỏ `active={screen.kind === 'check'}` hoặc bỏ `onNext` của `RowTestRun` → probe báo lỗi.
  - `stack.md`: phím tắt tách thành dòng riêng "Phím tắt (máy tính)".

## Spec Change Log

- **2026-11-09, review vòng 0 — thẻ "Làm quen" thêm Enter.** Finding: thẻ "Làm quen" (mọi từ mới, vì `buildStudySession` luôn bật `introMode`) không có phím nào để đi tiếp (1–4 và Space là null theo matrix), nên mục kiểm tay "Ôn 5 thẻ chỉ bằng bàn phím" tự mâu thuẫn với matrix. Sửa: thêm dòng Enter vào Intent (Thẻ từ) và cột Expected của dòng matrix "Thẻ Làm quen". Enter là phím "đi tiếp" của mọi màn khác trong story (QuestionCard, câu check, viên gạch), nên là cách duy nhất hợp quy ước; không đổi 1–4 / Space / K / L. Trạng thái xấu tránh được: người học dùng bàn phím kẹt ở mỗi từ mới. KEEP: thẻ thường Enter vẫn null; Space đã lật vẫn null (trang cuộn).
- **2026-11-09, review vòng 0 — làm rõ Never về câu `order` / `sort` / `tapSyllable`.** Finding: Never cấm phím cho các câu này, nhưng Intent ("Câu check đã xong: Enter bấm nút footer") và nút footer có `<Kbd>Enter</Kbd>` áp cho mọi loại câu. Sửa: Never chỉ cấm phím trả lời cho ba loại câu đó; Enter "Câu tiếp" sau khi câu đã xong vẫn chạy. Code giữ nguyên hành vi, chỉ sửa chú thích `CheckItemView`. Trạng thái xấu tránh được: gợi ý Enter trên nút "Câu tiếp" nói sai ở câu xếp chữ. KEEP: không có phím 1–4 hay phím nào khác khi đang trả lời ba loại câu đó.

## Review Triage Log

Nguồn: B = Blind Hunter, E = Edge Case Hunter, V = Verification Gap. Vòng 0.

| # | Nguồn | Finding | Verdict | Bằng chứng | Route |
|---|---|---|---|---|---|
| 1 | B1 | Thẻ "Làm quen" không có phím đi tiếp ("Đã xem") | medium | `flashcardKeyAction` trả null cho Space/1–4 khi `intro`; nút "Đã xem" không có binding. Mọi từ mới là thẻ "Làm quen" (`buildStudySession` bật `introMode`), nên chỉ dùng bàn phím phải Tab qua từng từ của câu ví dụ | patch + sửa spec: Enter → `onGrade('good')`, `Kbd` + test (Spec Change Log) |
| 2 | B2 | Bước `/notebook` của probe không thể hỏng vì phím tắt | low | Đúng là `/notebook` không gắn hook nào, nhưng chốt ô nhập với binding đang sống đã được bước F01 kiểm (màn 4 có Enter "Tiếp" đang bật, gõ "chào 1" + Enter trong ô vẫn ở màn 4); trên `/notebook` tiêu chí tự đúng | reject |
| 3 | B3 | Mô phỏng Telex không chạm chốt IME | low | IME chỉ soạn chữ trong phần tử nhập, mà chốt ô nhập đã chặn trước; nhánh `isComposing`/229 có unit test; Telex thật nằm trong mục kiểm tay | reject |
| 4 | B4 | Mũi tên bị chiếm trên widget dùng mũi tên (tab/radio/slider, vùng cuộn) | low | Cả `src` chỉ có một `role="radio"` (`SubtitledVideo`, nút thường không tự xử lý mũi tên, nên mũi tên ở đó vốn không làm gì); không có `slider`/`tablist`/`listbox`; iframe YouTube giữ focus riêng nên phím không tới `window`. Intent đóng băng ghi rõ "số và mũi tên vẫn chạy" trên các role này | reject (gộp #16) |
| 5 | B5 | Sau khi bấm chuột, Enter/Space vào nút đang focus thay vì hành động có gợi ý `Kbd` | low | Đúng thiết kế đóng băng (Space/Enter trên nút để trình duyệt bấm). Trường hợp gây hại thật (nút "Tiếp" của buổi học còn focus sau khi đổi bước) xử lý ở #14; các nút khác (Gợi ý, Nghe) chỉ lặp lại hành động vô hại, còn nút chọn / nút chấm bị gỡ hoặc `disabled` sau khi bấm nên mất focus | reject (phần buổi học → #14) |
| 6 | B6 | Phím thẻ từ và `QuestionCard` không có kiểm tự động | medium | Trùng #20, #21: chỉ có test `flashcardKeyAction`/`choiceForKey` rời; probe không mở thẻ từ hay quiz | patch (gộp #20, #21) |
| 7 | B7 | Lưới Hôm nay chỉ đo ở một trạng thái dữ liệu; `columns` = 1 giả khi mọi con trải 2 cột | low | `layout:check` chỉ chạy dữ liệu sạch (chế độ Sân ga). Chế độ lộ trình: các thẻ mỗi thẻ một ô theo Intent, `ScheduleCard` ở nửa khung 1024px (~500px) vẫn rộng hơn 375px; trạng thái "mọi con đều trải 2 cột" không xảy ra trên dữ liệu sạch (Streak luôn một ô) | reject (thêm mục kiểm tay) |
| 8 | B8 | Kiểm lưới Lộ trình chỉ đo chặng đầu; tháng lẻ không được khẳng định | low | Các chặng dùng cùng component `StageMap`; tháng lẻ nằm cột trái là hành vi mặc định của CSS grid, không có code riêng để hỏng | reject |
| 9 | B9 | `GRADE_KEYS` không thật sự dùng chung với `GRADE_BUTTONS` | low | `GradeButtons` lặp `GRADE_BUTTONS` và lấy số bằng `GRADE_KEYS.indexOf(grade) + 1`; đổi thứ tự một bên là số trên nút lệch với phím | patch: lặp `GRADE_KEYS` + `GRADE_STYLES`, test thứ tự |
| 10 | B10 | Gợi ý phím hiện trên nút `disabled`; L không có `Kbd` | low | Chỉ là hiển thị: nút `disabled` không chạy gì (`next` của O.W.L. có chốt `if (!answered) return`); `ListenButton` là nút icon, L đã có trong `title` + `aria-keyshortcuts`, matrix "Gợi ý phím" cố ý không liệt kê L | reject |
| 11 | B11 | Thanh nổi của `ReadableText` không được coi là lớp phủ chặn phím | false | Thanh "Lưu" chỉ hiện khi đang bôi đen chữ, lúc đó `shouldHandleKey` đã trả false; thanh thông báo nằm trong `ReadableText` của thẻ, mà `Flashcard` có `key` theo thẻ nên chấm xong là thanh bị gỡ, không còn chữ của thẻ trước | reject |
| 12 | B12 | Frontmatter / Spec Change Log / Triage Log chưa cập nhật | low | Các mục này do bước review này điền (status đặt `done` khi commit); hai sửa `check.mjs` là sửa lỗi script cũ, đã ghi ở Implementation Notes, không đổi spec. Sửa = chỉnh spec của chính build này | reject |
| 13 | B13 | Ô UI trong `stack.md` quá dài | low | Một ô bảng gồm cả TopBar, SplitLayout, lưới, phím tắt, guard; story sau sẽ tiếp tục dồn vào | patch: tách dòng "Phím tắt (máy tính)" |
| 14 | E1 | Nút "Tiếp" ở cột phụ buổi học còn focus sau khi bấm chuột; Space để lật thẻ lại bấm nút đó, nhảy qua bước thẻ từ | medium | `SessionRail` / hàng nút đáy giữ nguyên phần tử nút khi đổi bước; `activatesOnKey` để Space vào nút → `goTo(stepIndex + 1)`. Trước story Space không có nghĩa "lật thẻ" nên không ai bấm | patch: `goTo` bỏ focus phần tử đang focus |
| 15 | E2 | Bàn phím AZERTY: phím số cần Shift nên 1–4 không chạy | low | Đúng với AZERTY, nhưng app dùng một người (Huy, bàn phím QWERTY + Telex); sửa cần thêm nhánh `e.code` | reject |
| 16 | E3 | Mũi tên trên nút `role=radio` chế độ phụ đề làm buổi học đổi bước | low | Như #4: nhóm radio này không tự xử lý mũi tên nên → / ← ở đó chỉ có nghĩa đổi bước như Intent quy định | reject (gộp #4) |
| 17 | E4 | Probe không kiểm kết quả `page.load` (redirect / timeout) | low | Nếu bị chuyển trang, bước sau vẫn báo lỗi (thông báo kém rõ), exit 1; chỉ ảnh hưởng người chạy script | reject |
| 18 | E5 | `Kbd` hiện dưới 1024px khi có chuột, trái "dưới 1024px không đổi từng pixel" | false | Intent đóng băng chọn rõ "phím tắt chạy ở mọi bề rộng, gợi ý `kbd` chỉ hiện với `pointer-fine:`" và Always cho phép tiền tố `pointer-fine:`; ràng buộc pixel đo với touch emulation | reject |
| 19 | E6 | Enter "Câu tiếp" chạy cả với câu `order`/`sort`/`tapSyllable`, trái Never | low | Never và Intent ("câu check đã xong: Enter bấm nút footer", nút footer có `Kbd` cho mọi loại) mâu thuẫn; hành vi vô hại và khớp gợi ý trên nút | patch: làm rõ Never (Spec Change Log) + sửa chú thích `CheckItemView` |
| 20 | V1 | Nối phím thẻ từ (Space, 1–4, K, L) không có test / probe | medium | Lỗ hổng do layer xác minh (đã tra test). Sửa: `flashcardKeyState` (3 loại thẻ, hư từ mặt trước không L) + `flashcardBindings` (gọi đúng `onGrade`/`onKnown`/`listen`) là hàm thuần, ba component gọi chung, có unit test | patch |
| 21 | V2 | `QuestionCard` 1–4 / Enter → `onNext` của 4 nơi gọi chưa được chạy | medium | Lỗ hổng do layer xác minh. Sửa: `choiceBindings` thuần có test; probe thêm `/foundation/kiem-tra/A` bấm 2 rồi Enter. Đã thử bỏ `onNext` của `RowTestRun` → probe báo lỗi | patch |
| 22 | V3 | Phím của `CheckItemView` và chốt `active` của phần check ẩn chưa được chạy | medium | Lỗ hổng do layer xác minh. Sửa: probe F01 sang màn 5, quay lại màn 4 bấm 1, về màn 5 (câu 1 phải còn chưa trả lời), bấm 1 (phải chọn). Đã thử đổi `active` thành `true` → probe báo lỗi | patch |
| 23 | V4 | Nối DOM của `useHotkeys` chỉ được kiểm bởi `layout:check` chạy tay, ngoài CI | medium | Repo không có môi trường DOM cho Vitest; `deploy.yml` chỉ chạy lint/test/build; spec chấp nhận `layout:check` là cổng tay | defer |

## Design Notes

Thứ tự xử lý một phím: `onKeyDown` của phần tử chạy trước (vd từ trong `ReadableText` gọi `preventDefault`), sau đó mới tới listener trên `window`. Listener chạy `shouldHandleKey`, rồi `hotkeyName`, rồi tra binding của hook đang bật. Có binding thì `preventDefault()` và gọi handler. Hook khác thấy `defaultPrevented` nên bỏ qua.

```ts
const action = flashcardKeyAction(name, { flipped, intro, knownVisible: kind === 'new', listenText })
// Space chưa lật → { type: 'flip' } ; '3' đã lật → { type: 'grade', grade: 'good' } ; còn lại → null (không chặn phím)
```

Các binding chỉ có mặt khi hợp lệ (vd Enter của `BrickPlayer` chỉ bật khi `canNext && !isLast`). Nhờ vậy Enter của câu check và Enter "Tiếp" không bao giờ cùng bật.

## Verification

**Commands:**
- `npm run lint && npm test && npm run build` -- expected: pass.
- `npm run layout:guard -- --base a19ede58eb593743f461317a4c8c17f6c4bd55be` -- expected: exit 0. `Kbd.tsx` được bỏ qua nhờ marker; file có sẵn chỉ thêm token `lg:` / `pointer-fine:`.
- `npm run layout:check -- --base a19ede58eb593743f461317a4c8c17f6c4bd55be` -- expected: exit 0.
  - Ảnh 375px trùng bản gốc.
  - `/` và `/roadmap` có `main` 1024px và lưới 2 cột ở 1024 / 1280 / 1920.
  - Probe phím đạt (F01 gồm màn luyện tập, kiểm tra hàng A, `/session`, `/notebook`).

**Manual checks:**
- Xem ảnh `1280-home.png` và `1280-roadmap.png`: hai cột cân, thẻ Sân ga và thẻ chặng trải hết bề rộng.
- Trên laptop thật, bật bộ gõ Telex: gõ ghi chú, ô tìm kiếm, ô "Từ còn thiếu" không kích hoạt phím tắt. Ôn 5 thẻ chỉ bằng bàn phím. Trên iPhone không thấy `kbd`.
