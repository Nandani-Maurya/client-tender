import { useState, useEffect } from "react";
import alerts from "../../../../utils/alerts";
import * as addDetailsService from "../../../../services/addDetails.service";
import "./Organisation.css";

const organisationFields = [
  { name: "nameOfFirm", label: "Name of Firm", required: true },
  { name: "registrationNumber", label: "Registration Number", required: true },
  { name: "registrationDate", label: "Registration Date", required: true, type: "date" },
  { name: "emailAddress", label: "Email Address", required: true, type: "email" },
  { name: "webAddress", label: "Website", required: true, type: "url" },
  { name: "yearOfEstablishment", label: "Year of Establishment", required: true, digits: 4 },
  { name: "typeOfFirm", label: "Type of Firm", required: true },
  { name: "panCardNumber", label: "PAN Card Number", required: true, uppercase: 10 },
  { name: "gstRegistrationNumber", label: "GST Registration Number", required: true, uppercase: 15 },
  { name: "epfRegistrationNumber", label: "EPF Registration Number", required: true, uppercase: 22 },
  { name: "esicRegistrationNumber", label: "ESIC Registration Number", required: true, digits: 17 },
  { name: "headOfficeState", label: "Head Office State", required: true },
  { name: "headOfficeCity", label: "Head Office City", required: true },
  { name: "headOfficePincode", label: "Head Office Pincode", required: true, digits: 6 },
  { name: "headOfficeFullAddress", label: "Full Address", required: true, fullWidth: true },
];

const initialOrganisationDraft = organisationFields.reduce((draft, field) => {
  draft[field.name] = "";
  return draft;
}, {});

const initialBranchDraft = { branchName: "", state: "", city: "", address: "", pincode: "" };
const initialContactDraft = { type: "Telephone", number: "" };
const initialPartnerDraft = { name: "", position: "", address: "", pincode: "", phoneNumber: "", isAuthorized: false };

const PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[0-9]{10}$/,
  pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  gst: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{3}$/,
  epf: /^[A-Z]{2}[A-Z0-9]{10,22}$/,
  esic: /^[0-9]{17}$/,
  pincode: /^[0-9]{6}$/
};

const normalizeWebsite = (value) => {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};


const allowOnlyDigits = (event) => {
  const allowedKeys = [
    "Backspace",
    "Delete",
    "Tab",
    "ArrowLeft",
    "ArrowRight",
    "Home",
    "End",
  ];
  if (allowedKeys.includes(event.key) || event.ctrlKey || event.metaKey) {
    return;
  }

  if (!/^[0-9]$/.test(event.key)) {
    event.preventDefault();
  }
};

const preventNonDigitPaste = (event) => {
  const pastedText = event.clipboardData.getData("text");
  if (!/^[0-9]+$/.test(pastedText)) {
    event.preventDefault();
  }
};



