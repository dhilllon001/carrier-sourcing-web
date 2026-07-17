import { useEffect, useState } from 'react'
import { GripVertical, Plus, Search, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import {
  AVAILABILITY_CITIES,
  AVAILABILITY_TRAILERS,
  type AvailabilityRow,
} from '@/data/availability'

type Props = {
  open: boolean
  onClose: () => void
  onPosted: (row: AvailabilityRow) => void
}

export function PostAvailabilityPanel({ open, onClose, onPosted }: Props) {
  const [carrierQuery, setCarrierQuery] = useState('')
  const [trailer, setTrailer] = useState('')
  const [pickup, setPickup] = useState('')
  const [deliveries, setDeliveries] = useState<string[]>([''])
  const [startDate, setStartDate] = useState('2026-07-17T12:30')
  const [endDate, setEndDate] = useState('2026-07-17T12:30')
  const [truckCount, setTruckCount] = useState(1)
  const [powerUnit, setPowerUnit] = useState(true)
  const [notes, setNotes] = useState('')
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  const carrierOk = carrierQuery.trim().length >= 2
  const trailerOk = Boolean(trailer)
  const pickupOk = Boolean(pickup)
  const deliveryOk = deliveries.some((d) => d.trim())
  const canPost = carrierOk && trailerOk && pickupOk && deliveryOk

  const reset = () => {
    setCarrierQuery('')
    setTrailer('')
    setPickup('')
    setDeliveries([''])
    setStartDate('2026-07-17T12:30')
    setEndDate('2026-07-17T12:30')
    setTruckCount(1)
    setPowerUnit(true)
    setNotes('')
    setTouched(false)
  }

  const post = () => {
    setTouched(true)
    if (!canPost) return
    const dest = deliveries.filter(Boolean).join(' → ') || 'Open'
    onPosted({
      id: `a${Date.now()}`,
      carrier: carrierQuery.trim(),
      email: `${carrierQuery.trim().toLowerCase().replace(/\s+/g, '.')}@carrier.example`,
      origin: pickup,
      destination: dest,
      trailerType: trailer,
      startDate: 'Jul 17, 2026',
      endDate: 'Jul 17, 2026',
      status: 'Posted',
      onboarding: 'Onboarded',
      source: 'CarrierApp',
      notes: notes.trim() || (powerUnit ? 'Power unit available' : ''),
    })
    reset()
    onClose()
  }

  return (
    <div className="av-post" role="dialog" aria-modal="true" aria-label="Post Carrier Availability">
      <button type="button" className="av-post__backdrop" aria-label="Close panel" onClick={onClose} />
      <aside className="av-post__panel">
        <header className="av-post__head">
          <strong>Post Carrier Availability</strong>
          <button type="button" className="av-post__close" aria-label="Close" onClick={onClose}>
            <X size={16} />
          </button>
        </header>

        <div className="av-post__body">
          <label className="av-field">
            <span>
              Carrier <i>*</i>
            </span>
            <div className={cn('av-field__control', touched && !carrierOk && 'is-invalid')}>
              <Search size={14} />
              <input
                value={carrierQuery}
                onChange={(e) => setCarrierQuery(e.target.value)}
                placeholder="Type at least 2 letters to search…"
              />
            </div>
          </label>

          <label className="av-field">
            <span>
              Trailer type <i>*</i>
            </span>
            <div className={cn('av-field__control', touched && !trailerOk && 'is-invalid')}>
              <select value={trailer} onChange={(e) => setTrailer(e.target.value)}>
                <option value="">Select trailer type</option>
                {AVAILABILITY_TRAILERS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </label>

          <label className="av-field">
            <span>
              Pickup city <i>*</i>
            </span>
            <div className={cn('av-field__control', touched && !pickupOk && 'is-invalid')}>
              <select value={pickup} onChange={(e) => setPickup(e.target.value)}>
                <option value="">Select city</option>
                {AVAILABILITY_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </label>

          <div className="av-field">
            <div className="av-field__row">
              <span>
                Delivery cities <i>*</i>
              </span>
              <button
                type="button"
                className="av-link-btn"
                onClick={() => setDeliveries((prev) => [...prev, ''])}
              >
                <Plus size={13} />
                Add stop
              </button>
            </div>
            <div className="av-stops">
              {deliveries.map((city, idx) => (
                <div key={idx} className="av-stop">
                  <GripVertical size={14} className="av-stop__grip" />
                  <div className={cn('av-field__control', touched && !deliveryOk && 'is-invalid')}>
                    <select
                      value={city}
                      onChange={(e) =>
                        setDeliveries((prev) => prev.map((v, i) => (i === idx ? e.target.value : v)))
                      }
                    >
                      <option value="">Select city</option>
                      {AVAILABILITY_CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    className="av-stop__remove"
                    aria-label="Remove stop"
                    disabled={deliveries.length === 1}
                    onClick={() => setDeliveries((prev) => prev.filter((_, i) => i !== idx))}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="av-dates">
            <label className="av-field">
              <span>
                Available Start Date <i>*</i>
              </span>
              <div className="av-field__control">
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
            </label>
            <label className="av-field">
              <span>Available End Date — optional</span>
              <div className="av-field__control">
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </label>
          </div>

          <label className="av-field av-field--narrow">
            <span>
              Truck count <i>*</i>
            </span>
            <div className="av-field__control">
              <input
                type="number"
                min={1}
                value={truckCount}
                onChange={(e) => setTruckCount(Math.max(1, Number(e.target.value) || 1))}
              />
            </div>
          </label>

          <button
            type="button"
            className={cn('av-toggle', powerUnit && 'is-on')}
            onClick={() => setPowerUnit((v) => !v)}
          >
            <span className="av-toggle__switch" aria-hidden />
            <span>
              <strong>Power unit available</strong>
              <em>Driver + tractor included</em>
            </span>
          </button>

          <label className="av-field">
            <span>Notes</span>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes…"
            />
          </label>
        </div>

        <footer className="av-post__foot">
          <button
            type="button"
            className="av-btn"
            onClick={() => {
              reset()
              onClose()
            }}
          >
            Cancel
          </button>
          <button type="button" className="av-btn av-btn--primary" onClick={post}>
            Post Availability
          </button>
        </footer>
      </aside>
    </div>
  )
}
