import { useState, useEffect } from 'react'
import alerts from '../../../../utils/alerts'
import * as addDetailsService from '../../../../services/addDetails.service'
import './Organisation.css'

const organisationFields = [
  { name: 'nameOfFirm', label: 'Name of Firm', required: true },
  { name: 'registrationNumber', label: 'Registration Number', required: true },
  { name: 'registrationDate', label: 'Registration Date', required: true },
  { name: 'emailAddress', label: 'Email Address', required: true },
  { name: 'webAddress', label: 'Website', required: true },
  { name: 'yearOfEstablishment', label: 'Year of Establishment', required: true },
  { name: 'typeOfFirm', label: 'Type of Firm', required: true },
  { name: 'panCardNumber', label: 'PAN Card Number', required: true },
  { name: 'gstRegistrationNumber', label: 'GST Registration Number', required: true },
  { name: 'epfRegistrationNumber', label: 'EPF Registration Number', required: true },
  { name: 'esicRegistrationNumber', label: 'ESIC Registration Number', required: true }
]

const initialOrganisationDraft = organisationFields.reduce((draft, field) => {
  draft[field.name] = ''
  return draft
}, {})

initialOrganisationDraft.headOfficePincode = ''

const initialBranchDraft = {
  branchName: '',
  state: '',
  city: '',
  address: '',
  pincode: ''
}

const initialContactDraft = {
  type: 'Telephone',
  number: ''
}

