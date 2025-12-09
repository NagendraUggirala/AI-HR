import React, { useState } from 'react';
import { Plus, Edit3, Trash2, GripVertical, Save, X, Check } from 'lucide-react';

const Stages = () => {
  const [stages, setStages] = useState([
    { id: 1, name: 'Applied', type: 'Screening', order: 1 },
    { id: 2, name: 'Phone Screen', type: 'Screening', order: 2 },
    { id: 3, name: 'Interview', type: 'Interview', order: 3 },
    { id: 4, name: 'Onsite Interview', type: 'Interview', order: 4 },
    { id: 5, name: 'Offer Extended', type: 'Decision', order: 5 },
    { id: 6, name: 'Hired', type: 'Final', order: 6 },
    { id: 7, name: 'Rejected', type: 'Final', order: 7 }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [stageToDelete, setStageToDelete] = useState(null);
  const [editingStage, setEditingStage] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [draggedStage, setDraggedStage] = useState(null);
  const [newStage, setNewStage] = useState({ name: '', type: 'Screening' });
  const [hasChanges, setHasChanges] = useState(false);

  const stageTypes = ['Screening', 'Interview', 'Decision', 'Final'];
  const getStageTypeBadgeClass = (type) => {
    const typeClasses = {
      'Screening': 'badge bg-primary-50 text-primary-600 border',
      'Interview': 'badge bg-warning-50 text-warning-600 border',
      'Decision': 'badge bg-info-50 text-info-600 border',
      'Final': 'badge bg-success-50 text-success-600 border'
    };
    return typeClasses[type] || 'badge bg-secondary-50 text-secondary-600 border';
  };

  const handleDragStart = (e, stage) => {
    setDraggedStage(stage);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetStage) => {
    e.preventDefault();
    if (!draggedStage || draggedStage.id === targetStage.id) return;

    const newStages = [...stages];
    const draggedIndex = newStages.findIndex(s => s.id === draggedStage.id);
    const targetIndex = newStages.findIndex(s => s.id === targetStage.id);

    // Remove dragged stage and insert at new position
    const [removed] = newStages.splice(draggedIndex, 1);
    newStages.splice(targetIndex, 0, removed);

    // Update order values
    const updatedStages = newStages.map((stage, index) => ({
      ...stage,
      order: index + 1
    }));

    setStages(updatedStages);
    setDraggedStage(null);
    setHasChanges(true);
  };

  const handleEditStart = (stage) => {
    setEditingStage(stage.id);
    setEditingName(stage.name);
  };

  const handleEditSave = (stageId) => {
    setStages(stages.map(stage => 
      stage.id === stageId 
        ? { ...stage, name: editingName }
        : stage
    ));
    setEditingStage(null);
    setEditingName('');
    setHasChanges(true);
  };

  const handleEditCancel = () => {
    setEditingStage(null);
    setEditingName('');
  };

  const handleTypeChange = (stageId, newType) => {
    setStages(stages.map(stage => 
      stage.id === stageId 
        ? { ...stage, type: newType }
        : stage
    ));
    setHasChanges(true);
  };

  const handleDeleteStage = (stageId) => {
    const stage = stages.find(s => s.id === stageId);
    setStageToDelete(stage);
    setShowDeleteModal(true);
  };

  const confirmDeleteStage = () => {
    if (stageToDelete) {
      setStages(stages.filter(stage => stage.id !== stageToDelete.id));
      setHasChanges(true);
      setShowDeleteModal(false);
      setStageToDelete(null);
    }
  };

  const cancelDeleteStage = () => {
    setShowDeleteModal(false);
    setStageToDelete(null);
  };

  const handleAddStage = () => {
    if (newStage.name.trim()) {
      const maxId = Math.max(...stages.map(s => s.id), 0);
      const newStageObj = {
        id: maxId + 1,
        name: newStage.name.trim(),
        type: newStage.type,
        order: stages.length + 1
      };
      setStages([...stages, newStageObj]);
      setNewStage({ name: '', type: 'Screening' });
      setShowAddModal(false);
      setHasChanges(true);
    }
  };

  const handleSaveWorkflow = () => {
    // Simulate saving to backend
    setHasChanges(false);
    // Show success message
    const successMsg = document.createElement('div');
    successMsg.className = 'position-fixed top-0 end-0 bg-success text-white px-16 py-8 rounded shadow-lg z-3 m-16';
    successMsg.textContent = 'Pipeline workflow saved successfully!';
    document.body.appendChild(successMsg);
    setTimeout(() => successMsg.remove(), 3000);
  };

  return (
    <div className='container-fluid py-4'>
      {/* Header */}
      <div className='mb-12'>
        <h4 className='mb-2'>Pipeline Stages</h4>
        <p className='text-secondary-light mb-0'>Customize your hiring workflow by adding, editing, and reordering stages.</p>
      </div>
      
      <div className='card border shadow-none mb-24'>
        <div className='card-header bg-base border-bottom d-flex align-items-center justify-content-between'>
          <h5 className='card-title mb-0'>Manage Stages</h5>
          <div className='d-flex gap-2'>
            <button
              onClick={() => setShowAddModal(true)}
              className='btn btn-primary d-inline-flex align-items-center justify-content-center gap-2'
            >
              <Plus size={16} />
              Add Stage
            </button>
            {hasChanges && (
              <button
                onClick={handleSaveWorkflow}
                className='btn btn-success d-inline-flex align-items-center justify-content-center gap-2'
              >
                <Save size={16} />
                Save Workflow
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      {stages.length === 0 ? (
        // Empty State
        <div className='card border border-dashed border-secondary-light'>
          <div className='card-body p-48 text-center'>
            <div className='w-64-px h-64-px bg-primary-50 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-16'>
              <Plus size={32} className='text-primary-600' />
            </div>
            <h5 className='mb-8'>No stages defined yet</h5>
            <p className='text-secondary-light mb-24'>Add your first stage to start building your pipeline.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className='btn btn-primary d-flex align-items-center justify-content-center'
            >
              + Add Stage
            </button>
          </div>
        </div>
      ) : (
        // Stages List
        <div className='card border shadow-none'>
          <div className='card-header bg-base border-bottom'>
            <h5 className='card-title mb-0'>Current Pipeline Stages</h5>
            <small className='text-secondary-light'>Drag and drop to reorder stages</small>
          </div>
          <div className='card-body p-0'>
            {stages.sort((a, b) => a.order - b.order).map((stage) => (
              <div
                key={stage.id}
                className={`p-16 d-flex align-items-center gap-3 border-bottom ${
                  draggedStage?.id === stage.id ? 'opacity-50' : ''
                }`}
                draggable
                onDragStart={(e) => handleDragStart(e, stage)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage)}
              >
                {/* Drag Handle */}
                <div className='cursor-grab active:cursor-grabbing text-secondary-light hover-text-primary'>
                  <GripVertical size={20} />
                </div>

                {/* Order Number */}
                <div className='w-32-px h-32-px bg-primary-50 rounded-circle d-flex align-items-center justify-content-center text-sm fw-medium text-primary-600'>
                  {stage.order}
                </div>

                {/* Stage Name */}
                <div className='flex-grow-1'>
                  {editingStage === stage.id ? (
                    <div className='d-flex align-items-center gap-2'>
                      <input
                        type='text'
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className='form-control form-control-sm'
                        autoFocus
                      />
                      <button
                        onClick={() => handleEditSave(stage.id)}
                        className='btn btn-link text-success p-0'
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={handleEditCancel}
                        className='btn btn-link text-secondary-light p-0'
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <span className='text-lg fw-medium'>{stage.name}</span>
                  )}
                </div>

                {/* Stage Type */}
                <div style={{ minWidth: '140px' }}>
                  <select
                    value={stage.type}
                    onChange={(e) => handleTypeChange(stage.id, e.target.value)}
                    className={`form-select form-select-sm form-select-center ${getStageTypeBadgeClass(stage.type)}`}
                    style={{ 
                      minWidth: '120px', 
                      paddingRight: '30px',
                      backgroundPosition: 'right 8px center'
                    }}
                  >
                    {stageTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Actions */}
                <div className='d-flex align-items-center gap-2'>
                  <button
                    onClick={() => handleEditStart(stage)}
                    className='btn btn-link text-secondary-light hover-text-primary p-2'
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteStage(stage.id)}
                    className='btn btn-link text-secondary-light hover-text-danger p-2'
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Stage Modal */}
      {showAddModal && (
        <>
          <div className='modal d-block' tabIndex='-1' role='dialog'>
            <div className='modal-dialog' role='document'>
              <div className='modal-content'>
                <div className='modal-header'>
                  <h5 className='modal-title mb-0'>Add New Stage</h5>
                  <button
                    type='button'
                    className='btn-close'
                    aria-label='Close'
                    onClick={() => setShowAddModal(false)}
                  ></button>
                </div>
                <div className='modal-body'>
                  <div className='d-grid gap-3'>
                    <div>
                      <label className='form-label'>Stage Name</label>
                      <input
                        type='text'
                        value={newStage.name}
                        onChange={(e) => setNewStage({ ...newStage, name: e.target.value })}
                        placeholder='e.g., HR Review'
                        className='form-control'
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className='form-label'>Stage Type</label>
                      <select
                        value={newStage.type}
                        onChange={(e) => setNewStage({ ...newStage, type: e.target.value })}
                        className='form-select'
                      >
                        {stageTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className='modal-footer'>
                  <button
                    type='button'
                    className='btn btn-secondary d-flex align-items-center justify-content-center'
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type='button'
                    className='btn btn-primary d-flex align-items-center justify-content-center'
                    onClick={handleAddStage}
                    disabled={!newStage.name.trim()}
                  >
                    Add Stage
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className='modal-backdrop fade show'></div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && stageToDelete && (
        <>
          <div className='modal d-block' tabIndex='-1' role='dialog'>
            <div className='modal-dialog' role='document'>
              <div className='modal-content'>
                <div className='modal-header'>
                  <h5 className='modal-title mb-0'>Delete Stage</h5>
                  <button
                    type='button'
                    className='btn-close'
                    aria-label='Close'
                    onClick={cancelDeleteStage}
                  ></button>
                </div>
                <div className='modal-body'>
                  <p className='mb-0'>
                    Are you sure you want to delete the stage <strong>"{stageToDelete.name}"</strong>? 
                    This action cannot be undone.
                  </p>
                </div>
                <div className='modal-footer'>
                  <button
                    type='button'
                    className='btn btn-secondary d-flex align-items-center justify-content-center'
                    onClick={cancelDeleteStage}
                  >
                    Cancel
                  </button>
                  <button
                    type='button'
                    className='btn btn-danger d-flex align-items-center justify-content-center'
                    onClick={confirmDeleteStage}
                  >
                    Delete Stage
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className='modal-backdrop fade show'></div>
        </>
      )}
    </div>
  );
};

export default Stages;