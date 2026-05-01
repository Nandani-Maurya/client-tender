import { useMemo, useState } from 'react'
import DetailsDataTable from '../../common/DetailsDataTable'
import './EmployeeBioData.css'

const employeeBasicFields = [
  { name: 'profession', label: 'Profession' },
  { name: 'name', label: 'Name of Employee' },
  { name: 'dateOfBirth', label: 'Date of Birth' },
  { name: 'totalExperience', label: 'Total Experience' },
  { name: 'yearOfEmployment', label: 'Year of Employment' },
  { name: 'employerName', label: 'Employer Name' },
  { name: 'currentPosition', label: 'Current Position' },
  { name: 'responsibilities', label: 'Responsibilities' },
  { name: 'achievements', label: 'Achievements' }
]

const qualificationFields = [
  { name: 'qualification', label: 'Qualification' },
  { name: 'collegeUniversity', label: 'College / University' },
  { name: 'passingYear', label: 'Passing Year' }
]

const initialEmployeeDraft = employeeBasicFields.reduce((draft, field) => {
  draft[field.name] = ''
  return draft
}, { qualifications: [] })

const initialQualificationDraft = qualificationFields.reduce((draft, field) => {
  draft[field.name] = ''
  return draft
}, {})

function EmployeeBioData() {
  const [employees, setEmployees] = useState([])
  const [employeeDraft, setEmployeeDraft] = useState(initialEmployeeDraft)
  const [qualificationDraft, setQualificationDraft] = useState(initialQualificationDraft)
  const [employeeMode, setEmployeeMode] = useState('table')
  const [editingEmployeeId, setEditingEmployeeId] = useState(null)
  const [viewingEmployee, setViewingEmployee] = useState(null)

  const handleEmployeeChange = (event) => {
    const { name, value } = event.target
    setEmployeeDraft((prev) => ({ ...prev, [name]: value }))
  }

  const handleQualificationChange = (event) => {
    const { name, value } = event.target
    setQualificationDraft((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddQualification = () => {
    if (!qualificationDraft.qualification.trim()) return;
    setEmployeeDraft((prev) => ({
      ...prev,
      qualifications: [
        ...prev.qualifications,
        { ...qualificationDraft, id: `qual-${prev.qualifications.length + 1}` }
      ]
    }))
    setQualificationDraft(initialQualificationDraft)
  }

  const handleRemoveQualification = (qualId) => {
    setEmployeeDraft((prev) => ({
      ...prev,
      qualifications: prev.qualifications.filter(q => q.id !== qualId)
    }))
  }

  const handleAddEmployee = () => {
    if (!employeeDraft.name.trim()) return;
    if (editingEmployeeId) {
      setEmployees((prev) => prev.map(emp => emp.id === editingEmployeeId ? { ...employeeDraft, id: editingEmployeeId } : emp))
      setEditingEmployeeId(null)
    } else {
      setEmployees((prev) => [
        ...prev,
        { id: `employee-${prev.length + 1}`, ...employeeDraft }
      ])
    }
    setEmployeeDraft(initialEmployeeDraft)
    setEmployeeMode('table')
  }

  const handleClearEmployee = () => {
    setEmployeeDraft(initialEmployeeDraft)
    setEditingEmployeeId(null)
    setEmployeeMode('table')
  }

  const handleDeleteEmployee = (id) => {
    setEmployees(prev => prev.filter(e => e.id !== id))
  }

  const columns = useMemo(() => [
    {
      id: 'sno',
      header: 'S.No.',
      size: 50,
      Cell: ({ row }) => row.index + 1
    },
    {
      accessorKey: 'profession',
      header: 'Profession',
      Cell: ({ cell }) => cell.getValue() || '-'
    },
    {
      accessorKey: 'name',
      header: 'Name',
      Cell: ({ cell }) => <span className="bold-label">{cell.getValue() || '-'}</span>
    },
    {
      accessorKey: 'currentPosition',
      header: 'Position',
      Cell: ({ cell }) => cell.getValue() || '-'
    },
    {
      accessorKey: 'totalExperience',
      header: 'Experience',
      Cell: ({ cell }) => cell.getValue() || '-'
    },
    {
      accessorKey: 'employerName',
      header: 'Employer',
      Cell: ({ cell }) => cell.getValue() || '-'
    },
    {
      id: 'actions',
      header: 'Action',
      enableSorting: false,
      enableColumnFilter: false,
      Cell: ({ row }) => {
        const emp = row.original
        return (
          <div className="row-actions">
            <button type="button" className="view-row-btn" onClick={() => setViewingEmployee(emp)}>View</button>
            <button
              type="button"
              className="edit-row-btn"
              onClick={() => {
                setEditingEmployeeId(emp.id)
                setEmployeeDraft(emp)
                setEmployeeMode('form')
              }}
            >
              Edit
            </button>
            <button type="button" className="delete-row-btn" onClick={() => handleDeleteEmployee(emp.id)}>Delete</button>
          </div>
        )
      }
    }
  ], [])

  return (
    <section className="details-section">
      <h3>Employee Bio-data Management</h3>
      <p className="section-helper">Manage employee profiles, experience and educational qualifications.</p>

      {employeeMode === 'table' ? (
        <>
          <div className="section-actions">
            <button type="button" onClick={() => setEmployeeMode('form')}>+ Add New Employee</button>
          </div>
          <DetailsDataTable
            columns={columns}
            data={employees}
            emptyMessage="No employee records in system."
          />

          {viewingEmployee && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h4>{viewingEmployee.name} Details</h4>
                  <button type="button" className="modal-close-btn" onClick={() => setViewingEmployee(null)}>✕</button>
                </div>
                <div className="modal-body">
                  <div className="employee-details-grid card-look">
                    {employeeBasicFields.map(f => (
                      <div className="detail-item" key={f.name}>
                        <strong>{f.label}:</strong>
                        <span style={{ marginLeft: '8px' }}>{viewingEmployee[f.name] || '-'}</span>
                      </div>
                    ))}
                  </div>
                  <div className="qualifications-section">
                    <h5>Educational Qualifications</h5>
                    <div className="qual-list">
                      {viewingEmployee.qualifications.length === 0 ? <p>No qualifications listed.</p> : viewingEmployee.qualifications.map(q => (
                        <div key={q.id} className="qual-item-view card-look mt-1">
                          <span><strong>{q.qualification}</strong> from {q.collegeUniversity} ({q.passingYear})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="employee-form premium-card mt-2">
          <h4>{editingEmployeeId ? 'Edit Profile' : 'Create New Profile'}</h4>
          <div className="employee-grid">
            {employeeBasicFields.map((field) => (
              <label className="details-field" key={field.name}>
                <span>{field.label}</span>
                <input type="text" name={field.name} value={employeeDraft[field.name]} onChange={handleEmployeeChange} placeholder={`Enter ${field.label}`} />
              </label>
            ))}
          </div>

          <div className="qualifications-setup-section mt-2">
            <h5>Educational Qualifications</h5>
            <div className="qualification-grid">
              {qualificationFields.map((field) => (
                <label className="details-field" key={field.name}>
                  <span>{field.label}</span>
                  <input type="text" name={field.name} value={qualificationDraft[field.name]} onChange={handleQualificationChange} placeholder={field.label} />
                </label>
              ))}
              <div className="add-qual-action">
                <button type="button" className="add-qual-btn" onClick={handleAddQualification}>+ Add Qual.</button>
              </div>
            </div>

            <div className="added-qual-list mt-1">
              {employeeDraft.qualifications.map((qual) => (
                <div key={qual.id} className="qualification-item">
                  <span>{qual.qualification} from {qual.collegeUniversity} ({qual.passingYear})</span>
                  <button type="button" onClick={() => handleRemoveQualification(qual.id)}>✕</button>
                </div>
              ))}
            </div>
          </div>

          <div className="project-actions mt-2">
            <button type="button" className="save-btn" onClick={handleAddEmployee}>{editingEmployeeId ? 'Update Profile' : 'Save Profile'}</button>
            <button type="button" className="cancel-btn" onClick={handleClearEmployee}>Cancel</button>
          </div>
        </div>
      )}
    </section>
  )
}

export default EmployeeBioData
