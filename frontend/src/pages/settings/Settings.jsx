import React from "react";
import { useNavigate } from "react-router-dom";
import "./Settings.css";

const Settings = () => {
  const navigate = useNavigate();

  // Navigation menu items mapping to wireframe specification
  const settingOptions = [
    {
      id: "my-trips",
      label: "My Trips",
      icon: "📅",
      path: "/my-trips",
    },
    {
      id: "my-vehicle",
      label: "My Vehicle",
      icon: "🚘",
      path: "/my-vehicle",
    },
    {
      id: "payment-method",
      label: "Payment Method",
      icon: "💳",
      path: "/payment",
    },
    {
      id: "ride-history",
      label: "Ride History",
      icon: "🕒",
      path: "/ride-history",
    },
    {
      id: "saved-places",
      label: "Saved Places",
      icon: "📍",
      path: "/saved-places",
    },
    {
      id: "help",
      label: "Help",
      icon: "❓",
      path: "/help",
    },
    {
      id: "chat",
      label: "Chat",
      icon: "💬",
      path: "/chat",
    },
  ];

  const handleNavigation = (path) => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <div className="settings-page">
      {/* Sidebar */}
      <aside className="settings-sidebar">
        <h2 className="sidebar-title">Setting</h2>
      </aside>

      {/* Main Content Area */}
      <main className="settings-main-content">
        {/* Header */}
        <div className="settings-header">
          <span className="back-link" onClick={() => navigate(-1)}>
            &lt; Settings
          </span>
        </div>

        {/* Quick Access Menu Options List */}
        <div className="settings-options-list">
          {settingOptions.map((item) => (
            <div
              key={item.id}
              className="settings-item-card"
              onClick={() => handleNavigation(item.path)}
            >
              <div className="item-icon-wrapper">{item.icon}</div>
              <span className="item-label">{item.label}</span>
              <span className="item-chevron">&gt;</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Settings;