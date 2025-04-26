
// This edge function customizes the email templates used by Supabase Auth
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Define custom email templates
const emailTemplates = {
  invitation: {
    subject: "You've been invited to Community Intelligence",
    html: `
      <h2>You've been invited to join Community Intelligence</h2>
      <p>You have been invited to join the Community Intelligence platform.</p>
      <p>Click the link below to accept the invitation and set up your account:</p>
      <p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite&redirect_to={{ .RedirectTo }}">Accept Invitation</a></p>
      <p>Or copy and paste this URL into your browser:</p>
      <p>{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite&redirect_to={{ .RedirectTo }}</p>
      <p>If you did not expect this invitation, you can ignore this email.</p>
    `,
  },
  confirmation: {
    subject: "Confirm your Community Intelligence account",
    html: `
      <h2>Confirm your email address</h2>
      <p>Thank you for signing up for Community Intelligence!</p>
      <p>Click the link below to confirm your email address:</p>
      <p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup&redirect_to={{ .RedirectTo }}">Confirm Email Address</a></p>
      <p>Or copy and paste this URL into your browser:</p>
      <p>{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup&redirect_to={{ .RedirectTo }}</p>
      <p>If you did not sign up for an account, you can ignore this email.</p>
    `,
  },
  magiclink: {
    subject: "Your Community Intelligence login link",
    html: `
      <h2>Login to Community Intelligence</h2>
      <p>Click the link below to log in to your Community Intelligence account:</p>
      <p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=magiclink&redirect_to={{ .RedirectTo }}">Log In</a></p>
      <p>Or copy and paste this URL into your browser:</p>
      <p>{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=magiclink&redirect_to={{ .RedirectTo }}</p>
      <p>If you did not request this email, you can ignore it.</p>
    `,
  },
  recovery: {
    subject: "Reset your Community Intelligence password",
    html: `
      <h2>Reset your password</h2>
      <p>Click the link below to reset your Community Intelligence password:</p>
      <p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&redirect_to={{ .RedirectTo }}">Reset Password</a></p>
      <p>Or copy and paste this URL into your browser:</p>
      <p>{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&redirect_to={{ .RedirectTo }}</p>
      <p>If you did not request a password reset, you can ignore this email.</p>
    `,
  },
  email_change: {
    subject: "Confirm your new email address",
    html: `
      <h2>Confirm your new email address</h2>
      <p>Click the link below to confirm your new email address:</p>
      <p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email_change&redirect_to={{ .RedirectTo }}">Confirm Email Change</a></p>
      <p>Or copy and paste this URL into your browser:</p>
      <p>{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email_change&redirect_to={{ .RedirectTo }}</p>
      <p>If you did not request this change, please contact support immediately.</p>
    `,
  },
};

// Handle the request
serve(async (req) => {
  try {
    // Get the email type from the request
    const { type } = await req.json();
    
    // Return the appropriate template
    const template = emailTemplates[type];
    if (!template) {
      return new Response(
        JSON.stringify({ error: `Template for type '${type}' not found` }),
        { status: 400 }
      );
    }
    
    return new Response(
      JSON.stringify(template),
      { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
});
