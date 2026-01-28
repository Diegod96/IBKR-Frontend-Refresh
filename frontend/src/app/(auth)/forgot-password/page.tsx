'use client';

/**
 * Forgot Password Page
 *
 * Allows users to request a password reset email.
 */

import { useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase';
import { AuthForm, AuthError, AuthSuccess } from '@/components/auth';
import { Button, Input } from '@/components/ui';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const supabase = createBrowserClient();

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
        }
      );

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setSuccess(
        'If an account exists with this email, you will receive a password reset link shortly.'
      );
      setEmail('');
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthForm
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link."
      footer={
        <>
          Remember your password?{' '}
          <Link
            href="/login"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <AuthError message={error} />
        <AuthSuccess message={success} />

        <Input
          label="Email address"
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />

        <Button
          type="submit"
          className="w-full"
          size="lg"
          isLoading={isLoading}
        >
          Send reset link
        </Button>
      </form>
    </AuthForm>
  );
}
