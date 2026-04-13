import { useState, useEffect } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import alerts from '../../utils/alerts'
import * as formatService from '../../services/format.service'
import './FormatManagement.css'

export default function FormatManagement() {
  const [formats, setFormats] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  
  // View/Edit State
  const [isEditing, setIsEditing] = useState(false)
  const [currentFormat, setCurrentFormat] = useState(null)
  const [editPages, setEditPages] = useState([])
  const [activePageIndex, setActivePageIndex] = useState(0)

  // Form Fields
  const [editName, setEditName] = useState('')
  const [editTitle, setEditTitle] = useState('')

  useEffect(() => {
    loadFormats()
  }, [])

  const loadFormats = async () => {
    setIsLoading(true)
    try {
      const resp = await formatService.getFormats()
      if (resp.success) {
        setFormats(resp.data)
      }
    } catch (err) {
      alerts.error('Error', 'Failed to fetch formats')
    } finally {
      setIsLoading(false)
    }
  }

  const startEditing = (format) => {
    setCurrentFormat(format)
    setEditName(format.format_name)
    setEditTitle(format.format_title)
    
    // Ensure template_pages is an array
    const pages = Array.isArray(format.template_pages) 
                  ? [...format.template_pages] 
                  : (format.template_html ? [format.template_html] : [''])
    
    setEditPages(pages)
    setActivePageIndex(0)
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (!editName || !editTitle) {
      return alerts.error('Validation', 'Name and Title are required')
    }

    alerts.loading('Updating Document...', 'Saving your changes to the database')
    try {
      const updateData = {
        format_name: editName,
        format_title: editTitle,
        template_pages: editPages
      }
      
      const resp = await formatService.updateFormatContent(currentFormat.id, updateData)
      if (resp.success) {
        alerts.success('Updated!', 'Document template saved successfully')
        setIsEditing(false)
        loadFormats()
      } else {
        alerts.error('Failed', resp.message)
      }
    } catch (err) {
      alerts.error('Error', 'Connection failed')
    }
  }

  const handleDelete = async (id) => {
    const confirm = await alerts.confirm('Deactivate Annexure?', 'This will hide it from all project dropdowns. You can restore it later from database.')
    if (confirm.isConfirmed) {
      try {
        const resp = await formatService.deleteFormat(id)
        if (resp.success) {
          alerts.success('Inactive', 'Annexure successfully deactivated')
          loadFormats()
        }
      } catch (err) {
        alerts.error('Error', 'Failed to deactivate')
      }
    }
  }

  const handlePageContentChange = (content) => {
    const updated = [...editPages]
    updated[activePageIndex] = content
    setEditPages(updated)
  }

  const addPage = () => {
    setEditPages([...editPages, '<div class="annexure-page"><h1>New Page Content</h1></div>'])
    setActivePageIndex(editPages.length)
  }

  const removePage = (index) => {
    if (editPages.length <= 1) return alerts.info('Action Denied', 'Format must have at least one page')
    const updated = editPages.filter((_, i) => i !== index)
    setEditPages(updated)
    setActivePageIndex(Math.max(0, activePageIndex - 1))
  }

  if (isEditing) {
    return (
      <div className="format-mgmt-container">
        <div className="format-edit-view">
          <div className="edit-actions-top">
            <button className="back-btn" onClick={() => setIsEditing(false)}>
              ← Back to Management
            </button>
            <div className="edit-header-text">
              <h2>Editing {currentFormat.format_name}</h2>
              <p>Customize the professional HTML template with React Quill</p>
            </div>
            <button className="save-all-btn" onClick={handleSave}>Save Document</button>
          </div>

          <div className="edit-form-grid">
            <div className="form-field">
              <label>Format Identifier (e.g. ANNEXURE-1)</label>
              <input value={editName} onChange={e => setEditName(e.target.value)} placeholder="ANNEXURE-X" />
            </div>
            <div className="form-field">
              <label>Document Official Title</label>
              <input value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="Enter formal title..." />
            </div>
          </div>

          <div className="editor-section">
            <div className="editor-page-navigation">
                {editPages.map((_, idx) => (
                  <button 
                    key={idx}
                    className={`editor-page-tab ${activePageIndex === idx ? 'active' : ''}`}
                    onClick={() => setActivePageIndex(idx)}
                  >
                    Page {idx + 1}
                  </button>
                ))}
                <button className="add-page-btn" onClick={addPage}>+ Add Page</button>
                
                {editPages.length > 1 && (
                  <button className="remove-page-btn" onClick={() => removePage(activePageIndex)}>
                    Delete This Page
                  </button>
                )}
            </div>

            <div className="quill-editor-container html-renderer-content">
               <ReactQuill 
                 theme="snow" 
                 value={editPages[activePageIndex] || ''} 
                 onChange={handlePageContentChange}
                 modules={{
                    toolbar: [
                      [{ 'header': [1, 2, false] }],
                      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                      ['link', 'image', 'code-block'],
                      ['clean']
                    ],
                 }}
               />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="format-mgmt-container">
      <div className="format-mgmt-header">
        <div>
          <h1>Annexure/Format Management</h1>
          <p>Manage official document templates, edit HTML content, and configure multi-page layouts.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="format-grid">
           {[1,2,3].map(i => <div key={i} className="format-card skeleton">Loading...</div>)}
        </div>
      ) : (
        <div className="format-grid">
          {formats.map(f => (
            <div className="format-card" key={f.id}>
              <div className="format-card-header">
                <span className="format-badge">{f.format_name}</span>
                <span className="format-pages-count">
                  {Array.isArray(f.template_pages) ? f.template_pages.length : 1} Pages
                </span>
              </div>
              <h3>{f.format_title}</h3>
              <div className="format-card-footer">
                 <button className="mgmt-btn view" onClick={() => startEditing(f)}>View/Edit</button>
                 <button className="mgmt-btn delete" onClick={() => handleDelete(f.id)}>Inactivate</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
