/**
 * VoteBot Predefined Knowledge Base
 * Detailed procedural answers, FAQs, and explanations for MyVote.
 */

export const CHATBOT_KNOWLEDGE = {
  ABOUT_MYVOTE: {
    title: 'About MyVote',
    text: `**MyVote** is a secure, auditable, and accessible client-side Online Voting System built with React 18, Vite, and the Web Crypto API.\n\nKey features include:\n• **Role-Based Access Control (RBAC)** for Administrators and Voters.\n• **Strict One-Vote Enforcement** preventing double voting per ballot.\n• **Interactive Canvas Charts** for visual real-time vote distribution.\n• **Tamper-Evident Audit Logging** tracking all key election actions.\n• **PBKDF2-SHA256 Password Hashing** (100,000 iterations) using browser-native cryptography.`
  },

  VOTING_PROCESS: {
    title: 'How to Cast Your Vote',
    text: `To cast your ballot in an active election:\n\n1. Go to the **Active Elections / Voting** section from the sidebar.\n2. Review the list of open elections.\n3. Choose your preferred candidate and click the **Vote** button.\n4. A confirmation dialog will appear summarizing your choice.\n5. Click **Submit Ballot** to record your vote.\n\n*Note: Your vote is final and cannot be altered or repeated once recorded.*`
  },

  ONE_VOTE_RULE: {
    title: 'One-Vote Rule & Integrity',
    text: `MyVote strictly enforces **one vote per user per election**:\n\n• Once you confirm your ballot, a unique record (\`ov:voted:<electionId>:<userId>\`) is stored.\n• The vote button for that election will be disabled and display **"Ballot Already Submitted"**.\n• You cannot vote a second time or change your candidate after submission.`
  },

  ALREADY_VOTED: {
    title: 'Already Voted Notice',
    text: `If you see the message **"You have already cast your ballot in this election"**, your vote has already been securely counted!\n\nTo see how the candidates are performing, check out the **Results & Analytics** page anytime to view the live Canvas bar chart.`
  },

  VOTING_ELIGIBILITY: {
    title: 'Voter Eligibility',
    text: `All users registered with the **Voter** or **Admin** role whose account is in **Active** status are eligible to participate in any election currently marked as **Active**.`
  },

  VOTING_DISABLED: {
    title: 'Why is Voting Disabled?',
    text: `Voting can be disabled for two main reasons:\n\n1. **You already voted**: The system disables the button to protect ballot integrity.\n2. **The election is closed or expired**: If an election reached its scheduled deadline or was deactivated by an administrator, new votes can no longer be accepted.`
  },

  CHANGE_PASSWORD: {
    title: 'Changing Your Password',
    text: `To change your password:\n\n1. Navigate to **My Profile / Settings** from the sidebar.\n2. In the **Change Password** card, enter your Current Password.\n3. Enter your New Password (at least 8 characters) and confirm it.\n4. Click **Change Password**.\n\nYour new credentials will be encrypted with PBKDF2-SHA256.`
  },

  FORGOT_PASSWORD: {
    title: 'Password Recovery',
    text: `Because MyVote is an academic client-side application using browser LocalStorage:\n\n• If you are a **Voter**, please contact an **Administrator**. Administrators can securely set a new password for your account in **User Management**.\n• If you are an **Admin**, you can reset your password from Admin Settings or use the default demo credentials (\`admin@example.com\` / \`admin\`).`
  },

  CREATE_ELECTION_HELP: {
    title: 'How to Create an Election (Admin)',
    text: `To create an election as an administrator:\n\n1. Navigate to **Election Management** from the sidebar.\n2. In the creation form, enter the **Election Title**.\n3. Optionally select a **Closing Date and Time** for automatic countdown.\n4. Click **Create Election**.\n\n*Pro-tip: You can also press <kbd>N</kbd> on your keyboard from anywhere to quickly open the election creator!*`
  },

  ADD_CANDIDATE_HELP: {
    title: 'Candidate Management (Admin)',
    text: `To configure ballot candidates:\n\n1. Open **Election Management** or **Candidate Setup**.\n2. Enter the candidate's name or party affiliation and click **Add Candidate**.\n3. Use the **↑** (Up) and **↓** (Down) buttons to arrange the order candidates appear on the ballot.\n4. Remove candidates using the **Remove** button if necessary.`
  },

  USER_MANAGEMENT_HELP: {
    title: 'User Management Guide (Admin)',
    text: `In **User Management**, administrators can:\n\n• **Add User**: Create voters or admins with Full Name, Email, Role, and password (min 8 chars).\n• **Edit User**: Modify user names, emails, or roles (passwords remain safely hidden).\n• **Change Password**: Click the **Key** icon on any user to set a new password for them.\n• **Delete User**: Remove accounts with instant access revocation.`
  },

  CSV_EXPORT_HELP: {
    title: 'CSV Data Export',
    text: `Administrators can download a full system backup by clicking **Export** in the top navigation or sidebar. This exports all users, elections, candidates, vote tallies, and audit logs into an \`ov-data.csv\` file using browser-native Blob APIs.`
  },

  CSV_IMPORT_HELP: {
    title: 'CSV Data Import',
    text: `To restore a previously exported backup, click **Import** in the sidebar. Select a valid \`ov-data.csv\` file. The system will automatically validate the records and restore application state into LocalStorage.`
  },

  AUDIT_LOG_HELP: {
    title: 'Audit Trail & Compliance (Admin)',
    text: `The **Audit Log** records up to 1,000 recent security and operational events (logins, signups, votes, user edits, election closures). Each entry logs the timestamp, triggering user email, action tag, and JSON metadata.`
  },

  ELECTION_ACTIVATION_HELP: {
    title: 'Election Activation & Auto-Close',
    text: `Elections must be marked **Active** for voters to cast ballots. Administrators can click **Activate** / **Deactivate** on any election card. If an election has an end timestamp, the system runs a real-time countdown timer and automatically closes the election when the time expires.`
  }
};
