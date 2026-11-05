# MyVote – Modern Online Voting System (React.js Frontend)

A modern, component-based frontend web application for online elections and ballot tallying, built with **React 18 + Vite**, **React Router v6**, **Lucide React**, **Web Crypto API (PBKDF2-SHA256)**, and **VoteBot – Your Smart Voting Assistant**.

---

## 🤖 VoteBot – Smart Voting Assistant

**VoteBot** is a fully functional, smart rule-based conversational virtual assistant integrated throughout the authenticated application.

### Key Capabilities:
* **Rule-Based Intent Detection**: Advanced text normalization, keyword clustering, synonym matching, and regex phrase detection recognizing multiple ways of asking questions (e.g. *"How can I vote?"*, *"Tell me the voting procedure"*, *"Where do I vote?"*).
* **Dynamic LocalStorage Data Retrieval**:
  * Real-time query of active, closed, and total elections.
  * Accurate candidate calculations and counts across configured ballots.
  * Live election deadlines and countdown calculations using stored closing timestamps.
* **Role-Based Assistance**:
  * **Voter Mode**: Explains voting steps, one-vote enforcement, active elections, result visualization, and navigation. Gated from administrative controls.
  * **Admin Mode**: Guides administrators on election creation, candidate reordering (`↑`/`↓`), user management, password resets, CSV data backups, and audit compliance.
* **Smart Navigation Integration**: Direct navigation to routes via React Router using role-enforced route allowlists (`/dashboard`, `/vote`, `/results`, `/settings`, `/users`, `/elections`, `/candidates`, `/audit`).
* **Contextual Quick Replies**: Dynamic suggestion pills tailored to the user's role and conversational context.
* **User-Scoped Persistent Chat History**:
  * Stored under `ov:chat_history:<userId>` in LocalStorage (capped at 100 messages).
  * Completely isolates Admin and Voter chat histories so switching accounts never leaks conversation data.
  * Features a **Clear Chat** action with confirmation dialog.
* **Responsive Floating UI**: Fixed bottom-right launcher button with unread pulse notification, desktop floating panel (380px x 540px), mobile-responsive interface, typing indicators, and minimize/close controls.

---

## 🚀 Key System Features

* **Role-Based Access Control (RBAC)**: Distinct workflows, routes, and UI permissions for **Administrators** and **Voters**.
* **Role-Based Settings**:
  * **Admin Settings**: Profile management, admin password change, theme switching, action toast toggles, and data governance (CSV Export, CSV Import, Factory Reset).
  * **Voter Settings**: Clean user-only view displaying profile info, name updates, self-service password change, theme preference, and registration details (data export/import/reset options are completely hidden and protected).
* **Enhanced User Management**:
  * Create new users with Full Name, Email, Role, Password (min 8 chars), and Confirm Password.
  * Show/Hide password eye toggle on all password fields with real-time validation feedback.
  * Edit user names, emails, and roles without exposing passwords.
  * Dedicated **Change Password** action for administrators to set new credentials for any user.
  * User Directory table displays Name, Email, Role, Account Status (`Active`), and action controls.
* **Cryptographic Web Crypto API (PBKDF2)**:
  * Client-side password encryption using PBKDF2 with SHA-256 (100,000 iterations) and 128-bit per-user salts (`pbkdf2$100000$<saltHex>$<hashHex>`).
  * Seamless backward compatibility and transparent upgrade of legacy demo accounts upon login.
  * Passwords and hashes are never exposed in UI tables, logs, or exports.
* **1-Click Demo Accounts**: Instant 1-click login for Administrator (`admin@example.com` / `admin`) and Voter (`voter@example.com` / `voter`).
* **Election Lifecycle & Countdown Timers**: Configure elections with optional closing dates, live second-by-second countdowns, and automatic deactivation upon expiry.
* **Ballot Candidate Management**: Add, remove, and reorder candidate display hierarchy (`↑` / `↓`).
* **Guaranteed One-Vote-Per-User**: Enforced at the ballot box using persistent per-election, per-user state keys.
* **Real-Time Canvas Analytics**: Custom, zero-dependency HTML5 2D Canvas horizontal bar charts with percentage calculations and color legends.
* **Audit Trail**: Security event logging retaining the latest 1,000 system actions with timestamp, user identity, and metadata.
* **Data Portability (CSV)**: Export and restore the complete system state using browser-native Blob and FileReader APIs.
* **Responsive Dark / Light Themes**: Instant high-contrast theme switching with persistent storage.
* **Keyboard Shortcuts**: Press <kbd>N</kbd> anywhere as an administrator to quickly create a new election.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | React 18 (Functional Components, Hooks) |
| **Build Tool & Dev Server** | Vite 6 |
| **Routing** | React Router DOM v6 |
| **Icons** | Lucide React |
| **Virtual Assistant** | VoteBot Rule-Based Intent & Dynamic Storage Engine |
| **Cryptography** | Web Crypto API (`window.crypto.subtle`) - PBKDF2-SHA256 |
| **Styling** | Modern Vanilla CSS with CSS Variables & Responsive Media Queries |
| **Analytics & Charts** | Native HTML5 Canvas 2D Context |
| **Data Persistence** | Browser `localStorage` (Structured JSON) |

---

## 📁 Project Architecture

