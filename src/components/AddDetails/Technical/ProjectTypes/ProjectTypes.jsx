import { useState, useEffect, useMemo } from 'react'
import alerts from '../../../../utils/alerts'
import * as projectTypeService from '../../../../services/projectType.service'
import DetailsDataTable from '../../common/DetailsDataTable'
import './ProjectTypes.css'

function ProjectTypes() {
  const [projectTypes, setProjectTypes] = useState([])
  const [projectTypeMode, setProjectTypeMode] = useState('list')
  const [projectTypeDraft, setProjectTypeDraft] = useState({ 
    type_name: ''
  })
  const [editingProjectTypeId, setEditingProjectTypeId] = useState(null)
  const [viewingType, setViewingType] = useState(null)

  useEffect(() => {
    fetchProjectTypes()
  }, [])

  async function fetchProjectTypes() {
    try {
      const resp = await projectTypeService.getProjectTypes()
      if (resp.success) {
        setProjectTypes(resp.data)
      }
    } catch (err) {
      console.error('Failed to load project types', err)
    }
  }

  const handleProjectTypeDraftChange = (e) => {
    const { name, value } = e.target
    setProjectTypeDraft(prev => ({ ...prev, [name]: value }))
  }

  const handleSaveProjectType = async () => {
    if (!projectTypeDraft.type_name.trim()) {
      return alerts.error('Required', 'Project type name is required')
    }

    const isEditing = !!editingProjectTypeId
    alerts.loading(isEditing ? 'Updating...' : 'Saving...', isEditing ? 'Updating project type' : 'Adding project type')

    try {
      let resp
      if (isEditing) {
        resp = await projectTypeService.updateProjectType(editingProjectTypeId, projectTypeDraft)
      } else {
        resp = await projectTypeService.createProjectType(projectTypeDraft)
      }

      if (resp.success) {
        if (isEditing) {
          setProjectTypes(prev => prev.map(t => t.id === editingProjectTypeId ? resp.data : t))
        } else {
          setProjectTypes(prev => [...prev, resp.data])
        }

        setProjectTypeMode('list')
        setProjectTypeDraft({ type_name: '' })
        setEditingProjectTypeId(null)
        alerts.success('Success', isEditing ? 'Project type updated' : 'Project type added')
      } else {
        alerts.error('Error', resp.message)
      }
    } catch {
      alerts.error('Error', 'API Connection failed')
    }
  }

  const handleEditProjectType = (type) => {
    setProjectTypeDraft({
      type_name: type.type_name
    })
    setEditingProjectTypeId(type.id)
    setProjectTypeMode('form')
  }

  const handleDeleteProjectType = async (id) => {
    const confirm = await alerts.confirm('Are you sure?', 'You want to delete this record?')
    if (confirm.isConfirmed) {
      try {
        const resp = await projectTypeService.deleteProjectType(id)
        if (resp.success) {
          setProjectTypes(prev => prev.filter(t => t.id !== id))
          alerts.success('Deleted', 'Project type deleted successfully')
        }
      } catch {
        alerts.error('Error', 'Failed to delete')
      }
    }
  }

  const columns = useMemo(() => [
    {
      accessorKey: 'type_name',
      header: 'Type Name',
      Cell: ({ cell }) => <span className="bold-label">{cell.getValue() || '-'}</span>
    },
    {
      id: 'actions',
      header: 'Action',
      enableSorting: false,
      enableColumnFilter: false,
      Cell: ({ row }) => {
        const type = row.original
        return (
          <div className="row-actions">
            <button
              type="button"
              className="view-row-btn"
              onClick={() => setViewingType(type)}
            >
              View
            </button>
            <button
              type="button"
              className="edit-row-btn"
              onClick={() => handleEditProjectType(type)}
            >
              Edit
            </button>
            <button
              type="button"
              className="delete-row-btn"
              onClick={() => handleDeleteProjectType(type.id)}
            >
              Delete
            </button>
          </div>
        )
      }
    }
  ], [])

  return (
    <section className="details-section">
      <h3>Project Type Setup</h3>
      <p className="section-helper">
        Manage project specializations (e.g. Architectural, Civil). Code is used for internal reference.
      </p>

      {projectTypeMode === 'list' ? (
        <>
          <div className="section-actions">
            <button type="button" onClick={() => setProjectTypeMode('form')}>
              + Add Project Type
            </button>
          </div>

          <DetailsDataTable
            columns={columns}
            data={projectTypes}
            emptyMessage="No project types found."
          />

          {viewingType && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h4>{viewingType.type_name} Details</h4>
                  <button type="button" className="modal-close-btn" onClick={() => setViewingType(null)}>✕</button>
                </div>
                <div className="modal-body">
                  <div className="card-look">
                    <p><strong>Project Type:</strong> {viewingType.type_name}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="premium-compact-form">
          <div className="details-grid" style={{ gridTemplateColumns: '1fr' }}>
            <label className="details-field">
              <span>Type Name *</span>
              <input
                type="text"
                name="type_name"
                value={projectTypeDraft.type_name}
                onChange={handleProjectTypeDraftChange}
                placeholder="e.g. Architectural"
                required
              />
            </label>
          </div>

          <div className="form-submit-actions">
            <button type="button" onClick={handleSaveProjectType} className="save-btn">
              Save
            </button>
            <button 
              type="button" 
              onClick={() => {
                setProjectTypeMode('list')
                setEditingProjectTypeId(null)
                setProjectTypeDraft({ type_name: '' })
              }}
              className="cancel-btn"
            >
              Back to List
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

export default ProjectTypes
