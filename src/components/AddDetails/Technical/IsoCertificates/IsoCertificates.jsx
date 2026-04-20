import { useState, useEffect, useMemo } from 'react'
import alerts from '../../../../utils/alerts'
import { uploadDocument } from '../../../../services/document.service'
import * as addDetailsService from '../../../../services/addDetails.service'
import DetailsDataTable from '../../common/DetailsDataTable'
import './IsoCertificates.css'

const initialIsoCertificateDraft = {
  certificateType: '',
  year: '',
  firstImage: null,
  firstImageName: '',
  firstImagePreview: '',
  secondImage: null,
  secondImageName: '',
  secondImagePreview: ''
}

function IsoCertificates({ activeOrgId }) {
  const [isoCertificates, setIsoCertificates] = useState([])
  const [isoMode, setIsoMode] = useState('list')
  const [isoDraft, setIsoDraft] = useState(initialIsoCertificateDraft)
  const [editingIsoId, setEditingIsoId] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [viewingDocsId, setViewingDocsId] = useState(null)

  useEffect(() => {
    if (activeOrgId) {
      fetchIsoCertificates(activeOrgId)
    }
  }, [activeOrgId])

  async function fetchIsoCertificates(orgId) {
    try {
      const res = await addDetailsService.getIsoCertificates(orgId);
      if (res.success && res.data) {
        setIsoCertificates(res.data.map((iso, i) => ({
          id: `iso-fetch-${Date.now()}-${i}`,
          certificateType: iso.certificate_type,
          year: iso.year,
          firstImage: null, 
          secondImage: null,
          firstImagePreview: iso.first_image_url || '',
          secondImagePreview: iso.second_image_url || '',
          existingFirstDocId: iso.first_image_id,
          existingSecondDocId: iso.second_image_id
        })));
      }
    } catch (err) {
      console.error('Failed to load ISO certificates', err);
    }
  }

  const handleIsoDraftChange = (event) => {
    const { name, value } = event.target
    setIsoDraft(prev => ({ ...prev, [name]: value }))
  }

  const handleIsoImageChange = (event, imageType) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      if (imageType === 'first') {
        setIsoDraft(prev => ({ ...prev, firstImage: file, firstImageName: file.name, firstImagePreview: reader.result }))
      } else {
        setIsoDraft(prev => ({ ...prev, secondImage: file, secondImageName: file.name, secondImagePreview: reader.result }))
      }
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveIsoImage = (imageType) => {
    if (imageType === 'first') {
      setIsoDraft(prev => ({ ...prev, firstImage: null, firstImageName: '', firstImagePreview: '' }))
    } else {
      setIsoDraft(prev => ({ ...prev, secondImage: null, secondImageName: '', secondImagePreview: '' }))
    }
  }

  const handleSaveIso = async () => {
    if (!isoDraft.certificateType.trim()) {
      return alerts.warning('Required', 'Certificate type is required');
    }

    if (!activeOrgId) {
      return alerts.warning('Wait', 'Please save Organization Details first.')
    }

    setIsSaving(true)
    try {
      const isEdit = !!editingIsoId;
      const isoId = isEdit ? editingIsoId : `iso-${Date.now()}`;
      const updatedIso = { id: isoId, ...isoDraft };
      
      const newIsoList = isEdit 
        ? isoCertificates.map(c => c.id === editingIsoId ? updatedIso : c)
        : [...isoCertificates, updatedIso];

      alerts.info('Uploading...', 'Uploading documents and saving details please wait.')

      const processedIso = []
      for (const iso of newIsoList) {
        let firstDocId = null;
        let secondDocId = null;

        if (iso.firstImage) {
          const up1 = await uploadDocument(iso.firstImage, 'ISO_CERTIFICATE_1')
          if (up1.success) firstDocId = up1.data.id
        }
        if (iso.secondImage) {
          const up2 = await uploadDocument(iso.secondImage, 'ISO_CERTIFICATE_2')
          if (up2.success) secondDocId = up2.data.id
        }

        if (iso.certificateType || iso.year || firstDocId || secondDocId || iso.existingFirstDocId || iso.existingSecondDocId) {
          processedIso.push({
            certificate_type: iso.certificateType,
            year: iso.year,
            first_image_id: firstDocId || iso.existingFirstDocId || null,
            second_image_id: secondDocId || iso.existingSecondDocId || null
          })
        }
      }

      const res = await addDetailsService.saveIsoCertificates({
        organization_id: activeOrgId,
        iso_certificates: processedIso
      })

      if (res.success) {
        setIsoCertificates(newIsoList)
        setIsoDraft(initialIsoCertificateDraft)
        setEditingIsoId(null)
        setIsoMode('list')
        alerts.success('Success', isEdit ? 'Certificate updated' : 'Certificate added')
      } else {
        alerts.error('Error', res.message)
      }
    } catch (err) {
      console.error(err)
      alerts.error('Error', 'Failed to save ISO certificates')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemoveIso = async (id) => {
    const confirm = await alerts.confirm('Delete?', 'Remove this ISO certificate?')
    if (!confirm.isConfirmed) return

    const newIsoList = isoCertificates.filter(c => c.id !== id)
    
    if (activeOrgId) {
      try {
        const processedIso = newIsoList.map(iso => ({
          certificate_type: iso.certificateType,
          year: iso.year,
          first_image_id: iso.existingFirstDocId || null,
          second_image_id: iso.existingSecondDocId || null
        }))
        await addDetailsService.saveIsoCertificates({ organization_id: activeOrgId, iso_certificates: processedIso })
      } catch (err) {
        console.error(err)
      }
    }
    setIsoCertificates(newIsoList)
  }

  const columns = useMemo(() => [
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
            <button type="button" className="view-row-btn" onClick={() => setViewingDocsId(cert.id)}>View</button>
            {(cert.firstImagePreview || cert.secondImagePreview) && (
              <button type="button" className="view-docs-btn" onClick={() => setViewingDocsId(cert.id)}>Docs</button>
            )}
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
  ], [handleRemoveIso])


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

          {viewingDocsId && (() => {
            const cert = isoCertificates.find(c => c.id === viewingDocsId);
            if (!cert) return null;
            return (
              <div className="modal-overlay">
                <div className="modal-content">
                  <div className="modal-header">
                    <h4>{cert.certificateType} Details</h4>
                    <button type="button" className="modal-close-btn" onClick={() => setViewingDocsId(null)}>✕</button>
                  </div>
                  <div className="modal-body">
                    <div className="card-look">
                      <p><strong>Certificate Type:</strong> {cert.certificateType}</p>
                      <p><strong>Year of Issuance:</strong> {cert.year || '-'}</p>
                    </div>
                    {cert.firstImagePreview && (
                      <div>
                        <h5>First Image</h5>
                        <img src={cert.firstImagePreview} alt="ISO 1" className="modal-image-preview" />
                      </div>
                    )}
                    {cert.secondImagePreview && (
                      <div>
                        <h5>Second Image</h5>
                        <img src={cert.secondImagePreview} alt="ISO 2" className="modal-image-preview" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}


        </>
      ) : (
        <div className="premium-card mt-2">
          <h4>{editingIsoId ? 'Edit Certificate' : 'Add New Certificate'}</h4>
          <div className="iso-cert-entry-form" style={{ border: 'none', background: 'transparent', padding: 0 }}>
            <label className="details-field">
              <span>Certificate Type *</span>
              <input
                type="text"
                name="certificateType"
                value={isoDraft.certificateType}
                onChange={handleIsoDraftChange}
                placeholder="e.g., ISO 9001"
              />
            </label>
            <label className="details-field">
              <span>Year</span>
              <input
                type="number"
                name="year"
                value={isoDraft.year}
                onChange={handleIsoDraftChange}
                placeholder="e.g. 2023"
              />
            </label>
          </div>

          <div className="bank-documents-section mt-2">
            <h5>Certificate Documents</h5>
            <div className="bank-documents-grid">
              <div className="bank-doc-upload">
                <p>First Certificate Image</p>
                {isoDraft.firstImagePreview ? (
                  <div className="image-preview-container">
                    <img src={isoDraft.firstImagePreview} alt="ISO 1" />
                    <button type="button" className="remove-image-btn mt-1" onClick={() => handleRemoveIsoImage('first')}>Remove</button>
                  </div>
                ) : (
                  <label className="image-upload-field">
                    <span>📄 Click to upload image</span>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleIsoImageChange(e, 'first')} />
                  </label>
                )}
              </div>
              <div className="bank-doc-upload">
                <p>Second Certificate Image</p>
                {isoDraft.secondImagePreview ? (
                  <div className="image-preview-container">
                    <img src={isoDraft.secondImagePreview} alt="ISO 2" />
                    <button type="button" className="remove-image-btn mt-1" onClick={() => handleRemoveIsoImage('second')}>Remove</button>
                  </div>
                ) : (
                  <label className="image-upload-field">
                    <span>📄 Click to upload image</span>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleIsoImageChange(e, 'second')} />
                  </label>
                )}
              </div>
            </div>
          </div>

          <div className="project-actions mt-2">
            <button type="button" className="save-btn" onClick={handleSaveIso} disabled={isSaving}>
              {isSaving ? 'Saving...' : (editingIsoId ? 'Update' : 'Save Details')}
            </button>
            <button 
              type="button" 
              className="cancel-btn" 
              onClick={() => {
                setIsoMode('list');
                setEditingIsoId(null);
                setIsoDraft(initialIsoCertificateDraft);
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

export default IsoCertificates
