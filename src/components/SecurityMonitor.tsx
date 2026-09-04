'use client'

import { useEffect } from 'react'
import { useSession } from '@/components/SessionProvider'
import { initDevtoolsDetection } from '@/lib/securityMonitor'

// Site-wide and mounted once per logged-in session (unauthenticated
// visitors can't reach anything worth flagging anyway). Lesson-content
// copy/selection detection is separate — see ArticleBody in
// components/lesson/LessonContentViews.tsx — since it needs to attach to
// that specific content container, not the whole page.
export default function SecurityMonitor() {
  const { user } = useSession()

  useEffect(() => {
    if (!user) return
    return initDevtoolsDetection()
  }, [user])

  return null
}
