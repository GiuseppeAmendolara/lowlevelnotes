'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthPageShell from '@/components/auth/AuthPageShell'
import AuthSubmitButton from '@/components/auth/AuthSubmitButton'
import AuthMessage from '@/components/auth/AuthMessage'
import { useSession } from '@/components/SessionProvider'
import { getUserProfile, updateMyProfile, uploadMyAvatar, getAvatarSrc, type UserProfile } from '@/lib/authClient'

const textareaClass = "border border-white/15 bg-[#0D0D0D] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none"

export default function AccountProfilePage() {
  const router = useRouter()
  const { user, loading: sessionLoading } = useSession()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [bio, setBio] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionLoading && !user) {
      router.replace('/login')
    }
  }, [sessionLoading, user, router])

  useEffect(() => {
    if (!user) return

    getUserProfile(user.id).then((result) => {
      if (result.ok) {
        setProfile(result.data)
        setBio(result.data.bio ?? '')
      }
    })
  }, [user])

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)
    const result = await uploadMyAvatar(file)
    setUploading(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    setProfile((prev) => (prev ? { ...prev, avatarUrl: result.data.avatarUrl } : prev))
  }

  async function handleSaveBio(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    const result = await updateMyProfile(bio)
    setSaving(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    setSuccess('Profile updated.')
  }

  if (sessionLoading || !user) {
    return (
      <AuthPageShell eyebrow="Account" heading="Your profile" backHref="/account">
        <p className="text-sm text-[#A1A1AA] animate-pulse motion-reduce:animate-none">Loading…</p>
      </AuthPageShell>
    )
  }

  return (
    <AuthPageShell eyebrow="Account" heading="Your profile" backHref="/account">
      <div className="flex items-center gap-5">
        {profile?.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- cross-subdomain, session-cookie-gated asset; next/image can't proxy this
          <img
            src={getAvatarSrc(profile.avatarUrl)}
            alt=""
            className="h-20 w-20 shrink-0 rounded-full border border-white/10 object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#0D0D0D] text-2xl font-bold text-white/40">
            {user.displayName.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div>
          <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/gif" className="hidden" onChange={handleAvatarChange} />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="border border-white/15 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:border-white/40 disabled:opacity-50"
          >
            {uploading ? 'Uploading…' : 'Change picture'}
          </button>
          <p className="mt-2 text-xs text-white/40">PNG, JPG, or GIF. 10MB max.</p>
        </div>
      </div>

      <form onSubmit={handleSaveBio} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-[0.1em] text-white/40">Bio</span>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={1000}
            rows={5}
            placeholder="Tell people a bit about yourself…"
            className={textareaClass}
          />
        </label>

        {error && <AuthMessage message={error} />}
        {success && <AuthMessage message={success} tone="success" />}

        <AuthSubmitButton loading={saving}>Save</AuthSubmitButton>
      </form>

      <Link href={`/u/${user.id}`} className="mt-6 inline-block text-sm text-white/70 underline underline-offset-2 transition-colors hover:text-white">
        View your public profile
      </Link>
    </AuthPageShell>
  )
}
