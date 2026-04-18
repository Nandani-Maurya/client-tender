import { useState, useEffect } from 'react'
import alerts from '../../../../utils/alerts'
import * as addDetailsService from '../../../../services/addDetails.service'
import './BankDetails.css'

const initialBankDraft = {
  bankName: '',
  branchName: '',
  accountHolderName: '',
  accountNumber: '',
  ifscCode: '',
  accountType: '',
  upiId: '',
  bankStatementImage: null,
  bankStatementPreview: '',
  passbookImage: null,
  passbookPreview: ''
}

function BankDetails({ activeOrgId }) {
  const [banks, setBanks] = useState([])
  const [bankDraft, setBankDraft] = useState(initialBankDraft)
  const [editingBankId, setEditingBankId] = useState(null)
  const [showBankForm, setShowBankForm] = useState(false)
  const [viewingBankDocuments, setViewingBankDocuments] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (activeOrgId) {
      fetchBankDetails(activeOrgId)
    }
  }, [activeOrgId])

  async function fetchBankDetails(orgId) {
    try {
      const res = await addDetailsService.getBankDetails(orgId);
      if (res.success && res.data) {
        setBanks(res.data.map((bank, i) => ({
          id: `bank-fetch-${Date.now()}-${i}`,
          bankName: bank.bank_name || '',
          branchName: bank.branch_name || '',
          accountHolderName: bank.account_holder_name || '',
          accountNumber: bank.account_number || '',
          ifscCode: bank.ifsc_code || '',
          accountType: bank.account_type || '',
          upiId: bank.upi_id || '',
          existingBankStatementId: bank.bank_statement_id,
          existingPassbookId: bank.passbook_id,
          bankStatementPreview: bank.bank_statement_url || '',
          passbookPreview: bank.passbook_url || ''
        })));
      }
    } catch (err) {
      console.error('Failed to load bank details', err);
    }
  }

  const handleBankChange = (event) => {
    const { name, value } = event.target
    setBankDraft((prev) => ({ ...prev, [name]: value }))
  }

  const handleBankImageChange = (event, imageType) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (imageType === 'statement') {
          setBankDraft((prev) => ({
            ...prev,
            bankStatementImage: file,
            bankStatementPreview: reader.result
          }))
        } else if (imageType === 'passbook') {
          setBankDraft((prev) => ({
            ...prev,
            passbookImage: file,
            passbookPreview: reader.result
          }))
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveBankImage = (imageType) => {
    if (imageType === 'statement') {
      setBankDraft((prev) => ({
        ...prev,
        bankStatementImage: null,
        bankStatementPreview: ''
      }))
    } else if (imageType === 'passbook') {
      setBankDraft((prev) => ({
        ...prev,
        passbookImage: null,
        passbookPreview: ''
      }))
    }
  }

  const handleSaveBank = async () => {
    if (!bankDraft.bankName.trim() || !bankDraft.accountNumber.trim()) {
      return alerts.warning('Required', 'Bank Name and Account Number are required')
    }

    if (!activeOrgId) {
      return alerts.warning('Wait', 'Please save Basic Organization Details first.')
    }

    setIsSaving(true)
    try {
      const isEdit = !!editingBankId;
      const bankId = isEdit ? editingBankId : `bank-${Date.now()}`;
      const updatedBank = { id: bankId, ...bankDraft };
      
      const newBanks = isEdit 
        ? banks.map(b => b.id === editingBankId ? updatedBank : b)
        : [...banks, updatedBank];

      alerts.info('Saving...', 'Saving bank details please wait.')

      const bankPayload = newBanks.map(b => ({
        bank_name: b.bankName,
        branch_name: b.branchName,
        account_holder_name: b.accountHolderName,
        account_number: b.accountNumber,
        ifsc_code: b.ifscCode,
        account_type: b.accountType,
        upi_id: b.upiId,
        bank_statement_id: b.existingBankStatementId || null,
        passbook_id: b.existingPassbookId || null
      }))

      const res = await addDetailsService.saveBankDetails({
        organization_id: activeOrgId,
        bank_details: bankPayload
      })

      if (res.success) {
        setBanks(newBanks)
        setBankDraft(initialBankDraft)
        setShowBankForm(false)
        setEditingBankId(null)
        alerts.success('Success', isEdit ? 'Bank updated' : 'Bank added')
      } else {
        alerts.error('Error', res.message)
      }
    } catch (err) {
      console.error(err)
      alerts.error('Error', 'Failed to save bank details')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemoveBank = async (bankId) => {
    const confirm = await alerts.confirm('Delete?', 'Remove this bank account?')
    if (!confirm.isConfirmed) return

    const newBanks = banks.filter(bank => bank.id !== bankId)
    
    if (activeOrgId) {
      try {
        const bankPayload = newBanks.map(b => ({
          bank_name: b.bankName,
          branch_name: b.branchName,
          account_holder_name: b.accountHolderName,
          account_number: b.accountNumber,
          ifsc_code: b.ifscCode,
          account_type: b.accountType,
          upi_id: b.upiId,
          bank_statement_id: b.existingBankStatementId || null,
          passbook_id: b.existingPassbookId || null
        }))
        await addDetailsService.saveBankDetails({ organization_id: activeOrgId, bank_details: bankPayload })
      } catch (err) {
        console.error(err)
      }
    }
    setBanks(newBanks)
  }

  return (
    <section className="details-section">
      <h3>Bank Details Management</h3>
      <p className="section-helper">Manage multiple bank accounts and associated documents for the organization.</p>

      {!showBankForm ? (
        <>
          <div className="section-actions">
            <button type="button" onClick={() => setShowBankForm(true)}>+ Add New Bank Account</button>
          </div>

          <div className="bank-table">
            <div className="bank-row table-heading">
              <span>Bank Name</span>
              <span>Account Holder</span>
              <span>Account Number</span>
              <span>Account Type</span>
              <span>Action</span>
            </div>
            {banks.length === 0 ? (
              <div className="empty-project-row">No bank details added yet.</div>
            ) : (
              banks.map((bank) => (
                <div className="bank-row" key={bank.id}>
                  <span className="bold-label">{bank.bankName}</span>
                  <span>{bank.accountHolderName || '-'}</span>
                  <span>{bank.accountNumber}</span>
                  <span>{bank.accountType || '-'}</span>
                  <div className="row-actions">
                    <button type="button" className="view-row-btn" onClick={() => setViewingBankDocuments(bank)}>View</button>
                    {(bank.bankStatementPreview || bank.passbookPreview) && (
                      <button type="button" className="view-docs-btn" onClick={() => setViewingBankDocuments(bank)}>Docs</button>
                    )}
                    <button type="button" className="edit-row-btn" onClick={() => {
                        setEditingBankId(bank.id);
                        setBankDraft(bank);
                        setShowBankForm(true);
                      }}>Edit</button>
                    <button type="button" className="delete-row-btn" onClick={() => handleRemoveBank(bank.id)}>Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>

          {viewingBankDocuments && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h4>{viewingBankDocuments.bankName} Details</h4>
                  <button type="button" className="modal-close-btn" onClick={() => setViewingBankDocuments(null)}>✕</button>
                </div>
                <div className="modal-body">
                  <div className="card-look">
                    <p><strong>Account Holder:</strong> {viewingBankDocuments.accountHolderName || '-'}</p>
                    <p><strong>Account No:</strong> {viewingBankDocuments.accountNumber}</p>
                    <p><strong>Account Type:</strong> {viewingBankDocuments.accountType || '-'}</p>
                    <p><strong>IFSC:</strong> {viewingBankDocuments.ifscCode || '-'}</p>
                    <p><strong>Branch:</strong> {viewingBankDocuments.branchName || '-'}</p>
                    <p><strong>UPI ID:</strong> {viewingBankDocuments.upiId || '-'}</p>
                  </div>
                  {viewingBankDocuments.bankStatementPreview && (
                    <div>
                      <h5>Bank Statement</h5>
                      <img src={viewingBankDocuments.bankStatementPreview} alt="Statement" className="modal-image-preview" />
                    </div>
                  )}
                  {viewingBankDocuments.passbookPreview && (
                    <div>
                      <h5>Passbook</h5>
                      <img src={viewingBankDocuments.passbookPreview} alt="Passbook" className="modal-image-preview" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}


        </>
      ) : (
        <div className="bank-form premium-card mt-2">
          <h4>{editingBankId ? 'Update Bank Details' : 'Register New Bank Account'}</h4>
          <div className="bank-entry-form">
            <label className="details-field"><span>Bank Name *</span><input type="text" name="bankName" value={bankDraft.bankName} onChange={handleBankChange} placeholder="Enter Bank Name" /></label>
            <label className="details-field"><span>Branch Name</span><input type="text" name="branchName" value={bankDraft.branchName} onChange={handleBankChange} placeholder="Enter Branch Name" /></label>
            <label className="details-field"><span>Account Holder Name</span><input type="text" name="accountHolderName" value={bankDraft.accountHolderName} onChange={handleBankChange} placeholder="Enter Name as per Bank" /></label>
            <label className="details-field"><span>Account Number *</span><input type="text" name="accountNumber" value={bankDraft.accountNumber} onChange={handleBankChange} placeholder="Number" /></label>
            <label className="details-field"><span>IFSC Code</span><input type="text" name="ifscCode" value={bankDraft.ifscCode} onChange={handleBankChange} placeholder="IFSC" /></label>
            <label className="details-field">
              <span>Account Type</span>
              <select name="accountType" value={bankDraft.accountType} onChange={handleBankChange}>
                <option value="">Select</option>
                <option value="Savings">Savings</option>
                <option value="Current">Current</option>
                <option value="OD/CC">OD/CC</option>
              </select>
            </label>
            <label className="details-field"><span>UPI ID</span><input type="text" name="upiId" value={bankDraft.upiId} onChange={handleBankChange} placeholder="example@upi" /></label>
          </div>

          <div className="bank-documents-section mt-2">
            <h5>Bank Documents (Photos/Scans)</h5>
            <div className="bank-documents-grid">
              <div className="bank-doc-upload">
                <p>Bank Statement / Cancelled Cheque</p>
                {bankDraft.bankStatementPreview ? (
                  <div className="image-preview-container">
                    <img src={bankDraft.bankStatementPreview} alt="Statement" />
                    <button type="button" onClick={() => handleRemoveBankImage('statement')}>Remove</button>
                  </div>
                ) : (
                  <label className="image-upload-field">
                    <span>📄 Click to Upload Statement</span>
                    <input type="file" onChange={(e) => handleBankImageChange(e, 'statement')} />
                  </label>
                )}
              </div>

              <div className="bank-doc-upload">
                <p>Passbook First Page</p>
                {bankDraft.passbookPreview ? (
                  <div className="image-preview-container">
                    <img src={bankDraft.passbookPreview} alt="Passbook" />
                    <button type="button" onClick={() => handleRemoveBankImage('passbook')}>Remove</button>
                  </div>
                ) : (
                  <label className="image-upload-field">
                    <span>📄 Click to Upload Passbook</span>
                    <input type="file" onChange={(e) => handleBankImageChange(e, 'passbook')} />
                  </label>
                )}
              </div>
            </div>
          </div>

          <div className="project-actions mt-2">
            <button type="button" className="save-btn" onClick={handleSaveBank} disabled={isSaving}>
              {isSaving ? 'Saving...' : (editingBankId ? 'Update Bank' : 'Save Details')}
            </button>
            <button type="button" className="cancel-btn" onClick={() => { setShowBankForm(false); setEditingBankId(null); setBankDraft(initialBankDraft); }}>Cancel</button>
          </div>
        </div>
      )}
    </section>
  )
}

export default BankDetails
