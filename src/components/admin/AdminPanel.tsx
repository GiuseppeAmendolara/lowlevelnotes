'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from '@/components/SessionProvider'
import {
  getStaffUsers,
  createStaffUser,
  updateStaffUserRole,
  banStaffUser,
  unbanStaffUser,
  deleteStaffUser,
  getStaffUserIps,
  getStaffBlockedIps,
  blockIp,
  unblockIp,
  getStaffAuditLog,
  getStaffPendingCounts,
  unwrapResult,
  roleLabel,
  type Role,
} from '@/lib/authClient'
import { SectionHeading, inputClass, rowInputClass, buttonClass, blockButtonClass } from '@/components/admin/shared'
import Eyebrow from '@/components/Eyebrow'
import { useToast } from '@/components/ToastProvider'
import { Skeleton, SkeletonRow } from '@/components/Skeleton'

type Tab = 'users' | 'ips' | 'log'

const ACTION_LABELS: Record<string, string> = {
  role_change: 'Role change',
  ban: 'Ban',
  unban: 'Unban',
  delete_user: 'Delete user',
  create_user: 'Create user',
  block_ip: 'Block IP',
  unblock_ip: 'Unblock IP',
  approve_role_request: 'Approve role request',
  reject_role_request: 'Reject role request',
  approve_resource_request: 'Approve resource request',
  reject_resource_request: 'Reject resource request',
  approve_course: 'Approve course',
  reject_course: 'Reject course',
  delete_course: 'Delete course',
}

const ROLES: Role[] = ['student', 'contributor', 'instructor', 'staff']

const TABS: { id: Tab; label: string }[] = [
  { id: 'users', label: 'Users' },
  { id: 'ips', label: 'Blocked IPs' },
  { id: 'log', label: 'Activity log' },
]

