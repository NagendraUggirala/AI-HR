import React, { useState } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';

const OrgInfo = () => {
  const [formData, setFormData] = useState({
    companyName: 'Veritech Software Web Development Services',
    website: 'https://veritechsoft.com',
    email: 'hr@veritechsoft.com',
    phone: '+91 98765 43210',
    address: 'Plot 45, Tech Park Road, Hyderabad, Telangana',
    about: 'We specialize in modern web solutions using React, Node, and Python to deliver scalable applications.'
  });

  const [logo, setLogo] = useState({
    file: null,
    preview: 'https://via.placeholder.com/200x200/3b82f6/ffffff?text=Veritech',
    name: 'veritech_logo.png'
  });

  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('Nagendra Uggirala on 08 Oct 2025');
  const [isDragging, setIsDragging] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, logo: 'File size must be less than 2MB' }));
        return;
      }
      if (!['image/png', 'image/jpeg', 'image/svg+xml'].includes(file.type)) {
        setErrors(prev => ({ ...prev, logo: 'Only PNG, JPG, and SVG files are allowed' }));
        return;
      }
     
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo({
          file: file,
          preview: reader.result,
          name: file.name
        });
        setErrors(prev => ({ ...prev, logo: '' }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
   
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }
   
    if (!formData.website.trim()) {
      newErrors.website = 'Website URL is required';
    } else if (!/^https?:\/\/.+\..+/.test(formData.website)) {
      newErrors.website = 'Please enter a valid URL (e.g., https://example.com)';
    }
   
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
   
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
   
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
   
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      setShowSuccess(true);
      setLastUpdated(`Nagendra Uggirala on ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleReset = () => {
    // Confirm before resetting
    if (window.confirm('Are you sure you want to reset all changes? This will restore the form to its original values.')) {
      // Reset form data to original values
      setFormData({
        companyName: 'Veritech Software Web Development Services',
        website: 'https://veritechsoft.com',
        email: 'hr@veritechsoft.com',
        phone: '+91 98765 43210',
        address: 'Plot 45, Tech Park Road, Hyderabad, Telangana',
        about: 'We specialize in modern web solutions using React, Node, and Python to deliver scalable applications.'
      });
     
      // Reset logo to original state
      setLogo({
        file: null,
        preview: 'https://via.placeholder.com/200x200/3b82f6/ffffff?text=Veritech',
        name: 'veritech_logo.png'
      });
     
      // Clear all errors
      setErrors({});
     
      // Hide success message
      setShowSuccess(false);
     
      // Reset drag state
      setIsDragging(false);
     
      // Reset any file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) {
        fileInput.value = '';
      }
     
      console.log('Form reset successfully');
    }
  };

  const handleDragStart = (e) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            {/* Header */}
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-24">
              <h6 className="fw-semibold mb-0">Company Settings</h6>
              <ul className="d-flex align-items-center gap-2">
                <li className="fw-medium">
                  <a href="#" className="d-flex align-items-center gap-1 hover-text-primary">
                    <Icon icon="solar:home-smile-angle-outline" className="icon text-lg" />
                    Dashboard
                  </a>
                </li>
                <li>-</li>
                <li className="fw-medium">Settings</li>
                <li>-</li>
                <li className="fw-medium">Org Info</li>
              </ul>
            </div>

            {/* Success Message */}
            {showSuccess && (
              <div className="alert alert-success d-flex align-items-center mb-4" role="alert">
                <Icon icon="heroicons:check-circle" className="me-2" />
                <span className="fw-medium">Company details updated successfully!</span>
              </div>
            )}

            {/* Main Form Card */}
            <div
              className="card shadow-lg border-0"
              draggable
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              style={{
                cursor: isDragging ? 'grabbing' : 'grab',
                opacity: isDragging ? 0.8 : 1
              }}
            >
              <div className="card-body p-4">
                <div className="row">
                  {/* Left Column - Form Fields */}
                  <div className="col-lg-8">
                    <div className="mb-4">
                      <label className="form-label fw-semibold text-dark fs-5">
                        Company Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        className={`form-control form-control-lg ${errors.companyName ? 'is-invalid' : ''}`}
                        placeholder="Enter official company name"
                      />
                      {errors.companyName && (
                        <div className="invalid-feedback d-flex align-items-center">
                          <Icon icon="heroicons:exclamation-triangle" className="me-1" />
                          {errors.companyName}
                        </div>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-semibold text-dark fs-5">
                        <Icon icon="heroicons:globe-alt" className="me-1" style={{ fontSize: "25px" }} />
                        Website URL <span className="text-danger">*</span>
                      </label>
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        className={`form-control form-control-lg ${errors.website ? 'is-invalid' : ''}`}
                        placeholder="https://example.com"
                      />
                      {errors.website && (
                        <div className="invalid-feedback d-flex align-items-center">
                          <Icon icon="heroicons:exclamation-triangle" className="me-1" />
                          {errors.website}
                        </div>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-semibold text-dark fs-5">
                        <Icon icon="heroicons:envelope" className="me-1" style={{ fontSize: "25px" }}  />
                        Company Email <span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`form-control form-control-lg ${errors.email ? 'is-invalid' : ''}`}
                        placeholder="careers@example.com"
                      />
                      {errors.email && (
                        <div className="invalid-feedback d-flex align-items-center">
                          <Icon icon="heroicons:exclamation-triangle" className="me-1" />
                          {errors.email}
                        </div>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-semibold text-dark fs-5">
                        <Icon icon="heroicons:phone" className="me-1" style={{ fontSize: "25px" }} />
                        Company Phone <span className="text-danger">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`form-control form-control-lg ${errors.phone ? 'is-invalid' : ''}`}
                        placeholder="+91 98765 43210"
                      />
                      {errors.phone && (
                        <div className="invalid-feedback d-flex align-items-center">
                          <Icon icon="heroicons:exclamation-triangle" className="me-1" />
                          {errors.phone}
                        </div>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-semibold text-dark fs-5">
                        <Icon icon="heroicons:map-pin" className="me-1" style={{ fontSize: "25px" }} />
                        Address <span className="text-danger">*</span>
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows="3"
                        className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                        placeholder="Full office address or headquarters"
                      />
                      {errors.address && (
                        <div className="invalid-feedback d-flex align-items-center">
                          <Icon icon="heroicons:exclamation-triangle" className="me-1" />
                          {errors.address}
                        </div>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-semibold text-dark fs-5">
                        About Company <span className="text-muted small">(Optional)</span>
                      </label>
                      <textarea
                        name="about"
                        value={formData.about}
                        onChange={handleInputChange}
                        rows="4"
                        className="form-control"
                        placeholder="Brief description about your company culture or mission"
                      />
                    </div>
                  </div>

                  {/* Right Column - Logo Upload */}
                  <div className="col-lg-4">
                    <div className="mb-4">
                      <label className="form-label text-dark">
                       <h6>Company Logo</h6>
                      </label>
                     
                      {/* Logo Preview */}
                      <div className="mb-3 text-center">
                        <img
                          src={logo.preview}
                          alt="Company Logo"
                          className="img-fluid border border-2 rounded shadow-sm"
                          style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'contain' }}
                        />
                      </div>

                      {/* Upload Button */}
                      <label className="w-100">
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/svg+xml"
                          onChange={handleLogoUpload}
                          className="d-none"
                        />
                        <div className="border border-2 border-dashed border-secondary rounded p-4 text-center cursor-pointer hover-bg-light">
                          <Icon icon="heroicons:cloud-arrow-up" className="text-muted mb-2" style={{ fontSize: '2rem' }} />
                          <p className="fw-medium text-dark mb-1">Upload Logo</p>
                          <p className="small text-muted mb-0">PNG, JPG, SVG (Max 2MB)</p>
                        </div>
                      </label>

                      {errors.logo && (
                        <div className="text-danger small d-flex align-items-center mt-2">
                          <Icon icon="heroicons:exclamation-triangle" className="me-1" />
                          {errors.logo}
                        </div>
                      )}

                      {/* Current Logo Info */}
                      <div className="mt-3 small text-muted bg-light p-3 rounded">
                        <p className="fw-semibold mb-1">Current Logo:</p>
                        <p className="text-truncate mb-0">{logo.name}</p>
                      </div>
                    </div>

                    {/* Preview Note */}
                    <div className="bg-primary bg-opacity-10 border border-primary border-opacity-20 rounded p-3">
                      <p className="small fw-medium text-primary mb-1">
                        <Icon icon="heroicons:light-bulb" className="me-1" />
                        Preview Info
                      </p>
                      <p className="small text-primary mb-0">
                        This logo will appear on job postings, offer letters, and emails sent to candidates.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="card-footer bg-light d-flex justify-content-between align-items-center">
                <div className="small text-muted">
                  Last updated by <span className="fw-medium text-dark">{lastUpdated}</span>
                </div>
                <div className="d-flex gap-2">
                  <button
                    onClick={handleReset}
                    className="btn btn-outline-secondary d-flex align-items-center"
                  >
                    <Icon icon="heroicons:arrow-path" className="me-2" />
                    Reset
                  </button>
                  <button
                    onClick={handleSave}
                    className="btn btn-primary d-flex align-items-center"
                  >
                    <Icon icon="heroicons:check" className="me-2" />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>

            {/* Info Cards */}
            <div className="row mt-4">
              <div className="col-md-6 mb-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <h6 className="fw-semibold text-dark mb-2 d-flex align-items-center">
                      <Icon icon="heroicons:globe-alt" className="text-primary me-2" style={{ fontSize: "28px" }} />
                      Career Portal Display
                    </h6>
                    <p className="small text-muted mb-0">
                      Your company name and logo will be displayed prominently on your public career portal and job listings.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <h6 className="fw-semibold text-dark mb-2 d-flex align-items-center">
                      <Icon icon="heroicons:envelope" className="text-primary me-2" style={{ fontSize: "28px" }} />
                      Email Templates
                    </h6>
                    <p className="small text-muted mb-0">
                      All automated emails sent to candidates will include your company branding and contact information.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default OrgInfo;

