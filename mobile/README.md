# TMS Facilities & Maintenance — React Native Mobile App

A modern, enterprise-grade React Native & Expo mobile application designed for campus and facility maintenance ticket management.

---

## 🎨 UI/UX Design System Highlights

- **Executive Obsidian Dark Theme**: Sleek slate headers (`#0F172A`) paired with clean light canvas backgrounds (`#F8FAFC`) and card surfaces (`#FFFFFF`).
- **Standardized Status Indicators**: Consistent visual hierarchy with dot-badges and left accent bars across all tickets:
  - ⏳ **Pending**: Warm Amber (`#F59E0B`, `#FFFBEB`)
  - 👤 **Assigned**: Ocean Sky Blue (`#0EA5E9`, `#F0F9FF`)
  - ⚙️ **In-Progress**: Electric Indigo (`#6366F1`, `#EEF2FF`)
  - ⏸️ **On-Hold**: Rose / Red (`#EF4444`, `#FEF2F2`)
  - ✅ **Completed**: Emerald Green (`#10B981`, `#ECFDF5`)
- **Interactive Issue Grid**: Visual selectable tiles for maintenance categories (⚡ Electrical, 🚰 Plumbing, 🪚 Carpentry, 💻 IT Support, ❄️ AC / HVAC, 🧹 Housekeeping, 🔧 General).
- **Resolution Lifecycle Stepper**: Step-by-step progress tracking (`Submitted` ➔ `Assigned` ➔ `Repairing` ➔ `Resolved`).
- **One-Tap Quick Role Presets**: Immediate one-click login for SuperAdmin, Technician, and Faculty/User directly on the login screen.

---

## 📂 Project Structure

```
mobile/
├── App.js                         # Root application entry with Theme & AuthProvider
├── app.json                       # Expo configuration & app branding
├── package.json                   # Dependencies & npm scripts
└── src/
    ├── api/                       # API clients and endpoints (axios)
    │   ├── auth.js
    │   ├── client.js
    │   ├── complaints.js
    │   └── masters.js
    ├── components/                # Reusable UI components
    │   ├── CategoryGrid.js        # Visual issue category selector
    │   ├── CustomPicker.js        # Bottom-sheet searchable dropdown
    │   ├── ImagePickerInput.js    # Camera & gallery attachment uploader
    │   ├── LifecycleStepper.js    # Resolution progress tracker
    │   ├── ResponsiveContainer.js # Web / mobile viewport wrapper
    │   ├── StatCard.js            # Metric tile with live indicator
    │   ├── StatusBadge.js         # Status chip with dot indicator
    │   └── TicketCard.js          # Elevated ticket card with left accent bar
    ├── constants/
    │   ├── colors.js              # Backward-compatible color tokens
    │   ├── config.js              # Base API URL configuration
    │   └── theme.js               # Comprehensive design tokens, palette & shadows
    ├── context/
    │   └── AuthContext.js         # JWT auth state & user role management
    ├── navigation/
    │   ├── AppNavigator.js        # Root navigation controller
    │   ├── AuthNavigator.js       # Login stack
    │   └── MainTabNavigator.js    # Bottom tab bar & nested stacks
    └── screens/
        ├── auth/
        │   └── LoginScreen.js     # Enterprise login with one-tap role presets
        ├── complaints/
        │   ├── ComplaintDetailScreen.js # Ticket details, lifecycle & status actions
        │   ├── ComplaintListScreen.js   # Searchable ticket feed with count tabs
        │   └── RaiseComplaintScreen.js  # 3-step structured ticket submission form
        ├── dashboard/
        │   └── DashboardScreen.js # Executive metrics, greeting & quick launch
        ├── masters/               # Admin master data management
        │   ├── BlockMasterScreen.js
        │   ├── DepartmentMasterScreen.js
        │   ├── MasterHubScreen.js
        │   ├── ProgrammeMasterScreen.js
        │   ├── RoleMasterScreen.js
        │   ├── RoomMasterScreen.js
        │   └── UserMasterScreen.js
        └── reports/
            └── ReportsScreen.js   # Resolution analytics & audit history log
```

---

## 🚀 How to Run

### 1. Start the Backend API Server
```bash
cd backend
node server.js
# API runs at http://localhost:5000
```

### 2. Start the React Native App (Expo)
```bash
cd mobile

# Run in Web Browser
npm run web

# Run on Android Emulator / Physical Device
npm run android

# Run Metro Bundler with Expo Go
npm start
```

---

## 🔑 Default Credentials (Verified & Active)

| Role | Username | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **👑 SuperAdmin** | `admin` | `password123` | Full system access (Dashboard, Tickets, Masters Hub, Analytics) |
| **🔧 Technician** | `Tech_tms` | `tech123` | Task queue, ticket progress updates, status transitions |
| **🎓 Faculty / User** | `CS(HOD)` | `password123` | Facility ticket reporting, status tracking, personal history |
