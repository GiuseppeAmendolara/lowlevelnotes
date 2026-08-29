'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthPageShell from '@/components/auth/AuthPageShell'
import { useSession } from '@/components/SessionProvider'
import {
  getMyGroups,
  createGroup,
  deleteGroup,
  getGroupMembers,
  addGroupMember,
  removeGroupMember,
  type StudentGroup,
  type GroupMember,
} from '@/lib/authClient'

// Same style constants as the rest of the instructor surface — duplicated
// rather than shared, matching this app's existing low-abstraction
// convention.
const inputClass = "border border-white/15 bg-[#0D0D0D] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none"
const buttonClass = "border border-[#FF8A3D]/50 px-3 py-1.5 text-xs font-medium text-[#FF8A3D] transition-colors transition-transform duration-150 hover:border-[#FF8A3D] hover:bg-[#FF8A3D]/10 active:scale-[0.98] motion-reduce:transition-none disabled:opacity-50 disabled:active:scale-100"

export default function GroupsPage() {
  const router = useRouter()
  const { user, loading: sessionLoading } = useSession()

  const [groups, setGroups] = useState<StudentGroup[] | null>(null)
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  useEffect(() => {
    if (sessionLoading) return
    if (!user) {
      router.replace('/login')
      return
    }
    if (user.role !== 'instructor' && user.role !== 'staff') {
      router.replace('/')
    }
  }, [sessionLoading, user, router])

  function load() {
    return getMyGroups().then((result) => {
      if (result.ok) setGroups(result.data)
    })
  }

  useEffect(() => {
    if (user && (user.role === 'instructor' || user.role === 'staff')) load()
  }, [user])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    setError(null)
    const result = await createGroup(name)
    setCreating(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setName('')
    load()
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Delete this group? Any courses restricted to it will lose that access.')) return
    const result = await deleteGroup(id)
    if (result.ok) load()
  }

  if (sessionLoading || !user || (user.role !== 'instructor' && user.role !== 'staff')) {
    return (
      <AuthPageShell eyebrow="Instructor" heading="Groups" backHref="/courses/builder" backLabel="Your courses">
        <p className="text-sm text-[#A1A1AA] animate-pulse motion-reduce:animate-none">Loading…</p>
      </AuthPageShell>
    )
  }

  return (
    <main className="min-h-screen bg-[#171717]">
      <section className="mx-auto max-w-3xl px-6 pb-10 pt-20 sm:pt-28">
        <Link href="/courses/builder" className="text-xs uppercase tracking-[0.12em] text-white/40 transition-colors hover:text-white">
          ← Your courses
        </Link>
        <p className="mt-4 text-xs font-medium uppercase tracking-[0.18em] text-[#FF8A3D]">Instructor</p>
        <h1 className="mt-4 text-4xl font-bold tracking-[-0.05em] text-white sm:text-5xl">Student groups</h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-[#A1A1AA]">
          Reusable rosters you can restrict any of your courses to — build a group once, add students to it, and reuse it across courses.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-24">
        <form onSubmit={handleCreate} className="flex flex-wrap items-center gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Group name" className={inputClass} />
          <button type="submit" disabled={creating} className={buttonClass}>{creating ? '…' : 'Create group'}</button>
        </form>
        {error && <p className="mt-2 text-sm text-[#F85149] animate-fade-in-up motion-reduce:animate-none">{error}</p>}

        <div className="mt-6 flex flex-col gap-3">
          {groups === null && <p className="text-sm text-[#A1A1AA] animate-pulse motion-reduce:animate-none">Loading…</p>}
          {groups?.length === 0 && <p className="text-sm text-[#A1A1AA]">No groups yet — create one above.</p>}
          {groups?.map((group) => (
            <div key={group.id} className="border border-white/10 bg-[#0D0D0D] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-white">{group.name}</p>
                  <p className="mt-1 text-xs text-[#A1A1AA]">{group.memberCount} students</p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setExpandedId(expandedId === group.id ? null : group.id)}
                    className="text-xs text-white/70 underline underline-offset-2 hover:text-white"
                  >
                    {expandedId === group.id ? 'Hide roster' : 'Manage roster'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(group.id)}
                    className="text-xs text-[#F85149] underline underline-offset-2 hover:text-[#F85149]/80"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {expandedId === group.id && <GroupRoster groupId={group.id} onChanged={load} />}
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

function GroupRoster({ groupId, onChanged }: { groupId: number; onChanged: () => void }) {
  const [members, setMembers] = useState<GroupMember[] | null>(null)
  const [email, setEmail] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function load() {
    return getGroupMembers(groupId).then((result) => {
      if (result.ok) setMembers(result.data)
    })
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setAdding(true)
    setError(null)
    const result = await addGroupMember(groupId, email)
    setAdding(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setEmail('')
    load()
    onChanged()
  }

  async function handleRemove(userId: number) {
    const result = await removeGroupMember(groupId, userId)
    if (result.ok) {
      load()
      onChanged()
    }
  }

  return (
    <div className="mt-4 border-t border-white/10 pt-4">
      <div className="flex flex-col gap-2">
        {members === null && <p className="text-xs text-[#A1A1AA] animate-pulse motion-reduce:animate-none">Loading…</p>}
        {members?.length === 0 && <p className="text-xs text-[#A1A1AA]">No students yet.</p>}
        {members?.map((member) => (
          <div key={member.id} className="flex items-center justify-between gap-3 border border-white/10 bg-[#171717] px-3 py-2 text-sm text-white">
            <span>{member.displayName} <span className="text-white/40">({member.email})</span></span>
            <button type="button" onClick={() => handleRemove(member.id)} className="text-xs text-white/50 underline underline-offset-2 hover:text-white">
              Remove
            </button>
          </div>
        ))}
      </div>
      <form onSubmit={handleAdd} className="mt-3 flex flex-wrap items-center gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Add a student by email"
          className={inputClass}
        />
        <button type="submit" disabled={adding} className={buttonClass}>{adding ? '…' : 'Add'}</button>
      </form>
      {error && <p className="mt-2 text-xs text-[#F85149] animate-fade-in-up motion-reduce:animate-none">{error}</p>}
    </div>
  )
}
