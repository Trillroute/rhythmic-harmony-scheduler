
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PaymentReminder {
  student_id: string;
  fee_plan_id: string;
  due_date: string;
  amount_due: number;
  days_until_due: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check for payment reminders
    const { data: reminders, error: remindersError } = await supabase
      .rpc('check_payment_reminders');

    if (remindersError) {
      throw remindersError;
    }

    console.log(`Found ${reminders.length} payment reminders`);

    // Process each reminder
    const notifications = [];
    for (const reminder of reminders) {
      // Get student details
      const { data: student, error: studentError } = await supabase
        .from('profiles')
        .select('name, email')
        .eq('id', reminder.student_id)
        .single();

      if (studentError) {
        console.error(`Error fetching student ${reminder.student_id}:`, studentError);
        continue;
      }

      // Get fee plan details
      const { data: feePlan, error: planError } = await supabase
        .from('fee_plans')
        .select('plan_title')
        .eq('id', reminder.fee_plan_id)
        .single();

      if (planError) {
        console.error(`Error fetching fee plan ${reminder.fee_plan_id}:`, planError);
        continue;
      }

      // Generate appropriate message based on days until due
      let message = "";
      const dueDate = new Date(reminder.due_date);
      const formattedDueDate = dueDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      if (reminder.days_until_due < 0) {
        // Overdue payment
        message = `OVERDUE PAYMENT: Your payment of ₹${reminder.amount_due} for ${feePlan.plan_title} was due on ${formattedDueDate}.`;
      } else if (reminder.days_until_due === 0) {
        // Due today
        message = `PAYMENT DUE TODAY: Your payment of ₹${reminder.amount_due} for ${feePlan.plan_title} is due today.`;
      } else {
        // Upcoming payment
        message = `PAYMENT REMINDER: Your payment of ₹${reminder.amount_due} for ${feePlan.plan_title} is due on ${formattedDueDate}.`;
      }

      // Create a reminder notification
      const { data: notification, error: notificationError } = await supabase
        .from('reminders')
        .insert([
          {
            type: 'payment',
            recipient_id: reminder.student_id,
            related_id: reminder.fee_plan_id,
            message,
            send_at: new Date().toISOString(),
            status: 'pending',
            channel: 'in_app'
          }
        ])
        .select()
        .single();

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
        continue;
      }

      notifications.push(notification);
    }

    return new Response(
      JSON.stringify({
        message: `Processed ${notifications.length} payment reminders`,
        notifications,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing payment reminders:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
})
