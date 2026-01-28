/**
 * Auth Form Container
 *
 * Provides consistent styling for authentication forms.
 */

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ReactNode } from 'react';

interface AuthFormProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  footer?: ReactNode;
  className?: string;
}

export function AuthForm({
  children,
  title,
  subtitle,
  footer,
  className,
}: AuthFormProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Brand */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-bold text-primary-600">
              IBKR Portfolio
            </h1>
          </Link>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>

        {/* Form Card */}
        <div
          className={cn(
            'rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-800 dark:ring-gray-800',
            className
          )}
        >
          {children}
        </div>

        {/* Footer Links */}
        {footer && (
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
