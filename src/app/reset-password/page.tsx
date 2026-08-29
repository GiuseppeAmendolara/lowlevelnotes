import AuthPageShell from '@/components/auth/AuthPageShell'
import AuthMessage from '@/components/auth/AuthMessage'
import ResetPasswordForm from './ResetPasswordForm'

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  return (
    <AuthPageShell eyebrow="Password recovery" heading="Reset your password" maxWidth="max-w-md">
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <AuthMessage message="This link is missing its token — check the link in your email." />
      )}
    </AuthPageShell>
  )
}
