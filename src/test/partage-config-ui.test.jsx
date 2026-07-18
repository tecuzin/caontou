import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PartageConfig } from '../screens/PartageConfig.jsx'
import { encodeSharePayload } from '../share-config.js'
import { s } from '../utils.js'

const store = { trip: { start: '2026-08-05', end: '2026-08-15', destination: 'Vezels-Roussy' }, saved: { 3: true }, budgetTotal: 1800, features: {} }

describe('PartageConfig — envoyer / recevoir', () => {
  it('affiche le payload copiable et un QR code', () => {
    render(<PartageConfig sx={s} payloadText={encodeSharePayload(store)} setters={{}} />)
    expect(screen.getByTestId('share-payload').value).toMatch(/cantou-cfg/)
    expect(screen.getByTestId('qr-code')).toBeInTheDocument()
  })

  it('applique une config collée via les setters', async () => {
    const user = userEvent.setup()
    const setTrip = vi.fn(); const setSaved = vi.fn(); const setBudgetTotal = vi.fn(); const setFeatures = vi.fn()
    render(<PartageConfig sx={s} payloadText="" setters={{ setTrip, setSaved, setBudgetTotal, setFeatures }} />)
    fireEvent.change(screen.getByTestId('receive-payload'), { target: { value: encodeSharePayload(store) } })
    await user.click(screen.getByTestId('btn-apply-config'))
    expect(screen.getByTestId('receive-feedback')).toHaveTextContent(/appliquée/i)
    expect(setTrip).toHaveBeenCalled()
    expect(setBudgetTotal).toHaveBeenCalledWith(1800)
  })

  it('signale une config invalide', async () => {
    const user = userEvent.setup()
    render(<PartageConfig sx={s} payloadText="" setters={{}} />)
    fireEvent.change(screen.getByTestId('receive-payload'), { target: { value: 'nimporte quoi' } })
    await user.click(screen.getByTestId('btn-apply-config'))
    expect(screen.getByTestId('receive-feedback')).toHaveTextContent(/⚠️/)
  })
})
