import { useState } from 'react';
import type { MoveAnalysis, MoveDebugEntry } from '../game/engine';

interface MoveDebugPanelProps {
  moveAnalysis: MoveAnalysis;
  movesRemaining: number;
  totalCandidates: number;
  validMovePreview: MoveDebugEntry[];
  skipSummary: Array<[string, number]>;
}

export function MoveDebugPanel({
  moveAnalysis,
  movesRemaining,
  totalCandidates,
  validMovePreview,
  skipSummary,
}: MoveDebugPanelProps) {
  const [showMoveDebug, setShowMoveDebug] = useState(false);

  if (!import.meta.env.DEV) return null;

  return (
    <div
      style={{
        position: 'fixed',
        right: 12,
        bottom: 12,
        zIndex: 2000,
        maxWidth: 420,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <button
        type="button"
        onClick={() => setShowMoveDebug((v) => !v)}
        style={{
          border: '1px solid #3a3a3a',
          borderRadius: 8,
          padding: '6px 10px',
          background: '#151515',
          color: '#f2f2f2',
          cursor: 'pointer',
        }}
      >
        {showMoveDebug ? 'Hide Move Debug' : 'Show Move Debug'}
      </button>

      {showMoveDebug && (
        <div
          style={{
            margin: 0,
            padding: 10,
            borderRadius: 8,
            border: '1px solid #3a3a3a',
            background: '#0f0f0f',
            color: '#c9f7d5',
            fontSize: 11,
            lineHeight: 1.4,
            maxHeight: '45vh',
            overflow: 'auto',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <div>
              <strong>Status</strong>
              <div>{moveAnalysis.hasMovesLeft ? 'Moves Available' : 'No Moves Available'}</div>
            </div>
            <div>
              <strong>Moves Remaining</strong>
              <div>{movesRemaining}</div>
            </div>
            <div>
              <strong>Skipped Candidates</strong>
              <div>{moveAnalysis.skippedMoves.length}</div>
            </div>
            <div>
              <strong>Total Candidates</strong>
              <div>{totalCandidates}</div>
            </div>
          </div>

          <div style={{ marginTop: 10 }}>
            <strong>Valid Moves (preview)</strong>
            {validMovePreview.length === 0 ? (
              <div style={{ opacity: 0.8, marginTop: 4 }}>None</div>
            ) : (
              <div style={{ marginTop: 4, display: 'grid', gap: 3 }}>
                {validMovePreview.map((move, idx) => (
                  <div key={`${move.from}-${move.to}-${idx}`}>
                    #{idx + 1} {move.from} {'->'} {move.to} (count: {move.moveCount ?? 0})
                  </div>
                ))}
                {moveAnalysis.validMoves.length > validMovePreview.length && (
                  <div style={{ opacity: 0.8 }}>
                    ...and {moveAnalysis.validMoves.length - validMovePreview.length} more
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ marginTop: 10 }}>
            <strong>Skip Reasons</strong>
            {skipSummary.length === 0 ? (
              <div style={{ opacity: 0.8, marginTop: 4 }}>None</div>
            ) : (
              <div style={{ marginTop: 4, display: 'grid', gap: 3 }}>
                {skipSummary.map(([reason, count]) => (
                  <div key={reason}>
                    {reason}: {count}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