```
OnlineVotingSystem/
├── index.html
├── package.json
├── vite.config.js
├── README.md
└── src/
    ├── main.jsx                     # Application root mounting & Providers
    ├── App.jsx                      # Route declarations, layout & Chatbot mount
    ├── assets/                      # Static assets
    ├── components/
    │   ├── chatbot/                 # VoteBot Virtual Assistant Components
    │   │   ├── Chatbot.jsx          # Root chatbot container
    │   │   ├── ChatbotButton.jsx    # Floating action button with pulse badge
    │   │   ├── ChatbotWindow.jsx    # Floating chat panel container
    │   │   ├── ChatHeader.jsx       # Header with status dot, clear, minimize
    │   │   ├── ChatMessages.jsx     # Auto-scrolling message list
    │   │   ├── ChatMessage.jsx      # Message bubbles & clickable navigation cards
    │   │   ├── ChatInput.jsx        # Text input & send button
    │   │   ├── QuickReplies.jsx     # Contextual quick prompt chips
    │   │   ├── TypingIndicator.jsx  # Animated 3-dot typing simulation
    │   │   └── Chatbot.css          # Assistant styling & responsive rules
    │   ├── CanvasBarChart.jsx       # Custom HTML5 Canvas horizontal bar visualizer
    │   ├── Header.jsx               # Top navigation, search, and global actions
    │   ├── Modal.jsx                # Reusable dialogs & confirmation modals
    │   ├── Navbar.jsx               # Auxiliary & mobile navigation
    │   ├── ProtectedRoute.jsx       # RBAC & authentication route guard
    │   ├── SearchBar.jsx            # Debounced election & user finder
    │   ├── Sidebar.jsx              # Role-aware sidebar navigation
    │   ├── ThemeToggle.jsx          # Light / Dark mode switcher
    │   └── Toast.jsx                # Non-blocking feedback notifications
    ├── context/
    │   ├── AppContext.jsx           # Global state (users, elections, votes, toasts)
    │   ├── AuthContext.jsx          # Session management & demo logins
    │   └── ThemeContext.jsx         # Theme toggle & attribute synchronization
    ├── hooks/
    │   ├── useAuth.js               # Authentication hook
    │   ├── useChatbot.js            # VoteBot hook managing conversation & state
    │   └── useLocalStorage.js       # LocalStorage synchronization hook
    ├── pages/
    │   ├── AuditLogs.jsx            # System audit trail & filter panel
    │   ├── CandidateManagement.jsx  # Candidate ordering & configuration
    │   ├── Dashboard.jsx            # Role-aware metric cards & quick actions
    │   ├── ElectionManagement.jsx   # Election creation, countdowns & toggles
    │   ├── Login.jsx                # Authentication with 1-click demo buttons & eye toggle
    │   ├── Results.jsx              # Election results and visual Canvas analytics
    │   ├── Settings.jsx             # Role-separated Admin vs Voter settings
    │   ├── Signup.jsx               # User registration with password confirmation
    │   ├── UserManagement.jsx       # Admin user directory, editing, and password reset
    │   └── Voting.jsx               # Official voter ballot booth
    ├── services/
    │   ├── chatbot/                 # VoteBot Intelligence & Query Layer
    │   │   ├── chatbotService.js    # Coordinator service
    │   │   ├── intentDetector.js    # Rule-based intent detection engine
    │   │   ├── responseGenerator.js # Dynamic response & storage integration
    │   │   ├── chatbotKnowledge.js  # Knowledge base & procedural tutorials
    │   │   ├── navigationService.js # Route allowlists and path resolution
    │   │   └── chatHistoryService.js# User-scoped LocalStorage persistence
    │   ├── auditService.js          # Event logging engine
    │   ├── authService.js           # Auth, session, password change & profile logic
    │   ├── electionService.js       # Election CRUD & lifecycle management
    │   ├── storageService.js        # Centralized LocalStorage wrapper & schema
    │   └── votingService.js         # Ballot submission & integrity checks
    ├── styles/
    │   ├── dashboard.css            # Component and layout styling
    │   ├── global.css               # Typography, resets, buttons, cards
    │   ├── responsive.css           # Mobile and tablet breakpoints
    │   └── variables.css            # Color palettes, radii, and theme tokens
    └── utils/
        ├── crypto.js                # Web Crypto API PBKDF2-SHA256 password hashing
        ├── csvUtils.js              # Safe CSV export & import parser
        ├── helpers.js               # UID, date, and countdown utilities
        └── validation.js            # Input validation & password match checks
```

---

## 💾 LocalStorage Architecture & Keys

| Key | Type | Description |
|---|---|---|
| `ov:users` | Array of Objects | Registered users (`id`, `name`, `email`, `role`, `password` [PBKDF2 hash], `status`, `createdAt`) |
| `ov:elections` | Array of Objects | Elections (`id`, `title`, `active`, `ends`, `candidates`, `votes`) |
| `ov:audit` | Array of Objects | System event trail (retains latest 1,000 events) |
| `ov:user` | Object \| null | Active authenticated user session (passwords omitted) |
| `ov:theme` | String | `'light'` or `'dark'` |
| `ov:chat_history:<userId>` | Array of Objects | Persistent VoteBot conversation history per user |
| `ov:voted:<electionId>:<userId>` | Boolean (`true`) | Prevents duplicate voting in an election |
| `ov:data` | Object | Backward-compatible mirror of the legacy data bundle |

---

## ⚡ Setup & Execution

### 1. Installation
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
The application will launch at `http://localhost:3000`.

### 3. Build for Production
```bash
npm run build
```
Build output is generated in the `dist/` directory.

---

## 🔒 Academic Demonstration Disclaimer
This application uses browser-supported cryptographic password hashing (PBKDF2 with SHA-256) and client-side access control. However, browser LocalStorage can still be viewed or edited using browser developer tools. This project is engineered for academic demonstrations, frontend architecture verification, and prototyping—it is not intended for legally binding government elections.
