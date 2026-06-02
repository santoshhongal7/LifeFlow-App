import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'var(--bg-primary)',
        backgroundImage: `
          radial-gradient(ellipse at 20% 50%, rgba(240,147,251,0.08) 0%, transparent 60%),
          radial-gradient(ellipse at 80% 20%, rgba(79,172,254,0.08) 0%, transparent 60%)
        `,
      }}
    >
      <Outlet />
    </div>
  )
}
