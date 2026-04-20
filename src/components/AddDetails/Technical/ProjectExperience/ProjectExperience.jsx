import { useMemo, useState } from 'react'
import alerts from '../../../../utils/alerts'
import DetailsDataTable from '../../common/DetailsDataTable'
import './ProjectExperience.css'

const initialProjectDraft = {
  projectTypeId: '',
  clientName: '',
  projectName: '',
  projectLocation: '',
  state: '',
  department: '',
  projectCost: '',
  consultancyFee: '',
  workOrderNumber: '',
  workOrderDate: '',
  completionCertificateDate: '',
  currentStatus: '',
  workOrderDocument: null,
  workOrderDocumentPreview: '',
  completionCertificateDocument: null,
  completionCertificateDocumentPreview: '',
  otherProjectDocuments: [],
  otherProjectDocumentsPreview: []
}

const projectInputFields = [
  { name: 'clientName', label: 'Name of Client' },
  { name: 'projectName', label: 'Name of Project / Assignment' },
  { name: 'projectLocation', label: 'Project Location' },
  { name: 'state', label: 'State' },
  { name: 'department', label: 'Department / Authority' },
  { name: 'projectCost', label: 'Project Cost' },
  { name: 'consultancyFee', label: 'Consultancy Fee' },
  { name: 'workOrderNumber', label: 'Work Order Number' },
  { name: 'workOrderDate', label: 'Work Order Date' },
  { name: 'completionCertificateDate', label: 'Completion Certificate Date' }
]

