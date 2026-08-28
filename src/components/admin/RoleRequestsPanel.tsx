'use client'

import { useEffect, useState } from 'react'
import {
  getStaffRoleRequests,
  reviewRoleRequest,
  type StaffRoleRequest,
  type RequestStatus,
} from '@/lib/authClient'
import { SectionHeading, StatusFilter, buttonClass } from '@/components/admin/shared'

const STATUS_OPTIONS: RequestStatus[] = ['pending', 'approved', 'rejected']

export default function RoleRequestsPanel() {
  const [status, setStatus] = useState<RequestStatus>('pending')
  const [requests, setRequests] = useState<StaffRoleRequest[] | null>(null)
  // See AdminPanel's UsersSection `refreshing` guard — same reflow hazard,
  // Approve/Reject remove a row from the pending list and shift the rest.
  const [refreshing, setRefreshing] = useState(false)

  function load() {
    return getStaffRoleRequests(status).then((result) => {
      if (result.ok) setRequests(result.data)
    })
  }

  useEffect(() => {
    load()
  }, [status])

  async function handleApprove(id: number) {
    setRefreshing(true)
    await reviewRoleRequest(id, 'approve')
    await load()
    setRefreshing(false)
  }

  async function handleReject(id: number) {
    const reason = window.prompt('Rejection reason (shown to the requester):')
    if (reason === null) return
    setRefreshing(true)
    await reviewRoleRequest(id, 'reject', reason)
    await load()
    setRefreshing(false)
  }

  return (
    <div>
      <SectionHeading>Role requests</SectionHeading>

      <StatusFilter status={status} options={STATUS_OPTIONS} onChange={setStatus} />

      <div className="mt-4 border-l border-t border-white/10">
        {requests === null && <p className="border-b border-r border-white/10 bg-[#0D0D0D] p-4 text-sm text-[#A1A1AA] animate-pulse motion-reduce:animate-none">Loading…</p>}
        {requests?.length === 0 && <p className="border-b border-r border-white/10 bg-[#0D0D0D] p-4 text-sm text-[#A1A1AA]">Nothing here.</p>}
        {requests?.map((r) => (
          <div key={r.id} className="border-b border-r border-white/10 bg-[#0D0D0D] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-sm font-medium text-white">{r.requesterDisplayName}</span>
                <span className="ml-2 text-xs text-[#A1A1AA]">{r.requesterEmail}</span>
                <span className="ml-2 text-xs uppercase tracking-[0.1em] text-[#FF8A3D]">→ {r.requestedRole}</span>
              </div>
              {r.status === 'pending' && (
                <div className="flex gap-2">
                  <button type="button" disabled={refreshing} onClick={() => handleApprove(r.id)} className={buttonClass}>Approve</button>
                  <button type="button" disabled={refreshing} onClick={() => handleReject(r.id)} className={buttonClass}>Reject</button>
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
