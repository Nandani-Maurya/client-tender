import { useState, useRef } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import * as pdfjsLib from 'pdfjs-dist'
import Tesseract from 'tesseract.js'
import './FormatEditor.css'

// Set the worker source for PDF parsing
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

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
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'list',
  'bullet',
  'blockquote',
  'code-block',
  'link',
  'image'
]

function FormatEditor() {
  const [formatType, setFormatType] = useState('EOI')
  const [projectType, setProjectType] = useState('Architectural')
  const [tenderRef, setTenderRef] = useState('')
  const [formatTitle, setFormatTitle] = useState('')
  const [editorHtml, setEditorHtml] = useState('')
  const [savedFormats, setSavedFormats] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef(null)

  const handleSaveFormat = () => {
    if (!formatTitle.trim()) return

    const newFormat = {
      id: Date.now(),
      formatTitle: formatTitle.trim(),
      formatType,
      projectType,
      tenderRef: tenderRef.trim(),
      html: editorHtml,
      savedAt: new Date().toLocaleString()
    }

    setSavedFormats((prev) => [newFormat, ...prev])
    setEditorHtml('')
    setFormatTitle('')
  }

  const handleImportFile = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setIsProcessing(true)
    const fileType = file.type

    try {
      if (fileType === 'application/pdf') {
        const reader = new FileReader()
        reader.onload = async (e) => {
          const arrayBuffer = e.target.result
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
          let fullText = ''

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i)
            const textContent = await page.getTextContent()
            const pageText = textContent.items.map((item) => item.str).join(' ')
            fullText += `<p>${pageText}</p>`
          }

          setEditorHtml(fullText)
          setIsProcessing(false)
          event.target.value = ''
        }
        reader.readAsArrayBuffer(file)
      } else if (fileType.startsWith('image/')) {
        const result = await Tesseract.recognize(
          file,
          'eng',
          { logger: m => console.log(m) }
        )
        const text = result.data.text.split('\n').map(line => `<p>${line}</p>`).join('')
        setEditorHtml(text)
        setIsProcessing(false)
        event.target.value = ''
      } else {
        alert('Please upload a PDF or an Image file.')
        setIsProcessing(false)
      }
    } catch (error) {
      console.error('Error parsing file:', error)
      alert('Failed to parse file. Please try a different one.')
      setIsProcessing(false)
    }
  }

  // Group saved formats by tenderRef
  const groupedFormats = savedFormats.reduce((acc, format) => {
    const key = format.tenderRef || 'No Tender Reference'
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(format)
    return acc
  }, {})

  return (
    <section className="format-editor-page">
      <div className="format-editor-header">
        <div>
          <h2>Add Tender Format</h2>
          <p>Choose the format type, project category, and add the content using rich text formatting. This saves the HTML content for future database integration.</p>
        </div>
      </div>

      <div className="format-editor-grid">
        <aside className="format-editor-sidebar">
          <h3>Format Settings</h3>
          <div className="format-control-group">
            <label>Format Type</label>
            <select value={formatType} onChange={(event) => setFormatType(event.target.value)}>
              {formatTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="format-control-group">
            <label>Project Type</label>
            <select value={projectType} onChange={(event) => setProjectType(event.target.value)}>
              {projectTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="format-control-group">
            <label>Tender Name / Ref ID</label>
            <input
              type="text"
              value={tenderRef}
              onChange={(event) => setTenderRef(event.target.value)}
              placeholder="e.g. TENDER/2026/001"
            />
          </div>

          <div className="format-control-group">
            <label>Format Title</label>
            <input
              type="text"
              value={formatTitle}
              onChange={(event) => setFormatTitle(event.target.value)}
              placeholder="Enter format title"
            />
          </div>

          <div className="format-sidebar-note">
            <p>
              Saved formats are kept in the application state for now. Later you can send the HTML to the backend database using an API call.
            </p>
          </div>
        </aside>

        <div className="format-editor-main">
          <div className="format-editor-box">
            <div className="format-editor-toolbar">
              <span>Rich Text Editor</span>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept=".pdf, image/*"
                  onChange={(e) => handleImportFile(e)}
                />
                
                {isProcessing ? (
                  <div className="loading-overlay">
                    <div className="spinner"></div>
                    Processing File...
                  </div>
                ) : (
                  <button 
                    type="button" 
                    className="import-pdf-button"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <span>📄</span> Import PDF / Image
                  </button>
                )}

                <button
                  type="button"
                  className="save-format-button"
                  disabled={!formatTitle.trim() || !tenderRef.trim()}
                  onClick={handleSaveFormat}
                >
                  Save Format
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
              <p className="empty-saved-text">No formats saved yet. Add a title and save to see saved entries.</p>
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
                        <div key={format.id} className="saved-format-card">
                          <div className="saved-format-meta">
                            <div className="meta-top">
                              <strong>{format.formatTitle}</strong>
                              <span className="badge">{format.formatType}</span>
                            </div>
                            <span className="meta-sub">{format.projectType} • {format.savedAt}</span>
                          </div>
                          <div className="saved-format-actions">
                            <button className="edit-format-btn" onClick={() => setEditorHtml(format.html)}>
                              Load to Editor
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