function ProjectExperience({ projectTypes }) {
  const [projects, setProjects] = useState([])
  const [projectDraft, setProjectDraft] = useState(initialProjectDraft)
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [editingProjectId, setEditingProjectId] = useState(null)
  const [viewingProjectDocuments, setViewingProjectDocuments] = useState(null)

  const handleProjectChange = (event) => {
    const { name, value } = event.target
    setProjectDraft((prev) => ({ ...prev, [name]: value }))
  }

  const handleProjectImageChange = (event, docType) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (docType === 'workOrder') {
          setProjectDraft((prev) => ({
            ...prev,
            workOrderDocument: file,
            workOrderDocumentPreview: reader.result
          }))
        } else if (docType === 'completionCertificate') {
          setProjectDraft((prev) => ({
            ...prev,
            completionCertificateDocument: file,
            completionCertificateDocumentPreview: reader.result
          }))
        } else if (docType === 'other') {
          setProjectDraft((prev) => ({
            ...prev,
            otherProjectDocuments: [...prev.otherProjectDocuments, file],
            otherProjectDocumentsPreview: [...prev.otherProjectDocumentsPreview, reader.result]
          }))
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveProjectImage = (docType, index) => {
    if (docType === 'workOrder') {
      setProjectDraft((prev) => ({
        ...prev,
        workOrderDocument: null,
        workOrderDocumentPreview: ''
      }))
    } else if (docType === 'completionCertificate') {
      setProjectDraft((prev) => ({
        ...prev,
        completionCertificateDocument: null,
        completionCertificateDocumentPreview: ''
      }))
    } else if (docType === 'other') {
      setProjectDraft((prev) => ({
        ...prev,
        otherProjectDocuments: prev.otherProjectDocuments.filter((_, i) => i !== index),
        otherProjectDocumentsPreview: prev.otherProjectDocumentsPreview.filter((_, i) => i !== index)
      }))
    }
  }

  const handleSaveProject = () => {
    if (!projectDraft.projectTypeId || !projectDraft.projectName.trim()) {
      return
    }

    const selectedType = projectTypes.find((type) => String(type.id) === String(projectDraft.projectTypeId))
    const typeLabel = selectedType ? selectedType.type_name : ''

    if (editingProjectId) {
      setProjects((prev) =>
        prev.map((project) =>
          project.id === editingProjectId
            ? { ...project, ...projectDraft, projectTypeLabel: typeLabel }
            : project
        )
      )
      setEditingProjectId(null)
    } else {
      setProjects((prev) => [
        ...prev,
        {
          id: `project-${prev.length + 1}`,
          ...projectDraft,
          projectTypeLabel: typeLabel
        }
      ])
    }
    setProjectDraft(initialProjectDraft)
    setShowProjectForm(false)
  }

  const handleRemoveProject = (projectId) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId))
  }

  const columns = useMemo(() => [
    {
      accessorKey: 'clientName',
      header: 'Client Name',
      Cell: ({ cell }) => <span className="bold-label">{cell.getValue() || '-'}</span>
    },
    {
      accessorKey: 'projectName',
      header: 'Project / Assignment',
      Cell: ({ cell }) => cell.getValue() || '-'
    },
    {
      accessorKey: 'projectCost',
      header: 'Project Cost',
      Cell: ({ cell }) => cell.getValue() || '-'
    },
    {
      accessorKey: 'consultancyFee',
      header: 'Consultancy Fee',
      Cell: ({ cell }) => cell.getValue() || '-'
    },
    {
      accessorKey: 'workOrderDate',
      header: 'Work Order Date',
      Cell: ({ cell }) => cell.getValue() || '-'
    },
    {
      accessorKey: 'completionCertificateDate',
      header: 'Comp. Cert. Date',
      Cell: ({ cell }) => cell.getValue() || '-'
    },
    {
      id: 'actions',
      header: 'Action',
      enableSorting: false,
      enableColumnFilter: false,
      Cell: ({ row }) => {
        const project = row.original
        return (
          <div className="row-actions">
            <button type="button" className="view-row-btn" onClick={() => setViewingProjectDocuments(project)}>View</button>
            {(project.workOrderDocumentPreview || project.completionCertificateDocumentPreview || project.otherProjectDocumentsPreview?.length > 0) && (
              <button type="button" className="view-docs-btn" onClick={() => setViewingProjectDocuments(project)}>Docs</button>
            )}
            <button
              type="button"
              className="edit-row-btn"
              onClick={() => {
                setEditingProjectId(project.id)
                setProjectDraft(project)
                setShowProjectForm(true)
              }}
            >
              Edit
            </button>
            <button type="button" className="delete-row-btn" onClick={() => handleRemoveProject(project.id)}>Delete</button>
          </div>
        )
      }
    }
  ], [])

  return (
    <section className="details-section">
      <h3>Project Experience Details</h3>
      <p className="section-helper">
        Detailed record of projects including consultancy fees and completion documents.
      </p>

      {!showProjectForm ? (
        <>
          <div className="section-actions">
            <button type="button" onClick={() => setShowProjectForm(true)}>
              + Add New Project
            </button>
          </div>

          <DetailsDataTable
            columns={columns}
            data={projects}
            emptyMessage="No project added yet."
          />

          {viewingProjectDocuments && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h4>{viewingProjectDocuments.projectName} ({viewingProjectDocuments.currentStatus || 'Status NA'})</h4>
                  <button type="button" className="modal-close-btn" onClick={() => setViewingProjectDocuments(null)}>✕</button>
                </div>
                <div className="modal-body">
                  <div className="card-look">
                    <p><strong>Project Type:</strong> {viewingProjectDocuments.projectTypeLabel}</p>
                    <p><strong>Client:</strong> {viewingProjectDocuments.clientName}</p>
                    <p><strong>Location:</strong> {viewingProjectDocuments.projectLocation}, {viewingProjectDocuments.state}</p>
                    <p><strong>Dept:</strong> {viewingProjectDocuments.department}</p>
                    <p><strong>Cost & Fee:</strong> {viewingProjectDocuments.projectCost} / {viewingProjectDocuments.consultancyFee}</p>
                    <p><strong>Work Order:</strong> {viewingProjectDocuments.workOrderNumber} ({viewingProjectDocuments.workOrderDate})</p>
                    <p><strong>Completion:</strong> {viewingProjectDocuments.completionCertificateDate}</p>
                  </div>
                  {viewingProjectDocuments.workOrderDocumentPreview && (
                    <div>
                      <h5>Work Order Document</h5>
                      <img src={viewingProjectDocuments.workOrderDocumentPreview} alt="WO" className="modal-image-preview" />
                    </div>
                  )}
                  {viewingProjectDocuments.completionCertificateDocumentPreview && (
                    <div>
                      <h5>Completion Certificate</h5>
                      <img src={viewingProjectDocuments.completionCertificateDocumentPreview} alt="CC" className="modal-image-preview" />
                    </div>
                  )}
                  {viewingProjectDocuments.otherProjectDocumentsPreview && viewingProjectDocuments.otherProjectDocumentsPreview.map((url, idx) => (
                    <div key={idx}>
                      <h5>Other Document {idx + 1}</h5>
                      <img src={url} alt={`Other ${idx}`} className="modal-image-preview" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="project-form-container premium-card mt-2">
          <h4>{editingProjectId ? 'Update Project Details' : 'Add New Project Assignment'}</h4>
          <div className="project-entry-form">
            <label className="details-field">
              <span>Project Type *</span>
              <select
                name="projectTypeId"
                value={projectDraft.projectTypeId}
                onChange={handleProjectChange}
                required
              >
                <option value="">Select Category</option>
                {projectTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.type_name}
                  </option>
                ))}
              </select>
            </label>

            {projectInputFields.map((field) => (
              <label className="details-field" key={field.name}>
                <span>{field.label}</span>
                <input
                  type={field.name.includes('Date') ? 'date' : 'text'}
                  name={field.name}
                  value={projectDraft[field.name]}
                  onChange={handleProjectChange}
                  placeholder={`Enter ${field.label}`}
                />
              </label>
            ))}

            <label className="details-field">
              <span>Current Status</span>
              <select
                name="currentStatus"
                value={projectDraft.currentStatus}
                onChange={handleProjectChange}
              >
                <option value="">Select Status</option>
                <option value="Completed">Completed</option>
                <option value="Ongoing">Ongoing</option>
              </select>
            </label>
          </div>

          <div className="project-documents-section">
            <h5>Upload Supporting Documents</h5>
            <div className="project-documents-grid">
              <div className="project-doc-upload">
                <p>Work Order Document</p>
                {projectDraft.workOrderDocumentPreview ? (
                  <div className="image-preview-container">
                    <img src={projectDraft.workOrderDocumentPreview} alt="WO" />
                    <button type="button" onClick={() => handleRemoveProjectImage('workOrder')}>Remove</button>
                  </div>
                ) : (
                  <label className="image-upload-field">
                    <span>📄 Upload Work Order</span>
                    <input type="file" onChange={(e) => handleProjectImageChange(e, 'workOrder')} />
                  </label>
                )}
              </div>

              <div className="project-doc-upload">
                <p>Completion Certificate</p>
                {projectDraft.completionCertificateDocumentPreview ? (
                  <div className="image-preview-container">
                    <img src={projectDraft.completionCertificateDocumentPreview} alt="CC" />
                    <button type="button" onClick={() => handleRemoveProjectImage('completionCertificate')}>Remove</button>
                  </div>
                ) : (
                  <label className="image-upload-field">
                    <span>📄 Upload Completion Cert</span>
                    <input type="file" onChange={(e) => handleProjectImageChange(e, 'completionCertificate')} />
                  </label>
                )}
              </div>
            </div>

            <div className="other-docs-upload">
              <p>Other Relevant Documents</p>
              <label className="image-upload-field">
                <span>➕ Add More Document</span>
                <input type="file" onChange={(e) => handleProjectImageChange(e, 'other')} />
              </label>
              <div className="docs-preview-grid mt-1">
                {projectDraft.otherProjectDocumentsPreview.map((url, idx) => (
                  <div className="other-doc-item" key={idx}>
                    <img src={url} alt={`Other ${idx}`} />
                    <button type="button" onClick={() => handleRemoveProjectImage('other', idx)}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="project-actions">
            <button type="button" className="save-btn" onClick={handleSaveProject}>
              {editingProjectId ? 'Update Project' : 'Add to List'}
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => {
                setShowProjectForm(false)
                setEditingProjectId(null)
                setProjectDraft(initialProjectDraft)
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

export default ProjectExperience
