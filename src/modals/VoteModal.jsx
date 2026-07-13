import { useState, useEffect } from 'react'
import { ModalShell } from './ModalShell.jsx'
import { pickWinner } from '../vote.js'

/**
 * Vote familial « on fait quoi demain ? » — pass-and-play sur un seul
 * téléphone : on choisit 2 à 4 visites candidates, chaque membre vote à tour
 * de rôle (choix caché des autres), la gagnante s'ajoute au planning.
 */
export function VoteModal({ isOpen, onClose, sx, visits, savedVisitIds, familyMembers, setFamilyMembers, days, addActivity, onWinner }) {
  const [phase, setPhase] = useState('setup') // setup | voting | result
  const [candidateIds, setCandidateIds] = useState([])
  const [voterIdx, setVoterIdx] = useState(0)
  const [votes, setVotes] = useState([])
  const [winnerId, setWinnerId] = useState(null)
  const [newVoter, setNewVoter] = useState('')
  const [targetDay, setTargetDay] = useState(0)

  // Réinitialise à chaque ouverture ; propose les visites ♥ en tête.
  useEffect(() => {
    if (!isOpen) return
    setPhase('setup'); setVoterIdx(0); setVotes([]); setWinnerId(null); setNewVoter('')
    setTargetDay(days.length > 1 ? 1 : 0)
    const saved = (savedVisitIds || []).slice(0, 4)
    setCandidateIds(saved.length >= 2 ? saved : [])
  }, [isOpen])

  if (!isOpen) return null
  const sheet = (inner) => (
    <ModalShell onClose={onClose} z={200} fade={true}>
      <div role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()} style={sx('width:100%;background:#f6efe2;border-radius:28px 28px 0 0;padding:20px 20px 36px;max-height:86vh;overflow-y:auto;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
        <div style={sx('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
        {inner}
      </div>
    </ModalShell>
  )

  const candidates = candidateIds.map((id) => visits.find((v) => v.id === id)).filter(Boolean)
  const toggleCandidate = (id) => setCandidateIds((c) => c.includes(id) ? c.filter((x) => x !== id) : (c.length >= 4 ? c : [...c, id]))
  const addVoter = () => { const n = newVoter.trim(); if (!n) return; setFamilyMembers((f) => [...f, n]); setNewVoter('') }
  const canStart = candidateIds.length >= 2 && familyMembers.length >= 1

  // ---- SETUP ----
  if (phase === 'setup') {
    const sorted = [...visits].sort((a, b) => (savedVisitIds?.includes(b.id) ? 1 : 0) - (savedVisitIds?.includes(a.id) ? 1 : 0))
    return sheet(<>
      <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:2px;')}>🗳️ On fait quoi demain ?</div>
      <div style={sx('font-size:13px;color:#6b6354;margin-bottom:14px;')}>Choisis 2 à 4 idées, puis chacun votera à son tour sur ce téléphone.</div>

      <div style={sx('font-size:12px;font-weight:700;color:#6b6354;margin-bottom:8px;')}>Les candidats · {candidateIds.length}/4</div>
      <div style={sx('display:flex;flex-direction:column;gap:8px;max-height:34vh;overflow-y:auto;margin-bottom:16px;')}>
        {sorted.map((v) => {
          const on = candidateIds.includes(v.id)
          return (
            <button key={v.id} data-testid={`vote-cand-${v.id}`} onClick={() => toggleCandidate(v.id)} style={sx(`display:flex;align-items:center;gap:10px;text-align:left;border:${on ? '2px solid #4a5d3a' : '1px solid #e3d8c2'};background:${on ? '#e7ecdf' : '#fffdf8'};border-radius:14px;padding:10px 12px;cursor:pointer;`)}>
              <span style={sx('font-size:20px;flex:0 0 auto;')}>{v.emoji}</span>
              <span style={sx('flex:1;font-size:14px;font-weight:600;')}>{v.name}</span>
              {on && <span style={sx('font-size:14px;color:#4a5d3a;')}>✓</span>}
            </button>
          )
        })}
      </div>

      <div style={sx('font-size:12px;font-weight:700;color:#6b6354;margin-bottom:8px;')}>Les votants</div>
      <div style={sx('display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px;')}>
        {familyMembers.map((m, i) => (
          <span key={i} style={sx('display:inline-flex;align-items:center;gap:6px;background:#fffdf8;border:1px solid #e3d8c2;border-radius:999px;padding:6px 12px;font-size:13px;font-weight:600;')}>
            {m}
            <button data-testid={`vote-rm-voter-${i}`} onClick={() => setFamilyMembers((f) => f.filter((_, j) => j !== i))} style={sx('border:none;background:transparent;cursor:pointer;color:#b8503f;font-size:13px;padding:0;')}>×</button>
          </span>
        ))}
      </div>
      <div style={sx('display:flex;gap:8px;margin-bottom:18px;')}>
        <input data-testid="vote-new-voter" value={newVoter} onChange={(e) => setNewVoter(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addVoter()} placeholder="Prénom (ex : Lina)" style={sx('flex:1;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:10px 12px;font-size:14px;')} />
        <button data-testid="vote-add-voter" onClick={addVoter} style={sx('border:none;background:#9c6b4a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:13px;border-radius:12px;padding:0 16px;cursor:pointer;')}>+ Ajouter</button>
      </div>

      <div style={sx('display:flex;gap:10px;')}>
        <button onClick={onClose} style={sx('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Annuler</button>
        <button data-testid="vote-start" disabled={!canStart} onClick={() => { setPhase('voting'); setVoterIdx(0); setVotes([]) }} style={sx(`flex:1;border:none;background:${canStart ? '#4a5d3a' : '#c7bfa8'};color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:${canStart ? 'pointer' : 'default'};`)}>Commencer le vote →</button>
      </div>
    </>)
  }

  // ---- VOTING (pass-and-play) ----
  if (phase === 'voting') {
    const voter = familyMembers[voterIdx]
    const castVote = (id) => {
      const next = [...votes, id]
      if (voterIdx + 1 < familyMembers.length) { setVotes(next); setVoterIdx(voterIdx + 1) }
      else { setVotes(next); setWinnerId(pickWinner(next)); setPhase('result'); onWinner?.() }
    }
    return sheet(<>
      <div style={sx('font-size:12px;font-weight:700;color:#9c6b4a;letter-spacing:1px;text-transform:uppercase;')}>Votant {voterIdx + 1}/{familyMembers.length}</div>
      <div data-testid="vote-current-voter" style={sx('font-family:Quicksand;font-weight:700;font-size:22px;margin:4px 0 2px;')}>À toi, {voter} !</div>
      <div style={sx('font-size:13px;color:#6b6354;margin-bottom:16px;')}>Ton choix reste secret. Tape ta sortie préférée puis passe le téléphone.</div>
      <div style={sx('display:flex;flex-direction:column;gap:10px;')}>
        {candidates.map((v) => (
          <button key={v.id} data-testid={`vote-pick-${v.id}`} onClick={() => castVote(v.id)} style={sx('display:flex;align-items:center;gap:12px;text-align:left;border:1px solid #e3d8c2;background:#fffdf8;border-radius:16px;padding:14px;cursor:pointer;box-shadow:0 2px 8px rgba(74,93,58,0.06);')}>
            <span style={sx('font-size:24px;flex:0 0 auto;')}>{v.emoji}</span>
            <span style={sx('flex:1;font-size:15px;font-weight:700;font-family:Quicksand;')}>{v.name}</span>
          </button>
        ))}
      </div>
    </>)
  }

  // ---- RESULT ----
  const winner = visits.find((v) => v.id === winnerId)
  const addWinnerToPlanning = () => {
    if (winner) addActivity(targetDay, { time: '10:00', title: winner.name, note: 'Choisi par la famille 🗳️', color: '#cf7d3c' })
    onClose()
  }
  return sheet(<>
    <div style={sx('text-align:center;')}>
      <div style={sx('font-size:44px;')}>{winner?.emoji || '🎉'}</div>
      <div style={sx('font-family:Quicksand;font-weight:700;font-size:13px;letter-spacing:1px;text-transform:uppercase;color:#9c6b4a;margin-top:4px;')}>La famille a choisi</div>
      <div data-testid="vote-winner" style={sx('font-family:Quicksand;font-weight:700;font-size:21px;margin:4px 0 16px;')}>{winner?.name || '—'}</div>
    </div>
    <div style={sx('font-size:12px;font-weight:700;color:#6b6354;margin-bottom:8px;')}>Ajouter au planning du jour</div>
    <select data-testid="vote-target-day" value={targetDay} onChange={(e) => setTargetDay(Number(e.target.value))} style={sx('width:100%;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;margin-bottom:18px;')}>
      {days.map((d, i) => <option key={i} value={i}>{d.dow} {d.num} — {d.title}</option>)}
    </select>
    <div style={sx('display:flex;gap:10px;')}>
      <button data-testid="vote-replay" onClick={() => { setPhase('setup'); setVotes([]); setVoterIdx(0); setWinnerId(null) }} style={sx('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>↺ Rejouer</button>
      <button data-testid="vote-add-planning" onClick={addWinnerToPlanning} style={sx('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Ajouter au planning</button>
    </div>
  </>)
}
