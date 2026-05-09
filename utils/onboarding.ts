/**
 * Returns the route for the next incomplete onboarding step.
 * Used by both the splash screen and the register screen so routing is consistent.
 */
export function getOnboardingRoute(data: Record<string, unknown>): string {
  if (!data.nickname) return '/(auth)/personal-info';
  if (!data.weight) return '/(auth)/weight';
  if (!data.height) return '/(auth)/height';
  if (!data.activity_level) return '/(auth)/activity-level';
  if (!data.diet_goal) return '/(auth)/diet-goal';
  return '/(auth)/weight?mode=register-goal';
}