export default function AdminPanel() {
  const [tab, setTab] = useState<Tab>('users')

  // Each of these three queries is also run independently inside its own
  // tab's section component below — same query keys, so React Query
  // dedupes them into one shared cache entry apiece instead of this
  // needing an onXLoaded callback to lift the data up.
  const { data: users } = useQuery({ queryKey: ['staffUsers'], queryFn: () => unwrapResult(getStaffUsers()) })
  const { data: ips } = useQuery({ queryKey: ['staffBlockedIps'], queryFn: () => unwrapResult(getStaffBlockedIps()) })
  const { data: pendingCounts } = useQuery({ queryKey: ['staffPendingCounts'], queryFn: () => unwrapResult(getStaffPendingCounts()) })

  const userCount = users?.length ?? null
  const bannedCount = users ? users.filter((u) => u.bannedAt).length : null
  const ipCount = ips?.length ?? null
  const pendingTotal = pendingCounts ? pendingCounts.roleRequests + pendingCounts.resourceRequests + pendingCounts.courseRequests : null

  return (
    <div>
      <Eyebrow>Staff</Eyebrow>
      <h1 className="mt-2 text-4xl font-bold tracking-[-0.05em] text-white">Staff</h1>

      <div className="mt-8 grid grid-cols-2 gap-px border border-white/10 bg-white/10 sm:grid-cols-4">
        <StatTile label="Total users" value={userCount} />
        <StatTile label="Banned" value={bannedCount} />
        <StatTile label="Blocked IPs" value={ipCount} />
        <StatTile label="Pending approvals" value={pendingTotal} accent={Boolean(pendingTotal)} />
      </div>

      <div className="mt-10 flex gap-2 border-b border-white/10">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-1 py-3 text-xs font-medium uppercase tracking-[0.1em] transition-colors ${
              tab === t.id ? 'border-[#FF7A33] text-white' : 'border-transparent text-[#90939A] hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === 'users' && <UsersSection />}
        {tab === 'ips' && <BlockedIpsSection />}
        {tab === 'log' && <AuditLogSection />}
      </div>
    </div>
  )
}

function StatTile({ label, value, accent }: { label: string; value: number | null; accent?: boolean }) {
  return (
    <div className="bg-[#17181B] p-4">
      <p className={`text-2xl font-bold tabular-nums tracking-[-0.03em] ${accent ? 'text-[#FF7A33]' : 'text-white'}`}>
        {value === null ? '—' : value}
      </p>
      <p className="mt-1 text-xs text-[#90939A]">{label}</p>
    </div>
  )
}

/* ==================== Users ==================== */

function UsersSection() {
  const { user: currentUser } = useSession()
  const queryClient = useQueryClient()
  const toast = useToast()
  const { data: users, error } = useQuery({ queryKey: ['staffUsers'], queryFn: () => unwrapResult(getStaffUsers()) })
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())

  const [newEmail, setNewEmail] = useState('')
  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState<Role>('student')

  function invalidateUsers() {
    return queryClient.invalidateQueries({ queryKey: ['staffUsers'] })
  }

  const createMutation = useMutation({
    mutationFn: () => unwrapResult(createStaffUser(newEmail, newName, newRole)),
    onSuccess: () => {
      setNewEmail('')
      setNewName('')
      invalidateUsers()
    },
  })

  // One mutation instance per action type, shared across every row (not
  // one per row) — see the `refreshing` derivation below. Deleting or
  // banning a user removes their row and every row below it shifts up to
  // fill the gap: a real, reported incident was a fast second click right
  // after a delete landed on a *different* user's now-repositioned Delete
  // button, deleting an unrelated account by accident. Disabling every
  // row's mutating controls for the whole reflow window (not just the row
  // that was acted on) closes that window instead of just narrowing it —
  // sharing one mutation per action across all rows means `isPending` is
  // already "is ANY row doing this," with no extra bookkeeping needed.
  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: Role }) => unwrapResult(updateStaffUserRole(id, role)),
    onSuccess: () => {
      invalidateUsers()
      toast.success('Role updated.')
    },
    onError: (error) => toast.error(error.message),
  })
  const banMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => unwrapResult(banStaffUser(id, reason)),
    onSuccess: () => {
      invalidateUsers()
      toast.success('User banned.')
    },
    onError: (error) => toast.error(error.message),
  })
  const unbanMutation = useMutation({
    mutationFn: (id: number) => unwrapResult(unbanStaffUser(id)),
    onSuccess: () => {
      invalidateUsers()
      toast.success('User unbanned.')
    },
    onError: (error) => toast.error(error.message),
  })
  const deleteMutation = useMutation({
    mutationFn: (id: number) => unwrapResult(deleteStaffUser(id)),
    onSuccess: () => {
      invalidateUsers()
      toast.success('User deleted.')
    },
    onError: (error) => toast.error(error.message),
  })
  const refreshing = roleMutation.isPending || banMutation.isPending || unbanMutation.isPending || deleteMutation.isPending

  const createResult = createMutation.isSuccess
    ? (createMutation.data.setPasswordLink ? `Created. Set-password link: ${createMutation.data.setPasswordLink}` : 'Created. Set-password email sent.')
    : createMutation.error?.message ?? null

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    createMutation.mutate()
  }

  function handleBan(id: number) {
    const reason = window.prompt('Ban reason (shown to no one but staff):')
    if (reason === null) return
    banMutation.mutate({ id, reason })
  }

  function handleDelete(id: number, email: string) {
    if (!window.confirm(`Permanently delete ${email}? This cannot be undone.`)) return
    deleteMutation.mutate(id)
  }

  function toggleIps(id: number) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div>
      <SectionHeading>Users</SectionHeading>

      <form onSubmit={handleCreate} className="mt-4 flex flex-wrap items-end gap-3">
        <input type="email" required placeholder="Email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className={inputClass} />
        <input type="text" required placeholder="Display name" value={newName} onChange={(e) => setNewName(e.target.value)} className={inputClass} />
        <select value={newRole} onChange={(e) => setNewRole(e.target.value as Role)} className={inputClass}>
          {ROLES.map((r) => <option key={r} value={r}>{roleLabel(r)}</option>)}
        </select>
        <button type="submit" disabled={createMutation.isPending} className={buttonClass}>{createMutation.isPending ? '…' : 'Create user'}</button>
      </form>
      {createResult && <p className="mt-2 break-all text-xs text-[#90939A]">{createResult}</p>}

      {error && <p className="mt-4 text-sm text-[#F85149] animate-fade-in-up motion-reduce:animate-none">{error.message}</p>}

      <div className="mt-6 border-l border-t border-white/10">
        {users === undefined && <SkeletonRow count={3} />}
        {users?.map((u) => {
          const locked = u.isSuperAdmin && !currentUser?.isSuperAdmin
          return (
          <div key={u.id} className="border-b border-r border-white/10 bg-[#17181B] p-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-white">{u.displayName}</span>
              <span className="text-xs text-[#90939A]">{u.email}</span>
              {u.isSuperAdmin && <span className="text-xs uppercase tracking-[0.1em] text-[#FF7A33]">Super admin</span>}
              {u.bannedAt && <span className="text-xs uppercase tracking-[0.1em] text-[#F85149]">Banned{u.banReason ? `: ${u.banReason}` : ''}</span>}
              {!u.emailVerified && <span className="text-xs uppercase tracking-[0.1em] text-white/40">Unverified</span>}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <select value={u.role} disabled={locked || refreshing} onChange={(e) => roleMutation.mutate({ id: u.id, role: e.target.value as Role })} className={`${rowInputClass} disabled:opacity-50`}>
                {ROLES.map((r) => <option key={r} value={r}>{roleLabel(r)}</option>)}
              </select>
              {u.bannedAt
                ? <button type="button" disabled={locked || refreshing} onClick={() => unbanMutation.mutate(u.id)} className={buttonClass}>Unban</button>
                : <button type="button" disabled={locked || refreshing} onClick={() => handleBan(u.id)} className={buttonClass}>Ban</button>}
              <button type="button" disabled={locked || refreshing} onClick={() => handleDelete(u.id, u.email)} className={buttonClass}>Delete</button>
              <button type="button" onClick={() => toggleIps(u.id)} className={buttonClass}>
                {expandedIds.has(u.id) ? 'Hide IPs' : 'View IPs'}
              </button>
            </div>

            {expandedIds.has(u.id) && <UserIpsList userId={u.id} />}
          </div>
          )
        })}
      </div>
    </div>
  )
}

