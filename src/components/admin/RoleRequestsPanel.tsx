'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getStaffRoleRequests,
  reviewRoleRequest,
  unwrapResult,
  type RequestStatus,
} from '@/lib/authClient'
import { SectionHeading, StatusFilter, buttonClass } from '@/components/admin/shared'
import { useToast } from '@/components/ToastProvider'
import { SkeletonRow } from '@/components/Skeleton'

const STATUS_OPTIONS: RequestStatus[] = ['pending', 'approved', 'rejected']

export default function RoleRequestsPanel() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [status, setStatus] = useState<RequestStatus>('pending')

  const { data: requests } = useQuery({
    queryKey: ['staffRoleRequests', status],
    queryFn: () => unwrapResult(getStaffRoleRequests(status)),
  })

  // Approving/rejecting also moves the sidebar/approvals-overview pending
  // count, so both keys go stale together.
  const reviewMutation = useMutation({
    mutationFn: ({ id, action, reason }: { id: number; action: 'approve' | 'reject'; reason?: string }) =>
      unwrapResult(reviewRoleRequest(id, action, reason)),
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ['staffRoleRequests'] })
      queryClient.invalidateQueries({ queryKey: ['staffPendingCounts'] })
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
      <SectionHeading>Role requests</SectionHeading>

      <StatusFilter status={status} options={STATUS_OPTIONS} onChange={setStatus} />

      <div className="mt-4 border-l border-t border-white/10">
        {requests === undefined && <SkeletonRow count={3} />}
        {requests?.length === 0 && <p className="border-b border-r border-white/10 bg-[#17181B] p-4 text-sm text-[#90939A]">Nothing here.</p>}
        {requests?.map((r) => (
          <div key={r.id} className="border-b border-r border-white/10 bg-[#17181B] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-sm font-medium text-white">{r.requesterDisplayName}</span>
                <span className="ml-2 text-xs text-[#90939A]">{r.requesterEmail}</span>
                <span className="ml-2 text-xs uppercase tracking-[0.1em] text-[#FF7A33]">→ {r.requestedRole}</span>
              </div>
              {r.status === 'pending' && (
                <div className="flex gap-2">
                  <button type="button" disabled={reviewMutation.isPending} onClick={() => reviewMutation.mutate({ id: r.id, action: 'approve' })} className={buttonClass}>Approve</button>
                  <button type="button" disabled={reviewMutation.isPending} onClick={() => handleReject(r.id)} className={buttonClass}>Reject</button>
                </div>
              )}
            </div>
            {r.message && <p className="mt-2 text-sm text-[#90939A]">{r.message}</p>}
            {r.status === 'rejected' && r.rejectionReason && (
              <p className="mt-2 text-xs text-[#F85149]">Rejected: {r.rejectionReason}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
