import type { TimelineKind } from '@/data/lessons'

const W = 300
const H = 96
const AXIS_Y = 58
const NOW_X = W / 2
/** Vị trí các lần lặp của thói quen (trải cả quá khứ – hiện tại – tương lai). */
const HABIT_XS = [42, 78, 114, 150, 186, 222, 258]

function Cross({ x, faded }: { x: number; faded?: boolean }) {
  return (
    <g stroke="var(--primary)" strokeWidth={2.5} strokeLinecap="round" opacity={faded ? 0.45 : 1}>
      <line x1={x - 5} y1={AXIS_Y - 5} x2={x + 5} y2={AXIS_Y + 5} />
      <line x1={x - 5} y1={AXIS_Y + 5} x2={x + 5} y2={AXIS_Y - 5} />
    </g>
  )
}

/**
 * Dòng thời gian tự vẽ (SVG co theo bề rộng): quá khứ – hiện tại – tương lai.
 * `state`: một dải trạng thái phủ quanh "bây giờ". `habit`: các dấu × lặp lại đều đặn.
 * `habit-question`: các dấu × mờ kèm dấu "?" ở hiện tại (hỏi / phủ định thói quen).
 */
export function TenseTimeline({ kind, label }: { kind: TimelineKind; label: string }) {
  return (
    <figure className="flex flex-col gap-1">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full max-w-full"
        role="img"
        aria-label={`Dòng thời gian: ${label}`}
        fontFamily="inherit"
      >
        {/* Trục thời gian có mũi tên về tương lai */}
        <line x1={8} y1={AXIS_Y} x2={W - 12} y2={AXIS_Y} stroke="var(--muted-foreground)" strokeWidth={1.5} />
        <path d={`M ${W - 12} ${AXIS_Y - 5} L ${W - 4} ${AXIS_Y} L ${W - 12} ${AXIS_Y + 5} Z`} fill="var(--muted-foreground)" />

        {/* Mốc "bây giờ" */}
        <line
          x1={NOW_X}
          y1={AXIS_Y - 30}
          x2={NOW_X}
          y2={AXIS_Y + 14}
          stroke="var(--accent-foreground)"
          strokeWidth={1.5}
          strokeDasharray="3 3"
        />

        {kind === 'state' && (
          <rect
            x={NOW_X - 60}
            y={AXIS_Y - 7}
            width={120}
            height={14}
            rx={7}
            fill="var(--primary)"
            opacity={0.85}
          />
        )}
        {kind !== 'state' && HABIT_XS.map((x) => <Cross key={x} x={x} faded={kind === 'habit-question'} />)}
        {kind === 'habit-question' && (
          <text x={NOW_X + 8} y={AXIS_Y - 14} fontSize={18} fontWeight={700} fill="var(--primary)">
            ?
          </text>
        )}

        <text x={NOW_X} y={AXIS_Y - 34} fontSize={11} textAnchor="middle" fill="var(--accent-foreground)">
          bây giờ
        </text>
        <text x={8} y={AXIS_Y + 30} fontSize={11} fill="var(--muted-foreground)">
          Quá khứ
        </text>
        <text x={NOW_X} y={AXIS_Y + 30} fontSize={11} textAnchor="middle" fill="var(--muted-foreground)">
          Hiện tại
        </text>
        <text x={W - 4} y={AXIS_Y + 30} fontSize={11} textAnchor="end" fill="var(--muted-foreground)">
          Tương lai
        </text>
      </svg>
      <figcaption className="text-center text-xs text-muted-foreground">{label}</figcaption>
    </figure>
  )
}
