import { useState, useEffect } from 'react'
import alerts from '../../../../utils/alerts'
import * as addDetailsService from '../../../../services/addDetails.service'
import './Organisation.css'

const organisationFields = [
  { name: 'nameOfFirm', label: 'Name of Firm' },
  { name: 'registrationNumber', label: 'Registration Number' },
  { name: 'registrationDate', label: 'Registration Date' },
  { name: 'emailAddress', label: 'Email Address' },
  { name: 'webAddress', label: 'Web Address' },
  { name: 'yearOfEstablishment', label: 'Year of Establishment' },
  { name: 'typeOfFirm', label: 'Type of Firm' },
  { name: 'panCardNumber', label: 'PAN Card Number' },
  { name: 'gstRegistrationNumber', label: 'GST Registration Number' },
  { name: 'epfRegistrationNumber', label: 'EPF Registration Number' },
  { name: 'esicRegistrationNumber', label: 'ESIC Registration Number' }
]

const initialOrganisationDraft = organisationFields.reduce((draft, field) => {
  draft[field.name] = ''
  return draft
}, {})

const initialBranchDraft = {
  branchName: '',
  state: '',
  city: '',
  address: ''
}

const initialContactDraft = {
  type: 'Telephone',
  number: ''
}

const initialPartnerDraft = {
  name: '',
  position: '',
  address: '',
  phoneNumber: '',
  isAuthorized: false
}

