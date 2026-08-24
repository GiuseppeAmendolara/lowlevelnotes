import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#000',
      color: '#fff',
      fontFamily: 'monospace',
      textAlign: 'center',
      padding: '2rem',
    }}>
      <h1 style={{ fontSize: '4rem', margin: 0 }}>404</h1>
      <p style={{ fontSize: '1.25rem', marginTop: '1rem' }}>
        This page doesn&apos;t exist.
      </p>
      <Link href="/" style={{ marginTop: '2rem', color: '#39FF14', textDecoration: 'underline' }}>
        Back to home
      </Link>
    </div>
  )
}