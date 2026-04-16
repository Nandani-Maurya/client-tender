import { useState, useEffect } from 'react'
import alerts from '../../utils/alerts'
import * as categoryService from '../../services/category.service'
import * as projectTypeService from '../../services/projectType.service'
import { uploadDocument } from '../../services/document.service'
import { saveOrganization, getActiveOrganization } from '../../services/organization.service'
import './AddDetails.css'

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

const initialBankDraft = {
  bankName: '',
  branchName: '',
  accountHolderName: '',
  accountNumber: '',
  ifscCode: '',
  micrCode: '',
  accountType: '',
  upiId: '',
  bankStatementImage: null,
  bankStatementPreview: '',
  passbookImage: null,
  passbookPreview: ''
}

const initialProjectDraft = {
  projectTypeId: '',
  clientName: '',
  projectName: '',
  projectLocation: '',
  state: '',
  department: '',
  projectCost: '',
  consultancyFee: '',
  workOrderNumber: '',
  workOrderDate: '',
  completionCertificateDate: '',
  currentStatus: '',
  workOrderDocument: null,
  workOrderDocumentPreview: '',
  completionCertificateDocument: null,
  completionCertificateDocumentPreview: '',
  otherProjectDocuments: [],
  otherProjectDocumentsPreview: []
}

const projectInputFields = [
  { name: 'clientName', label: 'Name of Client' },
  { name: 'projectName', label: 'Name of Project / Assignment' },
  { name: 'projectLocation', label: 'Project Location' },
  { name: 'state', label: 'State' },
  { name: 'department', label: 'Department / Authority' },
  { name: 'projectCost', label: 'Project Cost' },
  { name: 'consultancyFee', label: 'Consultancy Fee' },
  { name: 'workOrderNumber', label: 'Work Order Number' },
  { name: 'workOrderDate', label: 'Work Order Date' },
  { name: 'completionCertificateDate', label: 'Completion Certificate Date' }
]

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

const uploadFields = [
  'PAN Card',
  'Aadhar Card',
  'Power of Attorney / Authorization Letter'
]

