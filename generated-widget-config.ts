
/**
 * WIDGET CONFIGURATION UPDATES
 * Add these to your widget configuration
 */

// New question widgets
export const CHANGEFPM_WIDGETS = {
  // Side effect questions
  side_effect_concerns: {
    type: 'list',
    options: [
      { id: 'menstrual_changes', label: 'Menstrual changes / Changes in bleeding' },
      { id: 'weight_changes', label: 'Weight gain or loss' },
      { id: 'mood_changes', label: 'Mood swings or depression' },
      { id: 'headaches', label: 'Headaches or migraines' },
      { id: 'pain', label: 'Pain or discomfort' },
      { id: 'other', label: 'Other side effects' }
    ]
  },
  
  // Stop/Switch reasons
  stop_switch_reasons: {
    type: 'buttons',
    options: [
      { id: 'want_pregnant', label: 'I want to get pregnant' },
      { id: 'side_effects', label: 'Experiencing side effects' },
      { id: 'not_effective', label: 'Not working well for me' },
      { id: 'switch_method', label: 'Want to try different method' },
      { id: 'other', label: 'Other reason' }
    ]
  },
  
  // Demographic questions
  marital_status: {
    type: 'list',
    options: [
      { id: 'single', label: 'Single' },
      { id: 'married', label: 'Married' },
      { id: 'divorced', label: 'Divorced' },
      { id: 'widowed', label: 'Widowed' },
      { id: 'prefer_not_say', label: 'Prefer not to say' }
    ]
  },
  
  age_groups: {
    type: 'list',
    options: [
      { id: '15-17', label: '15-17 years' },
      { id: '18-24', label: '18-24 years' },
      { id: '25-34', label: '25-34 years' },
      { id: '35-44', label: '35-44 years' },
      { id: '45-54', label: '45-54 years' },
      { id: '55+', label: '55 and older' }
    ]
  }
};
