import { useState, useEffect } from 'react'
import alerts from '../../utils/alerts'
import * as categoryService from '../../services/category.service'
import * as projectTypeService from '../../services/projectType.service'
import * as formatService from '../../services/format.service'
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
  { name: 'esicRegistrationNumber', label: 'ESIC Registration Number' },
  { name: 'udyamMsmeNumber', label: 'Udyam / MSME Number' }
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

const bankFields = [
  'Bank Name',
  'Branch Name',
  'Account Holder Name',
  'Account Number',
  'IFSC Code',
  'MICR Code',
  'Account Type',
  'UPI ID'
]

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
  const [savedOrganisationDetails, setSavedOrganisationDetails] = useState(null)
  const [branchDraft, setBranchDraft] = useState(initialBranchDraft)
  const [branches, setBranches] = useState([])
  const [contactDraft, setContactDraft] = useState(initialContactDraft)
  const [contacts, setContacts] = useState([])
  const [partnerDraft, setPartnerDraft] = useState(initialPartnerDraft)
  const [partners, setPartners] = useState([])
  const [employeeDraft, setEmployeeDraft] = useState(initialEmployeeDraft)
  const [employees, setEmployees] = useState([])
  const [qualificationDraft, setQualificationDraft] = useState(initialQualificationDraft)
  const [viewingEmployee, setViewingEmployee] = useState(null)
  const [editingEmployeeId, setEditingEmployeeId] = useState(null)
  const [employeeMode, setEmployeeMode] = useState('table')
  const [projectDraft, setProjectDraft] = useState(initialProjectDraft)
  const [projects, setProjects] = useState([])
  const [isoCertificateDraft, setIsoCertificateDraft] = useState(initialIsoCertificateDraft)
  const [isoCertificates, setIsoCertificates] = useState([])
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

  // Formats / Annexures State
  const [formats, setFormats] = useState([])
  const [viewingFormat, setViewingFormat] = useState(null)
  const [currentFormatPage, setCurrentFormatPage] = useState(0)

  // Fetch on mount
  useEffect(() => {
    fetchTenderCategories()
    fetchProjectTypes()
    fetchFormats()
  }, [])

  const fetchFormats = async () => {
    try {
      const resp = await formatService.getFormats()
      if (resp.success) {
        setFormats(resp.data)
      }
    } catch (err) {
      console.error('Failed to load formats', err)
    }
  }

  const fetchProjectTypes = async () => {
    try {
      const resp = await projectTypeService.getProjectTypes()
      if (resp.success) {
        setProjectTypes(resp.data)
      }
    } catch (err) {
      console.error('Failed to load project types', err)
    }
  }

  const fetchTenderCategories = async () => {
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
    } catch (err) {
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
      } catch (err) {
        alerts.error('Error', 'Failed to delete category')
      }
    }
  }

  const handleProjectChange = (event) => {
    const { name, value } = event.target
    setProjectDraft((prev) => ({ ...prev, [name]: value }))
  }

  const handleBranchChange = (event) => {
    const { name, value } = event.target
    setBranchDraft((prev) => ({ ...prev, [name]: value }))
  }

  const handleContactChange = (event) => {
    const { name, value } = event.target
    setContactDraft((prev) => ({ ...prev, [name]: value }))
  }

  const handlePartnerChange = (event) => {
    const { name, value, checked, type } = event.target
    setPartnerDraft((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleOrganisationChange = (event) => {
    const { name, value } = event.target
    setOrganisationDraft((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleIsoCertificateImageChange = (event, imageType) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (imageType === 'first') {
          setIsoCertificateDraft((prev) => ({
            ...prev,
            firstImage: file,
            firstImageName: file.name,
            firstImagePreview: reader.result
          }))
        } else {
          setIsoCertificateDraft((prev) => ({
            ...prev,
            secondImage: file,
            secondImageName: file.name,
            secondImagePreview: reader.result
          }))
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveIsoCertificateImage = (imageType) => {
    if (imageType === 'first') {
      setIsoCertificateDraft((prev) => ({
        ...prev,
        firstImage: null,
        firstImageName: '',
        firstImagePreview: ''
      }))
    } else {
      setIsoCertificateDraft((prev) => ({
        ...prev,
        secondImage: null,
        secondImageName: '',
        secondImagePreview: ''
      }))
    }
  }

  const handleSaveOrganisation = () => {
    const hasData = organisationFields.some(({ name }) => organisationDraft[name].trim())

    if (!hasData) {
      return
    }

    setSavedOrganisationDetails({
      ...organisationDraft
    })
  }

  const handleClearOrganisation = () => {
    setOrganisationDraft(initialOrganisationDraft)
  }

  const handleIsoCertificateInputChange = (event) => {
    const { name, value } = event.target
    setIsoCertificateDraft((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAddIsoCertificate = () => {
    if (!isoCertificateDraft.certificateType.trim() || !isoCertificateDraft.year.trim()) {
      return
    }

    setIsoCertificates((prev) => [
      ...prev,
      {
        id: `iso-cert-${prev.length + 1}`,
        ...isoCertificateDraft
      }
    ])
    setIsoCertificateDraft(initialIsoCertificateDraft)
  }

  const handleClearIsoCertificateDraft = () => {
    setIsoCertificateDraft(initialIsoCertificateDraft)
  }

  const handleRemoveIsoCertificate = (certId) => {
    setIsoCertificates((prev) => prev.filter((cert) => cert.id !== certId))
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

  const handleAddBank = () => {
    if (!bankDraft.bankName.trim() || !bankDraft.accountNumber.trim()) {
      return
    }

    setBanks((prev) => [
      ...prev,
      {
        id: `bank-${prev.length + 1}`,
        ...bankDraft
      }
    ])
    setBankDraft(initialBankDraft)
  }

  const handleRemoveBank = (bankId) => {
    setBanks((prev) => prev.filter((bank) => bank.id !== bankId))
  }

  const handleAddBranch = () => {
    if (!branchDraft.branchName.trim() || !branchDraft.address.trim()) {
      return
    }

    setBranches((prev) => [
      ...prev,
      {
        id: `branch-${prev.length + 1}`,
        ...branchDraft
      }
    ])
    setBranchDraft(initialBranchDraft)
  }

  const handleClearBranch = () => {
    setBranchDraft(initialBranchDraft)
  }

  const handleAddContact = () => {
    if (!contactDraft.number.trim()) {
      return
    }

    setContacts((prev) => [
      ...prev,
      {
        id: `contact-${prev.length + 1}`,
        ...contactDraft
      }
    ])
    setContactDraft(initialContactDraft)
  }

  const handleClearContact = () => {
    setContactDraft(initialContactDraft)
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
    setProjectTypeDraft('')
    setOrganisationDraft(initialOrganisationDraft)
    setBankDraft(initialBankDraft)
    setProjectDraft(initialProjectDraft)
    setEmployeeDraft(initialEmployeeDraft)
    setIsoCertificateDraft(initialIsoCertificateDraft)
    setBranchDraft(initialBranchDraft)
    setContactDraft(initialContactDraft)
    setPartnerDraft(initialPartnerDraft)
    setQualificationDraft(initialQualificationDraft)
    setDocumentTypeDraft('')
    setViewingFormat(null)
    setCurrentFormatPage(0)

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
    } catch (err) {
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
      } catch (err) {
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

  const handleAddPartner = () => {
    if (!partnerDraft.name.trim() || !partnerDraft.position.trim()) {
      return
    }

    setPartners((prev) => [
      ...prev,
      {
        id: `partner-${prev.length + 1}`,
        ...partnerDraft
      }
    ])
    setPartnerDraft(initialPartnerDraft)
  }

  const openProjectTypesTab = () => {
    setProjectTypeMode('list')
    setProjectTypeDraft('')
    setEditingProjectTypeId(null)
    setActiveTechnicalTab('projectTypes')
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

  const handleAddProject = () => {
    handleSaveProject()
    setShowProjectForm(false)
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
            <button
              type="button"
              className={`technical-subtab ${activeTechnicalTab === 'formats' ? 'active' : ''}`}
              onClick={() => handleTechnicalTabChange('formats')}
            >
              Annexures / Formats
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
                      type="text"
                      name={name}
                      value={organisationDraft[name]}
                      onChange={handleOrganisationChange}
                      placeholder={`Enter ${label.toLowerCase()}`}
                    />
                  </label>
                ))}
              </div>

              <div className="organization-actions">
                <button type="button" onClick={handleSaveOrganisation}>
                  Save Organization Details
                </button>
                <button type="button" className="cancel-btn" onClick={handleClearOrganisation}>
                  Clear
                </button>
              </div>

              {savedOrganisationDetails && (
                <div className="organisation-summary">
                  <h4>Saved Organization Details</h4>
                  <div className="organisation-summary-table">
                    <div className="organisation-summary-row table-heading">
                      <span>Field</span>
                      <span>Value</span>
                    </div>
                    {organisationFields.map(({ name, label }) => (
                      <div className="organisation-summary-row" key={name}>
                        <span>{label}</span>
                        <span>{savedOrganisationDetails[name] || '-'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="office-block">
                <h4>ISO Certificate Details</h4>
                <p className="section-helper">
                  Add one ISO certificate per row. Different years can be saved separately.
                </p>
                
                <div className="iso-cert-entry-form">
                  <label className="details-field">
                    <span>Certificate Type</span>
                    <input
                      type="text"
                      name="certificateType"
                      value={isoCertificateDraft.certificateType}
                      onChange={handleIsoCertificateInputChange}
                      placeholder="e.g., ISO 9001, ISO 27001, ISO 45001"
                    />
                  </label>
                  <label className="details-field">
                    <span>Year of Certification</span>
                    <input
                      type="number"
                      name="year"
                      value={isoCertificateDraft.year}
                      onChange={handleIsoCertificateInputChange}
                      placeholder="e.g., 2024"
                      min="1990"
                      max={new Date().getFullYear()}
                    />
                  </label>
                </div>

                <div className="iso-certificate-upload">
                  <div className="iso-image-section">
                    <h5>First Certificate Image</h5>
                    {isoCertificateDraft.firstImagePreview ? (
                      <div className="image-preview-container">
                        <img src={isoCertificateDraft.firstImagePreview} alt="First ISO Certificate" className="image-preview" />
                        <button
                          type="button"
                          className="remove-image-btn"
                          onClick={() => handleRemoveIsoCertificateImage('first')}
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="image-upload-field">
                        <span>📸 Click to upload certificate image</span>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={(e) => handleIsoCertificateImageChange(e, 'first')}
                        />
                      </label>
                    )}
                  </div>

                  <div className="iso-image-section">
                    <h5>Second Certificate Image (Optional)</h5>
                    {isoCertificateDraft.secondImagePreview ? (
                      <div className="image-preview-container">
                        <img src={isoCertificateDraft.secondImagePreview} alt="Second ISO Certificate" className="image-preview" />
                        <button
                          type="button"
                          className="remove-image-btn"
                          onClick={() => handleRemoveIsoCertificateImage('second')}
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="image-upload-field">
                        <span>📸 Click to upload certificate image</span>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={(e) => handleIsoCertificateImageChange(e, 'second')}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="iso-actions">
                  <button type="button" onClick={handleAddIsoCertificate}>
                    Save ISO Certificate
                  </button>
                  <button type="button" className="cancel-btn" onClick={handleClearIsoCertificateDraft}>
                    Clear
                  </button>
                </div>

                <div className="iso-cert-table">
                  <div className="iso-cert-row table-heading">
                    <span>Type</span>
                    <span>Year</span>
                    <span>First Image</span>
                    <span>Second Image</span>
                    <span>Action</span>
                  </div>

                  {isoCertificates.length === 0 ? (
                    <div className="iso-cert-row empty-cert-row">
                      <span>No ISO certificate added yet.</span>
                    </div>
                  ) : (
                    isoCertificates.map((cert) => (
                      <div className="iso-cert-row" key={cert.id}>
                        <span>{cert.certificateType}</span>
                        <span>{cert.year || '-'}</span>
                        <span>
                          {cert.firstImageName ? (
                            <div className="iso-file-chip" title={cert.firstImageName}>
                              {cert.firstImageName}
                            </div>
                          ) : (
                            'Not added'
                          )}
                        </span>
                        <span>
                          {cert.secondImageName ? (
                            <div className="iso-file-chip" title={cert.secondImageName}>
                              {cert.secondImageName}
                            </div>
                          ) : (
                            'Optional'
                          )}
                        </span>
                        <button
                          type="button"
                          className="delete-cert-btn"
                          onClick={() => handleRemoveIsoCertificate(cert.id)}
                        >
                          Delete
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="office-block">
                <h4>Telephone / Mobile Numbers</h4>
                <div className="contact-entry-form">
                  <label className="details-field">
                    <span>Contact Type</span>
                    <select
                      name="type"
                      value={contactDraft.type}
                      onChange={handleContactChange}
                    >
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
                      value={contactDraft.number}
                      onChange={handleContactChange}
                      placeholder="Enter phone number"
                    />
                  </label>
                </div>

                <div className="project-actions">
                  <button type="button" onClick={handleAddContact}>
                    Add Number
                  </button>
                  <button type="button" className="cancel-btn" onClick={handleClearContact}>
                    Clear
                  </button>
                </div>

                <div className="simple-table">
                  <div className="simple-row table-heading">
                    <span>Type</span>
                    <span>Number</span>
                  </div>

                  {contacts.length === 0 ? (
                    <div className="empty-project-row">No phone number added yet.</div>
                  ) : (
                    contacts.map((contact) => (
                      <div className="simple-row" key={contact.id}>
                        <span>{contact.type}</span>
                        <span>{contact.number}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="office-block">
                <h4>Head Office Details</h4>
                <div className="details-grid">
                  <label className="details-field">
                    <span>Head Office State</span>
                    <input type="text" placeholder="Enter state" />
                  </label>
                  <label className="details-field">
                    <span>Head Office City</span>
                    <input type="text" placeholder="Enter city" />
                  </label>
                  <label className="details-field full-field">
                    <span>Head Office Full Address</span>
                    <input type="text" placeholder="Enter full address" />
                  </label>
                </div>
              </div>

              <div className="office-block">
                <h4>Branch Office Details</h4>
                <div className="branch-entry-form">
                  <label className="details-field">
                    <span>Branch Name / Location</span>
                    <input
                      type="text"
                      name="branchName"
                      value={branchDraft.branchName}
                      onChange={handleBranchChange}
                      placeholder="Example: Madhya Pradesh Branch"
                    />
                  </label>
                  <label className="details-field">
                    <span>State</span>
                    <input
                      type="text"
                      name="state"
                      value={branchDraft.state}
                      onChange={handleBranchChange}
                      placeholder="Example: Madhya Pradesh"
                    />
                  </label>
                  <label className="details-field">
                    <span>City</span>
                    <input
                      type="text"
                      name="city"
                      value={branchDraft.city}
                      onChange={handleBranchChange}
                      placeholder="Enter city"
                    />
                  </label>
                  <label className="details-field full-field">
                    <span>Branch Full Address</span>
                    <input
                      type="text"
                      name="address"
                      value={branchDraft.address}
                      onChange={handleBranchChange}
                      placeholder="Enter complete branch address"
                    />
                  </label>
                </div>

                <div className="project-actions">
                  <button type="button" onClick={handleAddBranch}>
                    Add Branch
                  </button>
                  <button type="button" className="cancel-btn" onClick={handleClearBranch}>
                    Clear
                  </button>
                </div>

                <div className="branch-table">
                  <div className="branch-row table-heading">
                    <span>Branch</span>
                    <span>State</span>
                    <span>City</span>
                    <span>Address</span>
                  </div>

                  {branches.length === 0 ? (
                    <div className="empty-project-row">No branch added yet.</div>
                  ) : (
                    branches.map((branch) => (
                      <div className="branch-row" key={branch.id}>
                        <span>{branch.branchName}</span>
                        <span>{branch.state || '-'}</span>
                        <span>{branch.city || '-'}</span>
                        <span>{branch.address}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="office-block">
                <h4>Partners / Directors</h4>
                <div className="partner-entry-form">
                  <label className="details-field">
                    <span>Name</span>
                    <input
                      type="text"
                      name="name"
                      value={partnerDraft.name}
                      onChange={handlePartnerChange}
                      placeholder="Enter partner/director name"
                    />
                  </label>
                  <label className="details-field">
                    <span>Position</span>
                    <input
                      type="text"
                      name="position"
                      value={partnerDraft.position}
                      onChange={handlePartnerChange}
                      placeholder="Enter position"
                    />
                  </label>
                  <label className="details-field">
                    <span>Phone Number</span>
                    <input
                      type="text"
                      name="phoneNumber"
                      value={partnerDraft.phoneNumber}
                      onChange={handlePartnerChange}
                      placeholder="Enter phone number"
                    />
                  </label>
                  <label className="details-field full-field">
                    <span>Address</span>
                    <input
                      type="text"
                      name="address"
                      value={partnerDraft.address}
                      onChange={handlePartnerChange}
                      placeholder="Enter address"
                    />
                  </label>
                  <label className="check-field">
                    <input
                      type="checkbox"
                      name="isAuthorized"
                      checked={partnerDraft.isAuthorized}
                      onChange={handlePartnerChange}
                    />
                    <span>Authorized person</span>
                  </label>
                </div>

                <div className="project-actions">
                  <button type="button" onClick={handleAddPartner}>
                    Add Partner
                  </button>
                  <button type="button" className="cancel-btn" onClick={() => setPartnerDraft(initialPartnerDraft)}>
                    Clear
                  </button>
                </div>

                <div className="partner-table">
                  <div className="partner-row table-heading">
                    <span>Name</span>
                    <span>Position</span>
                    <span>Phone</span>
                    <span>Address</span>
                    <span>Authorized</span>
                  </div>

                  {partners.length === 0 ? (
                    <div className="empty-project-row">No partner/director added yet.</div>
                  ) : (
                    partners.map((partner) => (
                      <div className="partner-row" key={partner.id}>
                        <span>{partner.name}</span>
                        <span>{partner.position}</span>
                        <span>{partner.phoneNumber || '-'}</span>
                        <span>{partner.address || '-'}</span>
                        <span>{partner.isAuthorized ? 'Yes' : 'No'}</span>
                      </div>
                    ))
                  )}
                </div>
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

          {activeTechnicalTab === 'formats' && (
            <FormSection title="Official Annexures & Formats">
              <p className="section-helper">
                Standard document templates (Annexure 1-7). Select a format to view the official structure.
              </p>

              <div className="project-type-table">
                <div className="project-type-row-v2 table-heading">
                  <span>Format Name & Title</span>
                  <span>Action</span>
                </div>

                {formats.length === 0 ? (
                  <div className="empty-project-row">No formats found in database.</div>
                ) : (
                  formats.map((f) => (
                    <div className="project-type-row-v2" key={f.id}>
                      <div className="format-info-cell" style={{ padding: '12px 14px' }}>
                        <div className="bold-label" style={{ fontWeight: '700', color: '#1c2748' }}>{f.format_name}</div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                          {f.format_title}
                        </div>
                      </div>
                      <div className="row-actions">
                        <button 
                          type="button" 
                          className="edit-row-btn"
                          style={{ background: '#f0fdf4', color: '#16a34a', borderColor: '#bbf7d0', width: 'auto' }}
                          onClick={() => setViewingFormat(f)}
                        >
                          View Template
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {viewingFormat && (
                <div className="format-preview-overlay">
                  <div className="format-preview-modal">
                    <div className="preview-header">
                      <div className="preview-header-info">
                        <h3>{viewingFormat.format_name} - {viewingFormat.format_title}</h3>
                        {viewingFormat.template_pages?.length > 1 && (
                          <span className="page-indicator">Page {currentFormatPage + 1} of {viewingFormat.template_pages.length}</span>
                        )}
                      </div>
                      <button className="close-preview" onClick={() => {
                        setViewingFormat(null)
                        setCurrentFormatPage(0)
                      }}>×</button>
                    </div>
                    <div className="preview-content-scroll">
                       <div 
                         className="html-renderer-content" 
                         dangerouslySetInnerHTML={{ __html: viewingFormat.template_pages?.[currentFormatPage] || viewingFormat.template_html }} 
                       />
                    </div>
                    <div className="preview-footer">
                        <div className="pagination-controls">
                           {viewingFormat.template_pages?.length > 1 && (
                             <>
                               <button 
                                 className="page-btn" 
                                 disabled={currentFormatPage === 0}
                                 onClick={() => setCurrentFormatPage(p => p - 1)}
                               >
                                 Previous Page
                               </button>
                               <button 
                                 className="page-btn highlight" 
                                 disabled={currentFormatPage === viewingFormat.template_pages.length - 1}
                                 onClick={() => setCurrentFormatPage(p => p + 1)}
                               >
                                 Next Page
                               </button>
                             </>
                           )}
                        </div>
                      <button type="button" onClick={() => {
                        setViewingFormat(null)
                        setCurrentFormatPage(0)
                      }} className="cancel-btn">Close Annexure</button>
                    </div>
                  </div>
                </div>
              )}
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