function Organisation({ activeOrgId, onOrgSaved }) {
  const [organisationDraft, setOrganisationDraft] = useState(initialOrganisationDraft)
  const [branches, setBranches] = useState([{ ...initialBranchDraft, id: 'branch-1' }])
  const [contacts, setContacts] = useState([{ ...initialContactDraft, id: 'contact-1' }])
  const [partners, setPartners] = useState([{ ...initialPartnerDraft, id: 'partner-1' }])
  const [isSaving, setIsSaving] = useState(false)
  const [isUpdateMode, setIsUpdateMode] = useState(false)

  useEffect(() => {
    loadActiveOrganization()
  }, [])

  async function loadActiveOrganization() {
    try {
      const res = await addDetailsService.getActiveDetails();
      if (res.success && res.data) {
        setIsUpdateMode(true);
        const org = res.data;
        if (onOrgSaved) onOrgSaved(org.id);
        
        setOrganisationDraft({
          nameOfFirm: org.name_of_firm || '',
          registrationNumber: org.registration_number || '',
          registrationDate: org.registration_date ? org.registration_date.split('T')[0] : '',
          emailAddress: org.email_address || '',
          webAddress: org.web_address || '',
          yearOfEstablishment: org.year_of_establishment || '',
          typeOfFirm: org.type_of_firm || '',
          panCardNumber: org.pan_card_number || '',
          gstRegistrationNumber: org.gst_registration_number || '',
          epfRegistrationNumber: org.epf_registration_number || '',
          esicRegistrationNumber: org.esic_registration_number || '',
          headOfficeState: org.head_office_state || '',
          headOfficeCity: org.head_office_city || '',
          headOfficeFullAddress: org.head_office_full_address || ''
        });
        
        if (org.contacts && org.contacts.length > 0) {
          setContacts(org.contacts.map((c, i) => ({ id: `contact-fetch-${Date.now()}-${i}`, ...c })));
        }
        if (org.branches && org.branches.length > 0) {
          setBranches(org.branches.map((b, i) => ({ 
            id: `branch-fetch-${Date.now()}-${i}`, 
            branchName: b.branch_name, 
            state: b.state, 
            city: b.city, 
            address: b.address 
          })));
        }
        if (org.partners && org.partners.length > 0) {
          setPartners(org.partners.map((p, i) => ({ 
            id: `partner-fetch-${Date.now()}-${i}`, 
            name: p.name, 
            position: p.position, 
            phoneNumber: p.phone, 
            address: p.address, 
            isAuthorized: p.is_authorized 
          })));
        }
      }
    } catch(err) {
      console.error(err);
    }
  }

  const handleOrganisationChange = (event) => {
    const { name, value } = event.target
    setOrganisationDraft((prev) => ({ ...prev, [name]: value }))
  }

  const handleBranchChange = (index, event) => {
    const { name, value } = event.target
    setBranches(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [name]: value }
      return updated
    })
  }

  const handleAddMoreBranch = () => {
    setBranches(prev => [...prev, { ...initialBranchDraft, id: `branch-${Date.now()}` }])
  }

  const handleRemoveBranch = (id) => {
    setBranches(prev => prev.filter(b => b.id !== id))
  }

  const handleContactChange = (index, event) => {
    const { name, value } = event.target
    setContacts(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [name]: value }
      return updated
    })
  }

  const handleAddMoreContact = () => {
    setContacts(prev => [...prev, { ...initialContactDraft, id: `contact-${Date.now()}` }])
  }

  const handleRemoveContact = (id) => {
    setContacts(prev => prev.filter(c => c.id !== id))
  }

  const handlePartnerChange = (index, event) => {
    const { name, value, checked, type } = event.target
    setPartners(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [name]: type === 'checkbox' ? checked : value }
      return updated
    })
  }

  const handleAddMorePartner = () => {
    setPartners(prev => [...prev, { ...initialPartnerDraft, id: `partner-${Date.now()}` }])
  }

  const handleRemovePartner = (id) => {
    setPartners(prev => prev.filter(p => p.id !== id))
  }

  const handleSaveBasicDetails = async () => {
    setIsSaving(true)
    try {
      const hasData = organisationFields.some(({ name }) => String(organisationDraft[name]).trim())
      if (!hasData) {
        alerts.error('No Data', 'Please fill the organization details before saving.')
        setIsSaving(false)
        return
      }

      const confirm = await alerts.confirm('Save Organization?', 'Are you sure you want to save BASIC organization details?')
      if (!confirm.isConfirmed) {
        setIsSaving(false)
        return
      }

      const payload = {
        name_of_firm: organisationDraft.nameOfFirm,
        registration_number: organisationDraft.registrationNumber,
        registration_date: organisationDraft.registrationDate || null,
        email_address: organisationDraft.emailAddress,
        web_address: organisationDraft.webAddress,
        year_of_establishment: parseInt(organisationDraft.yearOfEstablishment, 10) || null,
        type_of_firm: organisationDraft.typeOfFirm,
        pan_card_number: organisationDraft.panCardNumber,
        gst_registration_number: organisationDraft.gstRegistrationNumber,
        epf_registration_number: organisationDraft.epfRegistrationNumber,
        esic_registration_number: organisationDraft.esicRegistrationNumber,
        head_office_state: organisationDraft.headOfficeState,
        head_office_city: organisationDraft.headOfficeCity,
        head_office_full_address: organisationDraft.headOfficeFullAddress,
        contacts: contacts.filter(c => c.number.trim()).map(c => ({ type: c.type, number: c.number })),
        branches: branches.filter(b => b.branchName.trim() || b.city.trim()).map(b => ({ branch_name: b.branchName, state: b.state, city: b.city, address: b.address })),
        partners: partners.filter(p => p.name.trim()).map(p => ({ name: p.name, position: p.position, phone: p.phoneNumber, address: p.address, is_authorized: p.isAuthorized }))
      }

      const res = await addDetailsService.saveBasicDetails(payload)
      if (res.success) {
        if (onOrgSaved) onOrgSaved(res.data.organization_id);
        setIsUpdateMode(true);
        alerts.success('Success', isUpdateMode ? 'Organization updated successfully' : 'Organization saved successfully')
      } else {
        alerts.error('Failed', res.message)
      }
    } catch (err) {
      console.error(err)
      alerts.error('Error', 'An unexpected error occurred.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="details-section">
      <h3>Basic Organization Details</h3>
      <p className="section-helper">Core administrative and legal registration data of the firm.</p>

      <div className="details-grid mt-2">
        {organisationFields.map(({ name, label }) => (
          <label className="details-field" key={name}>
            <span>{label}</span>
            <input
              type={name === 'registrationDate' ? 'date' : (name.includes('year') || name.includes('Year')) ? 'number' : 'text'}
              name={name}
              value={organisationDraft[name]}
              onChange={handleOrganisationChange}
              placeholder={`Enter ${label}`}
            />
          </label>
        ))}
      </div>

      <div className="office-block mt-3">
        <h4>Official Contact Numbers</h4>
        <div className="multi-list">
          {contacts.map((contact, idx) => (
            <div className="multi-form-entry card-look mb-1" key={contact.id}>
              <div className="multi-form-header">
                <span>Contact Point #{idx + 1}</span>
                {contacts.length > 1 && (
                  <button type="button" className="delete-entry-btn" onClick={() => handleRemoveContact(contact.id)}>✕ Remove</button>
                )}
              </div>
              <div className="contact-entry-form">
                <label className="details-field">
                  <span>Category</span>
                  <select name="type" value={contact.type} onChange={(e) => handleContactChange(idx, e)}>
                    <option value="Telephone">Telephone</option>
                    <option value="Mobile">Mobile</option>
                    <option value="Alternate Mobile">Alternate Mobile</option>
                    <option value="Customer Care">Customer Care</option>
                  </select>
                </label>
                <label className="details-field">
                  <span>Phone Number</span>
                  <input type="text" name="number" value={contact.number} onChange={(e) => handleContactChange(idx, e)} placeholder="Enter 10-digit number" />
                </label>
              </div>
            </div>
          ))}
          <button type="button" className="add-more-section-btn" onClick={handleAddMoreContact}>+ Add Another Contact</button>
        </div>
      </div>

      <div className="office-block mt-3">
        <h4>Registered Head Office Address</h4>
        <div className="details-grid card-look p-2">
          <label className="details-field">
            <span>State</span>
            <input type="text" name="headOfficeState" value={organisationDraft.headOfficeState || ''} onChange={handleOrganisationChange} placeholder="e.g. Maharashtra" />
          </label>
          <label className="details-field">
            <span>City</span>
            <input type="text" name="headOfficeCity" value={organisationDraft.headOfficeCity || ''} onChange={handleOrganisationChange} placeholder="e.g. Mumbai" />
          </label>
          <label className="details-field full-field">
            <span>Complete Postal Address</span>
            <input type="text" name="headOfficeFullAddress" value={organisationDraft.headOfficeFullAddress || ''} onChange={handleOrganisationChange} placeholder="House no, Street, Landmark..." />
          </label>
        </div>
      </div>

      <div className="office-block mt-3">
        <h4>Regional / Branch Offices</h4>
        <div className="multi-list">
          {branches.map((branch, idx) => (
            <div className="multi-form-entry card-look mb-1" key={branch.id}>
              <div className="multi-form-header">
                <span>Branch Location #{idx + 1}</span>
                {branches.length > 1 && (
                  <button type="button" className="delete-entry-btn" onClick={() => handleRemoveBranch(branch.id)}>✕ Remove</button>
                )}
              </div>
              <div className="branch-entry-form">
                <label className="details-field"><span>Branch Name</span><input type="text" name="branchName" value={branch.branchName} onChange={(e) => handleBranchChange(idx, e)} placeholder="e.g. Pune Regional" /></label>
                <label className="details-field"><span>State</span><input type="text" name="state" value={branch.state} onChange={(e) => handleBranchChange(idx, e)} placeholder="State" /></label>
                <label className="details-field"><span>City</span><input type="text" name="city" value={branch.city} onChange={(e) => handleBranchChange(idx, e)} placeholder="City" /></label>
                <label className="details-field full-field"><span>Full Address</span><input type="text" name="address" value={branch.address} onChange={(e) => handleBranchChange(idx, e)} placeholder="Complete branch address" /></label>
              </div>
            </div>
          ))}
          <button type="button" className="add-more-section-btn" onClick={handleAddMoreBranch}>+ Register Branch Office</button>
        </div>
      </div>

      <div className="office-block mt-3">
        <h4>Active Partners / Directors</h4>
        <div className="multi-list">
          {partners.map((partner, idx) => (
            <div className="multi-form-entry card-look mb-1" key={partner.id}>
              <div className="multi-form-header">
                <span>Executive Member #{idx + 1}</span>
                {partners.length > 1 && (
                  <button type="button" className="delete-entry-btn" onClick={() => handleRemovePartner(partner.id)}>✕ Remove</button>
                )}
              </div>
              <div className="partner-entry-form">
                <label className="details-field"><span>Full Name</span><input type="text" name="name" value={partner.name} onChange={(e) => handlePartnerChange(idx, e)} placeholder="Member name" /></label>
                <label className="details-field"><span>Designation</span><input type="text" name="position" value={partner.position} onChange={(e) => handlePartnerChange(idx, e)} placeholder="e.g. MD / CEO" /></label>
                <label className="details-field"><span>Personal Mobile</span><input type="text" name="phoneNumber" value={partner.phoneNumber} onChange={(e) => handlePartnerChange(idx, e)} placeholder="Mobile number" /></label>
                <label className="details-field full-field"><span>Residential Address</span><input type="text" name="address" value={partner.address} onChange={(e) => handlePartnerChange(idx, e)} placeholder="Member complete address" /></label>
                <label className="check-field">
                  <input type="checkbox" name="isAuthorized" checked={partner.isAuthorized} onChange={(e) => handlePartnerChange(idx, e)} />
                  <span>Legally authorized for tender signing</span>
                </label>
              </div>
            </div>
          ))}
          <button type="button" className="add-more-section-btn" onClick={handleAddMorePartner}>+ Add Partner / Director</button>
        </div>
      </div>

      <div className="section-save-container mt-3">
        <button type="button" className="save-all-details-btn" onClick={handleSaveBasicDetails} disabled={isSaving}>
          {isSaving ? 'Synchronizing...' : (isUpdateMode ? 'Update All Organization Data' : 'Save Organization Details')}
        </button>
      </div>
    </section>
  )
}

export default Organisation
