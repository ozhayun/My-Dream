"use server";

import { supabase } from "@/lib/supabase";
import { currentUser } from "@clerk/nextjs/server";

/**
 * Ensure user exists in Supabase (fallback if webhook didn't fire)
 * This is useful for local development when webhooks might not be set up
 */
export async function ensureUserExists(userId: string) {
  // Check if user exists
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("id", userId)
    .single();

  if (!existingUser) {
    // Get user info from Clerk
    const user = await currentUser();
    if (user) {
      await supabase.from("users").insert({
        id: userId,
        email: user.emailAddresses[0]?.emailAddress || "",
        avatar_url: user.imageUrl || null,
      });
    }
  }
}