function Organisation() {
  const [organisationDraft, setOrganisationDraft] = useState(
    initialOrganisationDraft,
  );
  const [branches, setBranches] = useState([
    { ...initialBranchDraft, id: "branch-1" },
  ]);
  const [contacts, setContacts] = useState([
    { ...initialContactDraft, id: "contact-1" },
  ]);
  const [partners, setPartners] = useState([
    { ...initialPartnerDraft, id: "partner-1" },
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [isEditEnabled, setIsEditEnabled] = useState(false);
  const [hasActiveOrganization, setHasActiveOrganization] = useState(false);

  useEffect(() => {
    loadActiveOrganization();
  }, []);

  async function loadActiveOrganization() {
    try {
      const res = await addDetailsService.getActiveDetails();
      if (res.success && res.data) {
        setHasActiveOrganization(true);
        setIsUpdateMode(true);
        setIsEditEnabled(false);
        const org = res.data;
        setOrganisationDraft({
          nameOfFirm: org.name_of_firm || "",
          registrationNumber: org.registration_number || "",
          registrationDate: org.registration_date
            ? org.registration_date.split("T")[0]
            : "",
          emailAddress: org.email_address || "",
          webAddress: org.web_address || "",
          yearOfEstablishment: org.year_of_establishment || "",
          typeOfFirm: org.type_of_firm || "",
          panCardNumber: org.pan_card_number || "",
          gstRegistrationNumber: org.gst_registration_number || "",
          epfRegistrationNumber: org.epf_registration_number || "",
          esicRegistrationNumber: org.esic_registration_number || "",
          headOfficeState: org.head_office_state || "",
          headOfficeCity: org.head_office_city || "",
          headOfficeFullAddress: org.head_office_full_address || "",
          headOfficePincode: org.head_office_pincode || "",
        });

        if (org.contacts && org.contacts.length > 0) {
          setContacts(
            org.contacts.map((c, i) => ({
              id: `contact-fetch-${Date.now()}-${i}`,
              ...c,
            })),
          );
        }
        if (org.branches && org.branches.length > 0) {
          setBranches(
            org.branches.map((b, i) => ({
              id: `branch-fetch-${Date.now()}-${i}`,
              branchName: b.branch_name,
              state: b.state,
              city: b.city,
              address: b.address,
              pincode: b.pincode || "",
            })),
          );
        }
        if (org.partners && org.partners.length > 0) {
          setPartners(
            org.partners.map((p, i) => ({
              id: `partner-fetch-${Date.now()}-${i}`,
              name: p.name,
              position: p.position,
              phoneNumber: p.phone,
              address: p.address,
              pincode: p.pincode || "",
              isAuthorized: p.is_authorized,
            })),
          );
        }
      }
      if (res.success && !res.data) {
        setHasActiveOrganization(false);
        setIsUpdateMode(false);
        setIsEditEnabled(true);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const handleOrganisationChange = (event) => {
    let { name, value } = event.target;
    const config = organisationFields.find(f => f.name === name);
    
    if (config?.digits) value = value.replace(/[^0-9]/g, "").slice(0, config.digits);
    if (config?.uppercase) value = value.toUpperCase().slice(0, config.uppercase);

    setOrganisationDraft((prev) => ({ ...prev, [name]: value }));
  };


  const handleListChange = (setter, index, event, options = {}) => {
    const { name, value, checked, type } = event.target;
    setter((prev) => {
      const updated = [...prev];
      let finalValue = type === "checkbox" ? checked : value;
      
      if (options.digits) finalValue = finalValue.replace(/[^0-9]/g, "").slice(0, options.digits);
      if (options.uppercase) finalValue = finalValue.toUpperCase().slice(0, options.uppercase);
      
      updated[index] = { ...updated[index], [name]: finalValue };
      return updated;
    });
  };


  const handleCancelOrganisationEdit = async () => {
    const confirm = await alerts.confirm(
      "Cancel changes?",
      "Are you sure you want to cancel? Unsaved changes will be lost.",
    );

    if (confirm.isConfirmed) {
      setIsEditEnabled(false);
      loadActiveOrganization();
    }
  };

  // Enhanced validation: collect all errors and first error field for scroll
  const validateOrganisationDraft = () => {
    const errors = {};
    let firstErrorField = null;

    organisationFields.forEach(field => {
      const value = String(organisationDraft[field.name] || "").trim();
      if (field.required && !value) {
        errors[`org-${field.name}`] = `${field.label} is required`;
        if (!firstErrorField) firstErrorField = `org-${field.name}`;
      } else if (value) {
        if (field.type === "email" && !PATTERNS.email.test(value)) {
          errors[`org-${field.name}`] = "Please enter a valid email address";
        } else if (field.name === "registrationDate") {
          const selectedDate = new Date(`${value}T00:00:00`);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (selectedDate > today) errors[`org-${field.name}`] = "Registration Date cannot be greater than today";
        } else if (field.name === "yearOfEstablishment") {
          const year = Number(value);
          const currentYear = new Date().getFullYear();
          if (!Number.isInteger(year) || year < 1800 || year > currentYear) errors[`org-${field.name}`] = "Please enter a valid year of establishment";
        } else if (field.name === "panCardNumber" && !PATTERNS.pan.test(value.toUpperCase())) {
          errors[`org-${field.name}`] = "Please enter a valid PAN card number";
        } else if (field.name === "gstRegistrationNumber" && !PATTERNS.gst.test(value.toUpperCase())) {
          errors[`org-${field.name}`] = "Please enter a valid GST registration number";
        } else if (field.name === "epfRegistrationNumber" && !PATTERNS.epf.test(value.toUpperCase())) {
          errors[`org-${field.name}`] = "Please enter a valid EPF registration number";
        } else if (field.name === "esicRegistrationNumber" && !PATTERNS.esic.test(value)) {
          errors[`org-${field.name}`] = "Please enter a valid ESIC registration number";
        } else if (field.digits && value.length !== field.digits) {
          errors[`org-${field.name}`] = `${field.label} must be exactly ${field.digits} digits`;
        }

        if (errors[`org-${field.name}`] && !firstErrorField) firstErrorField = `org-${field.name}`;
      }
    });

    contacts.forEach((contact, idx) => {
      if (!String(contact.number || "").trim()) {
        errors[`contact-number-${idx}`] = "Contact number is required";
      } else if (!PATTERNS.phone.test(String(contact.number).trim())) {
        errors[`contact-number-${idx}`] = "Contact phone number must be exactly 10 digits";
      }
      if (errors[`contact-number-${idx}`] && !firstErrorField) firstErrorField = `contact-number-${idx}`;
    });

    branches.forEach((branch, idx) => {
      ["branchName", "state", "city", "address", "pincode"].forEach(key => {
        if (!String(branch[key] || "").trim()) {
          errors[`branch-${key}-${idx}`] = `Branch ${key.replace(/([A-Z])/g, " $1").toLowerCase()} is required`;
        } else if (key === "pincode" && !PATTERNS.pincode.test(branch[key])) {
          errors[`branch-${key}-${idx}`] = "Branch pincode must be exactly 6 digits";
        }
        if (errors[`branch-${key}-${idx}`] && !firstErrorField) firstErrorField = `branch-${key}-${idx}`;
      });
    });

    partners.forEach((partner, idx) => {
      ["name", "position", "phoneNumber", "address", "pincode"].forEach(key => {
        if (!String(partner[key] || "").trim()) {
          errors[`partner-${key}-${idx}`] = `Partner ${key.replace(/([A-Z])/g, " $1").toLowerCase()} is required`;
        } else if (key === "phoneNumber" && !PATTERNS.phone.test(partner[key])) {
          errors[`partner-${key}-${idx}`] = "Partner mobile number must be exactly 10 digits";
        } else if (key === "pincode" && !PATTERNS.pincode.test(partner[key])) {
          errors[`partner-${key}-${idx}`] = "Partner pincode must be exactly 6 digits";
        }
        if (errors[`partner-${key}-${idx}`] && !firstErrorField) firstErrorField = `partner-${key}-${idx}`;
      });
    });

    if (contacts.filter(c => String(c.number || "").trim()).length === 0) {
      errors["contact-atleastone"] = "At least one contact number is required";
      if (!firstErrorField) firstErrorField = "contact-atleastone";
    }

    if (!branches.some(b => Object.values(b).some(v => String(v || "").trim()))) {
      errors["branch-atleastone"] = "At least one branch office is required";
      if (!firstErrorField) firstErrorField = "branch-atleastone";
    }

    return { errors, firstErrorField };
  };


  const handleSaveBasicDetails = async () => {
    try {
      const hasData = organisationFields.some(({ name }) =>
        String(organisationDraft[name] || "").trim()
      );

      if (!hasData) {
        alerts.info("No Data", "Please fill the organization details before saving.");
        return;
      }

      const { errors } = validateOrganisationDraft();
      if (Object.keys(errors).length > 0) {
        alerts.info("Info", Object.values(errors)[0]);
        return;
      }

      const confirm = await alerts.confirm(
        isUpdateMode ? "Update Organization?" : "Save Organization?",
        `Are you sure you want to ${isUpdateMode ? "update" : "save"} basic organization details?`,
        isUpdateMode ? "Yes, Update" : "Yes, Save"
      );

      if (!confirm.isConfirmed) return;

      setIsSaving(true);

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
        contacts: contacts
          .filter((c) => String(c.number || "").trim())
          .map((c) => ({ type: c.type, number: c.number })),
        branches: branches
          .filter((b) => String(b.branchName || "").trim() || String(b.city || "").trim() || String(b.pincode || "").trim())
          .map((b) => ({
            branch_name: b.branchName,
            state: b.state,
            city: b.city,
            address: b.address,
            pincode: b.pincode,
          })),
        partners: partners
          .filter((p) => String(p.name || "").trim())
          .map((p) => ({
            name: p.name,
            position: p.position,
            phone: p.phoneNumber,
            address: p.address,
            pincode: p.pincode,
            is_authorized: p.isAuthorized,
          })),
      };

      const res = await addDetailsService.saveBasicDetails(payload);

      if (res.success) {
        setIsUpdateMode(true);
        setHasActiveOrganization(true);
        setIsEditEnabled(false);
        alerts.success(
          "Success",
          isUpdateMode ? "Organization updated successfully" : "Organization saved successfully"
        );
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {

        alerts.info("Info", res.message);
      }
    } catch (err) {
      console.error(err);
      alerts.error("Error", "Internal server error");
    } finally {
      setIsSaving(false);
    }
  };




  return (
    <section
      className={`details-section ${!isEditEnabled ? "org-fields--disabled" : ""}`}
    >
      {!hasActiveOrganization && (
        <div className="org-status-banner org-status-banner--empty mb-2">
          <div className="org-status-mark">!</div>
          <div>
            <h4>No active organization found</h4>
            <p>
              Please fill and save organization details to create the first
              active record.
            </p>
          </div>
        </div>
      )}

      <h3>Basic Organization Details</h3>
      <p className="section-helper">
        Core administrative and legal registration data of the firm.
      </p>
      {hasActiveOrganization && !isEditEnabled && (
        <div className="org-status-banner org-status-banner--view mb-2">
          <div className="org-status-mark org-status-mark--view">i</div>
          <div className="org-status-copy">
            <h4>Organization loaded in view mode</h4>
            <p>Click edit to unlock the fields and update the active record.</p>
          </div>
          <button
            type="button"
            className="save-btn org-status-action"
            onClick={() => setIsEditEnabled(true)}
          >
            Want to Edit
          </button>
        </div>
      )}

      <div className="details-grid mt-2">
        {organisationFields
          .filter((f) => !f.name.startsWith("headOffice"))
          .map((field) => (
            <label
              className={`details-field ${field.fullWidth ? "full-field" : ""}`}
              key={field.name}
              style={{ alignItems: "flex-start" }}
            >
              <span className="field-label-line">
                <span className="field-label-text">{field.label}</span>
                {field.required ? <span className="required-star">*</span> : null}
              </span>
              <div style={{ width: "100%", minHeight: "42px", display: "flex", alignItems: "center" }}>
                {!isEditEnabled && field.type === "url" && organisationDraft[field.name] ? (
                  <a
                    href={normalizeWebsite(organisationDraft[field.name])}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="org-link"
                  >
                    {organisationDraft[field.name]}
                  </a>
                ) : (
                  <input
                    type={field.type === "date" ? "date" : "text"}
                    name={field.name}
                    value={organisationDraft[field.name]}
                    onChange={handleOrganisationChange}
                    onKeyDown={field.digits ? allowOnlyDigits : undefined}
                    onPaste={field.digits ? preventNonDigitPaste : undefined}
                    inputMode={field.digits ? "numeric" : undefined}
                    autoComplete="off"
                    placeholder={`Enter ${field.label}`}
                    disabled={!isEditEnabled}
                    max={field.type === "date" ? new Date().toISOString().split("T")[0] : undefined}
                    maxLength={field.digits || field.uppercase || undefined}
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
                  <span className="subheading-text">
                    Contact Number #{idx + 1}
                  </span>
                  <span className="required-star" style={{ color: "red" }}>
                    *
                  </span>
                </span>
                {contacts.length > 1 && <button
                      type="button"
                      className="delete-entry-btn"
                      onClick={() => setContacts(prev => prev.filter(c => c.id !== contact.id))}
                      disabled={!isEditEnabled}
                    >
                      ✕ Remove
                    </button>

                }
              </div>
              <div className="contact-entry-form">
                <label className="details-field">
                  <span>Category</span>
                  <select
                    name="type"
                    value={contact.type}
                    onChange={(e) => handleListChange(setContacts, idx, e)}
                    disabled={!isEditEnabled}
                  >
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
                    onChange={(e) => handleListChange(setContacts, idx, e, { digits: 10 })}
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
          <button
            type="button"
            className="add-more-section-btn"
            onClick={() => setContacts(prev => [...prev, { ...initialContactDraft, id: `contact-${Date.now()}` }])}
            disabled={!isEditEnabled}
          >
            + Add Another Contact
          </button>

        </div>
      </div>

      <div className="office-block mt-3">
        <h4>
          Registered Head Office Address{" "}
          <span className="required-star">*</span>
        </h4>
        <div className="details-grid card-look p-2">
          {organisationFields
            .filter((f) => f.name.startsWith("headOffice"))
            .map((field) => (
              <label
                className={`details-field ${field.fullWidth ? "full-field" : ""}`}
                key={field.name}
                style={{ alignItems: "flex-start" }}
              >
                <span className="field-label-line">
                  <span className="field-label-text">{field.label.replace("Head Office ", "")}</span>
                  {field.required ? <span className="required-star">*</span> : null}
                </span>
                <div style={{ width: "100%" }}>
                  <input
                    type="text"
                    name={field.name}
                    value={organisationDraft[field.name] || ""}
                    onChange={handleOrganisationChange}
                    onKeyDown={field.digits ? allowOnlyDigits : undefined}
                    onPaste={field.digits ? preventNonDigitPaste : undefined}
                    placeholder={`Enter ${field.label.replace("Head Office ", "")}`}
                    disabled={!isEditEnabled}
                    maxLength={field.digits || undefined}
                  />
                </div>
              </label>
            ))}
        </div>
      </div>

      <div className="office-block mt-3">

        <h4>Regional / Branch Offices</h4>
        <div className="multi-list">
          {branches.map((branch, idx) => (
            <div className="multi-form-entry card-look mb-1" key={branch.id}>
              <div className="multi-form-header">
                <span className="subheading-required">
                  <span className="subheading-text">
                    Branch Location #{idx + 1}
                  </span>
                  <span className="required-star" style={{ color: "red" }}>
                    *
                  </span>
                </span>
                {branches.length > 1 && <button
                      type="button"
                      className="delete-entry-btn"
                      onClick={() => setBranches(prev => prev.filter(b => b.id !== branch.id))}
                      disabled={!isEditEnabled}
                    >
                      ✕ Remove
                    </button>

                }
              </div>
              <div className="branch-entry-form">
                <label className="details-field">
                  <span>Branch Name</span>
                  <input
                    type="text"
                    name="branchName"
                    value={branch.branchName}
                    onChange={(e) => handleListChange(setBranches, idx, e)}
                    placeholder="e.g. Pune Regional"
                    disabled={!isEditEnabled}
                  />
                </label>
                <label className="details-field">
                  <span>State</span>
                  <input
                    type="text"
                    name="state"
                    value={branch.state}
                    onChange={(e) => handleListChange(setBranches, idx, e)}
                    placeholder="State"
                    disabled={!isEditEnabled}
                  />
                </label>
                <label className="details-field">
                  <span>City</span>
                  <input
                    type="text"
                    name="city"
                    value={branch.city}
                    onChange={(e) => handleListChange(setBranches, idx, e)}
                    placeholder="City"
                    disabled={!isEditEnabled}
                  />
                </label>
                <label className="details-field full-field">
                  <span>Full Address</span>
                  <input
                    type="text"
                    name="address"
                    value={branch.address}
                    onChange={(e) => handleListChange(setBranches, idx, e)}
                    placeholder="Complete branch address"
                    disabled={!isEditEnabled}
                  />
                </label>
                <label className="details-field">
                  <span>Pincode </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    name="pincode"
                    value={branch.pincode || ""}
                    onChange={(e) => handleListChange(setBranches, idx, e, { digits: 6 })}
                    onKeyDown={allowOnlyDigits}
                    onPaste={preventNonDigitPaste}
                    placeholder="6-digit pincode"
                    disabled={!isEditEnabled}
                    maxLength="6"
                  />
                </label>
              </div>
            </div>
          ))}
          <button
            type="button"
            className="add-more-section-btn"
            onClick={() => setBranches(prev => [...prev, { ...initialBranchDraft, id: `branch-${Date.now()}` }])}
            disabled={!isEditEnabled}
          >
            + Add Another Branch Office
          </button>

        </div>
      </div>

      <div className="office-block mt-3">
        <h4>Active Partners / Directors</h4>
        <div className="multi-list">
          {partners.map((partner, idx) => (
            <div className="multi-form-entry card-look mb-1" key={partner.id}>
              <div className="multi-form-header">
                <span className="subheading-required">
                  <span className="subheading-text">
                    Executive Member #{idx + 1}
                  </span>
                  <span className="required-star" style={{ color: "red" }}>
                    *
                  </span>
                </span>
                {partners.length > 1 && <button
                      type="button"
                      className="delete-entry-btn"
                      onClick={() => setPartners(prev => prev.filter(p => p.id !== partner.id))}
                      disabled={!isEditEnabled}
                    >
                      ✕ Remove
                    </button>

                }
              </div>
              <div className="partner-entry-form">
                <label className="details-field">
                  <span>Full Name</span>
                  <input
                    type="text"
                    name="name"
                    value={partner.name}
                    onChange={(e) => handleListChange(setPartners, idx, e)}
                    placeholder="Member name"
                    disabled={!isEditEnabled}
                  />
                </label>
                <label className="details-field">
                  <span>Designation</span>
                  <input
                    type="text"
                    name="position"
                    value={partner.position}
                    onChange={(e) => handleListChange(setPartners, idx, e)}
                    placeholder="e.g. MD / CEO"
                    disabled={!isEditEnabled}
                  />
                </label>
                <label className="details-field">
                  <span>Personal Mobile</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    name="phoneNumber"
                    value={partner.phoneNumber}
                    onChange={(e) => handleListChange(setPartners, idx, e, { digits: 10 })}
                    onKeyDown={allowOnlyDigits}
                    onPaste={preventNonDigitPaste}
                    placeholder="Mobile number"
                    disabled={!isEditEnabled}
                    maxLength="10"
                  />
                </label>
                <label className="details-field full-field">
                  <span>Residential Address</span>
                  <input
                    type="text"
                    name="address"
                    value={partner.address}
                    onChange={(e) => handleListChange(setPartners, idx, e)}
                    placeholder="Member complete address"
                    disabled={!isEditEnabled}
                  />
                </label>
                <label className="details-field">
                  <span>Pincode</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    name="pincode"
                    value={partner.pincode || ""}
                    onChange={(e) => handleListChange(setPartners, idx, e, { digits: 6 })}
                    onKeyDown={allowOnlyDigits}
                    onPaste={preventNonDigitPaste}
                    placeholder="6-digit pincode"
                    disabled={!isEditEnabled}
                    maxLength="6"
                  />
                </label>
                <label className="check-field">
                  <input
                    type="checkbox"
                    name="isAuthorized"
                    checked={partner.isAuthorized}
                    onChange={(e) => handleListChange(setPartners, idx, e)}
                    disabled={!isEditEnabled}
                  />
                  <span>Authorized person?</span>
                </label>
              </div>
            </div>
          ))}
          <button
            type="button"
            className="add-more-section-btn"
            onClick={() => setPartners(prev => [...prev, { ...initialPartnerDraft, id: `partner-${Date.now()}` }])}
            disabled={!isEditEnabled}
          >
            + Add Partner / Director
          </button>

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
            {isUpdateMode ? "Update" : "Save"}
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
  );
}

export default Organisation;