const initialPartnerDraft = {
  name: '',
  position: '',
  address: '',
  pincode: '',
  phoneNumber: '',
  isAuthorized: false
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phonePattern = /^[0-9]{10}$/
const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
const gstPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{3}$/
const epfPattern = /^[A-Z]{2}[A-Z0-9]{10,22}$/
const esicPattern = /^[0-9]{17}$/

const normalizeWebsite = (value) => {
  const trimmed = String(value || '').trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

const allowOnlyDigits = (event) => {
  const allowedKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End']
  if (allowedKeys.includes(event.key) || event.ctrlKey || event.metaKey) {
    return
  }

  if (!/^[0-9]$/.test(event.key)) {
    event.preventDefault()
  }
}

const preventNonDigitPaste = (event) => {
  const pastedText = event.clipboardData.getData('text')
  if (!/^[0-9]+$/.test(pastedText)) {
    event.preventDefault()
  }
}

const digitsOnlyValue = (value) => String(value || '').replace(/[^0-9]/g, '')

function Organisation() {
  const [organisationDraft, setOrganisationDraft] = useState(initialOrganisationDraft)
  const [branches, setBranches] = useState([{ ...initialBranchDraft, id: 'branch-1' }])
  const [contacts, setContacts] = useState([{ ...initialContactDraft, id: 'contact-1' }])
  const [partners, setPartners] = useState([{ ...initialPartnerDraft, id: 'partner-1' }])
  const [isSaving, setIsSaving] = useState(false)
  const [isUpdateMode, setIsUpdateMode] = useState(false)
  const [isEditEnabled, setIsEditEnabled] = useState(false)
  const [hasActiveOrganization, setHasActiveOrganization] = useState(false)

  useEffect(() => {
    loadActiveOrganization()
  }, [])

  async function loadActiveOrganization() {
    try {
      const res = await addDetailsService.getActiveDetails();
      if (res.success && res.data) {
        setHasActiveOrganization(true)
        setIsUpdateMode(true);
        setIsEditEnabled(false);
        const org = res.data;
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
          headOfficeFullAddress: org.head_office_full_address || '',
          headOfficePincode: org.head_office_pincode || ''
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
            address: b.address,
            pincode: b.pincode || ''
          })));
        }
        if (org.partners && org.partners.length > 0) {
          setPartners(org.partners.map((p, i) => ({ 
            id: `partner-fetch-${Date.now()}-${i}`, 
            name: p.name, 
            position: p.position, 
            phoneNumber: p.phone, 
            address: p.address, 
            pincode: p.pincode || '',
            isAuthorized: p.is_authorized 
          })));
        }
      }
      if (res.success && !res.data) {
        setHasActiveOrganization(false)
        setIsUpdateMode(false)
        setIsEditEnabled(true)
      }
    } catch(err) {
      console.error(err);
    }
  }

  const handleOrganisationChange = (event) => {
    let { name, value } = event.target
    if (name === 'yearOfEstablishment') {
      setOrganisationDraft((prev) => ({ ...prev, [name]: digitsOnlyValue(value).slice(0, 4) }))
      return
    }
    if (name === 'panCardNumber') value = value.toUpperCase().slice(0, 10);
    if (name === 'gstRegistrationNumber') value = value.toUpperCase().slice(0, 15);
    if (name === 'epfRegistrationNumber') value = value.toUpperCase().slice(0, 22);
    if (name === 'esicRegistrationNumber') value = digitsOnlyValue(value).slice(0, 17);
    
    setOrganisationDraft((prev) => ({ ...prev, [name]: value }))
  }

  const handleContactNumberChange = (index, event) => {
    const digitsOnly = digitsOnlyValue(event.target.value).slice(0, 10)
    setContacts(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], number: digitsOnly }
      return updated
    })
  }

  const handleBranchChange = (index, event) => {
    const { name, value } = event.target
    setBranches(prev => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        [name]: name === 'pincode' ? digitsOnlyValue(value).slice(0, 6) : value
      }
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
      updated[index] = {
        ...updated[index],
        [name]:
          type === 'checkbox'
            ? checked
            : name === 'pincode'
              ? digitsOnlyValue(value).slice(0, 6)
              : value
      }
      return updated
    })
  }

  const handlePartnerPhoneChange = (index, event) => {
    const digitsOnly = digitsOnlyValue(event.target.value).slice(0, 10)
    setPartners(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], phoneNumber: digitsOnly }
      return updated
    })
  }

  const handlePincodeChange = (setter, key) => (event) => {
    const digitsOnly = digitsOnlyValue(event.target.value).slice(0, 6)
    setter((prev) => ({ ...prev, [key]: digitsOnly }))
  }

  const handleAddMorePartner = () => {
    setPartners(prev => [...prev, { ...initialPartnerDraft, id: `partner-${Date.now()}` }])
  }

  const handleRemovePartner = (id) => {
    setPartners(prev => prev.filter(p => p.id !== id))
  }

  const handleCancelOrganisationEdit = async () => {
    const confirm = await alerts.confirm(
      'Cancel changes?',
      'Are you sure you want to cancel? Unsaved changes will be lost.',
    )

    if (confirm.isConfirmed) {
      setIsEditEnabled(false)
      loadActiveOrganization()
    }
  }

  // Enhanced validation: collect all errors and first error field for scroll
  const validateOrganisationDraft = () => {
    const errors = {};
    let firstErrorField = null;
    // Static fields
    const requiredFields = [
      ['nameOfFirm', 'Name of Firm'],
      ['registrationNumber', 'Registration Number'],
      ['registrationDate', 'Registration Date'],
      ['emailAddress', 'Email Address'],
      ['webAddress', 'Website'],
      ['yearOfEstablishment', 'Year of Establishment'],
      ['typeOfFirm', 'Type of Firm'],
      ['panCardNumber', 'PAN Card Number'],
      ['gstRegistrationNumber', 'GST Registration Number'],
      ['epfRegistrationNumber', 'EPF Registration Number'],
      ['esicRegistrationNumber', 'ESIC Registration Number'],
      ['headOfficeState', 'Head Office State'],
      ['headOfficeCity', 'Head Office City'],
      ['headOfficeFullAddress', 'Head Office Full Address'],
      ['headOfficePincode', 'Registered Office Pincode']
    ];
    for (const [key, label] of requiredFields) {
      if (!String(organisationDraft[key] || '').trim()) {
        errors[`org-${key}`] = `${label} is required`;
        if (!firstErrorField) firstErrorField = `org-${key}`;
      }
    }
    // Email
    if (organisationDraft.emailAddress && !emailPattern.test(String(organisationDraft.emailAddress).trim())) {
      errors['org-emailAddress'] = 'Please enter a valid email address';
      if (!firstErrorField) firstErrorField = 'org-emailAddress';
    }
    // Website
    if (organisationDraft.webAddress && !String(organisationDraft.webAddress).trim()) {
      errors['org-webAddress'] = 'Website is required';
      if (!firstErrorField) firstErrorField = 'org-webAddress';
    }
    // Registration date
    if (organisationDraft.registrationDate) {
      const selectedDate = new Date(`${organisationDraft.registrationDate}T00:00:00`)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (selectedDate > today) {
        errors['org-registrationDate'] = 'Registration Date cannot be greater than today';
        if (!firstErrorField) firstErrorField = 'org-registrationDate';
      }
    }
    // Pincode
    if (organisationDraft.headOfficePincode && !/^[0-9]{6}$/.test(String(organisationDraft.headOfficePincode).trim())) {
      errors['org-headOfficePincode'] = 'Registered office pincode must be exactly 6 digits';
      if (!firstErrorField) firstErrorField = 'org-headOfficePincode';
    }
    // Year
    if (organisationDraft.yearOfEstablishment) {
      const year = Number(organisationDraft.yearOfEstablishment)
      const currentYear = new Date().getFullYear()
      if (!Number.isInteger(year) || year < 1800 || year > currentYear) {
        errors['org-yearOfEstablishment'] = 'Please enter a valid year of establishment';
        if (!firstErrorField) firstErrorField = 'org-yearOfEstablishment';
      }
    }
    // PAN
    if (organisationDraft.panCardNumber && !panPattern.test(String(organisationDraft.panCardNumber).trim().toUpperCase())) {
      errors['org-panCardNumber'] = 'Please enter a valid PAN card number';
      if (!firstErrorField) firstErrorField = 'org-panCardNumber';
    }
    // GST
    if (organisationDraft.gstRegistrationNumber && !gstPattern.test(String(organisationDraft.gstRegistrationNumber).trim().toUpperCase())) {
      errors['org-gstRegistrationNumber'] = 'Please enter a valid GST registration number';
      if (!firstErrorField) firstErrorField = 'org-gstRegistrationNumber';
    }
    // EPF
    if (organisationDraft.epfRegistrationNumber && !epfPattern.test(String(organisationDraft.epfRegistrationNumber).trim().toUpperCase())) {
      errors['org-epfRegistrationNumber'] = 'Please enter a valid EPF registration number';
      if (!firstErrorField) firstErrorField = 'org-epfRegistrationNumber';
    }
    // ESIC
    if (organisationDraft.esicRegistrationNumber && !esicPattern.test(String(organisationDraft.esicRegistrationNumber).trim())) {
      errors['org-esicRegistrationNumber'] = 'Please enter a valid ESIC registration number';
      if (!firstErrorField) firstErrorField = 'org-esicRegistrationNumber';
    }
    // Contacts
    contacts.forEach((contact, idx) => {
      if (!String(contact.number || '').trim()) {
        errors[`contact-number-${idx}`] = 'Contact number is required';
        if (!firstErrorField) firstErrorField = `contact-number-${idx}`;
      } else if (!phonePattern.test(String(contact.number).trim())) {
        errors[`contact-number-${idx}`] = 'Contact phone number must be exactly 10 digits';
        if (!firstErrorField) firstErrorField = `contact-number-${idx}`;
      }
    });
    // Branches
    branches.forEach((branch, idx) => {
      if (!String(branch.branchName || '').trim()) {
        errors[`branch-branchName-${idx}`] = 'Branch name is required';
        if (!firstErrorField) firstErrorField = `branch-branchName-${idx}`;
      }
      if (!String(branch.state || '').trim()) {
        errors[`branch-state-${idx}`] = 'Branch state is required';
        if (!firstErrorField) firstErrorField = `branch-state-${idx}`;
      }
      if (!String(branch.city || '').trim()) {
        errors[`branch-city-${idx}`] = 'Branch city is required';
        if (!firstErrorField) firstErrorField = `branch-city-${idx}`;
      }
      if (!String(branch.address || '').trim()) {
        errors[`branch-address-${idx}`] = 'Branch address is required';
        if (!firstErrorField) firstErrorField = `branch-address-${idx}`;
      }
      if (!/^[0-9]{6}$/.test(String(branch.pincode || '').trim())) {
        errors[`branch-pincode-${idx}`] = 'Branch pincode must be exactly 6 digits';
        if (!firstErrorField) firstErrorField = `branch-pincode-${idx}`;
      }
    });
    // Partners
    partners.forEach((partner, idx) => {
      if (!String(partner.name || '').trim()) {
        errors[`partner-name-${idx}`] = 'Partner name is required';
        if (!firstErrorField) firstErrorField = `partner-name-${idx}`;
      }
      if (!String(partner.position || '').trim()) {
        errors[`partner-position-${idx}`] = 'Partner designation is required';
        if (!firstErrorField) firstErrorField = `partner-position-${idx}`;
      }
      if (!String(partner.phoneNumber || '').trim()) {
        errors[`partner-phoneNumber-${idx}`] = 'Partner mobile number is required';
        if (!firstErrorField) firstErrorField = `partner-phoneNumber-${idx}`;
      } else if (!phonePattern.test(String(partner.phoneNumber).trim())) {
        errors[`partner-phoneNumber-${idx}`] = 'Partner mobile number must be exactly 10 digits';
        if (!firstErrorField) firstErrorField = `partner-phoneNumber-${idx}`;
      }
      if (!String(partner.address || '').trim()) {
        errors[`partner-address-${idx}`] = 'Partner residential address is required';
        if (!firstErrorField) firstErrorField = `partner-address-${idx}`;
      }
      if (!String(partner.pincode || '').trim()) {
        errors[`partner-pincode-${idx}`] = 'Partner pincode is required';
        if (!firstErrorField) firstErrorField = `partner-pincode-${idx}`;
      } else if (!/^[0-9]{6}$/.test(String(partner.pincode || '').trim())) {
        errors[`partner-pincode-${idx}`] = 'Partner pincode must be exactly 6 digits';
        if (!firstErrorField) firstErrorField = `partner-pincode-${idx}`;
      }
    });
    // At least one contact
    if (contacts.filter((contact) => String(contact.number || '').trim()).length === 0) {
      errors['contact-atleastone'] = 'At least one contact number is required';
      if (!firstErrorField) firstErrorField = 'contact-atleastone';
    }
    // At least one branch
    const hasAnyBranch = branches.some((branch) =>
      ['branchName', 'state', 'city', 'address', 'pincode'].some((field) => String(branch[field] || '').trim())
    )
    if (!hasAnyBranch) {
      errors['branch-atleastone'] = 'At least one branch office is required';
      if (!firstErrorField) firstErrorField = 'branch-atleastone';
    }
    return { errors, firstErrorField };
  }

  const handleSaveBasicDetails = async () => {
    setIsSaving(true)
    const loader = alerts.loading('Synchronizing', 'Saving organization details to cloud...');
    try {
      const hasData = organisationFields.some(({ name }) => String(organisationDraft[name]).trim())
      if (!hasData) {
        loader.close();
        alerts.info('No Data', 'Please fill the organization details before saving.')
        setIsSaving(false)
        return
      }

      // Validate first, then confirm
      const { errors } = validateOrganisationDraft();
      if (Object.keys(errors).length > 0) {
        loader.close();
        const firstErrorMessage = Object.values(errors)[0];
        alerts.info('Info', firstErrorMessage);
        setIsSaving(false);
        return;
      }

      const confirm = await alerts.confirm('Save Organization?', 'Are you sure you want to save BASIC organization details?')
      if (!confirm.isConfirmed) {
        loader.close();
        setIsSaving(false)
        return
      }

      const payload = {
        name_of_firm: organisationDraft.nameOfFirm,
        registration_number: organisationDraft.registrationNumber,
        registration_date: organisationDraft.registrationDate || null,
        email_address: organisationDraft.emailAddress,
        web_address: normalizeWebsite(organisationDraft.webAddress),
        year_of_establishment: parseInt(organisationDraft.yearOfEstablishment, 10) || null,
        type_of_firm: organisationDraft.typeOfFirm,
        pan_card_number: organisationDraft.panCardNumber,
        gst_registration_number: organisationDraft.gstRegistrationNumber,
        epf_registration_number: organisationDraft.epfRegistrationNumber,
        esic_registration_number: organisationDraft.esicRegistrationNumber,
        head_office_state: organisationDraft.headOfficeState,
        head_office_city: organisationDraft.headOfficeCity,
        head_office_full_address: organisationDraft.headOfficeFullAddress,
        head_office_pincode: organisationDraft.headOfficePincode,
        contacts: contacts.filter(c => c.number.trim()).map(c => ({ type: c.type, number: c.number })),
        branches: branches.filter(b => b.branchName.trim() || b.city.trim() || b.pincode.trim()).map(b => ({ branch_name: b.branchName, state: b.state, city: b.city, address: b.address, pincode: b.pincode })),
        partners: partners.filter(p => p.name.trim()).map(p => ({ name: p.name, position: p.position, phone: p.phoneNumber, address: p.address, pincode: p.pincode, is_authorized: p.isAuthorized }))
      }

      const res = await addDetailsService.saveBasicDetails(payload)
      loader.close();
      if (res.success) {
        setIsUpdateMode(true);
        setHasActiveOrganization(true)
        setIsEditEnabled(false)
        alerts.success('Success', isUpdateMode ? 'Organization updated successfully' : 'Organization saved successfully')
      } else {
        alerts.info('Info', res.message)
      }
    } catch (err) {
      loader.close();
      console.error(err)
      alerts.info('Info', 'An unexpected error occurred during save.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className={`details-section ${!isEditEnabled ? 'org-fields--disabled' : ''}`}>
      {!hasActiveOrganization && (
        <div className="org-status-banner org-status-banner--empty mb-2">
          <div className="org-status-mark">!</div>
          <div>
            <h4>No active organization found</h4>
            <p>Please fill and save organization details to create the first active record.</p>
          </div>
        </div>
      )}

      <h3>Basic Organization Details</h3>
      <p className="section-helper">Core administrative and legal registration data of the firm.</p>
      {hasActiveOrganization && !isEditEnabled && (
        <div className="org-status-banner org-status-banner--view mb-2">
          <div className="org-status-mark org-status-mark--view">i</div>
          <div className="org-status-copy">
            <h4>Organization loaded in view mode</h4>
            <p>Click edit to unlock the fields and update the active record.</p>
          </div>
          <button type="button" className="save-btn org-status-action" onClick={() => setIsEditEnabled(true)}>Want to Edit</button>
        </div>
      )}

      <div className="details-grid mt-2">
        {organisationFields.map(({ name, label, required }) => (
          <label className="details-field" key={name} style={{ alignItems: 'flex-start' }}>
            <span className="field-label-line">
              <span className="field-label-text">{label}</span>
              {required ? <span className="required-star">*</span> : null}
            </span>
            <div style={{ width: '100%', minHeight: '42px', display: 'flex', alignItems: 'center' }}>
              {!isEditEnabled && name === 'webAddress' && organisationDraft[name] ? (
                <a 
                  href={normalizeWebsite(organisationDraft[name])} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#2563eb', textDecoration: 'underline', fontWeight: '600', fontSize: '14px', wordBreak: 'break-all' }}
                >
                  {organisationDraft[name]}
                </a>
              ) : (
                <input
                  type={name === 'registrationDate' ? 'date' : 'text'}
                  name={name}
                  value={organisationDraft[name]}
                  onChange={handleOrganisationChange}
                  onKeyDown={name === 'yearOfEstablishment' || name === 'esicRegistrationNumber' ? allowOnlyDigits : undefined}
                  onPaste={name === 'yearOfEstablishment' || name === 'esicRegistrationNumber' ? preventNonDigitPaste : undefined}
                  inputMode={name === 'yearOfEstablishment' || name === 'esicRegistrationNumber' ? 'numeric' : undefined}
                  autoComplete="off"
                  placeholder={`Enter ${label}`}
                  disabled={!isEditEnabled}
                  max={name === 'registrationDate' ? new Date().toISOString().split('T')[0] : undefined}
                  maxLength={
                    name === 'panCardNumber' ? 10 :
                    name === 'gstRegistrationNumber' ? 15 :
                    name === 'esicRegistrationNumber' ? 17 :
                    name === 'epfRegistrationNumber' ? 22 :
                    name === 'yearOfEstablishment' ? 4 :
                    undefined
                  }
                />
              )}
            </div>
          </label>
        ))}
      </div>

      <div className="office-block mt-3">
        <h4>Official Contact Numbers</h4>
        <div className="multi-list">
          {contacts.map((contact, idx) => (
            <div className="multi-form-entry card-look mb-1" key={contact.id}>
              <div className="multi-form-header">
                <span className="subheading-required">
                  <span className="subheading-text">Contact Number #{idx + 1}</span>
                  <span className="required-star" style={{ color: 'red' }}>*</span>
                </span>
                {contacts.length > 1 && (
                  <button type="button" className="delete-entry-btn" onClick={() => handleRemoveContact(contact.id)} disabled={!isEditEnabled}>✕ Remove</button>
                )}
              </div>
              <div className="contact-entry-form">
                <label className="details-field">
                  <span>Category</span>
                  <select name="type" value={contact.type} onChange={(e) => handleContactChange(idx, e)} disabled={!isEditEnabled}>
                    <option value="Telephone">Telephone</option>
                    <option value="Mobile">Mobile</option>
                    <option value="Alternate Mobile">Alternate Mobile</option>
                    <option value="Customer Care">Customer Care</option>
                  </select>
                </label>
                <label className="details-field">
                  <span>Phone Number</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    name="number"
                    value={contact.number}
                    onChange={(e) => handleContactNumberChange(idx, e)}
                    onKeyDown={allowOnlyDigits}
                    onPaste={preventNonDigitPaste}
                    placeholder="Enter 10-digit number"
                    disabled={!isEditEnabled}
                    maxLength="10"
                  />
                </label>
              </div>
            </div>
          ))}
          <button type="button" className="add-more-section-btn" onClick={handleAddMoreContact} disabled={!isEditEnabled}>+ Add Another Contact</button>
        </div>
      </div>

      <div className="office-block mt-3">
        <h4>Registered Head Office Address <span className="required-star">*</span></h4>
        <div className="details-grid card-look p-2">
          <label className="details-field" style={{ alignItems: 'flex-start' }}>
            <span>State</span>
            <div style={{ width: '100%' }}>
              <input type="text" name="headOfficeState" value={organisationDraft.headOfficeState || ''} onChange={handleOrganisationChange} placeholder="e.g. Maharashtra" disabled={!isEditEnabled} />
            </div>
          </label>
          <label className="details-field" style={{ alignItems: 'flex-start' }}>
            <span>City</span>
            <div style={{ width: '100%' }}>
              <input type="text" name="headOfficeCity" value={organisationDraft.headOfficeCity || ''} onChange={handleOrganisationChange} placeholder="e.g. Mumbai" disabled={!isEditEnabled} />
            </div>
          </label>
          <label className="details-field full-field" style={{ alignItems: 'flex-start' }}>
            <span>Complete Postal Address</span>
            <div style={{ width: '100%' }}>
              <input type="text" name="headOfficeFullAddress" value={organisationDraft.headOfficeFullAddress || ''} onChange={handleOrganisationChange} placeholder="House no, Street, Landmark..." disabled={!isEditEnabled} />
            </div>
          </label>
          <label className="details-field" style={{ alignItems: 'flex-start' }}>
            <span>Pincode </span>
            <div style={{ width: '100%' }}>
              <input type="text" inputMode="numeric" autoComplete="off" name="headOfficePincode" value={organisationDraft.headOfficePincode || ''} onChange={(e) => { setOrganisationDraft((prev) => ({ ...prev, headOfficePincode: digitsOnlyValue(e.target.value).slice(0, 6) })) }} onKeyDown={allowOnlyDigits} onPaste={preventNonDigitPaste} placeholder="6-digit pincode" disabled={!isEditEnabled} maxLength="6" />
            </div>
          </label>
        </div>
      </div>

      <div className="office-block mt-3">
        <h4>Regional / Branch Offices</h4>
        <div className="multi-list">
          {branches.map((branch, idx) => (
            <div className="multi-form-entry card-look mb-1" key={branch.id}>
              <div className="multi-form-header">
                <span className="subheading-required">
                  <span className="subheading-text">Branch Location #{idx + 1}</span>
                  <span className="required-star" style={{ color: 'red' }}>*</span>
                </span>
                {branches.length > 1 && (
                  <button type="button" className="delete-entry-btn" onClick={() => handleRemoveBranch(branch.id)} disabled={!isEditEnabled}>✕ Remove</button>
                )}
              </div>
              <div className="branch-entry-form">
                <label className="details-field"><span>Branch Name</span><input type="text" name="branchName" value={branch.branchName} onChange={(e) => handleBranchChange(idx, e)} placeholder="e.g. Pune Regional" disabled={!isEditEnabled} /></label>
                <label className="details-field"><span>State</span><input type="text" name="state" value={branch.state} onChange={(e) => handleBranchChange(idx, e)} placeholder="State" disabled={!isEditEnabled} /></label>
                <label className="details-field"><span>City</span><input type="text" name="city" value={branch.city} onChange={(e) => handleBranchChange(idx, e)} placeholder="City" disabled={!isEditEnabled} /></label>
                <label className="details-field full-field"><span>Full Address</span><input type="text" name="address" value={branch.address} onChange={(e) => handleBranchChange(idx, e)} placeholder="Complete branch address" disabled={!isEditEnabled} /></label>
                <label className="details-field">
                  <span>Pincode </span>
                  <input type="text" inputMode="numeric" autoComplete="off" name="pincode" value={branch.pincode || ''} onChange={(e) => handleBranchChange(idx, e)} onKeyDown={allowOnlyDigits} onPaste={preventNonDigitPaste} placeholder="6-digit pincode" disabled={!isEditEnabled} maxLength="6" />
                </label>
              </div>
            </div>
          ))}
          <button type="button" className="add-more-section-btn" onClick={handleAddMoreBranch} disabled={!isEditEnabled}>+ Add Another Branch Office</button>
        </div>
      </div>

      <div className="office-block mt-3">
        <h4>Active Partners / Directors</h4>
        <div className="multi-list">
          {partners.map((partner, idx) => (
            <div className="multi-form-entry card-look mb-1" key={partner.id}>
              <div className="multi-form-header">
                <span className="subheading-required">
                  <span className="subheading-text">Executive Member #{idx + 1}</span>
                  <span className="required-star" style={{ color: 'red' }}>*</span>
                </span>
                {partners.length > 1 && (
                  <button type="button" className="delete-entry-btn" onClick={() => handleRemovePartner(partner.id)} disabled={!isEditEnabled}>✕ Remove</button>
                )}
              </div>
              <div className="partner-entry-form">
                <label className="details-field"><span>Full Name</span><input type="text" name="name" value={partner.name} onChange={(e) => handlePartnerChange(idx, e)} placeholder="Member name" disabled={!isEditEnabled} /></label>
                <label className="details-field"><span>Designation</span><input type="text" name="position" value={partner.position} onChange={(e) => handlePartnerChange(idx, e)} placeholder="e.g. MD / CEO" disabled={!isEditEnabled} /></label>
                <label className="details-field">
                  <span>Personal Mobile</span>
                  <input type="text" inputMode="numeric" autoComplete="off" name="phoneNumber" value={partner.phoneNumber} onChange={(e) => handlePartnerPhoneChange(idx, e)} onKeyDown={allowOnlyDigits} onPaste={preventNonDigitPaste} placeholder="Mobile number" disabled={!isEditEnabled} maxLength="10" />
                </label>
                <label className="details-field full-field"><span>Residential Address</span><input type="text" name="address" value={partner.address} onChange={(e) => handlePartnerChange(idx, e)} placeholder="Member complete address" disabled={!isEditEnabled} /></label>
                <label className="details-field">
                  <span>Pincode</span>
                  <input type="text" inputMode="numeric" autoComplete="off" name="pincode" value={partner.pincode || ''} onChange={(e) => handlePartnerChange(idx, e)} onKeyDown={allowOnlyDigits} onPaste={preventNonDigitPaste} placeholder="6-digit pincode" disabled={!isEditEnabled} maxLength="6" />
                </label>
                <label className="check-field">
                  <input type="checkbox" name="isAuthorized" checked={partner.isAuthorized} onChange={(e) => handlePartnerChange(idx, e)} disabled={!isEditEnabled} />
                  <span>Authorized person?</span>
                </label>
              </div>
            </div>
          ))}
          <button type="button" className="add-more-section-btn" onClick={handleAddMorePartner} disabled={!isEditEnabled}>+ Add Partner / Director</button>
        </div>
      </div>

      <div className="section-save-container mt-3">
        <div className="organisation-actions">
          <button
            type="button"
            className="save-all-details-btn"
            onClick={handleSaveBasicDetails}
            disabled={isSaving || (!isEditEnabled && hasActiveOrganization)}
          >
            {isSaving ? 'Synchronizing...' : (isUpdateMode ? 'Update' : 'Save')}
          </button>
          <button
            type="button"
            className="org-cancel-btn"
            onClick={handleCancelOrganisationEdit}
            disabled={!isEditEnabled && hasActiveOrganization}
          >
            Cancel
          </button>
        </div>
      </div>
    </section>
  )
}

export default Organisation
