'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getStaffResourceRequests,
  reviewResourceRequest,
  getResourceRequestFileUrl,
  unwrapResult,
  type RequestStatus,
} from '@/lib/authClient'
import { SectionHeading, StatusFilter, buttonClass } from '@/components/admin/shared'
import { useToast } from '@/components/ToastProvider'
import { SkeletonRow } from '@/components/Skeleton'

const STATUS_OPTIONS: RequestStatus[] = ['pending', 'approved', 'rejected']

export default function ResourceRequestsPanel() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [status, setStatus] = useState<RequestStatus>('pending')

  const { data: requests } = useQuery({
    queryKey: ['staffResourceRequests', status],
    queryFn: () => unwrapResult(getStaffResourceRequests(status)),
  })

  // Approving publishes it into the public library list, and either way
  // the sidebar/approvals-overview pending count shifts too.
  const reviewMutation = useMutation({
    mutationFn: ({ id, action, reason }: { id: number; action: 'approve' | 'reject'; reason?: string }) =>
      unwrapResult(reviewResourceRequest(id, action, reason)),
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ['staffResourceRequests'] })
      queryClient.invalidateQueries({ queryKey: ['staffPendingCounts'] })
      queryClient.invalidateQueries({ queryKey: ['library'] })
      toast.success(action === 'approve' ? 'Request approved.' : 'Request rejected.')
    },
    onError: (error) => toast.error(error.message),
  })

  function handleReject(id: number) {
    const reason = window.prompt('Rejection reason (shown to the requester):')
    if (reason === null) return
    reviewMutation.mutate({ id, action: 'reject', reason })
  }

  return (
    <div>
      <SectionHeading>Resource requests</SectionHeading>

      <StatusFilter status={status} options={STATUS_OPTIONS} onChange={setStatus} />

      <div className="mt-4 border-l border-t border-white/10">
        {requests === undefined && <SkeletonRow count={3} />}
        {requests?.length === 0 && <p className="border-b border-r border-white/10 bg-[#17181B] p-4 text-sm text-[#90939A]">Nothing here.</p>}
        {requests?.map((r) => (
          <div key={r.id} className="border-b border-r border-white/10 bg-[#17181B] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-sm font-medium text-white">{r.title}</span>
                <span className="ml-2 text-xs uppercase tracking-[0.1em] text-[#90939A]">{r.type} · {r.category}</span>
              </div>
              {r.status === 'pending' && (
                <div className="flex gap-2">
                  <button type="button" disabled={reviewMutation.isPending} onClick={() => reviewMutation.mutate({ id: r.id, action: 'approve' })} className={buttonClass}>Approve</button>
                  <button type="button" disabled={reviewMutation.isPending} onClick={() => handleReject(r.id)} className={buttonClass}>Reject</button>
                </div>
              )}
            </div>

            <div className="mt-1 text-xs text-[#90939A]">
              {r.requesterEmail} <span className="uppercase tracking-[0.1em] text-[#FF7A33]">({r.requesterRole})</span>
            </div>

            {r.description && <p className="mt-2 text-sm text-[#90939A]">{r.description}</p>}

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