// Its own query (['staffUserIps', userId]) so re-expanding a row already
// viewed this session shows instantly from cache instead of refetching.
function UserIpsList({ userId }: { userId: number }) {
  const toast = useToast()
  const { data } = useQuery({ queryKey: ['staffUserIps', userId], queryFn: () => unwrapResult(getStaffUserIps(userId)) })
  const blockMutation = useMutation({
    mutationFn: ({ ip }: { ip: string }) => unwrapResult(blockIp(ip, undefined, userId)),
    onError: (error) => toast.error(error.message),
  })

  function handleBlockIp(ip: string) {
    if (!window.confirm(`Block ${ip} at the Cloudflare edge?`)) return
    blockMutation.mutate({ ip }, { onSuccess: () => toast.success(`${ip} blocked.`) })
  }

  if (!data) {
    return <Skeleton className="mt-3 h-4 w-32" />
  }

  return (
    <div className="mt-3 flex flex-col gap-1.5">
      {data.ips.length === 0 && <span className="text-xs text-[#90939A]">No IPs on record.</span>}
      {data.ips.map((ip) => (
        <div key={ip} className="flex items-center gap-3 text-xs text-[#90939A]">
          <span className="font-mono">{ip}</span>
          <button type="button" onClick={() => handleBlockIp(ip)} className="text-[#F85149] underline underline-offset-2 hover:text-white">
            Block
          </button>
        </div>
      ))}
    </div>
  )
}

/* ==================== Blocked IPs ==================== */

