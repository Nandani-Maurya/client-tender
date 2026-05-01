import { useState } from 'react'
import './Documents.css'

const uploadFields = [
  'PAN Card',
  'Aadhar Card',
  'Power of Attorney / Authorization Letter'
]

function Documents() {
  const [additionalDocuments, setAdditionalDocuments] = useState([])
  const [documentTypeDraft, setDocumentTypeDraft] = useState('')

  const handleAddAdditionalDocument = () => {
    if (!documentTypeDraft.trim()) return;
    setAdditionalDocuments(prev => [...prev, {
      id: `add-doc-${Date.now()}`,
      type: documentTypeDraft,
      file: null,
      fileName: '',
      preview: ''
    }])
    setDocumentTypeDraft('')
  }

  const handleFileChange = (docId, event) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAdditionalDocuments(prev => prev.map(doc => doc.id === docId ? { ...doc, file, fileName: file.name, preview: reader.result } : doc))
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <section className="details-section">
      <h3>Document Uploads</h3>
      <div className="upload-grid">
        {uploadFields.map(f => (
          <label className="upload-field" key={f}>
            <span>{f}</span>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" />
          </label>
        ))}
      </div>
      <div className="additional-documents-section">
        <h4>Additional Documents</h4>
        {additionalDocuments.map((doc, idx) => (
          <div key={doc.id} className="additional-document-item">
            <span>{idx + 1}. {doc.type}</span>
            <label className="upload-field inline-upload">
              <input type="file" onChange={(e) => handleFileChange(doc.id, e)} />
              <span>{doc.fileName || 'Upload File'}</span>
            </label>
            <button onClick={() => setAdditionalDocuments(prev => prev.filter(i => i.id !== doc.id))}>Remove</button>
          </div>
        ))}
        <div className="add-document-form">
          <input value={documentTypeDraft} onChange={e => setDocumentTypeDraft(e.target.value)} placeholder="Doc type..." />
          <button onClick={handleAddAdditionalDocument}>Add</button>
        </div>
      </div>
    </section>
  )
}

export default Documents
