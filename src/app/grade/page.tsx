import { gradeApplication } from '@/lib/grading';
import { PageHeader } from '@/components/ui/PageHeader';

export const dynamic = 'force-dynamic';

function ScoreCircle({ score }: { score: number }) {
  const color =
    score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-amber-400' : 'text-red-400';
  const ringColor =
    score >= 80 ? 'border-emerald-500' : score >= 60 ? 'border-amber-500' : 'border-red-500';
  return (
    <div
      className={`w-24 h-24 rounded-full border-4 flex items-center justify-center ${ringColor}`}
    >
      <span className={`text-3xl font-bold ${color}`}>{score}</span>
    </div>
  );
}

function CategoryCard({ cat }: { cat: ReturnType<typeof gradeApplication>['categories'][0] }) {
  const color =
    cat.score >= 80 ? 'text-emerald-400' : cat.score >= 60 ? 'text-amber-400' : 'text-red-400';
  const barColor =
    cat.score >= 80 ? 'bg-emerald-500' : cat.score >= 60 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-white">{cat.name}</h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Weight: {(cat.weight * 100).toFixed(0)}%
          </p>
        </div>
        <span className={`text-2xl font-bold ${color}`}>{cat.score}</span>
      </div>

      <div className="mb-4 h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
        <div
          className={`h-full rounded-full ${barColor} transition-all`}
          style={{ width: `${cat.score}%` }}
        />
      </div>

      <ul className="space-y-1.5">
        {cat.notes.map((note, i) => {
          const isWarning = note.startsWith('BLOCKER') || note.startsWith('SUGGESTION');
          return (
            <li key={i} className="flex items-start gap-2 text-xs">
              <span
                className={
                  isWarning
                    ? note.startsWith('BLOCKER')
                      ? 'text-red-400 flex-shrink-0 mt-0.5'
                      : 'text-amber-400 flex-shrink-0 mt-0.5'
                    : 'text-emerald-400 flex-shrink-0 mt-0.5'
                }
              >
                {isWarning ? (note.startsWith('BLOCKER') ? '✗' : '→') : '✓'}
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>{note}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function GradePage() {
  const grade = gradeApplication();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <PageHeader
        title="App Quality Grade"
        subtitle="Automated assessment of SignalPort's production readiness"
      />

      {/* ── Overall Score ─────────────────────────────────────────────── */}
      <div className="card flex flex-col sm:flex-row items-center gap-6">
        <ScoreCircle score={grade.overall} />
        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center gap-3 justify-center sm:justify-start mb-2">
            <h2 className="text-2xl font-bold text-white">
              Overall Score: {grade.overall}/100
            </h2>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                grade.readyForProduction
                  ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800'
                  : 'bg-amber-900/40 text-amber-400 border border-amber-800'
              }`}
            >
              {grade.readyForProduction ? 'Production Ready' : 'Needs Work'}
            </span>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Weighted across {grade.categories.length} quality dimensions. Score ≥ 80 indicates production readiness.
          </p>

          {/* Mini scores */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            {grade.categories.map((c) => (
              <div key={c.name} className="text-center rounded-lg p-2" style={{ background: 'var(--bg-secondary)' }}>
                <p
                  className={`text-lg font-bold ${
                    c.score >= 80 ? 'text-emerald-400' : c.score >= 60 ? 'text-amber-400' : 'text-red-400'
                  }`}
                >
                  {c.score}
                </p>
                <p className="text-[10px] leading-tight" style={{ color: 'var(--text-muted)' }}>
                  {c.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Category Breakdown ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {grade.categories.map((cat) => (
          <CategoryCard key={cat.name} cat={cat} />
        ))}
      </div>

      {/* ── Blockers ─────────────────────────────────────────────────── */}
      {grade.blockers.length > 0 && (
        <div className="card border border-red-900/40">
          <h2 className="text-sm font-semibold text-red-400 mb-3">
            Blockers — Must resolve before production
          </h2>
          <ul className="space-y-2">
            {grade.blockers.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-red-400 flex-shrink-0 mt-0.5">✗</span>
                <span style={{ color: 'var(--text-secondary)' }}>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Suggestions ───────────────────────────────────────────────── */}
      {grade.suggestions.length > 0 && (
        <div className="card">
          <h2 className="text-sm font-semibold text-white mb-3">
            Improvement Suggestions
          </h2>
          <ul className="space-y-2">
            {grade.suggestions.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-brand-400 flex-shrink-0 mt-0.5">→</span>
                <span style={{ color: 'var(--text-secondary)' }}>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
