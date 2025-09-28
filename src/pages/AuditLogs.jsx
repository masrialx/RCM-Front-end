import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { 
  ClipboardDocumentListIcon, 
  MagnifyingGlassIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { claimsAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

const AuditLogs = () => {
  const [audits, setAudits] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({})
  const [filters, setFilters] = useState({
    claim_id: '',
    action: '',
    user: '',
    tenant_id: '',
    date_from: '',
    date_to: '',
    page: 1,
    page_size: 20
  })
  const { user } = useAuth()

  useEffect(() => {
    fetchAuditLogs()
  }, [filters])

  const fetchAuditLogs = async () => {
    try {
      setLoading(true)
      // Request unfiltered page; apply filters client-side for robustness
      const params = {
        tenant_id: user?.tenant_id || 'tenant_demo',
        page: filters.page,
        page_size: filters.page_size,
      }
      const response = await claimsAPI.getAudit(params)
      
      if (response.data) {
        setAudits(response.data.audits || [])
        setPagination(response.data.pagination || {})
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error)
      toast.error('Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }

  // Client-side derived filtering and sorting (if needed later)
  const displayedAudits = React.useMemo(() => {
    let rows = [...audits]

    // Action filter (robust mapping)
    if (filters.action) {
      const a = filters.action.toLowerCase()
      rows = rows.filter(r => (r.action || '').toLowerCase().includes(a))
    }

    // Claim ID filter (contains)
    if (filters.claim_id) {
      const q = filters.claim_id.toLowerCase()
      rows = rows.filter(r => (r.claim_id || '').toString().toLowerCase().includes(q))
    }

    // User filter (if present in details or top-level)
    if (filters.user) {
      const u = filters.user.toLowerCase()
      rows = rows.filter(r => {
        const fromDetails = r.details && typeof r.details === 'object'
          ? Object.values(r.details).some(v => String(v).toLowerCase().includes(u))
          : false
        const topLevel = (r.user || '').toString().toLowerCase().includes(u)
        return fromDetails || topLevel
      })
    }

    // Tenant filter (matches either top-level tenant_id or in details)
    if (filters.tenant_id) {
      const t = filters.tenant_id.toLowerCase()
      rows = rows.filter(r => {
        const top = (r.tenant_id || '').toLowerCase()
        const fromDetails = r.details && typeof r.details === 'object'
          ? Object.values(r.details).some(v => String(v).toLowerCase().includes(t))
          : false
        return top.includes(t) || fromDetails
      })
    }

    // Date range filter (use timestamp if available; fallback to created_at)
    const getDateMs = (r) => {
      const ts = r.timestamp || r.created_at
      return ts ? new Date(ts).getTime() : null
    }
    if (filters.date_from) {
      const fromMs = new Date(filters.date_from).getTime()
      rows = rows.filter(r => {
        const t = getDateMs(r)
        return t !== null && t >= fromMs
      })
    }
    if (filters.date_to) {
      const toMs = new Date(filters.date_to).getTime()
      rows = rows.filter(r => {
        const t = getDateMs(r)
        return t !== null && t <= toMs
      })
    }

    return rows
  }, [audits, filters])

  const getActionIcon = (action) => {
    switch (action?.toLowerCase()) {
      case 'upload':
        return <ArrowPathIcon className="h-5 w-5 text-blue-500" />
      case 'validate':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'reject':
        return <XCircleIcon className="h-5 w-5 text-red-500" />
      case 'approve':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-gray-500" />
    }
  }

  const getOutcomeColor = (outcome) => {
    switch (outcome?.toLowerCase()) {
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '-'
    return new Date(timestamp).toLocaleString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <ClipboardDocumentListIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Audit Logs
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Track all system activities and claim processing events
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Claim ID
            </label>
            <input
              type="text"
              value={filters.claim_id}
              onChange={(e) => setFilters({...filters, claim_id: e.target.value, page: 1})}
              placeholder="Enter claim ID"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Action
            </label>
            <select
              value={filters.action}
              onChange={(e) => setFilters({...filters, action: e.target.value, page: 1})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Actions</option>
              <option value="upload">Upload</option>
              <option value="validation">Validation</option>
              <option value="re-validation">Re-validation</option>
              <option value="api_call">API Call</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => setFilters({...filters, date_from: e.target.value, page: 1})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => setFilters({...filters, date_to: e.target.value, page: 1})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
            <input
              type="text"
              value={filters.user}
              onChange={(e) => setFilters({...filters, user: e.target.value, page: 1})}
              placeholder="Username"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tenant</label>
            <input
              type="text"
              value={filters.tenant_id}
              onChange={(e) => setFilters({...filters, tenant_id: e.target.value, page: 1})}
              placeholder="Tenant ID"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchAuditLogs}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          {displayedAudits.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-gray-500">No audit logs found for the selected filters.</p>
              <p className="text-xs text-gray-400 mt-1">Try clearing filters or refreshing data.</p>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Claim ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Outcome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayedAudits.map((audit) => (
                    <tr key={audit.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatTimestamp(audit.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {audit.claim_id || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getActionIcon(audit.action)}
                          <span className="ml-2 text-sm text-gray-900 capitalize">
                            {audit.action || '-'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getOutcomeColor(audit.outcome)}`}>
                          {audit.outcome || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {audit.details && typeof audit.details === 'object' ? (
                          <div className="max-w-xs truncate">
                            {Object.entries(audit.details).map(([key, value]) => (
                              <div key={key} className="text-xs">
                                <span className="font-medium">{key}:</span> {String(value)}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">
                            {audit.details || '-'}
                          </span>
                        )}
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((pagination.page - 1) * pagination.page_size) + 1} to{' '}
                {Math.min(pagination.page * pagination.page_size, pagination.total_audits)} of{' '}
                {pagination.total_audits} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilters({...filters, page: pagination.page - 1})}
                  disabled={pagination.page <= 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md">
                  {pagination.page}
                </span>
                <button
                  onClick={() => setFilters({...filters, page: pagination.page + 1})}
                  disabled={pagination.page >= pagination.total_pages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuditLogs