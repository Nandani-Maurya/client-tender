import { useState, useEffect, useMemo } from "react";
import alerts from "../../../../utils/alerts";
import * as categoryService from "../../../../services/category.service";
import DetailsDataTable from "../../common/DetailsDataTable";
import "./TenderCategories.css";

function TenderCategories() {
  const [tenderCategories, setTenderCategories] = useState([]);
  const [tenderCategoryMode, setTenderCategoryMode] = useState("list");
  const [tenderCategoryDraft, setTenderCategoryDraft] = useState({category_name: "", category_description: "",});
  const [editingTenderCategoryId, setEditingTenderCategoryId] = useState(null);
  const [viewingCategory, setViewingCategory] = useState(null);

  const fetchTenderCategories = async () => {
    try {
      const resp = await categoryService.getTenderCategories();
      if (resp.success) {
        setTenderCategories(resp.data);
      } else {
        alerts.error("Error", resp.message || "Failed to load categories");
      }
    } catch (err) {
      alerts.error("Error", "Failed to load categories");
      console.error("Failed to load categories", err);
    }
  };

  useEffect(() => {
    fetchTenderCategories();
  }, []);

  const handleTenderCategoryDraftChange = (e) => {
    const { name, value } = e.target;
    setTenderCategoryDraft((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveTenderCategory = async () => {
    if (!tenderCategoryDraft.category_name.trim()) {
      return alerts.info("Info", "Category value is required");
    }
    if (!tenderCategoryDraft.category_description.trim()) {
      return alerts.info("Info", "Category description is required");
    }

    const isEditing = !!editingTenderCategoryId;

    try {
      let resp;
      if (isEditing) {
        resp = await categoryService.updateTenderCategory(
          editingTenderCategoryId,
          tenderCategoryDraft,
        );
      } else {
        resp = await categoryService.createTenderCategory(tenderCategoryDraft);
      }
      if (resp.success) {
        await fetchTenderCategories();

        setTenderCategoryMode("list");
        setTenderCategoryDraft({ category_name: "", category_description: "" });
        setEditingTenderCategoryId(null);
        alerts.success(
          "Success",
          isEditing
            ? "Category updated successfully"
            : "Tender Category added successfully",
        );
      } else {
        alerts.info("Info", resp.message);
      }
    } catch (error) {
      alerts.error("Error", error.message || "Failed to save category");
      console.error("Debug Error:", error);
    }
  };

  const handleEditTenderCategory = (cat) => {
    setTenderCategoryDraft({
      category_name: cat.category_name,
      category_description: cat.category_description,
    });
    setEditingTenderCategoryId(cat.id);
    setTenderCategoryMode("form");
  };

  const handleDeleteTenderCategory = async (id) => {
    const confirm = await alerts.confirm(
      "Are you sure?",
      "You want to delete this record?",
    );
      if (confirm.isConfirmed) {
      try {
        const resp = await categoryService.deleteTenderCategory(id);
        if (resp.success) {
          await fetchTenderCategories();
          alerts.success("Deleted", "Category deleted successfully");
        } else {
          alerts.info("Info", resp.message || "Unable to delete category");
        }
      } catch (error) {
        alerts.error("Error", error.message || "Failed to delete category");
      }
    }
  };

  const handleCancelTenderCategory = async () => {
    const confirm = await alerts.confirm(
      "Cancel changes?",
      "Are you sure you want to cancel? Unsaved changes will be lost.",
    );

    if (confirm.isConfirmed) {
      setTenderCategoryMode("list");
      setEditingTenderCategoryId(null);
      setTenderCategoryDraft({
        category_name: "",
        category_description: "",
      });
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "category_name",
        header: "Category Value",
        Cell: ({ cell }) => (
          <span className="bold-label">{cell.getValue() || "-"}</span>
        ),
      },
      {
        accessorKey: "category_description",
        header: "Description",
        Cell: ({ cell }) => cell.getValue() || "-",
      },
      {
        id: "actions",
        header: "Action",
        enableSorting: false,
        enableColumnFilter: false,
        Cell: ({ row }) => {
          const cat = row.original;
          return (
            <div className="row-actions">
              <button
                type="button"
                className="view-row-btn"
                onClick={() => setViewingCategory(cat)}
              >
                View
              </button>
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
          );
        },
      },
    ],
    [],
  );

  return (
    <section className="details-section">
      <h3>Tender Category Management</h3>
      <p className="section-helper">
        Identify tender category types (e.g. NIT, RFP, EOI). Short forms are
        saved as values, full forms as descriptions.
      </p>

      {tenderCategoryMode === "list" ? (
        <>
          <div className="section-actions">
            <button type="button" onClick={() => setTenderCategoryMode("form")}>
              + Add New Category
            </button>
          </div>

          <DetailsDataTable
            columns={columns}
            data={tenderCategories}
            emptyMessage="No categories found in system."
          />

          {viewingCategory && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h4>{viewingCategory.category_name} Details</h4>
                  <button
                    type="button"
                    className="modal-close-btn"
                    onClick={() => setViewingCategory(null)}
                  >
                    ✕
                  </button>
                </div>
                <div className="modal-body">
                  <div className="card-look">
                    <p>
                      <strong>Category Name (Value):</strong>{" "}
                      {viewingCategory.category_name}
                    </p>
                    <p>
                      <strong>Description:</strong>{" "}
                      {viewingCategory.category_description ||
                        "No description available"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="premium-compact-form">
          <div className="details-grid">
            <label className="details-field">
              <span className="field-label-line">
                <span className="field-label-text">Category Value (Short Form)</span>
                <span className="required-star">*</span>
              </span>
              <input
                type="text"
                name="category_name"
                value={tenderCategoryDraft.category_name}
                onChange={handleTenderCategoryDraftChange}
                placeholder="e.g. RFP"
                required
              />
            </label>
            <label className="details-field">
              <span className="field-label-line">
                <span className="field-label-text">Full Description</span>
                <span className="required-star">*</span>
              </span>
              <input
                type="text"
                name="category_description"
                value={tenderCategoryDraft.category_description}
                onChange={handleTenderCategoryDraftChange}
                placeholder="e.g. Request For Proposal"
              />
            </label>
          </div>

          <div className="form-submit-actions">
            <button
              type="button"
              onClick={handleSaveTenderCategory}
              className="save-btn"
            >
              {!!editingTenderCategoryId ? "Update" : "Save"}
            </button>
            <button
              type="button"
              onClick={handleCancelTenderCategory}
              className="cancel-btn"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default TenderCategories;
