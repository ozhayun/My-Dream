import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return new Response('Missing CLERK_WEBHOOK_SECRET', { status: 500 });
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    });
  }

  // Get the body as text (required for svix verification)
  const body = await req.text();

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: any;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as any;
  } catch {
    return new Response('Error occurred', {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;
  const payload = evt.data;

  if (eventType === 'user.created') {
    const { id, email_addresses, image_url } = payload;

    // Get the primary email
    const primaryEmail = email_addresses?.find((email: any) => email.id === payload.primary_email_address_id)?.email_address 
      || email_addresses?.[0]?.email_address;

    if (!primaryEmail) {
      return new Response('No email found for user', { status: 400 });
    }

    try {
      const supabase = createServerSupabaseClient();
      
      const { error } = await supabase
        .from('users')
        .insert({
          id: id,
          email: primaryEmail,
          avatar_url: image_url || null,
        });

      if (error) {
        return new Response(`Error inserting user: ${error.message}`, {
          status: 500,
        });
      }

      return new Response('User created successfully', { status: 200 });
    } catch {
      return new Response('Error processing webhook', { status: 500 });
    }
  }

  return new Response('Webhook received', { status: 200 });
}

