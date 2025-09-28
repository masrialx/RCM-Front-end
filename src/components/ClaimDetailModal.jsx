import React, { useState } from 'react'
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline'

const ClaimDetailModal = ({ claim, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('summary')
  if (!isOpen || !claim) return null

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'valid':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />
      case 'invalid':
        return <XCircleIcon className="h-6 w-6 text-red-500" />
      case 'warning':
        return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />
      default:
        return <ExclamationTriangleIcon className="h-6 w-6 text-gray-500" />
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Claim {claim.claim_id}
                </h3>
                <p className="text-sm text-gray-600">
                  Encounter: {claim.claim_details?.encounter_type || '-'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Status and Error Type Badges */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  {getStatusIcon(claim.agent_response?.current_status || claim.claim_details?.status)}
                  <span className={`ml-2 inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(claim.agent_response?.current_status || claim.claim_details?.status)}`}>
                    {claim.agent_response?.current_status || claim.claim_details?.status || 'Unknown'}
                  </span>
                </div>
                <div>
                  {(() => {
                    const et = claim.agent_response?.error_type || claim.claim_details?.error_type
                    const t = (et || '').toLowerCase()
                    if (!t || t === 'none' || t === 'no error') {
                      return <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-800">No error</span>
                    }
                    if (t.includes('both')) {
                      return <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-purple-100 text-purple-800">Both</span>
                    }
                    if (t.includes('medical')) {
                      return <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">Medical error</span>
                    }
                    if (t.includes('technical')) {
                      return <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-orange-100 text-orange-800">Technical error</span>
                    }
                    return <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-800">{et}</span>
                  })()}
                </div>
              </div>

              {/* Tabs */}
              <div>
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {['summary','errors','actions','metadata'].map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`${activeTab === tab ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm capitalize`}
                      >
                        {tab}
                      </button>
                    ))}
                  </nav>
                </div>

                {activeTab === 'summary' && (
                  <div className="mt-4 space-y-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="text-md font-medium text-gray-900 mb-3">AI Analysis</h4>
                      <p className="text-sm text-gray-900">{claim.agent_response?.analysis || 'No analysis available'}</p>
                    </div>
                  </div>
                )}

                {activeTab === 'errors' && (
                  <div className="mt-4">
                    <h4 className="text-md font-medium text-gray-900 mb-3">Error Explanation</h4>
                    <ul className="list-disc list-inside text-sm text-gray-900 space-y-1">
                      {(claim.agent_response?.errors || claim.claim_details?.error_explanation || []).map((e, i) => (
                        <li key={i}>{e}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeTab === 'actions' && (
                  <div className="mt-4">
                    <h4 className="text-md font-medium text-gray-900 mb-3">Recommended Actions</h4>
                    <ul className="list-disc list-inside text-sm text-gray-900 space-y-1">
                      {(claim.agent_response?.recommendations || claim.claim_details?.recommended_action || []).map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeTab === 'metadata' && (
                  <div className="mt-4 bg-gray-50 rounded-lg p-4">
                    <h4 className="text-md font-medium text-gray-900 mb-3">Claim Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Encounter Type</label>
                        <p className="mt-1 text-sm text-gray-900">{claim.claim_details?.encounter_type || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Service Date</label>
                        <p className="mt-1 text-sm text-gray-900">{claim.claim_details?.service_date ? new Date(claim.claim_details.service_date).toLocaleDateString() : '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">National ID</label>
                        <p className="mt-1 text-sm text-gray-900">{claim.claim_details?.national_id || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Member ID</label>
                        <p className="mt-1 text-sm text-gray-900">{claim.claim_details?.member_id || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Facility ID</label>
                        <p className="mt-1 text-sm text-gray-900">{claim.claim_details?.facility_id || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Service Code</label>
                        <p className="mt-1 text-sm text-gray-900">{claim.claim_details?.service_code || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Paid Amount (AED)</label>
                        <p className="mt-1 text-sm text-gray-900">{claim.claim_details?.paid_amount_aed ? `AED ${claim.claim_details.paid_amount_aed.toLocaleString()}` : '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Approval Number</label>
                        <p className="mt-1 text-sm text-gray-900">{claim.claim_details?.approval_number || '-'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClaimDetailModal