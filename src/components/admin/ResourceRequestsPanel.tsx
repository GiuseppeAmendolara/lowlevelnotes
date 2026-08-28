'use client'

import { useEffect, useState } from 'react'
import {
  getStaffResourceRequests,
  reviewResourceRequest,
  getResourceRequestFileUrl,
  type StaffResourceRequest,
  type RequestStatus,
} from '@/lib/authClient'
import { SectionHeading, StatusFilter, buttonClass } from '@/components/admin/shared'

const STATUS_OPTIONS: RequestStatus[] = ['pending', 'approved', 'rejected']

export default function ResourceRequestsPanel() {
  const [status, setStatus] = useState<RequestStatus>('pending')
  const [requests, setRequests] = useState<StaffResourceRequest[] | null>(null)
  // See AdminPanel's UsersSection `refreshing` guard.
  const [refreshing, setRefreshing] = useState(false)

  function load() {
    return getStaffResourceRequests(status).then((result) => {
      if (result.ok) setRequests(result.data)
    })
  }

  useEffect(() => {
    load()
  }, [status])

  async function handleApprove(id: number) {
    setRefreshing(true)
    await reviewResourceRequest(id, 'approve')
    await load()
    setRefreshing(false)
  }

  async function handleReject(id: number) {
    const reason = window.prompt('Rejection reason (shown to the requester):')
    if (reason === null) return
    setRefreshing(true)
    await reviewResourceRequest(id, 'reject', reason)
    await load()
    setRefreshing(false)
  }

  return (
    <div>
      <SectionHeading>Resource requests</SectionHeading>

      <StatusFilter status={status} options={STATUS_OPTIONS} onChange={setStatus} />

      <div className="mt-4 border-l border-t border-white/10">
        {requests === null && <p className="border-b border-r border-white/10 bg-[#0D0D0D] p-4 text-sm text-[#A1A1AA] animate-pulse motion-reduce:animate-none">Loading…</p>}
        {requests?.length === 0 && <p className="border-b border-r border-white/10 bg-[#0D0D0D] p-4 text-sm text-[#A1A1AA]">Nothing here.</p>}
        {requests?.map((r) => (
          <div key={r.id} className="border-b border-r border-white/10 bg-[#0D0D0D] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-sm font-medium text-white">{r.title}</span>
                <span className="ml-2 text-xs uppercase tracking-[0.1em] text-[#A1A1AA]">{r.type} · {r.category}</span>
              </div>
              {r.status === 'pending' && (
                <div className="flex gap-2">
                  <button type="button" disabled={refreshing} onClick={() => handleApprove(r.id)} className={buttonClass}>Approve</button>
                  <button type="button" disabled={refreshing} onClick={() => handleReject(r.id)} className={buttonClass}>Reject</button>
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
