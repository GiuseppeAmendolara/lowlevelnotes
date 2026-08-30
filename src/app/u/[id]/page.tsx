'use client'

import { use, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/components/SessionProvider'
import AchievementTile from '@/components/AchievementTile'
import AuthSubmitButton from '@/components/auth/AuthSubmitButton'
import AuthMessage from '@/components/auth/AuthMessage'
import { getUserProfile, updateMyProfile, uploadMyAvatar, getAssetSrc, roleLabel, type UserProfile } from '@/lib/authClient'
import Eyebrow from '@/components/Eyebrow'

const textareaClass = "w-full border border-white/15 bg-[#17181B] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none"

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { user, loading: sessionLoading } = useSession()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [bio, setBio] = useState('')
  const [uploading, setUploading] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!sessionLoading && !user) {
      router.replace('/login')
    }
  }, [sessionLoading, user, router])

  useEffect(() => {
    if (!user) return

    getUserProfile(Number(id)).then((result) => {
      if (result.ok) {
        setProfile(result.data)
        setBio(result.data.bio ?? '')
      } else {
        setError(result.error)
      }
    })
  }, [id, user])

  const isOwnProfile = Boolean(user && profile && user.id === profile.id)

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setAvatarError(null)
    const result = await uploadMyAvatar(file)
    setUploading(false)

    if (!result.ok) {
      setAvatarError(result.error)
      return
    }

    setProfile((prev) => (prev ? { ...prev, avatarUrl: result.data.avatarUrl } : prev))
  }

  async function handleSaveBio(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaveError(null)
    setSaved(false)

    const result = await updateMyProfile(bio)
    setSaving(false)

    if (!result.ok) {
      setSaveError(result.error)
      return
    }

    setProfile((prev) => (prev ? { ...prev, bio } : prev))
    setSaved(true)
  }

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

                {isOwnProfile && (
                  <>
                    <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/gif" className="hidden" onChange={handleAvatarChange} />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="mt-2 border border-white/15 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:border-white/40 disabled:opacity-50"
                    >
                      {uploading ? 'Uploading…' : 'Change picture'}
                    </button>
                    {avatarError && <p className="mt-2 text-xs text-[#F85149]">{avatarError}</p>}
                  </>
                )}
              </div>
            </div>

            {isOwnProfile ? (
              <form onSubmit={handleSaveBio} className="mt-6 flex max-w-xl flex-col gap-3">
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-medium uppercase tracking-[0.1em] text-white/40">Bio</span>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={1000}
                    rows={4}
                    placeholder="Tell people a bit about yourself…"
                    className={textareaClass}
                  />
                </label>

                {saveError && <AuthMessage message={saveError} />}
                {saved && <AuthMessage message="Saved." tone="success" />}

                <AuthSubmitButton loading={saving}>Save</AuthSubmitButton>
              </form>
            ) : (
              profile.bio && <p className="mt-6 max-w-xl text-sm leading-7 text-[#90939A]">{profile.bio}</p>
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
