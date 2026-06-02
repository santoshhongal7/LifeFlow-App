export default function DietPage() {
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
        Diet Tracker
      </h1>

      <div className="glass-card p-8 text-center">
        <div className="text-5xl mb-4">🥗</div>
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Diet Tracking
        </h2>
        <p style={{ color: 'var(--text-secondary)' }} className="mb-4">
          Track your nutrition and meals
        </p>
        <p style={{ color: 'var(--text-muted)' }} className="text-sm">
          Coming soon...
        </p>
      </div>
    </div>
  )
}
