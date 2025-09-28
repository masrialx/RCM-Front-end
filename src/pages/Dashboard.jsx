import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { 
  ChartBarIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { claimsAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import ClaimDetailModal from '../components/ClaimDetailModal'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const Dashboard = () => {
  const [claims, setClaims] = useState([])
  const [chartData, setChartData] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedClaim, setSelectedClaim] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [pagination, setPagination] = useState({})
  const [filters, setFilters] = useState({
    status: '',
    error_type: '',
    service_code: '',
    service_date_from: '',
    service_date_to: '',
    facility_id: '',
    member_or_national: '',
    sort_field: 'service_date',
    sort_dir: 'desc',
    page: 1,
    page_size: 10
  })
  const [facilityOptions, setFacilityOptions] = useState([])
  const { user } = useAuth()

  useEffect(() => {
    fetchData()
  }, [filters])

  const fetchData = async () => {
    try {
      setLoading(true)
      // Request unfiltered page from server; apply all filters client-side for robustness
      const params = {
        tenant_id: user?.tenant_id || 'tenant_demo',
        page: filters.page,
        page_size: filters.page_size,
      }
      const response = await claimsAPI.getResults(params)
      
      if (response.data) {
        const serverClaims = response.data.claims || []
        setClaims(serverClaims)
        setChartData(response.data.chart_data || {})
        setPagination(response.data.pagination || {})
        // Populate facility options from current page of data
        const facilities = Array.from(new Set(serverClaims.map(c => c.facility_id).filter(Boolean)))
        setFacilityOptions(facilities)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleRevalidate = async (claimId) => {
    try {
      const response = await claimsAPI.validate({
        tenant_id: user?.tenant_id || 'tenant_demo',
        claim_ids: [claimId]
      })
      
      if (response.data) {
        toast.success('Claim revalidated successfully')
        fetchData() // Refresh data
      }
    } catch (error) {
      console.error('Revalidation error:', error)
      toast.error('Failed to revalidate claim')
    }
  }

  const handleViewDetails = async (claimId) => {
    try {
      const response = await claimsAPI.queryAgent({
        tenant_id: user?.tenant_id || 'tenant_demo',
        claim_id: claimId,
        query: 'Provide detailed analysis of this claim'
      })
      
      if (response.data) {
        setSelectedClaim(response.data)
        setIsModalOpen(true)
      }
    } catch (error) {
      console.error('Error fetching claim details:', error)
      toast.error('Failed to load claim details')
    }
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'valid':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'invalid':
        return <XCircleIcon className="h-5 w-5 text-red-500" />
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'valid':
        return 'bg-green-100 text-green-800'
      case 'invalid':
        return 'bg-red-100 text-red-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status) => {
    const s = (status || '').toLowerCase()
    if (s === 'valid') return 'Validated'
    if (s === 'invalid') return 'Not Validated'
    return status || 'Unknown'
  }

  const getErrorTypeBadge = (errorType) => {
    const t = (errorType || '').toLowerCase()
    if (!t || t === 'none' || t === 'no error') {
      return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">No error</span>
    }
    if (t.includes('both')) {
      return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">Both</span>
    }
    if (t.includes('medical')) {
      return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Medical error</span>
    }
    if (t.includes('technical')) {
      return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">Technical error</span>
    }
    return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{errorType}</span>
  }

  const renderExplanationPreview = (explanations = []) => {
    if (!Array.isArray(explanations) || explanations.length === 0) {
      return <span className="text-gray-400">-</span>
    }
    const preview = explanations.slice(0, 2)
    return (
      <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
        {preview.map((item, idx) => (
          <li key={idx} className="truncate">{item}</li>
        ))}
      </ul>
    )
  }

  const renderRecommendedPreview = (actions = []) => {
    if (!Array.isArray(actions) || actions.length === 0) {
      return <span className="text-gray-400">-</span>
    }
    return <span className="text-sm text-gray-700">{actions[0]}</span>
  }

  // Chart configurations
  const claimCountsData = {
    labels: Object.keys(chartData.claim_counts_by_error || {}),
    datasets: [
      {
        label: 'Claim Count',
        data: Object.values(chartData.claim_counts_by_error || {}),
        backgroundColor: [
          '#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6', '#F97316'
        ],
        borderColor: [
          '#1D4ED8', '#DC2626', '#D97706', '#059669', '#7C3AED', '#EA580C'
        ],
        borderWidth: 1,
      },
    ],
  }

  const paidAmountData = {
    labels: Object.keys(chartData.paid_amount_by_error || {}),
    datasets: [
      {
        label: 'Paid Amount (AED)',
        data: Object.values(chartData.paid_amount_by_error || {}),
        backgroundColor: [
          '#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6', '#F97316'
        ],
        borderColor: [
          '#1D4ED8', '#DC2626', '#D97706', '#059669', '#7C3AED', '#EA580C'
        ],
        borderWidth: 1,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Claims Analysis',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  // Derived filtered/sorted claims on client (in addition to server filters)
  const displayedClaims = React.useMemo(() => {
    let rows = [...claims]
    // Status filter (client-side, robust)
    if (filters.status) {
      rows = rows.filter(c => {
        const s = (c.status || '').toLowerCase()
        if (filters.status === 'valid') return s === 'valid' || s === 'validated'
        if (filters.status === 'invalid') return s === 'invalid' || s === 'not validated'
        return true
      })
    }
    // Error type filter (client-side, robust)
    if (filters.error_type) {
      rows = rows.filter(c => {
        const et = (c.error_type || '').toLowerCase()
        if (filters.error_type === 'none') return et === '' || et === 'none' || et === 'no error' || et === '-'
        if (filters.error_type === 'medical') return et.includes('medical')
        if (filters.error_type === 'technical') return et.includes('technical')
        if (filters.error_type === 'both') return et.includes('both')
        return true
      })
    }
    // Date range filter (client-side) - exclude records with missing date if bounds set
    if (filters.service_date_from) {
      rows = rows.filter(c => c.service_date && new Date(c.service_date) >= new Date(filters.service_date_from))
    }
    if (filters.service_date_to) {
      rows = rows.filter(c => c.service_date && new Date(c.service_date) <= new Date(filters.service_date_to))
    }
    // Facility filter (client-side)
    if (filters.facility_id) {
      rows = rows.filter(c => (c.facility_id || '') === filters.facility_id)
    }
    // Member/National search (client-side contains)
    if (filters.member_or_national) {
      const q = filters.member_or_national.toLowerCase()
      rows = rows.filter(c =>
        (c.member_id && String(c.member_id).toLowerCase().includes(q)) ||
        (c.national_id && String(c.national_id).toLowerCase().includes(q))
      )
    }
    // Sorting
    const { sort_field, sort_dir } = filters
    rows.sort((a, b) => {
      const dir = sort_dir === 'desc' ? -1 : 1
      let va = a[sort_field]
      let vb = b[sort_field]
      if (sort_field === 'service_date') {
        va = va ? new Date(va).getTime() : 0
        vb = vb ? new Date(vb).getTime() : 0
      }
      if (sort_field === 'paid_amount_aed') {
        va = typeof va === 'number' ? va : (va ? Number(va) : 0)
        vb = typeof vb === 'number' ? vb : (vb ? Number(vb) : 0)
      }
      if (va < vb) return -1 * dir
      if (va > vb) return 1 * dir
      return 0
    })
    return rows
  }, [claims, filters])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Claims by Error Category
          </h3>
          <div className="h-64">
            <Bar data={claimCountsData} options={chartOptions} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Paid Amount by Error Category
          </h3>
          <div className="h-64">
            <Bar data={paidAmountData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value, page: 1})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="valid">Validated</option>
              <option value="invalid">Not Validated</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Error Type</label>
            <select
              value={filters.error_type}
              onChange={(e) => setFilters({...filters, error_type: e.target.value, page: 1})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="none">None</option>
              <option value="medical">Medical Error</option>
              <option value="technical">Technical Error</option>
              <option value="both">Both</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Date From</label>
            <input
              type="date"
              value={filters.service_date_from}
              onChange={(e) => setFilters({...filters, service_date_from: e.target.value, page: 1})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Date To</label>
            <input
              type="date"
              value={filters.service_date_to}
              onChange={(e) => setFilters({...filters, service_date_to: e.target.value, page: 1})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Facility ID</label>
            <select
              value={filters.facility_id}
              onChange={(e) => setFilters({...filters, facility_id: e.target.value, page: 1})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              {facilityOptions.map(fid => (
                <option key={fid} value={fid}>{fid}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Member/National ID</label>
            <input
              type="text"
              value={filters.member_or_national}
              onChange={(e) => setFilters({...filters, member_or_national: e.target.value, page: 1})}
              placeholder="Search"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={filters.sort_field}
              onChange={(e) => setFilters({...filters, sort_field: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="service_date">Service Date</option>
              <option value="paid_amount_aed">Paid Amount</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Direction</label>
            <select
              value={filters.sort_dir}
              onChange={(e) => setFilters({...filters, sort_dir: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="asc">ASC</option>
              <option value="desc">DESC</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchData}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Page Title */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Claims Validation Results</h2>
      </div>

      {/* Claims Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Claims Validation Results
          </h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Claim ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Error Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Explanation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recommended Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayedClaims.map((claim) => (
                  <tr key={claim.claim_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-700">
                      <button
                        className="hover:underline"
                        onClick={() => handleViewDetails(claim.claim_id)}
                        title="View details"
                      >
                        {claim.claim_id}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(claim.status)}
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(claim.status)}`}>
                          {getStatusLabel(claim.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getErrorTypeBadge(claim.error_type)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                      <div className="space-y-1">
                        {renderExplanationPreview(claim.error_explanation)}
                        {Array.isArray(claim.error_explanation) && claim.error_explanation.length > 2 && (
                          <button
                            onClick={() => handleViewDetails(claim.claim_id)}
                            className="text-blue-600 hover:text-blue-800 text-xs"
                          >
                            View more
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs">
                      {renderRecommendedPreview(claim.recommended_action)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleViewDetails(claim.claim_id)}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        Details
                      </button>
                      <button
                        onClick={() => handleRevalidate(claim.claim_id)}
                        className="text-green-600 hover:text-green-900 flex items-center"
                      >
                        <ArrowPathIcon className="h-4 w-4 mr-1" />
                        Re-validate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((pagination.page - 1) * pagination.page_size) + 1} to{' '}
                {Math.min(pagination.page * pagination.page_size, pagination.total_claims)} of{' '}
                {pagination.total_claims} results
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

      {/* Claim Detail Modal */}
      {isModalOpen && selectedClaim && (
        <ClaimDetailModal
          claim={selectedClaim}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedClaim(null)
          }}
        />
      )}
    </div>
  )
}

export default Dashboard