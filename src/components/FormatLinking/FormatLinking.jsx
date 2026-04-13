import { useState, useEffect } from 'react'
import alerts from '../../utils/alerts'
import * as categoryService from '../../services/category.service'
import * as projectTypeService from '../../services/projectType.service'
import * as formatService from '../../services/format.service'
import * as mappingService from '../../services/mapping.service'
import './FormatLinking.css'

export default function FormatLinking() {
  const [categories, setCategories] = useState([])
  const [projectTypes, setProjectTypes] = useState([])
  const [availableFormats, setAvailableFormats] = useState([])
  const [locationOptions, setLocationOptions] = useState({ states: [], cities: [] })
  
  // Search Filters
  const [filters, setFilters] = useState({
    category_id: '',
    project_type_id: '',
    state: '',
    city: ''
  })
  
  // Mapping State
  const [mappings, setMappings] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  
  // Linking Form State
  const [showAddModal, setShowAddModal] = useState(false)
  const [newMapping, setNewMapping] = useState({
    format_id: '',
    category_id: '',
    project_type_id: '',
    state: '',
    city: ''
  })
  
  // Preview State
  const [viewingFormat, setViewingFormat] = useState(null)
  const [currentFormatPage, setCurrentFormatPage] = useState(0)

  useEffect(() => {
    loadBaseData()
  }, [])

  // Reset page when switching formats in Add Modal or Search Table
  useEffect(() => {
    setCurrentFormatPage(0)
  }, [newMapping.format_id, viewingFormat?.id])

  const loadBaseData = async () => {
    try {
      const [catRes, ptRes, fmtRes, optRes] = await Promise.all([
        categoryService.getTenderCategories(),
        projectTypeService.getProjectTypes(),
        formatService.getFormats(),
        mappingService.getFilterOptions()
      ])
      
      if (catRes.success) setCategories(catRes.data)
      if (ptRes.success) setProjectTypes(ptRes.data)
      if (fmtRes.success) setAvailableFormats(fmtRes.data)
      if (optRes.success) setLocationOptions(optRes.data)
    } catch (err) {
      console.error('Failed to load base data', err)
    }
  }

  const handleFilterChange = (e) => {
    let { name, value } = e.target
    if (name === 'state' || name === 'city') value = value.toUpperCase()
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    setIsSearching(true)
    try {
      const resp = await mappingService.getMappings(filters)
      if (resp.success) {
        setMappings(resp.data)
        if (resp.data.length === 0) {
          alerts.info('No Results', 'No mappings found for these filters')
        }
      }
    } catch (err) {
      alerts.error('Search Failed', 'Connection error')
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddMapping = async () => {
    if (!newMapping.format_id || !newMapping.state || !newMapping.city) {
      return alerts.error('Error', 'Please fill required fields')
    }

    alerts.loading('Saving...', 'Creating format link')
    try {
      const resp = await mappingService.createMapping(newMapping)
      if (resp.success) {
        alerts.success('Linked!', 'Format successfully mapped')
        setShowAddModal(false)
        setNewMapping({
          format_id: '',
          category_id: '',
          project_type_id: '',
          state: '',
          city: ''
        })
        // Refresh table if searching
        handleSearch({ preventDefault: () => {} })
      } else {
        alerts.error('Failed', resp.message)
      }
    } catch (err) {
      alerts.error('Error', 'Connection failed')
    }
  }

  const handleDeleteMapping = async (id) => {
    const confirm = await alerts.confirm('Are you sure?', 'You want to delete this link?')
    if (confirm.isConfirmed) {
      try {
        const resp = await mappingService.deleteMapping(id)
        if (resp.success) {
          setMappings(prev => prev.filter(m => m.id !== id))
          alerts.success('Deleted', 'Mapping removed successfully')
        }
      } catch (err) {
        alerts.error('Error', 'Failed to delete')
      }
    }
  }

  return (
    <div className="linking-container">
      <div className="linking-header">
        <div className="header-text">
          <h1>Format Linking Management</h1>
          <p>Link physical Annexures with specific project scopes and locations.</p>
        </div>
        <button className="add-linking-btn" onClick={() => setShowAddModal(true)}>
          + Add New Linking
        </button>
      </div>

      <div className="search-filter-card">
        <form onSubmit={handleSearch} className="filter-grid">
          <div className="filter-item">
            <label>Tender Category</label>
            <select name="category_id" value={filters.category_id} onChange={handleFilterChange}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.category_name}</option>)}
            </select>
          </div>
          <div className="filter-item">
            <label>Project Type</label>
            <select name="project_type_id" value={filters.project_type_id} onChange={handleFilterChange}>
              <option value="">All Types</option>
              {projectTypes.map(pt => <option key={pt.id} value={pt.id}>{pt.type_name}</option>)}
            </select>
          </div>
          <div className="filter-item">
            <label>State</label>
            <input 
              type="text" 
              name="state" 
              placeholder="Filter by State" 
              value={filters.state} 
              onChange={handleFilterChange}
              list="search-states"
            />
            <datalist id="search-states">
              {locationOptions.states.map(s => <option key={s} value={s} />)}
            </datalist>
          </div>
          <div className="filter-item">
            <label>City</label>
            <input 
              type="text" 
              name="city" 
              placeholder="Filter by City" 
              value={filters.city} 
              onChange={handleFilterChange}
              list="search-cities"
            />
            <datalist id="search-cities">
              {locationOptions.cities.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>
          <div className="filter-actions">
            <button type="submit" disabled={isSearching}>
              {isSearching ? 'Searching...' : 'Search Filters'}
            </button>
          </div>
        </form>
      </div>

      <div className="linking-table-wrapper">
        <div className="linking-table-header">
          <span>Annexure Name</span>
          <span>Category</span>
          <span>Project Type</span>
          <span>Location</span>
          <span>Action</span>
        </div>
        
        <div className="linking-table-body">
          {mappings.length === 0 ? (
            <div className="empty-linking-state">
              {isSearching ? 'Loading data...' : 'No mappings found. Use the filters above to search.'}
            </div>
          ) : (
            mappings.map(m => (
              <div className="linking-row" key={m.id}>
                <div className="row-col main-col">
                  <strong>{m.format_name}</strong>
                  <div className="sub">{m.format_title}</div>
                </div>
                <div className="row-col">{m.category_name || 'Global'}</div>
                <div className="row-col">{m.project_type_name || 'General'}</div>
                <div className="row-col">
                  <strong>{m.city}</strong>
                  <div className="sub">{m.state}</div>
                </div>
                <div className="row-col action-col">
                  <button className="view-link-btn" onClick={() => setViewingFormat(m)}>View</button>
                  <button className="delete-link-btn" onClick={() => handleDeleteMapping(m.id)}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Mapping Modal */}
      {showAddModal && (
        <div className="mapping-modal-overlay">
          <div className={`mapping-modal ${newMapping.format_id ? 'wide-modal' : ''}`}>
            <div className="modal-header">
              <h2>Add New Format Link</h2>
              <button onClick={() => setShowAddModal(false)}>&times;</button>
            </div>
            <div className="modal-split-container">
                <div className="modal-form-section">
                    <div className="modal-body">
                        <div className="form-row">
                            <label>Select Format / Annexure *</label>
                            <select 
                            value={String(newMapping.format_id)} 
                            onChange={(e) => setNewMapping(p => ({...p, format_id: e.target.value}))}
                            >
                                <option value="">-- Choose Format --</option>
                                {availableFormats.map(f => (
                                <option key={`fmt-${f.id}`} value={String(f.id)}>{f.format_name} - {f.format_title}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-grid-2">
                            <div className="form-col">
                                <label>Tender Category</label>
                                <select 
                                    value={newMapping.category_id} 
                                    onChange={(e) => setNewMapping(p => ({...p, category_id: e.target.value}))}
                                >
                                    <option value="">All Categories</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.category_name}</option>)}
                                </select>
                            </div>
                            <div className="form-col">
                                <label>Project Type</label>
                                <select 
                                    value={newMapping.project_type_id} 
                                    onChange={(e) => setNewMapping(p => ({...p, project_type_id: e.target.value}))}
                                >
                                    <option value="">All Types</option>
                                    {projectTypes.map(pt => <option key={pt.id} value={pt.id}>{pt.type_name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="form-grid-2">
                            <div className="form-col">
                                <label>State *</label>
                                <input 
                                    type="text" 
                                    placeholder="Enter State Name"
                                    value={newMapping.state}
                                    onChange={(e) => setNewMapping(p => ({...p, state: e.target.value.toUpperCase()}))}
                                    list="mapping-states"
                                />
                                <datalist id="mapping-states">
                                {locationOptions.states.map(s => <option key={s} value={s} />)}
                                </datalist>
                            </div>
                            <div className="form-col">
                                <label>City *</label>
                                <input 
                                    type="text" 
                                    placeholder="Enter City Name"
                                    value={newMapping.city}
                                    onChange={(e) => setNewMapping(p => ({...p, city: e.target.value.toUpperCase()}))}
                                    list="mapping-cities"
                                />
                                <datalist id="mapping-cities">
                                {locationOptions.cities.map(c => <option key={c} value={c} />)}
                                </datalist>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button className="confirm-btn" onClick={handleAddMapping}>Save & Link Format</button>
                        <button className="cancel-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
                    </div>
                </div>

                {newMapping.format_id && (
                    <div className="modal-preview-section">
                        <div className="mini-preview-header">
                            <span>Template Preview</span>
                            {availableFormats.find(f => f.id == newMapping.format_id)?.template_pages?.length > 1 && (
                                <div className="mini-pagination">
                                   <button disabled={currentFormatPage === 0} onClick={() => setCurrentFormatPage(p => p - 1)}>←</button>
                                   <span>{currentFormatPage + 1} / {availableFormats.find(f => f.id == newMapping.format_id).template_pages.length}</span>
                                   <button disabled={currentFormatPage === availableFormats.find(f => f.id == newMapping.format_id).template_pages.length - 1} onClick={() => setCurrentFormatPage(p => p + 1)}>→</button>
                                </div>
                            )}
                        </div>
                        <div className="mini-preview-content">
                            <div 
                                className="html-renderer-content"
                                style={{ transform: 'scale(0.85)', transformOrigin: 'top center', padding: '30px' }}
                                dangerouslySetInnerHTML={{ 
                                    __html: availableFormats.find(f => f.id == newMapping.format_id)?.template_pages?.[currentFormatPage] 
                                            || availableFormats.find(f => f.id == newMapping.format_id)?.template_html 
                                }} 
                            />
                        </div>
                    </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {viewingFormat && (
        <div className="format-preview-overlay">
          <div className="format-preview-modal">
            <div className="preview-header">
              <div className="preview-header-info">
                <h3>{viewingFormat.format_name} - {viewingFormat.format_title}</h3>
                {viewingFormat.template_pages?.length > 1 && (
                  <span className="page-indicator" style={{ marginLeft: '15px', color: '#64748b', fontSize: '13px' }}>
                    Page {currentFormatPage + 1} of {viewingFormat.template_pages.length}
                  </span>
                )}
              </div>
              <button className="close-preview" onClick={() => {
                setViewingFormat(null)
                setCurrentFormatPage(0)
              }}>&times;</button>
            </div>
            <div className="preview-content-scroll">
              <div 
                className="html-renderer-content" 
                dangerouslySetInnerHTML={{ __html: viewingFormat.template_pages?.[currentFormatPage] || viewingFormat.template_html }} 
              />
            </div>
            <div className="preview-footer" style={{ borderTop: '1px solid #edf2f7', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', background: '#fff' }}>
                <div className="pagination-controls">
                    {viewingFormat.template_pages?.length > 1 && (
                      <>
                        <button 
                          className="page-btn" 
                          disabled={currentFormatPage === 0}
                          style={{ marginRight: '10px' }}
                          onClick={() => setCurrentFormatPage(p => p - 1)}
                        >
                          Previous
                        </button>
                        <button 
                          className="page-btn highlight" 
                          disabled={currentFormatPage === viewingFormat.template_pages.length - 1}
                          onClick={() => setCurrentFormatPage(p => p + 1)}
                        >
                          Next
                        </button>
                      </>
                    )}
                </div>
                <button onClick={() => {
                   setViewingFormat(null)
                   setCurrentFormatPage(0)
                }} className="cancel-btn">Close Annexure</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
