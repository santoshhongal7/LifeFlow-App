export default function SplashScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="text-center">
        <div className="text-6xl mb-4">🌊</div>
        <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          LifeFlow
        </h1>
        <div className="flex gap-2 justify-center">
          <div
            className="w-2 h-2 rounded-full animate-bounce"
            style={{ background: 'var(--status-done)', animationDelay: '0s' }}
          />
          <div
            className="w-2 h-2 rounded-full animate-bounce"
            style={{ background: 'var(--status-done)', animationDelay: '0.1s' }}
          />
          <div
            className="w-2 h-2 rounded-full animate-bounce"
            style={{ background: 'var(--status-done)', animationDelay: '0.2s' }}
          />
        </div>
      </div>
    </div>
  )
}
