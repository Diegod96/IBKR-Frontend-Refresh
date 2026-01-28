/**
 * Protected Routes Layout
 *
 * Layout wrapper for all protected routes that require authentication.
 * The middleware handles the actual auth check, this provides consistent styling.
 */

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
