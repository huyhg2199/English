import type { LucideIcon } from 'lucide-react'

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type Props = {
  title: string
  subtitle?: string
  icon: LucideIcon
}

export function PagePlaceholder({ title, subtitle, icon: Icon }: Props) {
  return (
    <section className="flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <Icon className="size-7 text-primary drop-shadow-[0_0_8px_var(--candle-glow)]" aria-hidden="true" />
        <h1 className="text-2xl font-semibold tracking-wide">{title}</h1>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Sắp có</CardTitle>
          {subtitle && <CardDescription>{subtitle}</CardDescription>}
        </CardHeader>
      </Card>
    </section>
  )
}
