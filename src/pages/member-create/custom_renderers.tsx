import { FellowshipSelect, VolunteerOpportunitySelect } from '@/components/form';

/**
 * Custom church field renderers to be used with SchemaFormSection
 */
export const churchCustomRenderers = {
  fellowshipId: () => (
    <FellowshipSelect placeholder="Select fellowship" />
  ),
};

/**
 * Creates an interests field renderer for volunteer opportunities
 */
export function createInterestsFieldRenderer(onChange: (value: string[]) => void) {
  return () => (
    <VolunteerOpportunitySelect
      placeholder="Select volunteer interests"
      onChange={(value) => onChange(value as string[])}
    />
  );
}