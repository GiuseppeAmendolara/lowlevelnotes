'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from '@/components/SessionProvider'
import AchievementTile from '@/components/AchievementTile'
import { getUserProfile, getAssetSrc, roleLabel, type UserProfile } from '@/lib/authClient'
import Eyebrow from '@/components/Eyebrow'

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { user, loading: sessionLoading } = useSession()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionLoading && !user) {
      router.replace('/login')
    }
  }, [sessionLoading, user, router])

  useEffect(() => {
    if (!user) return

    getUserProfile(Number(id)).then((result) => {
      if (result.ok) setProfile(result.data)
      else setError(result.error)
    })
  }, [id, user])

  if (sessionLoading || !user) {
    return (
      <main className="min-h-screen bg-[#0B0B0D]">
        <section className="mx-auto max-w-3xl px-6 pb-10 pt-20 sm:pt-28">
          <p className="text-sm text-[#90939A] animate-pulse motion-reduce:animate-none">Loading…</p>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0B0B0D]">
      <section className="mx-auto max-w-3xl px-6 pb-24 pt-20 sm:pt-28">
        {error && <p className="text-sm text-[#F85149] animate-fade-in-up motion-reduce:animate-none">{error}</p>}

        {!profile && !error && (
          <p className="text-sm text-[#90939A] animate-pulse motion-reduce:animate-none">Loading…</p>
        )}

        {profile && (
          <>
            <div className="flex items-center gap-5">
              {profile.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- cross-subdomain, session-cookie-gated asset; next/image can't proxy this
                <img
                  src={getAssetSrc(profile.avatarUrl)}
                  alt=""
                  className="h-20 w-20 shrink-0 rounded-full border border-white/10 object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#17181B] text-2xl font-bold text-white/40">
                  {profile.displayName.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div>
                <Eyebrow>{roleLabel(profile.role)}</Eyebrow>
                <h1 className="mt-1 text-3xl font-bold tracking-[-0.04em] text-white sm:text-4xl">{profile.displayName}</h1>
                <p className="mt-1 text-xs text-white/40">Joined {new Date(profile.joinedAt).toLocaleDateString()}</p>
              </div>
            </div>

            {profile.bio && <p className="mt-6 max-w-xl text-sm leading-7 text-[#90939A]">{profile.bio}</p>}

            {user.id === profile.id && (
              <Link href="/account/profile" className="mt-4 inline-block text-sm text-white/70 underline underline-offset-2 transition-colors hover:text-white">
                Edit your profile
              </Link>
            )}

            <div className="mt-10">
              <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-white/40">Achievements</h2>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {profile.achievements.map((achievement) => (
                  <AchievementTile key={achievement.slug} achievement={achievement} />
                ))}
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  )
}
