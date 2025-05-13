
/**
 * Utility function to export data to CSV
 */
export const exportToCsv = (data: any[], filename: string) => {
  if (!data || !data.length) {
    console.error('No data to export');
    return;
  }

  // Get headers from the first row
  const headers = Object.keys(data[0]);
  
  // Convert data to CSV format
  const csvRows = [];
  
  // Add headers
  csvRows.push(headers.join(','));
  
  // Add rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      
      // Handle different data types
      if (value === null || value === undefined) {
        return '';
      } else if (typeof value === 'object') {
        // For objects or arrays, stringify them
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      } else if (typeof value === 'string') {
        // Escape quotes in strings
        return `"${value.replace(/"/g, '""')}"`;
      }
      
      return value;
    });
    
    csvRows.push(values.join(','));
  }
  
  // Create CSV content
  const csvContent = csvRows.join('\n');
  
  // Create a blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Format Supabase data for CSV export
 */
export const formatDataForExport = (data: any[], type: 'sessions' | 'attendance' | 'packs') => {
  if (!data || !data.length) return [];
  
  // Different formatting based on data type
  switch (type) {
    case 'sessions':
      return data.map(session => ({
        id: session.id,
        subject: session.subject,
        type: session.session_type,
        location: session.location,
        date: new Date(session.date_time).toLocaleDateString(),
        time: new Date(session.date_time).toLocaleTimeString(),
        teacher: session.teacher_id,
        status: session.status,
        rescheduled: session.reschedule_count > 0 ? 'Yes' : 'No'
      }));
      
    case 'attendance':
      return data.map(event => ({
        id: event.id,
        session_id: event.session_id,
        status: event.status,
        marked_at: new Date(event.marked_at).toLocaleString(),
        marked_by: event.marked_by_user_id,
        notes: event.notes || ''
      }));
      
    case 'packs':
      return data.map(pack => ({
        id: pack.id,
        student: pack.student_id,
        subject: pack.subject,
        size: pack.size,
        type: pack.session_type,
        purchased: new Date(pack.purchased_date).toLocaleDateString(),
        expiry: pack.expiry_date ? new Date(pack.expiry_date).toLocaleDateString() : 'N/A',
        remaining: pack.remaining_sessions,
        used: parseInt(pack.size) - pack.remaining_sessions,
        active: pack.is_active ? 'Yes' : 'No'
      }));
      
    default:
      return data;
  }
};
