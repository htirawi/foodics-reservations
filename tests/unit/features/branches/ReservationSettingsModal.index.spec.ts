import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import SettingsModalIndex from '@/features/branches/components/ReservationSettingsModal/SettingsModalIndex.vue';
import type { Branch } from '@/types/foodics';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      app: {
        remove: 'Remove',
      },
      settings: {
        title: 'Edit {branchName} branch reservation settings',
        noBranch: 'No branch selected',
        workingHours: 'Branch working hours are {from} - {to}',
        duration: { label: 'Duration', placeholder: 'Enter duration' },
        tables: { label: 'Tables', noTables: 'No tables', noSections: 'No sections', seats: 'seats' },
        slots: { title: 'Slots' },
        actions: { save: 'Save', close: 'Close' },
        validation: {
          durationRequired: 'Duration required',
          durationMin: 'Min 1 minute',
        },
        timeSlots: { add: 'Add', applyToAll: 'Apply to all' },
        days: {
          saturday: 'Saturday',
          sunday: 'Sunday',
          monday: 'Monday',
          tuesday: 'Tuesday',
          wednesday: 'Wednesday',
          thursday: 'Thursday',
          friday: 'Friday',
        },
      },
    },
  },
});

const mockBranch: Branch = {
  id: '1',
  name: 'Test Branch',
  name_localized: null,
  reference: 'TEST-001',
  type: 1,
  accepts_reservations: true,
  reservation_duration: 60,
  reservation_times: {
    saturday: [['09:00', '17:00']],
    sunday: [],
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
  },
  receives_online_orders: false,
  opening_from: '09:00',
  opening_to: '22:00',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  deleted_at: null,
  sections: [],
};

describe('ReservationSettingsModal/SettingsModalIndex', () => {
  beforeEach(() => {
    // Reset body overflow style
    document.body.style.overflow = '';
  });

  it('renders modal when isOpen is true', () => {
    const wrapper = mount(SettingsModalIndex, {
      props: {
        branch: mockBranch,
        isOpen: true,
      },
      global: {
        plugins: [i18n],
        stubs: {
          Teleport: true,
        },
      },
    });

    expect(wrapper.find('[data-testid="settings-modal"]').exists()).toBe(true);
  });

  it('renders all sections when branch is provided', () => {
    const wrapper = mount(SettingsModalIndex, {
      props: {
        branch: mockBranch,
        isOpen: true,
      },
      global: {
        plugins: [i18n],
        stubs: {
          Teleport: true,
        },
      },
    });

    expect(wrapper.find('[data-testid="working-hours-info"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="settings-duration"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="settings-tables"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="settings-day-slots"]').exists()).toBe(true);
  });

  it('shows guard message when branch is null', () => {
    const wrapper = mount(SettingsModalIndex, {
      props: {
        branch: null,
        isOpen: true,
      },
      global: {
        plugins: [i18n],
        stubs: {
          Teleport: true,
        },
      },
    });

    expect(wrapper.text()).toContain('No branch selected');
    expect(wrapper.find('[data-testid="settings-duration"]').exists()).toBe(false);
  });

  it('disables Save button when branch is null', () => {
    const wrapper = mount(SettingsModalIndex, {
      props: {
        branch: null,
        isOpen: true,
      },
      global: {
        plugins: [i18n],
        stubs: {
          Teleport: true,
        },
      },
    });

    const saveButton = wrapper.find('[data-testid="settings-save"]');
    expect(saveButton.attributes('disabled')).toBeDefined();
  });

  it('initializes form with branch data', () => {
    const wrapper = mount(SettingsModalIndex, {
      props: {
        branch: mockBranch,
        isOpen: true,
      },
      global: {
        plugins: [i18n],
        stubs: {
          Teleport: true,
        },
      },
    });

    // Check that DurationField receives correct modelValue
    const durationField = wrapper.findComponent({ name: 'DurationField' });
    expect(durationField.props('modelValue')).toBe(60);
  });

  it('emits close event when Cancel is clicked', async () => {
    const wrapper = mount(SettingsModalIndex, {
      props: {
        branch: mockBranch,
        isOpen: true,
      },
      global: {
        plugins: [i18n],
        stubs: {
          Teleport: true,
        },
      },
    });

    await wrapper.find('[data-testid="settings-cancel"]').trigger('click');
    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('emits save event with payload when Save is clicked and form is valid', async () => {
    const wrapper = mount(SettingsModalIndex, {
      props: {
        branch: mockBranch,
        isOpen: true,
      },
      global: {
        plugins: [i18n],
        stubs: {
          Teleport: true,
        },
      },
    });

    // Simulate child components emitting valid=true
    const durationField = wrapper.findComponent({ name: 'DurationField' });
    await durationField.vm.$emit('update:valid', true);

    const slotsEditor = wrapper.findComponent({ name: 'DaySlotsEditor' });
    await slotsEditor.vm.$emit('update:valid', true);

    await wrapper.vm.$nextTick();

    // Now Save should be enabled
    const saveButton = wrapper.find('[data-testid="settings-save"]');
    await saveButton.trigger('click');

    expect(wrapper.emitted('save')).toBeTruthy();
    const savePayload = wrapper.emitted('save')?.[0]?.[0];
    expect(savePayload).toHaveProperty('reservation_duration');
    expect(savePayload).toHaveProperty('reservation_times');
  });

  it('keeps Save button disabled when form is invalid', async () => {
    const wrapper = mount(SettingsModalIndex, {
      props: {
        branch: mockBranch,
        isOpen: true,
      },
      global: {
        plugins: [i18n],
        stubs: {
          Teleport: true,
        },
      },
    });

    // Simulate child components emitting valid=false
    const durationField = wrapper.findComponent({ name: 'DurationField' });
    await durationField.vm.$emit('update:valid', false);

    const slotsEditor = wrapper.findComponent({ name: 'DaySlotsEditor' });
    await slotsEditor.vm.$emit('update:valid', false);

    await wrapper.vm.$nextTick();

    const saveButton = wrapper.find('[data-testid="settings-save"]');
    expect(saveButton.attributes('disabled')).toBeDefined();
  });

  it('updates form state when branch prop changes', async () => {
    const wrapper = mount(SettingsModalIndex, {
      props: {
        branch: mockBranch,
        isOpen: true,
      },
      global: {
        plugins: [i18n],
        stubs: {
          Teleport: true,
        },
      },
    });

    const newBranch: Branch = {
      ...mockBranch,
      id: '2',
      name: 'New Branch',
      reservation_duration: 90,
    };

    await wrapper.setProps({ branch: newBranch });
    await wrapper.vm.$nextTick();

    const durationField = wrapper.findComponent({ name: 'DurationField' });
    expect(durationField.props('modelValue')).toBe(90);
  });
});

