/**
 * Auth Success Alert
 *
 * Displays success messages (e.g., after password reset email sent).
 */

import { cn } from '@/lib/utils';

interface AuthSuccessProps {
  message: string | null;
  className?: string;
}

export function AuthSuccess({ message, className }: AuthSuccessProps) {
  if (!message) return null;

  return (
    <div
      className={cn(
        'rounded-lg bg-green-50 p-4 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400',
        className
      )}
      role="alert"
    >
      <div className="flex items-center">
        <svg
          className="mr-2 h-4 w-4 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        <span>{message}</span>
      </div>
    </div>
  );
}