function BlockedIpsSection() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const { data: ips, error } = useQuery({ queryKey: ['staffBlockedIps'], queryFn: () => unwrapResult(getStaffBlockedIps()) })
  const [newIp, setNewIp] = useState('')
  const [newNote, setNewNote] = useState('')

  function invalidateIps() {
    return queryClient.invalidateQueries({ queryKey: ['staffBlockedIps'] })
  }

  const addMutation = useMutation({
    mutationFn: () => unwrapResult(blockIp(newIp, newNote || undefined)),
    onSuccess: () => {
      setNewIp('')
      setNewNote('')
      invalidateIps()
      toast.success('IP blocked.')
    },
    onError: (error) => toast.error(error.message),
  })
  // Shared across every row, same reasoning as UsersSection's refreshing
  // guard — Unblock removes a row and shifts the rest.
  const removeMutation = useMutation({
    mutationFn: (id: string) => unwrapResult(unblockIp(id)),
    onSuccess: () => {
      invalidateIps()
      toast.success('IP unblocked.')
    },
    onError: (error) => toast.error(error.message),
  })

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    addMutation.mutate()
  }

  return (
    <div>
      <SectionHeading>Blocked IPs</SectionHeading>

      <form onSubmit={handleAdd} className="mt-4 flex flex-wrap items-end gap-3">
        <input type="text" required placeholder="IP address" value={newIp} onChange={(e) => setNewIp(e.target.value)} className={inputClass} />
        <input type="text" placeholder="Note (optional)" value={newNote} onChange={(e) => setNewNote(e.target.value)} className={inputClass} />
        <button type="submit" disabled={addMutation.isPending} className={blockButtonClass}>{addMutation.isPending ? '…' : 'Block'}</button>
      </form>

      {error && <p className="mt-4 text-sm text-[#F85149] animate-fade-in-up motion-reduce:animate-none">{error.message}</p>}

      <div className="mt-6 border-l border-t border-white/10">
        {ips === undefined && !error && <SkeletonRow count={3} />}
        {ips?.length === 0 && <p className="border-b border-r border-white/10 bg-[#17181B] p-4 text-sm text-[#90939A]">Nothing blocked.</p>}
        {ips?.map((r) => (
          <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-r border-white/10 bg-[#17181B] p-4">
            <div>
              <span className="font-mono text-sm text-white">{r.ip}</span>
              {r.note && <span className="ml-3 text-xs text-[#90939A]">{r.note}</span>}
            </div>
            <button type="button" disabled={removeMutation.isPending} onClick={() => removeMutation.mutate(r.id)} className={buttonClass}>Unblock</button>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ==================== Audit log ==================== */

// What makes the super-admin role above actually mean something — a
// super admin isn't meant to do day-to-day administration, they're meant
// to spot-check this. Read-only, no filters yet: at this scale scrolling
// the latest 200 entries is enough, and every staff member can see it
// (not just super admins) — there's nothing here anyone could use to
// cover their tracks, so there's no reason to hide it.
function AuditLogSection() {
  const { data: entries, error } = useQuery({ queryKey: ['staffAuditLog'], queryFn: () => unwrapResult(getStaffAuditLog()) })

  return (
    <div>
      <SectionHeading>Activity log</SectionHeading>

      {error && <p className="mt-4 text-sm text-[#F85149] animate-fade-in-up motion-reduce:animate-none">{error.message}</p>}

      <div className="mt-6 border-l border-t border-white/10">
        {entries === undefined && !error && <SkeletonRow count={3} />}
        {entries?.length === 0 && <p className="border-b border-r border-white/10 bg-[#17181B] p-4 text-sm text-[#90939A]">Nothing logged yet.</p>}
        {entries?.map((e) => (
          <div key={e.id} className="border-b border-r border-white/10 bg-[#17181B] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-sm font-medium text-white">{ACTION_LABELS[e.action] ?? e.action}</span>
                {e.targetLabel && <span className="ml-2 text-xs text-[#90939A]">→ {e.targetLabel}</span>}
              </div>
              <span className="shrink-0 text-xs text-white/40">{new Date(e.createdAt).toLocaleString()}</span>
            </div>
            <p className="mt-1 text-xs text-[#90939A]">by {e.actorEmail}</p>
            {e.detail && <p className="mt-2 text-sm text-[#90939A]">{e.detail}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
