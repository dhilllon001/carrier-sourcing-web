import { useMemo, useState } from 'react'
import { Shield, Users } from 'lucide-react'
import { cn } from '@/lib/cn'
import { ACCESS_USERS, type AccessUser } from '@/data/accessUsers'

type Props = {
  search: string
}

export function AccessManagementPage({ search }: Props) {
  const [users, setUsers] = useState(ACCESS_USERS)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return users
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        u.team.toLowerCase().includes(q)
    )
  }, [users, search])

  const toggle = (id: string, key: keyof AccessUser) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== id) return u
        const val = u[key]
        if (typeof val === 'boolean') return { ...u, [key]: !val }
        return u
      })
    )
  }

  return (
    <div className="access-page">
      <div className="access-hero">
        <div className="access-hero__mark">
          <Users size={18} />
        </div>
        <div>
          <strong>Access & management</strong>
          <em>Mock roles for DAT / Loadlink posting and CMT approvals · not wired to auth</em>
        </div>
      </div>

      <section className="access-card">
        <div className="access-card__head">
          <strong>Posting & CMT permissions</strong>
          <span>{filtered.length} users</span>
        </div>
        <div className="access-table-wrap">
          <table className="access-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Team</th>
                <th>DAT</th>
                <th>Loadlink</th>
                <th>CMT</th>
                <th>Blast</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className={cn(u.status === 'Disabled' && 'is-disabled')}>
                  <td>
                    <strong>{u.name}</strong>
                    <em>{u.email}</em>
                  </td>
                  <td>
                    <span className={cn('access-role', `is-${u.role.replace(/\s+/g, '-').toLowerCase()}`)}>
                      {u.role === 'CMT Reviewer' ? (
                        <>
                          <Shield size={11} /> {u.role}
                        </>
                      ) : (
                        u.role
                      )}
                    </span>
                  </td>
                  <td>{u.team}</td>
                  {(
                    [
                      ['canPostDat', u.canPostDat],
                      ['canPostLoadlink', u.canPostLoadlink],
                      ['canApproveCmt', u.canApproveCmt],
                      ['canBlast', u.canBlast],
                    ] as const
                  ).map(([key, on]) => (
                    <td key={key}>
                      <button
                        type="button"
                        className={cn('access-toggle', on && 'is-on')}
                        onClick={() => toggle(u.id, key)}
                        disabled={u.status === 'Disabled'}
                      >
                        {on ? 'On' : 'Off'}
                      </button>
                    </td>
                  ))}
                  <td>
                    <span className={cn('access-status', u.status === 'Active' ? 'is-ok' : 'is-off')}>
                      {u.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="access-card access-card--note">
        <strong>Integration hold</strong>
        <p>
          Real RBAC, Highway domain sync, WhatsApp number validation, and live DAT/Loadlink posting
          stay out of scope until backends are connected. This matrix is local mock state only.
        </p>
      </section>
    </div>
  )
}
