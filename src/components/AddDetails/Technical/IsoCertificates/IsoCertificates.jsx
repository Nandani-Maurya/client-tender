import { useState, useEffect, useMemo } from 'react'
import alerts from '../../../../utils/alerts'
import { uploadDocument } from '../../../../services/document.service'
import * as addDetailsService from '../../../../services/addDetails.service'
import DetailsDataTable from '../../common/DetailsDataTable'
import './IsoCertificates.css'

const initialIsoCertificateDraft = {
  certificateType: '',
  year: '',
  documents: [
    { file: null, name: '', preview: '', label: 'ISO Certificate', existingDocId: null, id: Date.now() }
  ]
}

function IsoCertificates() {
  const [isoCertificates, setIsoCertificates] = useState([])
  const [isoMode, setIsoMode] = useState('list')
  const [isoDraft, setIsoDraft] = useState(initialIsoCertificateDraft)
  const [editingIsoId, setEditingIsoId] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [viewingDocsId, setViewingDocsId] = useState(null)
  const [viewMode, setViewMode] = useState('all') // 'all' or 'docs'

  useEffect(() => {
    fetchIsoCertificates()
  }, [])

  async function fetchIsoCertificates() {
    try {
      const res = await addDetailsService.getIsoCertificates();
      if (res.success && res.data) {
        setIsoCertificates(res.data.map((iso, i) => {
          const apiDocs = iso.documents || [];
          const docs = apiDocs.map((d, di) => ({
            id: `doc-${i}-${di}-${Date.now()}`,
            existingDocId: d.id,
            preview: d.file_url || '',
            name: `Document ${di + 1}`,
            file: null
          }));
          
          if (docs.length === 0) {
            docs.push({ id: Date.now() + i, file: null, name: '', preview: '', label: 'ISO Certificate', existingDocId: null });
          }

          return {
            id: iso.id || `iso-fetch-${i}`,
            certificateType: iso.certificate_type,
            year: iso.year,
            documents: docs
          };
        }));
      }
    } catch (err) {
      console.error('Failed to load ISO certificates', err);
    }
  }


  const handleIsoDraftChange = (event) => {
    const { name, value } = event.target
    setIsoDraft(prev => ({ ...prev, [name]: value }))
  }

  const handleAddDocumentSlot = () => {
    setIsoDraft(prev => ({
      ...prev,
      documents: [...prev.documents, { file: null, name: '', preview: '', label: 'ISO Certificate', existingDocId: null, id: Date.now() }]
    }))
  }

  const handleRemoveDocumentSlot = (docId) => {
    setIsoDraft(prev => {
      const newDocs = prev.documents.filter(d => d.id !== docId);
      // Keep at least one
      if (newDocs.length === 0) {
        return { ...prev, documents: [{ file: null, name: '', preview: '', existingDocId: null, id: Date.now() }] };
      }
      return { ...prev, documents: newDocs };
    });
  }

  const handleIsoImageChange = (event, docId) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check for duplicates in current draft
    const isDuplicate = isoDraft.documents.some(d => 
      d.id !== docId && d.file && d.file.name === file.name && d.file.size === file.size
    )
    if (isDuplicate) {
      alerts.info('Info', 'This file is already selected.')
      event.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setIsoDraft(prev => ({
        ...prev,
        documents: prev.documents.map(d => 
          d.id === docId ? { ...d, file, name: file.name, preview: reader.result } : d
        )
      }))
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveIsoImage = (docId) => {
    setIsoDraft(prev => ({
      ...prev,
      documents: prev.documents.map(d => 
        d.id === docId ? { ...d, file: null, name: '', preview: '', existingDocId: null } : d
      )
    }))
  }

  const handleDocLabelChange = (docId, value) => {
    setIsoDraft(prev => ({
      ...prev,
      documents: prev.documents.map(d => 
        d.id === docId ? { ...d, label: value } : d
      )
    }))
  }

  const handleViewFile = (doc) => {
    if (doc.preview) {
      // For remote URLs, just open in new tab directly
      if (!doc.preview.startsWith('data:') && !doc.preview.startsWith('blob:')) {
        window.open(doc.preview, '_blank');
        return;
      }

      // For local data/blob URLs
      const win = window.open();
      if (!win) {
        return alerts.error('Error', 'Popup blocked. Please allow popups for this site.');
      }

      const isImage = doc.preview.includes('image/') || (doc.file && doc.file.type.startsWith('image/'));
      
      if (isImage) {
        win.document.write(`
          <html>
            <head><title>${doc.name || 'Image Preview'}</title></head>
            <body style="margin:0; display:flex; justify-content:center; align-items:center; background:#1a202c; height:100vh;">
              <img src="${doc.preview}" style="max-width:100%; max-height:100%; object-fit:contain;" />
            </body>
          </html>
        `);
        win.document.close();
      } else {
        win.document.write(`
          <html>
            <head><title>${doc.name || 'Document Preview'}</title></head>
            <body style="margin:0;">
              <iframe src="${doc.preview}" frameborder="0" style="border:0; width:100%; height:100%;" allowfullscreen></iframe>
            </body>
          </html>
        `);
        win.document.close();
      }
    }
  }


  const handleSaveIso = async () => {
    if (!isoDraft.certificateType.trim()) {
      return alerts.info('Info', 'Certificate type is required')
    }

    // 1. Check if a certificate with same type and year already exists (excluding the one being edited)
    const isDuplicateCert = isoCertificates.some(c => 
      c.id !== editingIsoId && 
      c.certificateType.toLowerCase().trim() === isoDraft.certificateType.toLowerCase().trim() &&
      (c.year || '').toString() === (isoDraft.year || '').toString()
    );
    if (isDuplicateCert) {
      return alerts.info('Info', `A certificate for "${isoDraft.certificateType}" in year ${isoDraft.year || 'N/A'} already exists.`);
    }

    // 2. Check for duplicate document names within the current draft
    const labels = isoDraft.documents.map(d => d.label.toLowerCase().trim());
    const hasDuplicateLabels = labels.some((label, index) => labels.indexOf(label) !== index);
    if (hasDuplicateLabels) {
      return alerts.info('Info', 'Each document must have a unique Name/Type.');
    }

    // Validation: Check if all slots have either a new file or an existing doc, and a label
    const invalidSlot = isoDraft.documents.some(d => (!d.file && !d.existingDocId) || !d.label.trim());
    if (invalidSlot) {
      return alerts.info('Info', 'All document slots are compulsory. Please ensure every slot has a name and a file uploaded.');
    }

    setIsSaving(true)
    try {
      const isEdit = !!editingIsoId
      const isoId = isEdit ? editingIsoId : `iso-${Date.now()}`
      
      // Parallel uploads for better performance and to prevent timeouts
      const uploadPromises = isoDraft.documents.map(async (doc, i) => {
        if (doc.file) {
          const up = await uploadDocument(doc.file, doc.label || `ISO_CERTIFICATE_${i + 1}`);
          if (up.success) {
            return { ...doc, existingDocId: up.data.id, file: null };
          } else {
            throw new Error(`Failed to upload document: ${doc.label || i + 1}`);
          }
        }
        return doc;
      });

      const updatedDocs = await Promise.all(uploadPromises);

      const updatedIso = { ...isoDraft, id: isoId, documents: updatedDocs }

      const newIsoList = isEdit
        ? isoCertificates.map(c => c.id === editingIsoId ? updatedIso : c)
        : [...isoCertificates, updatedIso]

      const processedIso = newIsoList.map(iso => ({
        certificate_type: iso.certificateType,
        year: iso.year,
        document_ids: iso.documents.map(d => d.existingDocId).filter(Boolean)
      }))

      const res = await addDetailsService.saveIsoCertificates({
        iso_certificates: processedIso
      })

      if (res.success) {
        setIsoCertificates(newIsoList)
        setIsoDraft(initialIsoCertificateDraft)
        setEditingIsoId(null)
        setIsoMode('list')
        alerts.success('Success', isEdit ? 'Certificate updated' : 'Certificate added')
      } else {
        alerts.info('Info', res.message)
      }
    } catch (err) {
      console.error(err)
      alerts.error('Error', err.message || 'Failed to save ISO certificates')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemoveIso = async (id) => {
    const confirm = await alerts.confirm('Delete?', 'Remove this ISO certificate?')
    if (!confirm.isConfirmed) return

    const newIsoList = isoCertificates.filter(c => c.id !== id)
    try {
      const processedIso = newIsoList.map(iso => ({
        certificate_type: iso.certificateType,
        year: iso.year,
        document_ids: iso.documents.map(d => d.existingDocId).filter(Boolean)
      }))
      await addDetailsService.saveIsoCertificates({ iso_certificates: processedIso })
      setIsoCertificates(newIsoList)
    } catch (err) {
      console.error(err)
      alerts.error('Error', 'Failed to delete ISO certificate')
    }
  }


  const columns = useMemo(() => [
    {
      id: 'sno',
      header: 'S.No.',
      size: 50,
      Cell: ({ row }) => row.index + 1
    },
    {
      accessorKey: 'certificateType',
      header: 'Certificate Type',
      Cell: ({ cell }) => <span className="bold-label">{cell.getValue() || '-'}</span>
    },
    {
      accessorKey: 'year',
      header: 'Year',
      Cell: ({ cell }) => cell.getValue() || '-'
    },
    {
      id: 'actions',
      header: 'Action',
      enableSorting: false,
      enableColumnFilter: false,
      Cell: ({ row }) => {
        const cert = row.original
        return (
          <div className="row-actions">
            <button type="button" className="view-row-btn" onClick={() => { setViewingDocsId(cert.id); setViewMode('all'); }}>View</button>
            <button
              type="button"
              className="edit-row-btn"
              onClick={() => {
                setEditingIsoId(cert.id)
                setIsoDraft(cert)
                setIsoMode('form')
              }}
            >
              Edit
            </button>
            <button type="button" className="delete-row-btn" onClick={() => handleRemoveIso(cert.id)}>Delete</button>
          </div>
        )
      }
    }
  ], [isoCertificates])

  return (
    <section className="details-section">
      <h3>ISO Certificates</h3>
      <p className="section-helper">Manage your ISO certifications and corresponding documents.</p>

      {isoMode === 'list' ? (
        <>
          <div className="section-actions">
            <button type="button" onClick={() => { setIsoDraft(initialIsoCertificateDraft); setEditingIsoId(null); setIsoMode('form'); }}>
              + Add New Certificate
            </button>
          </div>

          <DetailsDataTable
            columns={columns}
            data={isoCertificates}
            emptyMessage="No certificates added yet."
          />
        </>
      ) : (
        <div className="premium-card mt-2">
          <h4>{editingIsoId ? 'Edit Certificate' : 'Add New Certificate'}</h4>
          <div className="form-field-group mb-3">
            <div className="iso-cert-entry-form" style={{ border: 'none', background: 'transparent', padding: 0 }}>
              <label className="details-field">
                <span>Certificate Type <span style={{ color: 'red' }}>*</span></span>
                <input type="text" name="certificateType" value={isoDraft.certificateType} onChange={handleIsoDraftChange} placeholder="e.g., ISO 9001" />
              </label>
              <label className="details-field">
                <span>Year</span>
                <input type="number" name="year" value={isoDraft.year} onChange={handleIsoDraftChange} placeholder="e.g. 2023" />
              </label>
            </div>
          </div>

          <div className="form-field-group">
            <h5 className="group-title">Certificate Documents <span style={{ color: 'red' }}>*</span></h5>
            
            <div className="compact-documents-list">
              {isoDraft.documents.map((doc, idx) => (
                <div className="compact-doc-row" key={doc.id}>
                  <div className="doc-label-input">
                    <label className="compact-row-label">Document Name/Type <span style={{ color: 'red' }}>*</span></label>
                    <input 
                      type="text" 
                      placeholder="e.g. ISO 9001 Front Page" 
                      value={doc.label} 
                      onChange={(e) => handleDocLabelChange(doc.id, e.target.value)}
                    />
                  </div>
                  
                  <div className="doc-upload-actions">
                    <div className="doc-upload-field-wrapper">
                      <label className="compact-row-label">File (Image/PDF) <span style={{ color: 'red' }}>*</span></label>
                      {!doc.preview ? (
                        <label className="compact-upload-btn">
                          <span>Upload File</span>
                          <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleIsoImageChange(e, doc.id)} hidden />
                        </label>
                      ) : (
                        <div className="doc-file-info">
                          <span className="file-name" title={doc.name}>{doc.name || 'File Uploaded'}</span>
                          <div className="file-actions">
                            <button type="button" className="view-mini-btn" onClick={() => handleViewFile(doc)}>View</button>
                            <button type="button" className="remove-mini-btn" onClick={() => handleRemoveIsoImage(doc.id)}>✕</button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {isoDraft.documents.length > 1 && (
                      <button 
                        type="button" 
                        className="remove-slot-btn" 
                        onClick={() => handleRemoveDocumentSlot(doc.id)}
                        title="Remove Slot"
                        style={{ marginTop: '18px' }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-2" style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <button 
                type="button" 
                className="add-more-section-btn" 
                onClick={handleAddDocumentSlot}
                style={{ width: 'auto', fontSize: '13px', padding: '8px 16px', borderStyle: 'solid' }}
              >
                + Add More Image/PDF
              </button>
            </div>
          </div>

          <div className="project-actions mt-3">
            <button type="button" className="save-btn" onClick={handleSaveIso} disabled={isSaving}>
              {isSaving ? 'Saving...' : (editingIsoId ? 'Update' : 'Save Details')}
            </button>
            <button 
              type="button" 
              className="cancel-btn" 
              onClick={() => {
                setIsoMode('list')
                setEditingIsoId(null)
                setIsoDraft(initialIsoCertificateDraft)
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {viewingDocsId && (
        <div className="iso-docs-modal-overlay" onClick={() => setViewingDocsId(null)}>
          <div className="iso-docs-modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h4>
                {viewMode === 'all' ? 'Certificate Details' : 'Documents List'}
              </h4>
              <button className="close-modal-btn" onClick={() => setViewingDocsId(null)}>✕</button>
            </div>
            <div className="modal-body">
              {viewMode === 'all' && (
                <div className="cert-details-summary mb-3">
                  <div className="detail-item">
                    <label>Certificate Type</label>
                    <p>{isoCertificates.find(c => c.id === viewingDocsId)?.certificateType}</p>
                  </div>
                  <div className="detail-item">
                    <label>Year</label>
                    <p>{isoCertificates.find(c => c.id === viewingDocsId)?.year || 'N/A'}</p>
                  </div>
                </div>
              )}

              <h5 className="modal-section-title">Documents List</h5>
              <div className="docs-vertical-stack">
                {isoCertificates.find(c => c.id === viewingDocsId)?.documents.map((doc, idx) => (
                  <div className="doc-stack-item" key={doc.id || idx}>
                    <div className="doc-header-row">
                      <div className="doc-type-icon">
                        {doc.preview?.toLowerCase().includes('.pdf') || (doc.file && doc.file.type === 'application/pdf') ? (
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        ) : (
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                        )}
                      </div>
                      <div className="doc-meta">
                        <span className="doc-label-text">{doc.label || `Document ${idx + 1}`}</span>
                        <span className="doc-name-text">{doc.name || 'View document'}</span>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      className="view-full-btn" 
                      onClick={() => handleViewFile(doc)}
                    >
                      View Document
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </section>
  )
}

export default IsoCertificates