function AddDetails() {
  const [activeTab, setActiveTab] = useState('technical')
  const [activeTechnicalTab, setActiveTechnicalTab] = useState('tenderCategories')
  
  // Tender Categories State
  const [tenderCategories, setTenderCategories] = useState([])
  const [tenderCategoryMode, setTenderCategoryMode] = useState('list')
  const [tenderCategoryDraft, setTenderCategoryDraft] = useState({ 
    category_name: '', 
    category_description: '' 
  })
  const [editingTenderCategoryId, setEditingTenderCategoryId] = useState(null)

  const [projectTypes, setProjectTypes] = useState([])
  const [projectTypeMode, setProjectTypeMode] = useState('list')
  const [projectTypeDraft, setProjectTypeDraft] = useState({ 
    type_name: ''
  })
  const [editingProjectTypeId, setEditingProjectTypeId] = useState(null)
  const [organisationDraft, setOrganisationDraft] = useState(initialOrganisationDraft)
  const [branches, setBranches] = useState([{ ...initialBranchDraft, id: 'branch-1' }])
  const [contacts, setContacts] = useState([{ ...initialContactDraft, id: 'contact-1' }])
  const [partners, setPartners] = useState([{ ...initialPartnerDraft, id: 'partner-1' }])
  const [employeeDraft, setEmployeeDraft] = useState(initialEmployeeDraft)
  const [employees, setEmployees] = useState([])
  const [qualificationDraft, setQualificationDraft] = useState(initialQualificationDraft)
  const [viewingEmployee, setViewingEmployee] = useState(null)
  const [editingEmployeeId, setEditingEmployeeId] = useState(null)
  const [employeeMode, setEmployeeMode] = useState('table')
  const [projectDraft, setProjectDraft] = useState(initialProjectDraft)
  const [projects, setProjects] = useState([])
  const [isoCertificates, setIsoCertificates] = useState([{ ...initialIsoCertificateDraft, id: 'iso-1' }])
  const [bankDraft, setBankDraft] = useState(initialBankDraft)
  const [banks, setBanks] = useState([])
  const [editingBankId, setEditingBankId] = useState(null)
  const [showBankForm, setShowBankForm] = useState(false)
  const [viewingBankDocuments, setViewingBankDocuments] = useState(null)
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [editingProjectId, setEditingProjectId] = useState(null)
  const [viewingProjectDocuments, setViewingProjectDocuments] = useState(null)
  const [additionalDocuments, setAdditionalDocuments] = useState([])
  const [documentTypeDraft, setDocumentTypeDraft] = useState('')

  // Is it in update mode?
  const [isUpdateMode, setIsUpdateMode] = useState(false)
  
  useEffect(() => {
    fetchTenderCategories()
    fetchProjectTypes()
    loadActiveOrganization()
  }, [])

  async function loadActiveOrganization() {
    try {
      const res = await getActiveOrganization();
      if (res.success && res.data) {
        setIsUpdateMode(true);
        const org = res.data;
        
        setOrganisationDraft(prev => ({
          ...prev,
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
        }));
        
        if (org.contacts && org.contacts.length > 0) setContacts(org.contacts.map((c, i) => ({ id: `contact-fetch-${Date.now()}-${i}`, ...c })));
        if (org.branches && org.branches.length > 0) setBranches(org.branches.map((b, i) => ({ id: `branch-fetch-${Date.now()}-${i}`, branchName: b.branch_name, state: b.state, city: b.city, address: b.address })));
        if (org.partners && org.partners.length > 0) setPartners(org.partners.map((p, i) => ({ id: `partner-fetch-${Date.now()}-${i}`, name: p.name, position: p.position, phoneNumber: p.phone, address: p.address, isAuthorized: p.is_authorized })));
        
        if (org.iso_certificates && org.iso_certificates.length > 0) {
          setIsoCertificates(org.iso_certificates.map((iso, i) => ({
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

        if (org.bank_details && org.bank_details.length > 0) {
          setBanks(org.bank_details.map((bank, i) => ({
            id: `bank-fetch-${Date.now()}-${i}`,
            bankName: bank.bank_name || '',
            branchName: bank.branch_name || '',
            accountHolderName: bank.account_holder_name || '',
            accountNumber: bank.account_number || '',
            ifscCode: bank.ifsc_code || '',
            micrCode: bank.micr_code || '',
            accountType: bank.account_type || '',
            upiId: bank.upi_id || '',
            existingBankStatementId: bank.bank_statement_id,
            existingPassbookId: bank.passbook_id,
            bankStatementPreview: bank.bank_statement_url || '',
            passbookPreview: bank.passbook_url || ''
          })));
        }
      }
    } catch(err) {
      console.error(err);
    }
  }

  async function fetchProjectTypes() {
    try {
      const resp = await projectTypeService.getProjectTypes()
      if (resp.success) {
        setProjectTypes(resp.data)
      }
    } catch (err) {
      console.error('Failed to load project types', err)
    }
  }

  async function fetchTenderCategories() {
    try {
      const resp = await categoryService.getTenderCategories()
      if (resp.success) {
        setTenderCategories(resp.data)
      }
    } catch (err) {
      console.error('Failed to load categories', err)
    }
  }

  const handleTenderCategoryDraftChange = (e) => {
    const { name, value } = e.target
    setTenderCategoryDraft(prev => ({ ...prev, [name]: value }))
  }

  const handleSaveTenderCategory = async () => {
    if (!tenderCategoryDraft.category_name.trim()) {
      return alerts.error('Required', 'Category value is required')
    }

    const isEditing = !!editingTenderCategoryId
    alerts.loading(isEditing ? 'Updating...' : 'Saving...', isEditing ? 'Updating tender category' : 'Adding new tender category')
    
    try {
      let resp
      if (isEditing) {
        resp = await categoryService.updateTenderCategory(editingTenderCategoryId, tenderCategoryDraft)
      } else {
        resp = await categoryService.createTenderCategory(tenderCategoryDraft)
      }

      if (resp.success) {
        if (isEditing) {
          setTenderCategories(prev => prev.map(c => c.id === editingTenderCategoryId ? resp.data : c))
        } else {
          setTenderCategories(prev => [resp.data, ...prev])
        }
        
        setTenderCategoryMode('list')
        setTenderCategoryDraft({ category_name: '', category_description: '' })
        setEditingTenderCategoryId(null)
        alerts.success('Success', isEditing ? 'Category updated successfully' : 'Tender Category added successfully')
      } else {
        alerts.error('Error', resp.message)
      }
} catch {
      alerts.error('Connection Error', `Failed to ${isEditing ? 'update' : 'save'} category`)
    }
  }

  const handleEditTenderCategory = (cat) => {
    setTenderCategoryDraft({
      category_name: cat.category_name,
      category_description: cat.category_description
    })
    setEditingTenderCategoryId(cat.id)
    setTenderCategoryMode('form')
  }

  const handleDeleteTenderCategory = async (id) => {
    const confirm = await alerts.confirm('Are you sure?', 'You want to delete this record?')
    if (confirm.isConfirmed) {
      try {
        const resp = await categoryService.deleteTenderCategory(id)
        if (resp.success) {
          setTenderCategories(prev => prev.filter(c => c.id !== id))
          alerts.success('Deleted', 'Category deleted successfully')
        }
      } catch {
        alerts.error('Error', 'Failed to delete category')
      }
    }
  }

  // --- ISO Certificates (array of open forms) ---
  const handleIsoCertificateInputChange = (index, event) => {
    const { name, value } = event.target
    setIsoCertificates(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [name]: value }
      return updated
    })
  }

  const handleIsoCertificateImageChange = (index, event, imageType) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setIsoCertificates(prev => {
        const updated = [...prev]
        if (imageType === 'first') {
          updated[index] = { ...updated[index], firstImage: file, firstImageName: file.name, firstImagePreview: reader.result }
        } else {
          updated[index] = { ...updated[index], secondImage: file, secondImageName: file.name, secondImagePreview: reader.result }
        }
        return updated
      })
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveIsoCertificateImage = (index, imageType) => {
    setIsoCertificates(prev => {
      const updated = [...prev]
      if (imageType === 'first') {
        updated[index] = { ...updated[index], firstImage: null, firstImageName: '', firstImagePreview: '' }
      } else {
        updated[index] = { ...updated[index], secondImage: null, secondImageName: '', secondImagePreview: '' }
      }
      return updated
    })
  }

  const handleAddMoreIsoCertificate = () => {
    setIsoCertificates(prev => [...prev, { ...initialIsoCertificateDraft, id: `iso-${Date.now()}` }])
  }

  const handleRemoveIsoCertificate = (id) => {
    setIsoCertificates(prev => prev.filter(c => c.id !== id))
  }

  // --- Branches (array of open forms) ---
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

  // --- Contacts (array of open forms) ---
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

  // --- Partners (array of open forms) ---
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

  const handleOrganisationChange = (event) => {
    const { name, value } = event.target
    setOrganisationDraft((prev) => ({ ...prev, [name]: value }))
  }

  // Loading state for saving
  const [isSavingOrg, setIsSavingOrg] = useState(false)

  const handleSaveAllOrganizationDetails = async () => {
    setIsSavingOrg(true)
    try {
      // Basic validation
      const hasData = organisationFields.some(({ name }) => organisationDraft[name].trim())
      if (!hasData) {
        alerts.error('No Data', 'Please fill the organization details before saving.')
        setIsSavingOrg(false)
        return
      }

      alerts.info('Uploading...', 'Uploading documents and saving data please wait.')

      const processedIso = []
      // Sequential file upload for ISO certificates to avoid backend spike
      for (const iso of isoCertificates) {
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

      // Cleanup ID/Draft UI properties properly sending arrays
      const payload = {
        name_of_firm: organisationDraft.nameOfFirm,
        registration_number: organisationDraft.registrationNumber,
        registration_date: organisationDraft.registrationDate,
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
        partners: partners.filter(p => p.name.trim()).map(p => ({ name: p.name, position: p.position, phone: p.phoneNumber, address: p.address, is_authorized: p.isAuthorized })),
        iso_certificates: processedIso,
        bank_details: banks.map(b => ({
          bank_name: b.bankName,
          branch_name: b.branchName,
          account_holder_name: b.accountHolderName,
          account_number: b.accountNumber,
          ifsc_code: b.ifscCode,
          micr_code: b.micrCode,
          account_type: b.accountType,
          upi_id: b.upiId,
          bank_statement_id: b.existingBankStatementId || null, // Note: We should ideally upload new docs here too if they changed
          passbook_id: b.existingPassbookId || null
        }))
      }

      const res = await saveOrganization(payload)
      if (res.success) {
        alerts.success('Success', res.message)
        setIsUpdateMode(true)
      } else {
        alerts.error('Failed', res.message || 'Error occurred while saving organization')
      }

    } catch (err) {
      console.error(err)
      alerts.error('Error', 'An unexpected error occurred.')
    } finally {
      setIsSavingOrg(false)
    }
  }

  const handleBankChange = (event) => {
    const { name, value } = event.target
    setBankDraft((prev) => ({
      ...prev,
      [name]: value
    }))
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

  const handleOpenBankForm = () => {
    setShowBankForm(true)
    setEditingBankId(null)
    setBankDraft(initialBankDraft)
  }

  const handleEditBank = (bank) => {
    setEditingBankId(bank.id)
    setBankDraft(bank)
  }

  const handleSaveBank = () => {
    if (!bankDraft.bankName.trim() || !bankDraft.accountNumber.trim()) {
      return
    }

    if (editingBankId) {
      setBanks((prev) =>
        prev.map((bank) =>
          bank.id === editingBankId
            ? { ...bank, ...bankDraft }
            : bank
        )
      )
      setEditingBankId(null)
    } else {
      setBanks((prev) => [
        ...prev,
        {
          id: `bank-${prev.length + 1}`,
          ...bankDraft
        }
      ])
    }

    setBankDraft(initialBankDraft)
  }

  const handleCancelEditBank = () => {
    setEditingBankId(null)
    setBankDraft(initialBankDraft)
  }

  const handleRemoveBank = (bankId) => {
    setBanks((prev) => prev.filter((bank) => bank.id !== bankId))
  }


  const handleProjectChange = (event) => {
    const { name, value } = event.target
    setProjectDraft((prev) => ({ ...prev, [name]: value }))
  }

  const handleRemoveProject = (projectId) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId))
  }

  const handleRemoveQualification = (qualId) => {
    setEmployeeDraft((prev) => ({
      ...prev,
      qualifications: prev.qualifications.filter(q => q.id !== qualId)
    }))
  }

  const handleEmployeeChange = (event) => {
    const { name, value } = event.target
    setEmployeeDraft((prev) => ({ ...prev, [name]: value }))
  }

  const handleQualificationChange = (event) => {
    const { name, value } = event.target
    setQualificationDraft((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddQualification = () => {
    if (!qualificationDraft.qualification.trim()) {
      return
    }
    setEmployeeDraft((prev) => ({
      ...prev,
      qualifications: [...prev.qualifications, { ...qualificationDraft, id: `qual-${prev.qualifications.length + 1}` }]
    }))
    setQualificationDraft(initialQualificationDraft)
  }

  const handleAddEmployee = () => {
    if (!employeeDraft.name.trim()) {
      return
    }

    if (editingEmployeeId) {
      setEmployees((prev) => prev.map(emp => emp.id === editingEmployeeId ? { ...employeeDraft, id: editingEmployeeId } : emp))
      setEditingEmployeeId(null)
    } else {
      setEmployees((prev) => [
        ...prev,
        {
          id: `employee-${prev.length + 1}`,
          ...employeeDraft
        }
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

  const handleViewEmployee = (employee) => {
    setViewingEmployee(employee)
  }

  const handleTechnicalTabChange = (tabName) => {
    // 1. Reset Modes (Always show Table/List first)
    setTenderCategoryMode('list')
    setProjectTypeMode('list')
    setEmployeeMode('table')
    setShowBankForm(false)
    setShowProjectForm(false)
    
    // 2. Reset Selection/Edit states
    setEditingTenderCategoryId(null)
    setEditingProjectTypeId(null)
    setEditingEmployeeId(null)
    setEditingBankId(null)
    setEditingProjectId(null)
    setViewingEmployee(null)
    setViewingBankDocuments(null)
    setViewingProjectDocuments(null)

    // 3. Clear/Reset Drafts (Clear input fields)
    setTenderCategoryDraft({ category_name: '', category_description: '' })
    setProjectTypeDraft({ type_name: '' })
    // setOrganisationDraft(initialOrganisationDraft) - STOP CLEARING THIS
    setBankDraft(initialBankDraft)
    setProjectDraft(initialProjectDraft)
    setEmployeeDraft(initialEmployeeDraft)
    setQualificationDraft(initialQualificationDraft)
    setDocumentTypeDraft('')

    // 4. Set Active Tab
    setActiveTechnicalTab(tabName)
  }

  const handleProjectTypeDraftChange = (e) => {
    const { name, value } = e.target
    setProjectTypeDraft(prev => ({ ...prev, [name]: value }))
  }

  const handleSaveProjectType = async () => {
    if (!projectTypeDraft.type_name.trim()) {
      return alerts.error('Required', 'Project type name is required')
    }

    const isEditing = !!editingProjectTypeId
    alerts.loading(isEditing ? 'Updating...' : 'Saving...', isEditing ? 'Updating project type' : 'Adding project type')

    try {
      let resp
      if (isEditing) {
        resp = await projectTypeService.updateProjectType(editingProjectTypeId, projectTypeDraft)
      } else {
        resp = await projectTypeService.createProjectType(projectTypeDraft)
      }

      if (resp.success) {
        if (isEditing) {
          setProjectTypes(prev => prev.map(t => t.id === editingProjectTypeId ? resp.data : t))
        } else {
          setProjectTypes(prev => [...prev, resp.data])
        }

        setProjectTypeMode('list')
        setProjectTypeDraft({ type_name: '', type_code: '' })
        setEditingProjectTypeId(null)
        alerts.success('Success', isEditing ? 'Project type updated' : 'Project type added')
      } else {
        alerts.error('Error', resp.message)
      }
    } catch {
      alerts.error('Error', 'API Connection failed')
    }
  }

  const handleEditProjectType = (type) => {
    setProjectTypeDraft({
      type_name: type.type_name
    })
    setEditingProjectTypeId(type.id)
    setProjectTypeMode('form')
  }

  const handleDeleteProjectType = async (id) => {
    const confirm = await alerts.confirm('Are you sure?', 'You want to delete this record?')
    if (confirm.isConfirmed) {
      try {
        const resp = await projectTypeService.deleteProjectType(id)
        if (resp.success) {
          setProjectTypes(prev => prev.filter(t => t.id !== id))
          alerts.success('Deleted', 'Project type deleted successfully')
        }
      } catch {
        alerts.error('Error', 'Failed to delete')
      }
    }
  }

  const handleEditEmployee = (employee) => {
    setEmployeeDraft(employee)
    setEditingEmployeeId(employee.id)
    setViewingEmployee(null)
    setEmployeeMode('form')
  }

  const handleDeleteEmployee = (employeeId) => {
    setEmployees((prev) => prev.filter(emp => emp.id !== employeeId))
  }

  const handleAddAdditionalDocument = () => {
    if (!documentTypeDraft.trim()) {
      return
    }

    setAdditionalDocuments((prev) => [
      ...prev,
      {
        id: `additional-doc-${prev.length + 1}`,
        type: documentTypeDraft,
        file: null,
        fileName: '',
        preview: ''
      }
    ])
    setDocumentTypeDraft('')
  }

  const handleAdditionalDocumentFileChange = (docId, event) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAdditionalDocuments((prev) =>
          prev.map(doc =>
            doc.id === docId
              ? { ...doc, file, fileName: file.name, preview: reader.result }
              : doc
          )
        )
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveAdditionalDocument = (docId) => {
    setAdditionalDocuments((prev) => prev.filter(doc => doc.id !== docId))
  }



  const handleProjectImageChange = (event, docType) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (docType === 'workOrder') {
          setProjectDraft((prev) => ({
            ...prev,
            workOrderDocument: file,
            workOrderDocumentPreview: reader.result
          }))
        } else if (docType === 'completionCertificate') {
          setProjectDraft((prev) => ({
            ...prev,
            completionCertificateDocument: file,
            completionCertificateDocumentPreview: reader.result
          }))
        } else if (docType === 'other') {
          setProjectDraft((prev) => ({
            ...prev,
            otherProjectDocuments: [...prev.otherProjectDocuments, file],
            otherProjectDocumentsPreview: [...prev.otherProjectDocumentsPreview, reader.result]
          }))
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveProjectImage = (docType, index) => {
    if (docType === 'workOrder') {
      setProjectDraft((prev) => ({
        ...prev,
        workOrderDocument: null,
        workOrderDocumentPreview: ''
      }))
    } else if (docType === 'completionCertificate') {
      setProjectDraft((prev) => ({
        ...prev,
        completionCertificateDocument: null,
        completionCertificateDocumentPreview: ''
      }))
    } else if (docType === 'other') {
      setProjectDraft((prev) => ({
        ...prev,
        otherProjectDocuments: prev.otherProjectDocuments.filter((_, i) => i !== index),
        otherProjectDocumentsPreview: prev.otherProjectDocumentsPreview.filter((_, i) => i !== index)
      }))
    }
  }

  const handleOpenProjectForm = () => {
    setShowProjectForm(true)
    setEditingProjectId(null)
    setProjectDraft(initialProjectDraft)
  }

  const handleEditProject = (project) => {
    setEditingProjectId(project.id)
    setProjectDraft(project)
    setShowProjectForm(true)
  }

  const handleSaveProject = () => {
    if (!projectDraft.projectTypeId || !projectDraft.projectName.trim()) {
      return
    }

    const selectedType = projectTypes.find((type) => type.id === projectDraft.projectTypeId)

    if (editingProjectId) {
      setProjects((prev) =>
        prev.map((project) =>
          project.id === editingProjectId
            ? { ...project, ...projectDraft, projectTypeLabel: selectedType?.label || '' }
            : project
        )
      )
      setEditingProjectId(null)
    } else {
      setProjects((prev) => [
        ...prev,
        {
          id: `project-${prev.length + 1}`,
          ...projectDraft,
          projectTypeLabel: selectedType?.label || ''
        }
      ])
    }

    setProjectDraft(initialProjectDraft)
  }

  const handleCancelEditProject = () => {
    setEditingProjectId(null)
    setProjectDraft(initialProjectDraft)
  }

  const openAddProjectType = () => {
    setProjectTypeDraft({ type_name: '' })
    setEditingProjectTypeId(null)
    setProjectTypeMode('form')
  }

  const closeProjectTypeForm = () => {
    setProjectTypeDraft({ type_name: '' })
    setEditingProjectTypeId(null)
    setProjectTypeMode('list')
  }

  return (
    <section className="add-details-page">
      <div className="details-header">
        <div>
          <h2>Add Details</h2>
          <p>Fill technical information and upload supporting documents.</p>
        </div>
      </div>

      <div className="details-tabs">
        <button
          type="button"
          className={`details-tab ${activeTab === 'technical' ? 'active' : ''}`}
          onClick={() => setActiveTab('technical')}
        >
          Technical Details
        </button>
        <button
          type="button"
          className={`details-tab ${activeTab === 'financial' ? 'active' : ''}`}
          onClick={() => setActiveTab('financial')}
        >
          Financial Details
        </button>
      </div>

      {activeTab === 'technical' ? (
        <form className="technical-form">
          <div className="technical-subtabs">
            <button
              type="button"
              className={`technical-subtab ${activeTechnicalTab === 'tenderCategories' ? 'active' : ''}`}
              onClick={() => handleTechnicalTabChange('tenderCategories')}
            >
              Tender Categories
            </button>
            <button
              type="button"
              className={`technical-subtab ${activeTechnicalTab === 'projectTypes' ? 'active' : ''}`}
              onClick={() => handleTechnicalTabChange('projectTypes')}
            >
              Project Types
            </button>
            <button
              type="button"
              className={`technical-subtab ${activeTechnicalTab === 'organisation' ? 'active' : ''}`}
              onClick={() => handleTechnicalTabChange('organisation')}
            >
              Organization
            </button>
            <button
              type="button"
              className={`technical-subtab ${activeTechnicalTab === 'bank' ? 'active' : ''}`}
              onClick={() => handleTechnicalTabChange('bank')}
            >
              Bank Details
            </button>
            <button
              type="button"
              className={`technical-subtab ${activeTechnicalTab === 'projects' ? 'active' : ''}`}
              onClick={() => handleTechnicalTabChange('projects')}
            >
              Project Experience
            </button>
            <button
              type="button"
              className={`technical-subtab ${activeTechnicalTab === 'employees' ? 'active' : ''}`}
              onClick={() => handleTechnicalTabChange('employees')}
            >
              Employee Bio-data
            </button>
            <button
              type="button"
              className={`technical-subtab ${activeTechnicalTab === 'documents' ? 'active' : ''}`}
              onClick={() => handleTechnicalTabChange('documents')}
            >
              Documents
            </button>
          </div>

          {activeTechnicalTab === 'tenderCategories' && (
            <FormSection title="Tender Category Management">
              <p className="section-helper">
                Identify tender category types (e.g. NIT, RFP, EOI). Short forms are saved as values, full forms as descriptions.
              </p>

              {tenderCategoryMode === 'list' ? (
                <>
                  <div className="section-actions">
                    <button type="button" onClick={() => setTenderCategoryMode('form')}>
                      + Add New Category
                    </button>
                  </div>

                  <div className="project-type-table">
                    <div className="tender-category-row table-heading">
                      <span>Category Value</span>
                      <span>Description</span>
                      <span>Action</span>
                    </div>

                    {tenderCategories.length === 0 ? (
                      <div className="empty-project-row">No categories found in system.</div>
                    ) : (
                      tenderCategories.map((cat) => (
                        <div className="tender-category-row" key={cat.id}>
                          <span className="bold-label">{cat.category_name}</span>
                          <span>{cat.category_description || '-'}</span>
                          <div className="row-actions">
                            <button
                              type="button"
                              className="edit-row-btn"
                              onClick={() => handleEditTenderCategory(cat)}
                            >
                              Edit
                            </button>
                            <button 
                              type="button" 
                              className="delete-row-btn"
                              onClick={() => handleDeleteTenderCategory(cat.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <div className="premium-compact-form">
                  <div className="details-grid">
                    <label className="details-field">
                      <span>Category Value (Short Form) *</span>
                      <input
                        type="text"
                        name="category_name"
                        value={tenderCategoryDraft.category_name}
                        onChange={handleTenderCategoryDraftChange}
                        placeholder="e.g. NIT"
                        required
                      />
                    </label>
                    <label className="details-field">
                      <span>Full Description</span>
                      <input
                        type="text"
                        name="category_description"
                        value={tenderCategoryDraft.category_description}
                        onChange={handleTenderCategoryDraftChange}
                        placeholder="e.g. Notice Inviting Tender"
                      />
                    </label>
                  </div>

                  <div className="form-submit-actions">
                    <button type="button" onClick={handleSaveTenderCategory} className="save-btn">
                      Save
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        setTenderCategoryMode('list')
                        setEditingTenderCategoryId(null)
                        setTenderCategoryDraft({ category_name: '', category_description: '' })
                      }} 
                      className="cancel-btn"
                    >
                      Back to List
                    </button>
                  </div>
                </div>
              )}
            </FormSection>
          )}

          {activeTechnicalTab === 'projectTypes' && (
            <FormSection title="Project Type Setup">
              <p className="section-helper">
                Manage project specializations (e.g. Architectural, Civil). Code is used for internal reference.
              </p>

              {projectTypeMode === 'list' ? (
                <>
                  <div className="section-actions">
                    <button type="button" onClick={openAddProjectType}>
                      + Add Project Type
                    </button>
                  </div>

                  <div className="project-type-table">
                    <div className="project-type-row-v2 table-heading">
                      <span>Type Name</span>
                      <span>Action</span>
                    </div>

                    {projectTypes.length === 0 ? (
                      <div className="empty-project-row">No project types found.</div>
                    ) : (
                      projectTypes.map((type) => (
                        <div className="project-type-row-v2" key={type.id}>
                          <span className="bold-label">{type.type_name}</span>
                          <div className="row-actions">
                            <button 
                              type="button" 
                              className="edit-row-btn"
                              onClick={() => handleEditProjectType(type)}
                            >
                              Edit
                            </button>
                            <button 
                              type="button" 
                              className="delete-row-btn"
                              onClick={() => handleDeleteProjectType(type.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <div className="premium-compact-form">
                  <div className="details-grid" style={{ gridTemplateColumns: '1fr' }}>
                    <label className="details-field">
                      <span>Type Name *</span>
                      <input
                        type="text"
                        name="type_name"
                        value={projectTypeDraft.type_name}
                        onChange={handleProjectTypeDraftChange}
                        placeholder="e.g. Architectural"
                        required
                      />
                    </label>
                  </div>

                  <div className="form-submit-actions">
                    <button type="button" onClick={handleSaveProjectType} className="save-btn">
                      Save
                    </button>
                    <button 
                      type="button" 
                      onClick={closeProjectTypeForm}
                      className="cancel-btn"
                    >
                      Back to List
                    </button>
                  </div>
                </div>
              )}
            </FormSection>
          )}

          {activeTechnicalTab === 'organisation' && (
            <FormSection title="Organization Details">
              <div className="details-grid">
                {organisationFields.map(({ name, label }) => (
                  <label className="details-field" key={name}>
                    <span>{label}</span>
                    <input
                      type={name === 'registrationDate' ? 'date' : (name.includes('year') || name.includes('Year')) ? 'number' : 'text'}
                      name={name}
                      value={organisationDraft[name]}
                      onChange={handleOrganisationChange}
                      placeholder={`Enter ${label.toLowerCase()}`}
                    />
                  </label>
                ))}
              </div>

              {/* ---- ISO Certificates ---- */}
              <div className="office-block">
                <h4>ISO Certificate Details</h4>

                {isoCertificates.map((cert, idx) => (
                  <div className="multi-form-entry" key={cert.id}>
                    <div className="multi-form-header">
                      <span>ISO Certificate #{idx + 1}</span>
                      {isoCertificates.length > 1 && (
                        <button type="button" className="delete-entry-btn" onClick={() => handleRemoveIsoCertificate(cert.id)}>
                          ✕ Delete this form
                        </button>
                      )}
                    </div>
                    <div className="iso-cert-entry-form">
                      <label className="details-field">
                        <span>Certificate Type</span>
                        <input
                          type="text"
                          name="certificateType"
                          value={cert.certificateType}
                          onChange={(e) => handleIsoCertificateInputChange(idx, e)}
                          placeholder="e.g., ISO 9001, ISO 27001, ISO 45001"
                        />
                      </label>
                      <label className="details-field">
                        <span>Year of Certification</span>
                        <input
                          type="number"
                          name="year"
                          value={cert.year}
                          onChange={(e) => handleIsoCertificateInputChange(idx, e)}
                          placeholder="e.g., 2024"
                          min="1990"
                          max={new Date().getFullYear()}
                        />
                      </label>
                    </div>
                    <div className="iso-certificate-upload">
                      <div className="iso-image-section">
                        <h5>First Certificate Image</h5>
                        {cert.firstImagePreview ? (
                          <div className="image-preview-container">
                            <img src={cert.firstImagePreview} alt="ISO Cert 1" className="image-preview" />
                            <button type="button" className="remove-image-btn" onClick={() => handleRemoveIsoCertificateImage(idx, 'first')}>Remove</button>
                          </div>
                        ) : (
                          <label className="image-upload-field">
                            <span>📸 Upload certificate image</span>
                            <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => handleIsoCertificateImageChange(idx, e, 'first')} />
                          </label>
                        )}
                      </div>
                      <div className="iso-image-section">
                        <h5>Second Certificate Image (Optional)</h5>
                        {cert.secondImagePreview ? (
                          <div className="image-preview-container">
                            <img src={cert.secondImagePreview} alt="ISO Cert 2" className="image-preview" />
                            <button type="button" className="remove-image-btn" onClick={() => handleRemoveIsoCertificateImage(idx, 'second')}>Remove</button>
                          </div>
                        ) : (
                          <label className="image-upload-field">
                            <span>📸 Upload certificate image</span>
                            <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => handleIsoCertificateImageChange(idx, e, 'second')} />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" className="add-more-section-btn" onClick={handleAddMoreIsoCertificate}>
                  + Add More ISO Certificate
                </button>
              </div>

              {/* ---- Contact Numbers ---- */}
              <div className="office-block">
                <h4>Telephone / Mobile Numbers</h4>

                {contacts.map((contact, idx) => (
                  <div className="multi-form-entry" key={contact.id}>
                    <div className="multi-form-header">
                      <span>Contact #{idx + 1}</span>
                      {contacts.length > 1 && (
                        <button type="button" className="delete-entry-btn" onClick={() => handleRemoveContact(contact.id)}>
                          ✕ Delete this form
                        </button>
                      )}
                    </div>
                    <div className="contact-entry-form">
                      <label className="details-field">
                        <span>Contact Type</span>
                        <select name="type" value={contact.type} onChange={(e) => handleContactChange(idx, e)}>
                          <option value="Telephone">Telephone</option>
                          <option value="Mobile">Mobile</option>
                          <option value="Alternate Mobile">Alternate Mobile</option>
                        </select>
                      </label>
                      <label className="details-field">
                        <span>Number</span>
                        <input
                          type="text"
                          name="number"
                          value={contact.number}
                          onChange={(e) => handleContactChange(idx, e)}
                          placeholder="Enter phone number"
                        />
                      </label>
                    </div>
                  </div>
                ))}
                <button type="button" className="add-more-section-btn" onClick={handleAddMoreContact}>
                  + Add More Number
                </button>
              </div>

              {/* ---- Head Office ---- */}
              <div className="office-block">
                <h4>Head Office Details</h4>
                <div className="details-grid">
                  <label className="details-field">
                    <span>Head Office State</span>
                    <input 
                      type="text" 
                      name="headOfficeState"
                      placeholder="Enter state" 
                      value={organisationDraft.headOfficeState || ''}
                      onChange={handleOrganisationChange}
                    />
                  </label>
                  <label className="details-field">
                    <span>Head Office City</span>
                    <input 
                      type="text" 
                      name="headOfficeCity"
                      placeholder="Enter city" 
                      value={organisationDraft.headOfficeCity || ''}
                      onChange={handleOrganisationChange}
                    />
                  </label>
                  <label className="details-field full-field">
                    <span>Head Office Full Address</span>
                    <input 
                      type="text" 
                      name="headOfficeFullAddress"
                      placeholder="Enter full address" 
                      value={organisationDraft.headOfficeFullAddress || ''}
                      onChange={handleOrganisationChange}
                    />
                  </label>
                </div>
              </div>

              {/* ---- Branch Offices ---- */}
              <div className="office-block">
                <h4>Branch Office Details</h4>

                {branches.map((branch, idx) => (
                  <div className="multi-form-entry" key={branch.id}>
                    <div className="multi-form-header">
                      <span>Branch #{idx + 1}</span>
                      {branches.length > 1 && (
                        <button type="button" className="delete-entry-btn" onClick={() => handleRemoveBranch(branch.id)}>
                          ✕ Delete this form
                        </button>
                      )}
                    </div>
                    <div className="branch-entry-form">
                      <label className="details-field">
                        <span>Branch Name / Location</span>
                        <input type="text" name="branchName" value={branch.branchName} onChange={(e) => handleBranchChange(idx, e)} placeholder="e.g., Madhya Pradesh Branch" />
                      </label>
                      <label className="details-field">
                        <span>State</span>
                        <input type="text" name="state" value={branch.state} onChange={(e) => handleBranchChange(idx, e)} placeholder="e.g., Madhya Pradesh" />
                      </label>
                      <label className="details-field">
                        <span>City</span>
                        <input type="text" name="city" value={branch.city} onChange={(e) => handleBranchChange(idx, e)} placeholder="Enter city" />
                      </label>
                      <label className="details-field full-field">
                        <span>Branch Full Address</span>
                        <input type="text" name="address" value={branch.address} onChange={(e) => handleBranchChange(idx, e)} placeholder="Enter complete branch address" />
                      </label>
                    </div>
                  </div>
                ))}
                <button type="button" className="add-more-section-btn" onClick={handleAddMoreBranch}>
                  + Add More Branch
                </button>
              </div>

              {/* ---- Partners / Directors ---- */}
              <div className="office-block">
                <h4>Partners / Directors</h4>

                {partners.map((partner, idx) => (
                  <div className="multi-form-entry" key={partner.id}>
                    <div className="multi-form-header">
                      <span>Partner / Director #{idx + 1}</span>
                      {partners.length > 1 && (
                        <button type="button" className="delete-entry-btn" onClick={() => handleRemovePartner(partner.id)}>
                          ✕ Delete this form
                        </button>
                      )}
                    </div>
                    <div className="partner-entry-form">
                      <label className="details-field">
                        <span>Name</span>
                        <input type="text" name="name" value={partner.name} onChange={(e) => handlePartnerChange(idx, e)} placeholder="Enter partner/director name" />
                      </label>
                      <label className="details-field">
                        <span>Position</span>
                        <input type="text" name="position" value={partner.position} onChange={(e) => handlePartnerChange(idx, e)} placeholder="Enter position" />
                      </label>
                      <label className="details-field">
                        <span>Phone Number</span>
                        <input type="text" name="phoneNumber" value={partner.phoneNumber} onChange={(e) => handlePartnerChange(idx, e)} placeholder="Enter phone number" />
                      </label>
                      <label className="details-field full-field">
                        <span>Address</span>
                        <input type="text" name="address" value={partner.address} onChange={(e) => handlePartnerChange(idx, e)} placeholder="Enter address" />
                      </label>
                      <label className="check-field">
                        <input type="checkbox" name="isAuthorized" checked={partner.isAuthorized} onChange={(e) => handlePartnerChange(idx, e)} />
                        <span>Authorized person</span>
                      </label>
                    </div>
                  </div>
                ))}
                <button type="button" className="add-more-section-btn" onClick={handleAddMorePartner}>
                  + Add More Partner / Director
                </button>
              </div>

              {/* ---- Single Save All Button ---- */}
              <div className="save-all-section">
                <button
                  type="button"
                  className="save-all-org-btn"
                  onClick={handleSaveAllOrganizationDetails}
                  disabled={isSavingOrg}
                >
                  {isSavingOrg ? '⏳ UPDATING...' : (isUpdateMode ? '📝 UPDATE ALL ORGANIZATION DETAILS' : '💾 SAVE ALL ORGANIZATION DETAILS')}
                </button>
              </div>

            </FormSection>
          )}



          {activeTechnicalTab === 'bank' && (
            <FormSection title="Bank Details">
              {!showBankForm ? (
                <>
                  <div className="bank-table">
                    <div className="bank-row table-heading">
                      <span>Bank Name</span>
                      <span>Account Holder</span>
                      <span>Account Number</span>
                      <span>Account Type</span>
                      <span>Documents</span>
                      <span>Action</span>
                    </div>

                    {banks.length === 0 ? (
                      <div className="empty-project-row">No bank details added yet.</div>
                    ) : (
                      banks.map((bank) => (
                        <div className="bank-row" key={bank.id}>
                          <span>{bank.bankName}</span>
                          <span>{bank.accountHolderName || '-'}</span>
                          <span>{bank.accountNumber}</span>
                          <span>{bank.accountType || '-'}</span>
                          <button
                            type="button"
                            className="view-docs-btn"
                            onClick={() => setViewingBankDocuments(viewingBankDocuments?.id === bank.id ? null : bank)}
                          >
                            {(bank.bankStatementPreview || bank.passbookPreview) ? '📄 View' : 'No Docs'}
                          </button>
                          <div className="bank-actions">
                            <button
                              type="button"
                              className="edit-bank-btn"
                              onClick={() => {
                                handleEditBank(bank)
                                setShowBankForm(true)
                              }}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="delete-bank-btn"
                              onClick={() => handleRemoveBank(bank.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {viewingBankDocuments && (
                    <div className="bank-documents-viewer">
                      <h4>Documents for {viewingBankDocuments.bankName}</h4>
                      <div className="documents-preview-grid">
                        {viewingBankDocuments.bankStatementPreview && (
                          <div className="doc-preview-item">
                            <h5>Bank Statement</h5>
                            <img src={viewingBankDocuments.bankStatementPreview} alt="Bank Statement" className="doc-preview-image" />
                          </div>
                        )}
                        {viewingBankDocuments.passbookPreview && (
                          <div className="doc-preview-item">
                            <h5>Passbook</h5>
                            <img src={viewingBankDocuments.passbookPreview} alt="Passbook" className="doc-preview-image" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="project-actions">
                    <button type="button" onClick={handleOpenBankForm}>
                      + Add Bank Details
                    </button>
                  </div>
                </>
              ) : (
                <div className="bank-form-section">
                  <h4>{editingBankId ? 'Edit Bank Details' : 'Add New Bank Account'}</h4>
                  
                  <div className="bank-entry-form">
                    <label className="details-field">
                      <span>Bank Name</span>
                      <input
                        type="text"
                        name="bankName"
                        value={bankDraft.bankName}
                        onChange={handleBankChange}
                        placeholder="Enter bank name"
                      />
                    </label>
                    <label className="details-field">
                      <span>Branch Name</span>
                      <input
                        type="text"
                        name="branchName"
                        value={bankDraft.branchName}
                        onChange={handleBankChange}
                        placeholder="Enter branch name"
                      />
                    </label>
                    <label className="details-field">
                      <span>Account Holder Name</span>
                      <input
                        type="text"
                        name="accountHolderName"
                        value={bankDraft.accountHolderName}
                        onChange={handleBankChange}
                        placeholder="Enter account holder name"
                      />
                    </label>
                    <label className="details-field">
                      <span>Account Number</span>
                      <input
                        type="text"
                        name="accountNumber"
                        value={bankDraft.accountNumber}
                        onChange={handleBankChange}
                        placeholder="Enter account number"
                      />
                    </label>
                    <label className="details-field">
                      <span>IFSC Code</span>
                      <input
                        type="text"
                        name="ifscCode"
                        value={bankDraft.ifscCode}
                        onChange={handleBankChange}
                        placeholder="Enter IFSC code"
                      />
                    </label>
                    <label className="details-field">
                      <span>MICR Code</span>
                      <input
                        type="text"
                        name="micrCode"
                        value={bankDraft.micrCode}
                        onChange={handleBankChange}
                        placeholder="Enter MICR code"
                      />
                    </label>
                    <label className="details-field">
                      <span>Account Type</span>
                      <select
                        name="accountType"
                        value={bankDraft.accountType}
                        onChange={handleBankChange}
                      >
                        <option value="">Select account type</option>
                        <option value="Savings">Savings</option>
                        <option value="Current">Current</option>
                        <option value="Business">Business</option>
                      </select>
                    </label>
                    <label className="details-field">
                      <span>UPI ID</span>
                      <input
                        type="text"
                        name="upiId"
                        value={bankDraft.upiId}
                        onChange={handleBankChange}
                        placeholder="Enter UPI ID"
                      />
                    </label>
                  </div>

                  <div className="bank-documents-section">
                    <h4>Bank Documents</h4>
                    <div className="bank-documents-grid">
                      <div className="bank-doc-upload">
                        <h5>Bank Statement</h5>
                        {bankDraft.bankStatementPreview ? (
                          <div className="image-preview-container">
                            <img src={bankDraft.bankStatementPreview} alt="Bank Statement" className="image-preview" />
                            <button
                              type="button"
                              className="remove-image-btn"
                              onClick={() => handleRemoveBankImage('statement')}
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <label className="image-upload-field">
                            <span>📄 Click to upload statement</span>
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleBankImageChange(e, 'statement')}
                            />
                          </label>
                        )}
                      </div>

                      <div className="bank-doc-upload">
                        <h5>Passbook</h5>
                        {bankDraft.passbookPreview ? (
                          <div className="image-preview-container">
                            <img src={bankDraft.passbookPreview} alt="Passbook" className="image-preview" />
                            <button
                              type="button"
                              className="remove-image-btn"
                              onClick={() => handleRemoveBankImage('passbook')}
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <label className="image-upload-field">
                            <span>📄 Click to upload passbook</span>
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleBankImageChange(e, 'passbook')}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="project-actions">
                    {editingBankId ? (
                      <>
                        <button type="button" onClick={() => {
                          handleSaveBank()
                          setShowBankForm(false)
                        }} className="save-btn">
                          Update Bank
                        </button>
                        <button type="button" onClick={handleCancelEditBank} className="cancel-btn">
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button type="button" onClick={() => {
                          handleSaveBank()
                          setShowBankForm(false)
                        }}>
                          Save Bank Details
                        </button>
                        <button type="button" onClick={() => setShowBankForm(false)} className="cancel-btn">
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </FormSection>
          )}

          {activeTechnicalTab === 'projects' && (
            <FormSection title="Project Experience Details">
              {!showProjectForm ? (
                <>
                  <div className="project-table">
                    <div className="project-row table-heading">
                      <span>Client Name</span>
                      <span>Project/Assignment</span>
                      <span>Cost (Lacs)</span>
                      <span>Consultancy Fee</span>
                      <span>Work Order Date</span>
                      <span>Completion Date</span>
                      <span>Documents</span>
                      <span>Action</span>
                    </div>

                    {projects.length === 0 ? (
                      <div className="empty-project-row">No project added yet.</div>
                    ) : (
                      projects.map((project) => (
                        <div className="project-row" key={project.id}>
                          <span>{project.clientName || '-'}</span>
                          <span>{project.projectName}</span>
                          <span>{project.projectCost || '-'}</span>
                          <span>{project.consultancyFee || '-'}</span>
                          <span>{project.workOrderDate || '-'}</span>
                          <span>{project.completionCertificateDate || '-'}</span>
                          <button
                            type="button"
                            className="view-docs-btn"
                            onClick={() => setViewingProjectDocuments(viewingProjectDocuments?.id === project.id ? null : project)}
                          >
                            {(project.workOrderDocumentPreview || project.completionCertificateDocumentPreview || project.otherProjectDocumentsPreview?.length > 0) ? '📄 View' : 'No Docs'}
                          </button>
                          <div className="project-actions">
                            <button
                              type="button"
                              className="view-project-btn"
                              onClick={() => setViewingProjectDocuments(viewingProjectDocuments?.id === project.id ? null : project)}
                            >
                              View
                            </button>
                            <button
                              type="button"
                              className="edit-project-btn"
                              onClick={() => handleEditProject(project)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="delete-project-btn"
                              onClick={() => handleRemoveProject(project.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {viewingProjectDocuments && (
                    <div className="project-details-viewer">
                      <h4>Project Details - {viewingProjectDocuments.projectName}</h4>
                      <div className="project-details-grid">
                        <div className="detail-item">
                          <span className="detail-label">Client Name:</span>
                          <span className="detail-value">{viewingProjectDocuments.clientName || '-'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Project Name:</span>
                          <span className="detail-value">{viewingProjectDocuments.projectName}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Project Type:</span>
                          <span className="detail-value">{viewingProjectDocuments.projectTypeLabel}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Location:</span>
                          <span className="detail-value">{viewingProjectDocuments.projectLocation || '-'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">State:</span>
                          <span className="detail-value">{viewingProjectDocuments.state || '-'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Department:</span>
                          <span className="detail-value">{viewingProjectDocuments.department || '-'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Project Cost:</span>
                          <span className="detail-value">{viewingProjectDocuments.projectCost || '-'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Consultancy Fee:</span>
                          <span className="detail-value">{viewingProjectDocuments.consultancyFee || '-'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Work Order Number:</span>
                          <span className="detail-value">{viewingProjectDocuments.workOrderNumber || '-'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Work Order Date:</span>
                          <span className="detail-value">{viewingProjectDocuments.workOrderDate || '-'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Completion Certificate Date:</span>
                          <span className="detail-value">{viewingProjectDocuments.completionCertificateDate || '-'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Status:</span>
                          <span className="detail-value">{viewingProjectDocuments.currentStatus || '-'}</span>
                        </div>
                      </div>
                      
                      <div className="project-documents-viewer">
                        <h4>Documents</h4>
                        <div className="documents-preview-grid">
                          {viewingProjectDocuments.workOrderDocumentPreview && (
                            <div className="doc-preview-item">
                              <h5>Work Order Document</h5>
                              <img src={viewingProjectDocuments.workOrderDocumentPreview} alt="Work Order" className="doc-preview-image" />
                            </div>
                          )}
                          {viewingProjectDocuments.completionCertificateDocumentPreview && (
                            <div className="doc-preview-item">
                              <h5>Completion Certificate</h5>
                              <img src={viewingProjectDocuments.completionCertificateDocumentPreview} alt="Completion Certificate" className="doc-preview-image" />
                            </div>
                          )}
                          {viewingProjectDocuments.otherProjectDocumentsPreview?.map((doc, idx) => (
                            <div className="doc-preview-item" key={idx}>
                              <h5>Other Document {idx + 1}</h5>
                              <img src={doc} alt={`Other Document ${idx + 1}`} className="doc-preview-image" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="project-actions">
                    <button type="button" onClick={handleOpenProjectForm}>
                      + Add Project
                    </button>
                  </div>
                </>
              ) : (
                <div className="project-form-section">
                  <h4>{editingProjectId ? 'Edit Project Details' : 'Add New Project'}</h4>
                  
                  <div className="project-entry-form">
                    <label className="details-field">
                      <span>Project Type</span>
                      <select
                        name="projectTypeId"
                        value={projectDraft.projectTypeId}
                        onChange={handleProjectChange}
                      >
                        <option value="">Select project type</option>
                        {projectTypes.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    {projectInputFields.map((field) => (
                      <label className="details-field" key={field.name}>
                        <span>{field.label}</span>
                        <input
                          type="text"
                          name={field.name}
                          value={projectDraft[field.name]}
                          onChange={handleProjectChange}
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                        />
                      </label>
                    ))}

                    <label className="details-field">
                      <span>Current Status</span>
                      <select
                        name="currentStatus"
                        value={projectDraft.currentStatus}
                        onChange={handleProjectChange}
                      >
                        <option value="">Select status</option>
                        <option value="Ongoing">Ongoing</option>
                        <option value="Completed">Completed</option>
                        <option value="Pending">Pending</option>
                      </select>
                    </label>
                  </div>

                  <div className="project-documents-section">
                    <h4>Project Documents</h4>
                    <div className="project-documents-grid">
                      <div className="project-doc-upload">
                        <h5>Work Order Document</h5>
                        {projectDraft.workOrderDocumentPreview ? (
                          <div className="image-preview-container">
                            <img src={projectDraft.workOrderDocumentPreview} alt="Work Order" className="image-preview" />
                            <button
                              type="button"
                              className="remove-image-btn"
                              onClick={() => handleRemoveProjectImage('workOrder')}
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <label className="image-upload-field">
                            <span>📄 Click to upload work order</span>
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleProjectImageChange(e, 'workOrder')}
                            />
                          </label>
                        )}
                      </div>

                      <div className="project-doc-upload">
                        <h5>Completion Certificate</h5>
                        {projectDraft.completionCertificateDocumentPreview ? (
                          <div className="image-preview-container">
                            <img src={projectDraft.completionCertificateDocumentPreview} alt="Completion Certificate" className="image-preview" />
                            <button
                              type="button"
                              className="remove-image-btn"
                              onClick={() => handleRemoveProjectImage('completionCertificate')}
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <label className="image-upload-field">
                            <span>📄 Click to upload completion certificate</span>
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleProjectImageChange(e, 'completionCertificate')}
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    <div className="other-docs-upload">
                      <h5>Other Project Documents (Optional)</h5>
                      <label className="image-upload-field">
                        <span>📎 Click to add more documents</span>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleProjectImageChange(e, 'other')}
                        />
                      </label>
                      
                      {projectDraft.otherProjectDocumentsPreview?.length > 0 && (
                        <div className="other-docs-list">
                          <h5>Uploaded Documents:</h5>
                          <div className="docs-preview-grid">
                            {projectDraft.otherProjectDocumentsPreview.map((doc, idx) => (
                              <div className="other-doc-item" key={idx}>
                                <img src={doc} alt={`Doc ${idx + 1}`} className="other-doc-preview" />
                                <button
                                  type="button"
                                  className="remove-image-btn"
                                  onClick={() => handleRemoveProjectImage('other', idx)}
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="project-actions">
                    {editingProjectId ? (
                      <>
                        <button type="button" onClick={() => {
                          handleSaveProject()
                          setShowProjectForm(false)
                        }} className="save-btn">
                          Update Project
                        </button>
                        <button type="button" onClick={() => {
                          handleCancelEditProject()
                          setShowProjectForm(false)
                        }} className="cancel-btn">
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button type="button" onClick={() => {
                          handleSaveProject()
                          setShowProjectForm(false)
                        }}>
                          Save Project
                        </button>
                        <button type="button" onClick={() => setShowProjectForm(false)} className="cancel-btn">
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </FormSection>
          )}

          {activeTechnicalTab === 'employees' && (
            <FormSection title="Employee Bio-data">
              {viewingEmployee ? (
                <div className="employee-view">
                  <h4>Employee Details</h4>
                  <div className="employee-details-grid">
                    {employeeBasicFields.map(({ name, label }) => (
                      <div key={name} className="detail-item">
                        <strong>{label}:</strong> {viewingEmployee[name] || '-'}
                      </div>
                    ))}
                  </div>
                  <h5>Qualifications</h5>
                  {viewingEmployee.qualifications.length === 0 ? (
                    <p>No qualifications added.</p>
                  ) : (
                    <div className="qualifications-list">
                      {viewingEmployee.qualifications.map((qual) => (
                        <div key={qual.id} className="qualification-item">
                          <p><strong>Qualification:</strong> {qual.qualification}</p>
                          <p><strong>College/University:</strong> {qual.collegeUniversity}</p>
                          <p><strong>Passing Year:</strong> {qual.passingYear}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="project-actions">
                    <button type="button" onClick={() => setViewingEmployee(null)}>Back to List</button>
                  </div>
                </div>
              ) : employeeMode === 'table' ? (
                <>
                  <div className="employee-table">
                    <div className="employee-row table-heading">
                      <span>Sl. No.</span>
                      <span>Name</span>
                      <span>Position</span>
                      <span>Total Experience</span>
                      <span>Year of Employment</span>
                      <span>Employer Name</span>
                      <span>Actions</span>
                    </div>

                    {employees.length === 0 ? (
                      <div className="employee-row empty-project-row">
                        <span>No employee bio-data added yet.</span>
                      </div>
                    ) : (
                      employees.map((employee, index) => (
                        <div className="employee-row" key={employee.id}>
                          <span>{index + 1}</span>
                          <span>{employee.name || '-'}</span>
                          <span>{employee.currentPosition || '-'}</span>
                          <span>{employee.totalExperience || '-'}</span>
                          <span>{employee.yearOfEmployment || '-'}</span>
                          <span>{employee.employerName || '-'}</span>
                          <span className="actions">
                            <button onClick={() => handleViewEmployee(employee)}>View</button>
                            <button onClick={() => handleEditEmployee(employee)}>Edit</button>
                            <button onClick={() => handleDeleteEmployee(employee.id)}>Delete</button>
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="project-actions">
                    <button type="button" onClick={() => setEmployeeMode('form')}>Add More Employee</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="details-grid employee-grid">
                    {employeeBasicFields.map(({ name, label }) => (
                      <label className="details-field" key={name}>
                        <span>{label}</span>
                        <input
                          type="text"
                          name={name}
                          value={employeeDraft[name]}
                          onChange={handleEmployeeChange}
                          placeholder={`Enter ${label.toLowerCase()}`}
                        />
                      </label>
                    ))}
                  </div>

                  <div className="qualifications-section">
                    <h4>Qualifications</h4>
                    <div className="qualifications-list">
                      {employeeDraft.qualifications.map((qual) => (
                        <div key={qual.id} className="qualification-item">
                          <span>{qual.qualification} - {qual.collegeUniversity} ({qual.passingYear})</span>
                          <button type="button" onClick={() => handleRemoveQualification(qual.id)}>Remove</button>
                        </div>
                      ))}
                    </div>
                    <div className="details-grid qualification-grid">
                      {qualificationFields.map(({ name, label }) => (
                        <label className="details-field" key={name}>
                          <span>{label}</span>
                          <input
                            type="text"
                            name={name}
                            value={qualificationDraft[name]}
                            onChange={handleQualificationChange}
                            placeholder={`Enter ${label.toLowerCase()}`}
                          />
                        </label>
                      ))}
                    </div>
                    <div className="project-actions">
                      <button type="button" onClick={handleAddQualification}>
                        Add Qualification
                      </button>
                    </div>
                  </div>

                  <div className="project-actions">
                    <button type="button" onClick={handleAddEmployee}>
                      {editingEmployeeId ? 'Update Employee' : 'Add Employee'}
                    </button>
                    <button type="button" className="cancel-btn" onClick={handleClearEmployee}>
                      Clear
                    </button>
                  </div>
                </>
              )}
            </FormSection>
          )}

          {activeTechnicalTab === 'documents' && (
            <FormSection title="Document Uploads">
              <div className="upload-grid">
                {uploadFields.map((field) => (
                  <label className="upload-field" key={field}>
                    <span>{field}</span>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" />
                  </label>
                ))}
              </div>

              <div className="additional-documents-section">
                <h4>Additional Documents</h4>
                <div className="additional-documents-list">
                  {additionalDocuments.map((doc) => (
                    <div key={doc.id} className="additional-document-item">
                      <span>{doc.type}</span>
                      {doc.fileName ? (
                        <span className="file-info">({doc.fileName})</span>
                      ) : (
                        <label className="upload-field inline-upload">
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleAdditionalDocumentFileChange(doc.id, e)}
                          />
                          <span>Upload File</span>
                        </label>
                      )}
                      <button type="button" onClick={() => handleRemoveAdditionalDocument(doc.id)}>Remove</button>
                    </div>
                  ))}
                </div>

                <div className="add-document-form">
                  <label className="details-field">
                    <span>Document Type</span>
                    <input
                      type="text"
                      value={documentTypeDraft}
                      onChange={(e) => setDocumentTypeDraft(e.target.value)}
                      placeholder="Enter document type (e.g., Tax Certificate, License, etc.)"
                    />
                  </label>
                  <div className="project-actions">
                    <button type="button" onClick={handleAddAdditionalDocument}>
                      Add Document
                    </button>
                  </div>
                </div>
              </div>

              <div className="project-actions">
                <button type="button">Upload All Documents</button>
              </div>
            </FormSection>
          )}

        </form>
      ) : (
        <div className="financial-placeholder">
          <h3>Financial Details</h3>
          <p>Financial fields will be added later.</p>
        </div>
      )}
    </section>
  )
}

function FormSection({ title, children }) {
  return (
    <section className="details-section">
      <h3>{title}</h3>
      {children}
    </section>
  )
}

export default AddDetails
