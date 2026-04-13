import { useState } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import Tesseract from 'tesseract.js'
import './FormatEditor.css'

const PDF_PARSE_API = '/api/parse-pdf' // Express backend endpoint

const formatTypeOptions = [
  { value: 'EOI', label: 'EOI' },
  { value: 'RFO', label: 'RFO' }
]

const projectTypeOptions = [
  { value: 'Architectural', label: 'Architectural' },
  { value: 'Sewage', label: 'Sewage' },
  { value: 'Waste Management', label: 'Waste Management' }
]

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['blockquote', 'code-block'],
    ['link', 'image'],
    ['clean']
  ]
}

const quillFormats = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'blockquote', 'code-block', 'link', 'image'
]

function FormatEditor() {
  const [formatType, setFormatType] = useState('EOI')
  const [projectType, setProjectType] = useState('Architectural')
  const [tenderRef, setTenderRef] = useState('')
  const [formatTitle, setFormatTitle] = useState('')
  const [editorHtml, setEditorHtml] = useState('')
  const [savedFormats, setSavedFormats] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState('')
  const [editingSource, setEditingSource] = useState(null)

  const handleSaveFormat = () => {
    if (!formatTitle.trim()) return
    const newFormat = {
      id: Date.now(),
      formatTitle: formatTitle.trim(),
      formatType,
      projectType,
      tenderRef: tenderRef.trim(),
      html: editorHtml,
      savedAt: new Date().toLocaleString(),
      editedFrom: editingSource ? editingSource.formatTitle : null
    }
    setSavedFormats((prev) => [newFormat, ...prev])
    setEditorHtml('')
    setFormatTitle('')
    setTenderRef('')
    setEditingSource(null)
  }

  const handleCancelEdit = () => {
    setEditorHtml('')
    setFormatTitle('')
    setTenderRef('')
    setFormatType('EOI')
    setProjectType('Architectural')
    setEditingSource(null)
  }

  const handleLoadToEditor = (format) => {
    setEditorHtml(format.html)
    setFormatTitle(format.formatTitle + ' (Copy)')
    setTenderRef(format.tenderRef)
    setFormatType(format.formatType)
    setProjectType(format.projectType)
    setEditingSource(format)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleImportFile = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setIsProcessing(true)
    setProgress('')
    const fileType = file.type

    try {
      if (fileType === 'application/pdf') {
        setProgress('Uploading PDF...')

        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch(PDF_PARSE_API, {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          const err = await response.json()
          throw new Error(err.error || 'Server error')
        }

        const { html } = await response.json()
        setProgress('Done!')
        setEditorHtml(html)
        setProgress('')
        setIsProcessing(false)
        event.target.value = ''

      } else if (fileType.startsWith('image/')) {
        setProgress('Starting OCR...')
        const result = await Tesseract.recognize(file, 'eng', {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setProgress(`OCR: ${Math.round(m.progress * 100)}%`)
            }
          }
        })
        const text = result.data.text
          .split('\n')
          .map((line) => `<p>${line}</p>`)
          .join('')
        setEditorHtml(text)
        setProgress('')
        setIsProcessing(false)
        event.target.value = ''

      } else {
        alert('Please upload a PDF or an Image file.')
        setIsProcessing(false)
        setProgress('')
      }
    } catch (error) {
      console.error('Error parsing file:', error)
      alert('Failed to parse file. Please try a different one.')
      setIsProcessing(false)
      setProgress('')
    }
  }

  const groupedFormats = savedFormats.reduce((acc, format) => {
    const key = format.tenderRef || 'No Tender Reference'
    if (!acc[key]) acc[key] = []
    acc[key].push(format)
    return acc
  }, {})

  return (
    <section className="format-editor-page">
      <div className="format-editor-header">
        <div>
          <h2>Add Tender Format</h2>
          <p>Choose the format type, project category, and add the content using rich text formatting.</p>
        </div>
      </div>

      <div className="format-editor-grid">
        <aside className="format-editor-sidebar">
          <h3>Format Settings</h3>

          {editingSource && (
            <div className="editing-banner">
              <span>✏️ Editing from:</span>
              <strong>{editingSource.formatTitle}</strong>
              <p>Saving will create a new copy.</p>
            </div>
          )}

          <div className="format-control-group">
            <label>Format Type</label>
            <select value={formatType} onChange={(e) => setFormatType(e.target.value)}>
              {formatTypeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div className="format-control-group">
            <label>Project Type</label>
            <select value={projectType} onChange={(e) => setProjectType(e.target.value)}>
              {projectTypeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div className="format-control-group">
            <label>Tender Name / Ref ID</label>
            <input
              type="text"
              value={tenderRef}
              onChange={(e) => setTenderRef(e.target.value)}
              placeholder="e.g. TENDER/2026/001"
            />
          </div>

          <div className="format-control-group">
            <label>Format Title</label>
            <input
              type="text"
              value={formatTitle}
              onChange={(e) => setFormatTitle(e.target.value)}
              placeholder="Enter format title"
            />
          </div>

          <div className="format-sidebar-note">
            <p>Saved formats are kept in application state. Connect to backend API to persist.</p>
          </div>
        </aside>

        <div className="format-editor-main">
          <div className="format-editor-box">
            <div className="format-editor-toolbar">
              <span>
                {editingSource ? `✏️ Editing: ${editingSource.formatTitle}` : 'Rich Text Editor'}
              </span>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {isProcessing ? (
                  <div className="loading-overlay">
                    <div className="spinner" />
                    <span>{progress || 'Processing...'}</span>
                  </div>
                ) : (
                  <label className="import-pdf-button">
                    <span>📄</span> Import PDF / Image
                    <input
                      type="file"
                      style={{ display: 'none' }}
                      accept=".pdf,.png,.jpg,.jpeg,.webp"
                      onChange={handleImportFile}
                    />
                  </label>
                )}

                {editingSource && (
                  <button type="button" className="cancel-edit-button" onClick={handleCancelEdit}>
                    ✕ Cancel
                  </button>
                )}

                <button
                  type="button"
                  className="save-format-button"
                  disabled={!formatTitle.trim() || !tenderRef.trim()}
                  onClick={handleSaveFormat}
                >
                  {editingSource ? '💾 Save as New' : 'Save Format'}
                </button>
              </div>
            </div>

            <ReactQuill
              theme="snow"
              value={editorHtml}
              onChange={setEditorHtml}
              modules={quillModules}
              formats={quillFormats}
              placeholder="Start typing tender format content here..."
            />
          </div>

          <div className="saved-formats-section">
            <h3>Saved Formats</h3>
            {Object.keys(groupedFormats).length === 0 ? (
              <p className="empty-saved-text">No formats saved yet.</p>
            ) : (
              <div className="tender-group-list">
                {Object.entries(groupedFormats).map(([tenderName, formats]) => (
                  <div key={tenderName} className="tender-group-card">
                    <div className="tender-group-header">
                      <span className="tender-icon">📁</span>
                      <h4>{tenderName}</h4>
                      <span className="format-count">{formats.length} Formats</span>
                    </div>
                    <div className="saved-format-list">
                      {formats.map((format) => (
                        <div
                          key={format.id}
                          className={`saved-format-card ${editingSource?.id === format.id ? 'active-edit' : ''}`}
                        >
                          <div className="saved-format-meta">
                            <div className="meta-top">
                              <strong>{format.formatTitle}</strong>
                              <span className="badge">{format.formatType}</span>
                              {format.editedFrom && (
                                <span className="edited-from-badge">from: {format.editedFrom}</span>
                              )}
                            </div>
                            <span className="meta-sub">{format.projectType} • {format.savedAt}</span>
                          </div>
                          <div className="saved-format-actions">
                            <button className="edit-format-btn" onClick={() => handleLoadToEditor(format)}>
                              ✏️ Edit
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default FormatEditor