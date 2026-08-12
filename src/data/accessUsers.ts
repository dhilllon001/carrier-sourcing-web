export type AccessRole = 'Admin' | 'Broker' | 'CMT Reviewer' | 'Viewer'

export type AccessUser = {
  id: string
  name: string
  email: string
  role: AccessRole
  team: string
  canPostDat: boolean
  canPostLoadlink: boolean
  canApproveCmt: boolean
  canBlast: boolean
  status: 'Active' | 'Disabled'
}

export const ACCESS_USERS: AccessUser[] = [
  {
    id: 'u1',
    name: 'Sukhdeep Dhillon',
    email: 'sukhdeep@chargerlogistics.com',
    role: 'Admin',
    team: 'Ontario',
    canPostDat: true,
    canPostLoadlink: true,
    canApproveCmt: true,
    canBlast: true,
    status: 'Active',
  },
  {
    id: 'u2',
    name: 'Denise Da Costa',
    email: 'denise@chargerlogistics.com',
    role: 'Broker',
    team: 'Ontario',
    canPostDat: true,
    canPostLoadlink: true,
    canApproveCmt: false,
    canBlast: true,
    status: 'Active',
  },
  {
    id: 'u3',
    name: 'James Baumer',
    email: 'james@chargerlogistics.com',
    role: 'Broker',
    team: 'Midwest',
    canPostDat: true,
    canPostLoadlink: false,
    canApproveCmt: false,
    canBlast: true,
    status: 'Active',
  },
  {
    id: 'u4',
    name: 'Priya Nair',
    email: 'priya@chargerlogistics.com',
    role: 'CMT Reviewer',
    team: 'Compliance',
    canPostDat: false,
    canPostLoadlink: false,
    canApproveCmt: true,
    canBlast: false,
    status: 'Active',
  },
  {
    id: 'u5',
    name: 'Jordan Lee',
    email: 'jordan@chargerlogistics.com',
    role: 'Viewer',
    team: 'Pacific',
    canPostDat: false,
    canPostLoadlink: false,
    canApproveCmt: false,
    canBlast: false,
    status: 'Disabled',
  },
]
