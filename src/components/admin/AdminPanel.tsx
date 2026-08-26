'use client'

import { useEffect, useState } from 'react'
import {
  getStaffUsers,
  createStaffUser,
  updateStaffUserRole,
  banStaffUser,
  unbanStaffUser,
  deleteStaffUser,
  getStaffUserIps,
  getStaffRoleRequests,
  reviewRoleRequest,
  getStaffResourceRequests,
  reviewResourceRequest,
  getResourceRequestFileUrl,
  getStaffBlockedIps,
  blockIp,
  unblockIp,
  type StaffUser,
  type StaffRoleRequest,
  type StaffResourceRequest,
  type BlockedIp,
  type Role,
  type RequestStatus,
} from '@/lib/authClient'

const ROLES: Role[] = ['student', 'contributor', 'instructor', 'administrator']

export default function AdminPanel() {
  return (
    <main className="min-h-screen bg-[#171717]">
      <section className="mx-auto max-w-5xl px-6 pb-10 pt-20 sm:pt-28">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#FF8A3D]">Administration</p>
        <h1 className="mt-4 text-4xl font-bold tracking-[-0.05em] text-white sm:text-5xl">Admin</h1>
      </section>

      <section className="mx-auto flex max-w-5xl flex-col gap-16 px-6 pb-24">
        <UsersSection />
        <RoleRequestsSection />
        <ResourceRequestsSection />
        <BlockedIpsSection />
      </section>
    </main>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-[#FF8A3D]">{children}</h2>
}

const inputClass = "border border-white/15 bg-[#0D0D0D] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none"
const buttonClass = "border border-white/15 px-3 py-1.5 text-xs text-white transition-colors hover:border-white/40 hover:bg-white/[0.04] disabled:opacity-50"

/* ==================== Users ==================== */

function UsersSection() {
  const [users, setUsers] = useState<StaffUser[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expandedIps, setExpandedIps] = useState<Record<number, string[]>>({})

  const [newEmail, setNewEmail] = useState('')
  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState<Role>('student')
  const [creating, setCreating] = useState(false)
  const [createResult, setCreateResult] = useState<string | null>(null)

  function load() {
    getStaffUsers().then((result) => {
      if (result.ok) setUsers(result.data)
      else setError(result.error)
    })
  }

  useEffect(load, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    setCreateResult(null)
    const result = await createStaffUser(newEmail, newName, newRole)
    setCreating(false)
    if (!result.ok) {
      setCreateResult(result.error)
      return
    }
    setCreateResult(result.data.setPasswordLink ? `Created. Set-password link: ${result.data.setPasswordLink}` : 'Created. Set-password email sent.')
    setNewEmail('')
    setNewName('')
    load()
  }

  async function handleRoleChange(id: number, role: Role) {
    await updateStaffUserRole(id, role)
    load()
  }

  async function handleBan(id: number) {
    const reason = window.prompt('Ban reason (shown to no one but admins):')
    if (reason === null) return
    await banStaffUser(id, reason)
    load()
  }

  async function handleUnban(id: number) {
    await unbanStaffUser(id)
    load()
  }

  async function handleDelete(id: number, email: string) {
    if (!window.confirm(`Permanently delete ${email}? This cannot be undone.`)) return
    await deleteStaffUser(id)
    load()
  }

  async function handleViewIps(id: number) {
    if (expandedIps[id]) {
      setExpandedIps((prev) => { const next = { ...prev }; delete next[id]; return next })
      return
    }
    const result = await getStaffUserIps(id)
    if (result.ok) setExpandedIps((prev) => ({ ...prev, [id]: result.data.ips }))
  }

  async function handleBlockIp(ip: string, userId: number) {
    if (!window.confirm(`Block ${ip} at the Cloudflare edge?`)) return
    await blockIp(ip, undefined, userId)
    window.alert(`${ip} blocked.`)
  }

  return (
    <div>
      <SectionHeading>Users</SectionHeading>

      <form onSubmit={handleCreate} className="mt-4 flex flex-wrap items-end gap-3">
        <input type="email" required placeholder="Email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className={inputClass} />
        <input type="text" required placeholder="Display name" value={newName} onChange={(e) => setNewName(e.target.value)} className={inputClass} />
        <select value={newRole} onChange={(e) => setNewRole(e.target.value as Role)} className={inputClass}>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <button type="submit" disabled={creating} className={buttonClass}>{creating ? '…' : 'Create user'}</button>
      </form>
      {createResult && <p className="mt-2 break-all text-xs text-[#A1A1AA]">{createResult}</p>}

      {error && <p className="mt-4 text-sm text-[#F85149]">{error}</p>}

      <div className="mt-6 border-l border-t border-white/10">
        {users === null && <p className="border-b border-r border-white/10 p-4 text-sm text-[#A1A1AA]">Loading…</p>}
        {users?.map((u) => (
          <div key={u.id} className="border-b border-r border-white/10 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-white">{u.displayName}</span>
              <span className="text-xs text-[#A1A1AA]">{u.email}</span>
              {u.bannedAt && <span className="text-xs uppercase tracking-[0.1em] text-[#F85149]">Banned{u.banReason ? `: ${u.banReason}` : ''}</span>}
              {!u.emailVerified && <span className="text-xs uppercase tracking-[0.1em] text-white/40">Unverified</span>}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value as Role)} className={inputClass}>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              {u.bannedAt
                ? <button type="button" onClick={() => handleUnban(u.id)} className={buttonClass}>Unban</button>
                : <button type="button" onClick={() => handleBan(u.id)} className={buttonClass}>Ban</button>}
              <button type="button" onClick={() => handleDelete(u.id, u.email)} className={buttonClass}>Delete</button>
              <button type="button" onClick={() => handleViewIps(u.id)} className={buttonClass}>
                {expandedIps[u.id] ? 'Hide IPs' : 'View IPs'}
              </button>
            </div>

            {expandedIps[u.id] && (
              <div className="mt-3 flex flex-col gap-1.5">
                {expandedIps[u.id].length === 0 && <span className="text-xs text-[#A1A1AA]">No IPs on record.</span>}
                {expandedIps[u.id].map((ip) => (
                  <div key={ip} className="flex items-center gap-3 text-xs text-[#A1A1AA]">
                    <span className="font-mono">{ip}</span>
                    <button type="button" onClick={() => handleBlockIp(ip, u.id)} className="text-[#F85149] underline underline-offset-2 hover:text-white">
                      Block
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ==================== Role requests ==================== */

function RoleRequestsSection() {
  const [status, setStatus] = useState<RequestStatus>('pending')
  const [requests, setRequests] = useState<StaffRoleRequest[] | null>(null)

  function load() {
    getStaffRoleRequests(status).then((result) => {
      if (result.ok) setRequests(result.data)
    })
  }

  useEffect(load, [status])

  async function handleApprove(id: number) {
    await reviewRoleRequest(id, 'approve')
    load()
  }

  async function handleReject(id: number) {
    const reason = window.prompt('Rejection reason (shown to the requester):')
    if (reason === null) return
    await reviewRoleRequest(id, 'reject', reason)
    load()
  }

  return (
    <div>
      <SectionHeading>Role requests</SectionHeading>

      <StatusFilter status={status} onChange={setStatus} />

      <div className="mt-4 border-l border-t border-white/10">
        {requests === null && <p className="border-b border-r border-white/10 p-4 text-sm text-[#A1A1AA]">Loading…</p>}
        {requests?.length === 0 && <p className="border-b border-r border-white/10 p-4 text-sm text-[#A1A1AA]">Nothing here.</p>}
        {requests?.map((r) => (
          <div key={r.id} className="border-b border-r border-white/10 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-sm font-medium text-white">{r.requesterDisplayName}</span>
                <span className="ml-2 text-xs text-[#A1A1AA]">{r.requesterEmail}</span>
                <span className="ml-2 text-xs uppercase tracking-[0.1em] text-[#FF8A3D]">→ {r.requestedRole}</span>
              </div>
              {r.status === 'pending' && (
                <div className="flex gap-2">
                  <button type="button" onClick={() => handleApprove(r.id)} className={buttonClass}>Approve</button>
                  <button type="button" onClick={() => handleReject(r.id)} className={buttonClass}>Reject</button>
                </div>
              )}
            </div>
            {r.message && <p className="mt-2 text-sm text-[#A1A1AA]">{r.message}</p>}
            {r.status === 'rejected' && r.rejectionReason && (
              <p className="mt-2 text-xs text-[#F85149]">Rejected: {r.rejectionReason}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ==================== Resource requests ==================== */

function ResourceRequestsSection() {
  const [status, setStatus] = useState<RequestStatus>('pending')
  const [requests, setRequests] = useState<StaffResourceRequest[] | null>(null)

  function load() {
    getStaffResourceRequests(status).then((result) => {
      if (result.ok) setRequests(result.data)
    })
  }

  useEffect(load, [status])

  async function handleApprove(id: number) {
    await reviewResourceRequest(id, 'approve')
    load()
  }

  async function handleReject(id: number) {
    const reason = window.prompt('Rejection reason (shown to the requester):')
    if (reason === null) return
    await reviewResourceRequest(id, 'reject', reason)
    load()
  }

  return (
    <div>
      <SectionHeading>Resource requests</SectionHeading>

      <StatusFilter status={status} onChange={setStatus} />

      <div className="mt-4 border-l border-t border-white/10">
        {requests === null && <p className="border-b border-r border-white/10 p-4 text-sm text-[#A1A1AA]">Loading…</p>}
        {requests?.length === 0 && <p className="border-b border-r border-white/10 p-4 text-sm text-[#A1A1AA]">Nothing here.</p>}
        {requests?.map((r) => (
          <div key={r.id} className="border-b border-r border-white/10 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-sm font-medium text-white">{r.title}</span>
                <span className="ml-2 text-xs uppercase tracking-[0.1em] text-[#A1A1AA]">{r.type} · {r.category}</span>
              </div>
              {r.status === 'pending' && (
                <div className="flex gap-2">
                  <button type="button" onClick={() => handleApprove(r.id)} className={buttonClass}>Approve</button>
                  <button type="button" onClick={() => handleReject(r.id)} className={buttonClass}>Reject</button>
                </div>
              )}
            </div>

            <div className="mt-1 text-xs text-[#A1A1AA]">
              {r.requesterEmail} <span className="uppercase tracking-[0.1em] text-[#FF8A3D]">({r.requesterRole})</span>
            </div>

            {r.description && <p className="mt-2 text-sm text-[#A1A1AA]">{r.description}</p>}

            <div className="mt-2">
              {r.url && (
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-xs text-white/70 underline underline-offset-2 hover:text-white">
                  Open link
                </a>
              )}
              {r.hasFile && (
                <a href={getResourceRequestFileUrl(r.id)} target="_blank" rel="noopener noreferrer" className="text-xs text-white/70 underline underline-offset-2 hover:text-white">
                  Preview file
                </a>
              )}
            </div>

            {r.status === 'rejected' && r.rejectionReason && (
              <p className="mt-2 text-xs text-[#F85149]">Rejected: {r.rejectionReason}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ==================== Blocked IPs ==================== */

function BlockedIpsSection() {
  const [ips, setIps] = useState<BlockedIp[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [newIp, setNewIp] = useState('')
  const [newNote, setNewNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function load() {
    getStaffBlockedIps().then((result) => {
      if (result.ok) setIps(result.data)
      else setError(result.error)
    })
  }

  useEffect(load, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    const result = await blockIp(newIp, newNote || undefined)
    setSubmitting(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setNewIp('')
    setNewNote('')
    setError(null)
    load()
  }

  async function handleRemove(id: string) {
    await unblockIp(id)
    load()
  }

  return (
    <div>
      <SectionHeading>Blocked IPs</SectionHeading>

      <form onSubmit={handleAdd} className="mt-4 flex flex-wrap items-end gap-3">
        <input type="text" required placeholder="IP address" value={newIp} onChange={(e) => setNewIp(e.target.value)} className={inputClass} />
        <input type="text" placeholder="Note (optional)" value={newNote} onChange={(e) => setNewNote(e.target.value)} className={inputClass} />
        <button type="submit" disabled={submitting} className={buttonClass}>{submitting ? '…' : 'Block'}</button>
      </form>

      {error && <p className="mt-4 text-sm text-[#F85149]">{error}</p>}

      <div className="mt-6 border-l border-t border-white/10">
        {ips === null && !error && <p className="border-b border-r border-white/10 p-4 text-sm text-[#A1A1AA]">Loading…</p>}
        {ips?.length === 0 && <p className="border-b border-r border-white/10 p-4 text-sm text-[#A1A1AA]">Nothing blocked.</p>}
        {ips?.map((r) => (
          <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-r border-white/10 p-4">
            <div>
              <span className="font-mono text-sm text-white">{r.ip}</span>
              {r.note && <span className="ml-3 text-xs text-[#A1A1AA]">{r.note}</span>}
            </div>
            <button type="button" onClick={() => handleRemove(r.id)} className={buttonClass}>Unblock</button>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatusFilter({ status, onChange }: { status: RequestStatus; onChange: (s: RequestStatus) => void }) {
  const options: RequestStatus[] = ['pending', 'approved', 'rejected']
  return (
    <div className="mt-4 flex gap-2">
      {options.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          className={`border px-3 py-1.5 text-xs uppercase tracking-[0.1em] transition-colors ${
            status === s ? 'border-[#FF8A3D] text-[#FF8A3D]' : 'border-white/15 text-[#A1A1AA] hover:border-white/40'
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  )
}
