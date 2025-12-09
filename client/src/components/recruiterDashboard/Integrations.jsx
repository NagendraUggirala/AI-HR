import React, { useState } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';

const Integrations = () => {
  const [integrations, setIntegrations] = useState([
    {
      id: 'slack',
      name: 'Slack',
      description: 'Get real-time hiring notifications in Slack channels.',
      status: 'connected',
      lastSync: '2 hours ago',
      settings: {
        channel: '#recruitment',
        notifications: ['new_candidate', 'stage_change']
      }
    },
    {
      id: 'gmail',
      name: 'Gmail',
      description: 'Sync recruiter inbox for candidate emails and updates.',
      status: 'disconnected',
      lastSync: null,
      settings: null
    },
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      description: 'Auto-schedule interviews directly from the platform.',
      status: 'disconnected',
      lastSync: null,
      settings: null
    },
    {
      id: 'ats',
      name: 'ATS (External System)',
      description: 'Import job data or export candidates to another ATS.',
      status: 'connected',
      lastSync: '15 minutes ago',
      settings: {
        syncFrequency: 'hourly',
        autoExport: true
      }
    }
  ]);

  const [notification, setNotification] = useState(null);
  const [showSettings, setShowSettings] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleConnect = (id, name) => {
    setIntegrations(integrations.map(int =>
      int.id === id
        ? { ...int, status: 'connected', lastSync: 'Just now', settings: { default: true } }
        : int
    ));
    setNotification({
      type: 'success',
      message: `You have successfully connected your ${name} workspace.`
    });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDisconnect = (id, name) => {
    setIntegrations(integrations.map(int =>
      int.id === id
        ? { ...int, status: 'disconnected', lastSync: null, settings: null }
        : int
    ));
    setNotification({
      type: 'info',
      message: `${name} disconnected successfully.`
    });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleTestConnection = (id, name) => {
    setNotification({
      type: 'success',
      message: `${name} connection test successful! ✓`
    });
    setTimeout(() => setNotification(null), 3000);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'connected':
        return (
          <span className="badge bg-success text-white d-flex align-items-center">
            <Icon icon="heroicons:check-circle" className="me-1" />
            Connected
          </span>
        );
      case 'error':
        return (
          <span className="badge bg-danger text-white d-flex align-items-center">
            <Icon icon="heroicons:x-circle" className="me-1" />
            Error
          </span>
        );
      default:
        return (
          <span className="badge bg-secondary text-white d-flex align-items-center">
            <div className="bg-white rounded-circle me-1" style={{ width: '8px', height: '8px' }}></div>
            Not Connected
          </span>
        );
    }
  };

  const getIntegrationIcon = (id) => {
    switch(id) {
      case 'slack':
        return 'heroicons:chat-bubble-left-right';
      case 'gmail':
        return 'heroicons:envelope';
      case 'google-calendar':
        return 'heroicons:calendar';
      default:
        return 'heroicons:server';
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
            <h6 className="fw-semibold mb-0">Integrations</h6>
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
              <li className="fw-medium">Integrations</li>
            </ul>
          </div>

          {/* Notification Banner */}
          {notification && (
            <div className={`alert alert-dismissible fade show mb-4 ${
              notification.type === 'success' ? 'alert-success' : 'alert-info'
            }`} role="alert">
              <span className="fw-medium">{notification.message}</span>
              <button
                type="button"
                className="btn-close"
                onClick={() => setNotification(null)}
              ></button>
            </div>
          )}

          {/* Integrations Grid */}
          <div className="row g-4">
            {integrations.map((integration) => (
              <div key={integration.id} className="col-md-6">
                <div
                  className="card shadow-sm border-0 h-100"
                  draggable
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  style={{
                    cursor: isDragging ? 'grabbing' : 'grab',
                    opacity: isDragging ? 0.8 : 1
                  }}
                >
                  <div className="card-body">
                    {/* Integration Header */}
                    <div className="d-flex align-items-start justify-content-between mb-3">
                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-primary bg-gradient rounded-2 d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                          <Icon icon={getIntegrationIcon(integration.id)} className="text-white" style={{ fontSize: '1.5rem' }} />
                        </div>
                        <div>
                          <h5 className="fw-semibold text-dark mb-0">{integration.name}</h5>
                          {integration.status === 'connected' && integration.settings && (
                            <button
                              onClick={() => setShowSettings(showSettings === integration.id ? null : integration.id)}
                              className="btn p-0 text-primary small d-flex align-items-center gap-1"
                            >
                              <Icon icon="heroicons:cog-6-tooth" className="small" />
                              Settings
                            </button>
                          )}
                        </div>
                      </div>
                      {getStatusBadge(integration.status)}
                    </div>

                    {/* Description */}
                    <p className="text-muted small mb-3">
                      {integration.description}
                    </p>

                    {/* Last Sync */}
                    {integration.status === 'connected' && integration.lastSync && (
                      <div className="d-flex align-items-center gap-2 text-muted small mb-3">
                        <Icon icon="heroicons:clock" className="fs-5" />
                        Last synced: {integration.lastSync}
                      </div>
                    )}

                    {/* Settings Panel */}
                    {showSettings === integration.id && integration.settings && (
                      <div className="mb-3 p-3 bg-light rounded border">
                        <h5 className="small fw-medium text-dark mb-2">Integration Settings</h5>
                        <div className="small text-muted">
                          {Object.entries(integration.settings).map(([key, value]) => (
                            <div key={key} className="d-flex justify-content-between mb-1">
                              <span className="text-capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                              <span className="fw-medium">
                                {typeof value === 'boolean' ? (value ? 'Enabled' : 'Disabled') :
                                 Array.isArray(value) ? value.join(', ') : value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="d-flex gap-2">
                      {integration.status === 'connected' ? (
                        <>
                          <button
                            onClick={() => handleDisconnect(integration.id, integration.name)}
                            className="btn btn-danger btn-sm d-flex align-items-center justify-content-center gap-1"
                          >
                            <Icon icon="heroicons:link-slash" className="small" />
                            Disconnect
                          </button>
                          <button
                            onClick={() => handleTestConnection(integration.id, integration.name)}
                            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                          >
                            Test
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleConnect(integration.id, integration.name)}
                          className="btn btn-primary btn-sm d-flex align-items-center justify-content-center gap-1"
                        >
                          <Icon icon="heroicons:link" className="small" />
                          Connect
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Info Card */}
          <div className="mt-4">
            <div className="card bg-primary bg-opacity-10 border border-primary border-opacity-20">
              <div className="card-body">
                <div className="d-flex align-items-start gap-3">
                  <Icon icon="heroicons:exclamation-triangle" className="text-primary mt-1 fs-5" />
                  <div>
                    <h6 className="fw-semibold text-primary mb-1">Need Help?</h6>
                    <p className="small text-primary mb-0">
                      Integrations help automate your recruitment workflow. For detailed setup guides, visit our documentation or contact support.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Integrations;

