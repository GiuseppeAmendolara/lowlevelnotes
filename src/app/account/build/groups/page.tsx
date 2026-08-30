'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Eyebrow from '@/components/Eyebrow'
import { useSession } from '@/components/SessionProvider'
import { useToast } from '@/components/ToastProvider'
import { Skeleton } from '@/components/Skeleton'
import {
  getMyGroups,
  createGroup,
  deleteGroup,
  getGroupMembers,
  addGroupMember,
  removeGroupMember,
  unwrapResult,
} from '@/lib/authClient'

// Same style constants as the rest of the instructor surface — duplicated
// rather than shared, matching this app's existing low-abstraction
// convention.
const inputClass = "border border-white/15 bg-[#17181B] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none"
const buttonClass = "border border-[#FF7A33]/50 px-3 py-1.5 text-xs font-medium text-[#FF7A33] transition-colors transition-transform duration-150 hover:border-[#FF7A33] hover:bg-[#FF7A33]/10 active:scale-[0.98] motion-reduce:transition-none disabled:opacity-50 disabled:active:scale-100"

export default function GroupsPage() {
  const router = useRouter()
  const { user, loading: sessionLoading } = useSession()
  const queryClient = useQueryClient()
  const toast = useToast()
  const canBuild = !!user && (user.role === 'instructor' || user.role === 'staff')

  const { data: groups } = useQuery({
    queryKey: ['myGroups'],
    queryFn: () => unwrapResult(getMyGroups()),
    enabled: canBuild,
  })

  const [name, setName] = useState('')
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const createMutation = useMutation({
    mutationFn: () => unwrapResult(createGroup(name)),
    onSuccess: () => {
      setName('')
      queryClient.invalidateQueries({ queryKey: ['myGroups'] })
      toast.success('Group created.')
    },
    onError: (error) => toast.error(error.message),
  })
  const deleteMutation = useMutation({
    mutationFn: (id: number) => unwrapResult(deleteGroup(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myGroups'] })
      toast.success('Group deleted.')
    },
    onError: (error) => toast.error(error.message),
  })

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

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    createMutation.mutate()
  }

  function handleDelete(id: number) {
    if (!window.confirm('Delete this group? Any courses restricted to it will lose that access.')) return
    deleteMutation.mutate(id)
  }

  if (sessionLoading || !canBuild) {
    return (
      <div>
        <Skeleton className="h-3 w-20" />
        <Skeleton className="mt-2 h-9 w-56" />
      </div>
    )
  }

  return (
    <div>
      <Eyebrow>Instructor</Eyebrow>
      <h1 className="mt-2 text-4xl font-bold tracking-[-0.05em] text-white">Student groups</h1>
      <p className="mt-4 max-w-xl text-sm leading-7 text-[#90939A]">
        Reusable rosters you can restrict any of your courses to — build a group once, add students to it, and reuse it across courses.
      </p>

      <form onSubmit={handleCreate} className="mt-8 flex flex-wrap items-center gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Group name" className={inputClass} />
        <button type="submit" disabled={createMutation.isPending} className={buttonClass}>{createMutation.isPending ? '…' : 'Create group'}</button>
      </form>

      <div className="mt-6 flex flex-col gap-3">
        {groups === undefined && (
          <>
            <Skeleton className="h-16 border border-white/10" />
            <Skeleton className="h-16 border border-white/10" />
          </>
        )}
        {groups?.length === 0 && <p className="text-sm text-[#90939A]">No groups yet — create one above.</p>}
        {groups?.map((group) => (
          <div key={group.id} className="border border-white/10 bg-[#17181B] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-white">{group.name}</p>
                <p className="mt-1 text-xs text-[#90939A]">{group.memberCount} students</p>
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
            {expandedId === group.id && <GroupRoster groupId={group.id} />}
          </div>
        ))}
      </div>
    </div>
  )
}

function GroupRoster({ groupId }: { groupId: number }) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [email, setEmail] = useState('')

  const { data: members } = useQuery({
    queryKey: ['groupMembers', groupId],
    queryFn: () => unwrapResult(getGroupMembers(groupId)),
  })

  // Membership changes also shift the parent list's memberCount, so both
  // keys need to go stale together.
  function invalidateBoth() {
    queryClient.invalidateQueries({ queryKey: ['groupMembers', groupId] })
    queryClient.invalidateQueries({ queryKey: ['myGroups'] })
  }

  const addMutation = useMutation({
    mutationFn: () => unwrapResult(addGroupMember(groupId, email)),
    onSuccess: () => {
      setEmail('')
      invalidateBoth()
    },
    onError: (error) => toast.error(error.message),
  })
  const removeMutation = useMutation({
    mutationFn: (userId: number) => unwrapResult(removeGroupMember(groupId, userId)),
    onSuccess: invalidateBoth,
    onError: (error) => toast.error(error.message),
  })

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    addMutation.mutate()
  }

  return (
    <div className="mt-4 border-t border-white/10 pt-4">
      <div className="flex flex-col gap-2">
        {members === undefined && <Skeleton className="h-9" />}
        {members?.length === 0 && <p className="text-xs text-[#90939A]">No students yet.</p>}
        {members?.map((member) => (
          <div key={member.id} className="flex items-center justify-between gap-3 border border-white/10 bg-[#0B0B0D] px-3 py-2 text-sm text-white">
            <span>{member.displayName} <span className="text-white/40">({member.email})</span></span>
            <button type="button" onClick={() => removeMutation.mutate(member.id)} className="text-xs text-white/50 underline underline-offset-2 hover:text-white">
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
        <button type="submit" disabled={addMutation.isPending} className={buttonClass}>{addMutation.isPending ? '…' : 'Add'}</button>
      </form>
    </div>
  )
}
