import { useState, useEffect, memo } from 'react'
import TenderCategories from './Technical/TenderCategories/TenderCategories'
import ProjectTypes from './Technical/ProjectTypes/ProjectTypes'
import IsoCertificates from './Technical/IsoCertificates/IsoCertificates'
import Organisation from './Technical/Organisation/Organisation'
import BankDetails from './Technical/BankDetails/BankDetails'
import ProjectExperience from './Technical/ProjectExperience/ProjectExperience'
import EmployeeBioData from './Technical/EmployeeBioData/EmployeeBioData'
import Documents from './Technical/Documents/Documents'
import FinancialDetails from './Financial/FinancialDetails'
import './AddDetails.css'

const MemoTenderCategories = memo(TenderCategories)
const MemoProjectTypes = memo(ProjectTypes)
const MemoIsoCertificates = memo(IsoCertificates)
const MemoOrganisation = memo(Organisation)
const MemoBankDetails = memo(BankDetails)
const MemoProjectExperience = memo(ProjectExperience)
const MemoEmployeeBioData = memo(EmployeeBioData)
const MemoDocuments = memo(Documents)
const MemoFinancialDetails = memo(FinancialDetails)

function AddDetails() {
  const [activeTab, setActiveTab] = useState('technical')
  const [activeTechnicalTab, setActiveTechnicalTab] = useState('tenderCategories')
  const projectTypes = []

  return (
    <section className="add-details-page">
      <div className="details-header">
        <div>
          <h2>Add Details</h2>
          <p>Fill technical information and upload supporting documents.</p>
        </div>
      </div>

      <div className="details-tabs">
        <button
          type="button"
          className={`details-tab ${activeTab === 'technical' ? 'active' : ''}`}
          onClick={() => setActiveTab('technical')}
        >
          Technical Details
        </button>
        <button
          type="button"
          className={`details-tab ${activeTab === 'financial' ? 'active' : ''}`}
          onClick={() => setActiveTab('financial')}
        >
          Financial Details
        </button>
      </div>

      <div className="details-panel">
        {activeTab === 'technical' ? (
          <div className="technical-form">
            <div className="technical-subtabs">
              <button type="button" className={`technical-subtab ${activeTechnicalTab === 'tenderCategories' ? 'active' : ''}`} onClick={() => setActiveTechnicalTab('tenderCategories')}>Tender Categories</button>
              <button type="button" className={`technical-subtab ${activeTechnicalTab === 'projectTypes' ? 'active' : ''}`} onClick={() => setActiveTechnicalTab('projectTypes')}>Project Types</button>
              <button type="button" className={`technical-subtab ${activeTechnicalTab === 'organisation' ? 'active' : ''}`} onClick={() => setActiveTechnicalTab('organisation')}>Organization Details</button>
              <button type="button" className={`technical-subtab ${activeTechnicalTab === 'iso' ? 'active' : ''}`} onClick={() => setActiveTechnicalTab('iso')}>ISO Certificates</button>
              <button type="button" className={`technical-subtab ${activeTechnicalTab === 'bank' ? 'active' : ''}`} onClick={() => setActiveTechnicalTab('bank')}>Bank Details</button>
              <button type="button" className={`technical-subtab ${activeTechnicalTab === 'projects' ? 'active' : ''}`} onClick={() => setActiveTechnicalTab('projects')}>Project Experience</button>
              <button type="button" className={`technical-subtab ${activeTechnicalTab === 'employees' ? 'active' : ''}`} onClick={() => setActiveTechnicalTab('employees')}>Employee Bio-data</button>
              <button type="button" className={`technical-subtab ${activeTechnicalTab === 'documents' ? 'active' : ''}`} onClick={() => setActiveTechnicalTab('documents')}>Documents</button>
            </div>

            <div className="technical-tab-content">
              {activeTechnicalTab === 'tenderCategories' && <MemoTenderCategories />}
              {activeTechnicalTab === 'projectTypes' && <MemoProjectTypes />}
              {activeTechnicalTab === 'organisation' && <MemoOrganisation />}
              {activeTechnicalTab === 'iso' && <MemoIsoCertificates />}
              {activeTechnicalTab === 'bank' && <MemoBankDetails />}
              {activeTechnicalTab === 'projects' && <MemoProjectExperience projectTypes={projectTypes} />}
              {activeTechnicalTab === 'employees' && <MemoEmployeeBioData />}
              {activeTechnicalTab === 'documents' && <MemoDocuments />}
            </div>
          </div>
        ) : (
          <MemoFinancialDetails />
        )}
      </div>
    </section>
  )
}

export default AddDetails
