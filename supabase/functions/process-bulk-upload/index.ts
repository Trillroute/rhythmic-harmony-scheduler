
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.23.0';
import { parse } from 'https://deno.land/std@0.168.0/encoding/csv.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { uploadId, uploadType } = await req.json();

    if (!uploadId || !uploadType) {
      return new Response(JSON.stringify({ 
        error: 'Missing required parameters' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Get upload record
    const { data: uploadData, error: uploadError } = await supabaseClient
      .from('bulk_uploads')
      .select('*')
      .eq('id', uploadId)
      .single();

    if (uploadError || !uploadData) {
      return new Response(JSON.stringify({ 
        error: 'Upload record not found' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    // Get the file content
    const { data: fileData, error: fileError } = await supabaseClient
      .storage
      .from('bulk_uploads')
      .download(uploadData.file_path);

    if (fileError || !fileData) {
      await updateUploadStatus(supabaseClient, uploadId, 'failed', 0, 0, {
        errors: [{ row: 0, message: 'Failed to download file' }]
      });
      
      return new Response(JSON.stringify({ 
        error: 'Failed to download file' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // Parse CSV content
    const csvText = await fileData.text();
    const { rows, errors: parseErrors } = await parse(csvText, { 
      skipFirstRow: true,
      columns: true 
    });

    if (parseErrors.length > 0) {
      await updateUploadStatus(supabaseClient, uploadId, 'failed', 0, 0, {
        errors: parseErrors.map(err => ({ row: err.rowNum, message: err.message }))
      });
      
      return new Response(JSON.stringify({ 
        error: 'CSV parsing error' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Update upload with total rows
    await supabaseClient
      .from('bulk_uploads')
      .update({ total_rows: rows.length })
      .eq('id', uploadId);

    // Process CSV data based on upload type
    switch (uploadType) {
      case 'students':
        await processStudents(supabaseClient, rows, uploadId);
        break;
      case 'session_packs':
        await processSessionPacks(supabaseClient, rows, uploadId);
        break;
      case 'sessions':
        await processSessions(supabaseClient, rows, uploadId);
        break;
      default:
        await updateUploadStatus(supabaseClient, uploadId, 'failed', 0, 0, {
          errors: [{ row: 0, message: 'Invalid upload type' }]
        });
        
        return new Response(JSON.stringify({ 
          error: 'Invalid upload type' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

// Helper function to update upload status
async function updateUploadStatus(
  supabaseClient,
  uploadId: string,
  status: 'processing' | 'completed' | 'failed', 
  successCount: number,
  failureCount: number,
  summary: any
) {
  return await supabaseClient
    .from('bulk_uploads')
    .update({
      status,
      successful_rows: successCount,
      failed_rows: failureCount,
      result_summary: summary,
      updated_at: new Date().toISOString()
    })
    .eq('id', uploadId);
}

// Process students CSV
async function processStudents(supabaseClient, rows, uploadId: string) {
  const results = {
    success: [],
    errors: [],
    warnings: []
  };
  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // +2 because we skip header and 0-index
    
    try {
      // Validate required fields
      if (!row.name || !row.email) {
        results.errors.push({ 
          row: rowNum, 
          message: 'Missing required fields: name and email are required' 
        });
        failureCount++;
        continue;
      }

      // Check if email already exists
      const { data: existingUser } = await supabaseClient
        .from('profiles')
        .select('id')
        .eq('email', row.email)
        .maybeSingle();

      if (existingUser) {
        results.warnings.push({ 
          row: rowNum, 
          message: `User with email ${row.email} already exists` 
        });
        continue;
      }

      // Create auth user
      const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
        email: row.email,
        email_confirm: true,
        user_metadata: { 
          name: row.name,
          role: 'student'
        },
        password: generateTempPassword() // This is just for the example, in production you'd want a more secure method
      });

      if (authError) {
        results.errors.push({ 
          row: rowNum, 
          message: `Auth error: ${authError.message}` 
        });
        failureCount++;
        continue;
      }

      // The profile and student records should be created by the handle_new_user trigger
      // but we'll update them with additional info from the CSV
      
      // Update student record with additional info if provided
      const studentUpdateData = {};
      if (row.preferred_subjects) {
        studentUpdateData.preferred_subjects = parseArrayField(row.preferred_subjects);
      }
      if (row.notes) {
        studentUpdateData.notes = row.notes;
      }
      
      if (Object.keys(studentUpdateData).length > 0) {
        const { error: studentError } = await supabaseClient
          .from('students')
          .update(studentUpdateData)
          .eq('id', authData.user.id);
          
        if (studentError) {
          results.warnings.push({ 
            row: rowNum, 
            message: `User created but failed to update student details: ${studentError.message}` 
          });
        }
      }
      
      results.success.push({ 
        row: rowNum, 
        id: authData.user.id 
      });
      successCount++;
    } catch (error) {
      results.errors.push({ 
        row: rowNum, 
        message: `Error: ${error.message}` 
      });
      failureCount++;
    }
  }

  // Update upload status
  await updateUploadStatus(
    supabaseClient,
    uploadId,
    failureCount === 0 ? 'completed' : (successCount > 0 ? 'completed' : 'failed'),
    successCount,
    failureCount,
    results
  );
}

// Process session packs CSV
async function processSessionPacks(supabaseClient, rows, uploadId: string) {
  const results = {
    success: [],
    errors: [],
    warnings: []
  };
  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // +2 because we skip header and 0-index
    
    try {
      // Validate required fields
      if (!row.student_email && !row.student_id) {
        results.errors.push({ 
          row: rowNum, 
          message: 'Missing student identifier: student_email or student_id required' 
        });
        failureCount++;
        continue;
      }
      
      if (!row.size || !row.subject || !row.session_type || !row.location || !row.weekly_frequency) {
        results.errors.push({ 
          row: rowNum, 
          message: 'Missing required fields: size, subject, session_type, location, and weekly_frequency are required' 
        });
        failureCount++;
        continue;
      }

      // Find student ID if email provided
      let studentId = row.student_id;
      if (!studentId && row.student_email) {
        const { data: student } = await supabaseClient
          .from('profiles')
          .select('id')
          .eq('email', row.student_email)
          .eq('role', 'student')
          .maybeSingle();
          
        if (!student) {
          results.errors.push({ 
            row: rowNum, 
            message: `Student with email ${row.student_email} not found` 
          });
          failureCount++;
          continue;
        }
        studentId = student.id;
      }

      // Convert pack size to a number and validate
      const packSize = parseInt(row.size);
      if (![4, 10, 20, 30].includes(packSize)) {
        results.errors.push({ 
          row: rowNum, 
          message: `Invalid pack size: ${row.size}. Must be one of 4, 10, 20, or 30.` 
        });
        failureCount++;
        continue;
      }

      // Create the session pack
      const { data: pack, error: packError } = await supabaseClient
        .from('session_packs')
        .insert({
          student_id: studentId,
          size: packSize,
          subject: row.subject,
          session_type: row.session_type,
          location: row.location,
          remaining_sessions: packSize,
          weekly_frequency: row.weekly_frequency,
          purchased_date: row.purchased_date || new Date().toISOString(),
          expiry_date: row.expiry_date || null
        })
        .select()
        .single();

      if (packError) {
        results.errors.push({ 
          row: rowNum, 
          message: `Error creating session pack: ${packError.message}` 
        });
        failureCount++;
        continue;
      }

      results.success.push({ 
        row: rowNum, 
        id: pack.id 
      });
      successCount++;
    } catch (error) {
      results.errors.push({ 
        row: rowNum, 
        message: `Error: ${error.message}` 
      });
      failureCount++;
    }
  }

  // Update upload status
  await updateUploadStatus(
    supabaseClient,
    uploadId,
    failureCount === 0 ? 'completed' : (successCount > 0 ? 'completed' : 'failed'),
    successCount,
    failureCount,
    results
  );
}

// Process sessions CSV
async function processSessions(supabaseClient, rows, uploadId: string) {
  const results = {
    success: [],
    errors: [],
    warnings: []
  };
  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // +2 because we skip header and 0-index
    
    try {
      // Validate required fields
      if (!row.teacher_email && !row.teacher_id) {
        results.errors.push({ 
          row: rowNum, 
          message: 'Missing teacher identifier: teacher_email or teacher_id required' 
        });
        failureCount++;
        continue;
      }
      
      if (!row.student_email && !row.student_id) {
        results.errors.push({ 
          row: rowNum, 
          message: 'Missing student identifier: student_email or student_id required' 
        });
        failureCount++;
        continue;
      }
      
      if (!row.date_time || !row.subject || !row.session_type || !row.location || !row.duration) {
        results.errors.push({ 
          row: rowNum, 
          message: 'Missing required fields: date_time, subject, session_type, location, and duration are required' 
        });
        failureCount++;
        continue;
      }

      // Find teacher ID if email provided
      let teacherId = row.teacher_id;
      if (!teacherId && row.teacher_email) {
        const { data: teacher } = await supabaseClient
          .from('profiles')
          .select('id')
          .eq('email', row.teacher_email)
          .eq('role', 'teacher')
          .maybeSingle();
          
        if (!teacher) {
          results.errors.push({ 
            row: rowNum, 
            message: `Teacher with email ${row.teacher_email} not found` 
          });
          failureCount++;
          continue;
        }
        teacherId = teacher.id;
      }

      // Find student ID if email provided
      let studentId = row.student_id;
      if (!studentId && row.student_email) {
        const { data: student } = await supabaseClient
          .from('profiles')
          .select('id')
          .eq('email', row.student_email)
          .eq('role', 'student')
          .maybeSingle();
          
        if (!student) {
          results.errors.push({ 
            row: rowNum, 
            message: `Student with email ${row.student_email} not found` 
          });
          failureCount++;
          continue;
        }
        studentId = student.id;
      }

      // Find a suitable session pack for the student
      const { data: pack } = await supabaseClient
        .from('session_packs')
        .select('id')
        .eq('student_id', studentId)
        .eq('subject', row.subject)
        .eq('session_type', row.session_type)
        .eq('is_active', true)
        .gt('remaining_sessions', 0)
        .order('expiry_date', { ascending: true, nullsLast: true })
        .maybeSingle();
        
      if (!pack) {
        results.errors.push({ 
          row: rowNum, 
          message: `No active session pack found for student with subject ${row.subject} and session type ${row.session_type}` 
        });
        failureCount++;
        continue;
      }

      // Check for teacher scheduling conflicts
      const sessionDate = new Date(row.date_time);
      const sessionEndTime = new Date(sessionDate.getTime() + parseInt(row.duration) * 60000);
      
      const { data: conflictingSession } = await supabaseClient
        .from('sessions')
        .select('id')
        .eq('teacher_id', teacherId)
        .not('status', 'in', '("Cancelled by Student","Cancelled by Teacher","Cancelled by School")')
        .or(`date_time.gte.${sessionDate.toISOString()},date_time.lt.${sessionEndTime.toISOString()}`)
        .maybeSingle();
        
      if (conflictingSession) {
        results.errors.push({ 
          row: rowNum, 
          message: `Teacher has a scheduling conflict at the requested time` 
        });
        failureCount++;
        continue;
      }

      // Create session
      const { data: session, error: sessionError } = await supabaseClient
        .from('sessions')
        .insert({
          teacher_id: teacherId,
          pack_id: pack.id,
          subject: row.subject,
          session_type: row.session_type,
          location: row.location,
          date_time: row.date_time,
          duration: parseInt(row.duration),
          notes: row.notes || '',
          status: 'Scheduled',
          reschedule_count: 0
        })
        .select()
        .single();

      if (sessionError) {
        results.errors.push({ 
          row: rowNum, 
          message: `Error creating session: ${sessionError.message}` 
        });
        failureCount++;
        continue;
      }

      // Link student to session
      const { error: linkError } = await supabaseClient
        .from('session_students')
        .insert({
          session_id: session.id,
          student_id: studentId
        });

      if (linkError) {
        results.errors.push({ 
          row: rowNum, 
          message: `Session created but failed to link student: ${linkError.message}` 
        });
        // Don't increment failure count as the session was created
      }

      // Deduct from pack
      const { error: packError } = await supabaseClient
        .from('session_packs')
        .update({
          remaining_sessions: supabaseClient.rpc('decrement', { row_id: pack.id, amount: 1 })
        })
        .eq('id', pack.id);

      if (packError) {
        results.warnings.push({ 
          row: rowNum, 
          message: `Session created but failed to update pack: ${packError.message}` 
        });
      }

      results.success.push({ 
        row: rowNum, 
        id: session.id 
      });
      successCount++;
    } catch (error) {
      results.errors.push({ 
        row: rowNum, 
        message: `Error: ${error.message}` 
      });
      failureCount++;
    }
  }

  // Update upload status
  await updateUploadStatus(
    supabaseClient,
    uploadId,
    failureCount === 0 ? 'completed' : (successCount > 0 ? 'completed' : 'failed'),
    successCount,
    failureCount,
    results
  );
}

// Helper functions
function parseArrayField(field: string): string[] {
  if (!field) return [];
  return field.split(',').map(item => item.trim()).filter(Boolean);
}

function generateTempPassword(): string {
  return Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
}
