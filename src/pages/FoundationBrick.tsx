import { ArrowLeft, Hammer } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router'

import { BrickPlayer } from '@/components/foundation/BrickPlayer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getBrickMeta } from '@/data/foundation'
import { getBrick, hasBrickContent } from '@/data/foundation/content'
import { brickHref, resolveBrickRoute } from '@/lib/foundation'

/** `/foundation/:brickId`: id viết thường được chấp nhận, id lạ về bức tường, viên chưa có nội dung hiện "Đang soạn". */
export function FoundationBrick() {
  const { brickId } = useParams()
  const route = resolveBrickRoute(brickId, hasBrickContent)

  if (route.kind === 'unknown') return <Navigate to="/foundation" replace />
  // `f01` → `/foundation/F01`: liên kết và lịch sử luôn dùng id viết hoa.
  if (brickId !== route.id) return <Navigate to={brickHref(route.id)} replace />

  const brick = route.kind === 'play' ? getBrick(route.id) : undefined
  if (brick) return <BrickPlayer key={brick.id} brick={brick} />

  const meta = getBrickMeta(route.id)
  return (
    <section className="flex flex-col gap-4 lg:mx-auto lg:w-full lg:max-w-3xl">
      <Link
        to="/foundation"
        className="inline-flex items-center gap-1 self-start text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Bức tường
      </Link>
      <Card className="gap-4">
        <CardHeader>
          <Hammer className="size-7 text-primary" aria-hidden="true" />
          <CardTitle>
            <h1 className="text-xl leading-tight">Viên này đang soạn</h1>
          </CardTitle>
          <CardDescription>
            {route.id} · {meta?.title}. Nội dung viên gạch này sẽ có sớm.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link to="/foundation">Về bức tường</Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  )
}
