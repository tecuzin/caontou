import { settlement } from '../settle.js'

const SectionLabel = ({ sx, children }) => (
  <div style={sx('font-family:Quicksand;font-weight:700;font-size:13px;letter-spacing:0.5px;color:#6b6354;text-transform:uppercase;')}>{children}</div>
)

/** Écran Budget — total, catégories, liste des dépenses. */
export function Budget({
  sx, eur, catColor, remain, budgetTotal, spentPct, spent,
  setNewBudgetTotal, setShowBudgetTotalEdit, setShowAdd, budgetCats,
  sortExpenses, setSortExpenses, expenses, startEditExpense, deleteExpense,
  familyMembers = [],
}) {
  const { balances, transfers } = settlement(expenses, familyMembers)
  const shareActive = familyMembers.length >= 2 && expenses.some((e) => e.paidBy)
  return (
    <div data-testid="screen-budget">
      <div style={sx('padding:54px 18px 14px;')}>
        <div style={sx('font-family:Quicksand;font-weight:700;font-size:26px;')}>Budget</div>
      </div>
      <div style={sx('margin:0 18px 14px;background:#4a5d3a;border-radius:28px;padding:18px;color:#f3ecda;box-shadow:0 10px 24px rgba(74,93,58,0.22);')}>
        <div style={sx('display:flex;justify-content:space-between;align-items:flex-end;')}>
          <div><div style={sx('font-size:12px;color:#c9d2b6;font-weight:700;letter-spacing:0.5px;')}>RESTANT</div><div style={sx('font-family:Quicksand;font-weight:700;font-size:30px;margin-top:2px;')}>{eur(remain)}</div></div>
          <div style={sx('text-align:right;')}>
            <div style={sx('font-size:12px;color:#dbe2c9;')}>sur {eur(budgetTotal)}</div>
            <button onClick={() => { setNewBudgetTotal(String(budgetTotal)); setShowBudgetTotalEdit(true) }} style={sx('margin-top:4px;border:none;background:rgba(255,255,255,0.15);color:#dbe2c9;border-radius:8px;padding:4px 8px;font-size:11px;cursor:pointer;')}>✏️ Modifier</button>
          </div>
        </div>
        <div style={sx('margin-top:14px;height:10px;border-radius:10px;background:rgba(255,255,255,0.18);overflow:hidden;')}><div style={sx(`height:100%;background:#e8c07a;width:${spentPct}%;`)} /></div>
        <div style={sx('margin-top:8px;font-size:13px;color:#dbe2c9;')}>Dépensé {eur(spent)} · {spentPct} %</div>
      </div>
      {spentPct >= 80 && (
        <div style={sx('margin:0 18px 14px;background:#b8503f;border-radius:14px;padding:12px 16px;color:#fff;display:flex;align-items:center;gap:10px;')}>
          <span style={sx('font-size:20px;')}>⚠️</span>
          <div><div style={sx('font-weight:700;font-family:Quicksand;font-size:14px;')}>Budget à {spentPct} %</div><div style={sx('font-size:12px;opacity:0.9;margin-top:2px;')}>Plus que {eur(remain)} restants</div></div>
        </div>
      )}
      <button data-testid="btn-add-depense" onClick={() => setShowAdd(true)} style={sx('margin:0 18px 18px;width:calc(100% - 36px);border:1.5px dashed #c2a778;background:#fbf4e6;color:#9c6b4a;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:12px;cursor:pointer;')}>+ Ajouter une dépense</button>
      <div style={sx('padding:0 18px 8px;')}><SectionLabel sx={sx}>Par catégorie</SectionLabel></div>
      <div style={sx('padding:0 18px 14px;display:flex;flex-direction:column;gap:12px;')}>
        {budgetCats.map((c) => (
          <div key={c.name}>
            <div style={sx('display:flex;justify-content:space-between;font-size:14px;margin-bottom:6px;')}><span style={sx('font-weight:700;')}>{c.name}</span><span style={sx('font-weight:700;color:#6b6354;')}>{eur(c.amt)}</span></div>
            <div style={sx('height:9px;border-radius:8px;background:#efe6d4;overflow:hidden;')}><div style={sx(`height:100%;background:${c.color};width:${c.pct}%;`)} /></div>
          </div>
        ))}
      </div>
      <div style={sx('padding:4px 18px 8px;display:flex;align-items:center;justify-content:space-between;')}>
        <SectionLabel sx={sx}>Dépenses</SectionLabel>
        <button onClick={() => setSortExpenses(s2 => s2 === 'amt' ? 'date' : 'amt')} style={sx(`border:1px solid ${sortExpenses === 'amt' ? '#4a5d3a' : '#ece2cf'};background:${sortExpenses === 'amt' ? '#4a5d3a' : '#fffdf8'};color:${sortExpenses === 'amt' ? '#fffaf0' : '#6b6354'};border-radius:999px;padding:6px 12px;font-weight:700;font-size:11px;cursor:pointer;`)}>↓ Par montant</button>
      </div>
      <div style={sx('padding:0 18px;display:flex;flex-direction:column;gap:8px;')}>
        {(sortExpenses === 'amt'
          ? expenses.map((e, i) => ({ ...e, _i: i })).sort((a, b) => b.amt - a.amt)
          : [...expenses.map((e, i) => ({ ...e, _i: i }))].reverse()
        ).map((e) => (
          <div key={e._i} style={sx('display:flex;align-items:center;gap:12px;background:#fffdf8;border:1px solid #efe6d4;border-radius:14px;padding:12px 14px;')}>
            <span style={sx(`width:10px;height:10px;border-radius:50%;background:${catColor(e.cat)};flex:0 0 auto;`)} />
            <div style={sx('flex:1;min-width:0;')}><div style={sx('font-weight:700;font-size:14px;')}>{e.label}</div><div style={sx('font-size:12px;color:#6b6354;')}>{e.cat}{e.paidBy ? ` · payé par ${e.paidBy}` : ''}</div></div>
            <div style={sx('font-family:Quicksand;font-weight:700;font-size:15px;')}>{eur(e.amt)}</div>
            <button onClick={() => startEditExpense(e._i)} style={sx('border:none;background:transparent;cursor:pointer;font-size:14px;padding:4px 6px;')}>✏️</button>
            <button onClick={() => deleteExpense(e._i)} style={sx('border:none;background:transparent;cursor:pointer;font-size:14px;padding:4px 6px;color:#b8503f;')}>🗑️</button>
          </div>
        ))}
      </div>

      {shareActive && (
        <div data-testid="comptes" style={sx('margin-top:18px;')}>
          <div style={sx('padding:4px 18px 8px;')}><SectionLabel sx={sx}>Comptes — qui doit combien&nbsp;?</SectionLabel></div>
          <div style={sx('padding:0 18px;display:flex;flex-direction:column;gap:8px;')}>
            {balances.map((b) => (
              <div key={b.member} style={sx('display:flex;align-items:center;justify-content:space-between;background:#fffdf8;border:1px solid #efe6d4;border-radius:14px;padding:12px 14px;')}>
                <span style={sx('font-weight:700;font-size:14px;')}>{b.member}</span>
                <span style={sx(`font-family:Quicksand;font-weight:700;font-size:15px;color:${b.balance > 0.005 ? '#4a5d3a' : b.balance < -0.005 ? '#b8503f' : '#6b6354'};`)}>
                  {b.balance > 0.005 ? `+${eur(b.balance)}` : b.balance < -0.005 ? eur(b.balance) : '—'}
                </span>
              </div>
            ))}
          </div>
          <div style={sx('padding:12px 18px 0;')}><SectionLabel sx={sx}>Remboursements</SectionLabel></div>
          <div style={sx('padding:8px 18px 0;display:flex;flex-direction:column;gap:8px;')}>
            {transfers.length === 0 ? (
              <div data-testid="comptes-balanced" style={sx('font-size:14px;color:#4a5d3a;font-weight:600;')}>✅ Tout est équilibré, personne ne doit rien.</div>
            ) : transfers.map((t, i) => (
              <div key={i} data-testid="comptes-transfer" style={sx('display:flex;align-items:center;gap:10px;background:#f3ece0;border-radius:14px;padding:12px 14px;font-size:14px;')}>
                <span style={sx('font-size:18px;')}>↪</span>
                <div><b>{t.from}</b> doit <b style={sx('color:#9c6b4a;')}>{eur(t.amount)}</b> à <b>{t.to}</b></div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={sx('height:16px;')} />
    </div>
  )
}
