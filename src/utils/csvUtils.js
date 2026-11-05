/**
 * Utility for exporting and importing application data via CSV
 */

export const exportDataToCSV = ({ users, elections, auditLogs }) => {
  const rows = [
    ['type', 'id', 'json'],
    ['users', '', JSON.stringify(users || [])],
    ['elections', '', JSON.stringify(elections || [])],
    ['audit', '', JSON.stringify(auditLogs || [])]
  ];

  const csvContent = rows
    .map((r) => r.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `ov-data-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const parseImportCSV = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('No file provided'));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = String(text).split('\n');

        let parsedUsers = null;
        let parsedElections = null;
        let parsedAudit = null;

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('"users"') || trimmed.startsWith('users')) {
            const jsonPart = extractJsonFromCsvLine(trimmed);
            if (jsonPart) parsedUsers = JSON.parse(jsonPart);
          } else if (trimmed.startsWith('"elections"') || trimmed.startsWith('elections')) {
            const jsonPart = extractJsonFromCsvLine(trimmed);
            if (jsonPart) parsedElections = JSON.parse(jsonPart);
          } else if (trimmed.startsWith('"audit"') || trimmed.startsWith('audit')) {
            const jsonPart = extractJsonFromCsvLine(trimmed);
            if (jsonPart) parsedAudit = JSON.parse(jsonPart);
          }
        }

        if (!Array.isArray(parsedUsers) && !Array.isArray(parsedElections) && !Array.isArray(parsedAudit)) {
          return reject(new Error('Invalid CSV structure or missing application data records.'));
        }

        // Validate structure to prevent corruption
        if (parsedUsers && !parsedUsers.every((u) => u.id && u.email)) {
          return reject(new Error('User data in CSV is corrupted or invalid.'));
        }

        if (parsedElections && !parsedElections.every((el) => el.id && el.title)) {
          return reject(new Error('Election data in CSV is corrupted or invalid.'));
        }

        resolve({
          users: parsedUsers,
          elections: parsedElections,
          auditLogs: parsedAudit
        });
      } catch (err) {
        reject(new Error(`Failed to parse CSV file: ${err.message}`));
      }
    };

    reader.onerror = () => reject(new Error('Error reading uploaded file'));
    reader.readAsText(file);
  });
};

function extractJsonFromCsvLine(line) {
  // Line format: "users","","[{...}]"
  // Split accounting for escaped quotes or extract from 2nd comma onwards
  const firstComma = line.indexOf(',');
  if (firstComma === -1) return null;
  const secondComma = line.indexOf(',', firstComma + 1);
  if (secondComma === -1) return null;

  let raw = line.slice(secondComma + 1).trim();
  // Strip leading and trailing quotes if wrapped
  if (raw.startsWith('"') && raw.endsWith('"')) {
    raw = raw.slice(1, -1);
  }
  // Replace escaped double quotes
  return raw.replaceAll('""', '"');
}
