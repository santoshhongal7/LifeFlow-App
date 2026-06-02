export default function AnalyticsPage() {
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
        Analytics
      </h1>

      <div className="glass-card p-8 text-center">
        <div className="text-5xl mb-4">📈</div>
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Analytics & Insights
        </h2>
        <p style={{ color: 'var(--text-secondary)' }} className="mb-4">
          Visualize your progress over time
        </p>
        <p style={{ color: 'var(--text-muted)' }} className="text-sm">
          Coming soon...
        </p>
      </div>
    </div>
  )
}
