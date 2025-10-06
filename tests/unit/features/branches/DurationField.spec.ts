import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import DurationField from '@/features/branches/components/ReservationSettingsModal/DurationField.vue';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      settings: {
        duration: {
          label: 'Duration',
          placeholder: 'Enter duration',
        },
        validation: {
          durationRequired: 'Duration required',
          durationMin: 'Min 1 minute',
        },
      },
    },
  },
});

describe('ReservationSettingsModal/DurationField', () => {
  it('renders with initial value', () => {
    const wrapper = mount(DurationField, {
      props: {
        modelValue: 60,
      },
      global: {
        plugins: [i18n],
      },
    });

    expect(wrapper.find('[data-testid="settings-duration"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="duration-input"]').exists()).toBe(true);
  });

  it('emits update:modelValue when value changes', async () => {
    const wrapper = mount(DurationField, {
      props: {
        modelValue: 60,
      },
      global: {
        plugins: [i18n],
      },
    });

    const input = wrapper.findComponent({ name: 'BaseInput' });
    await input.vm.$emit('update:modelValue', 90);

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([90]);
  });

  it('emits update:valid with true for valid duration', async () => {
    const wrapper = mount(DurationField, {
      props: {
        modelValue: 60,
      },
      global: {
        plugins: [i18n],
      },
    });

    const input = wrapper.findComponent({ name: 'BaseInput' });
    await input.vm.$emit('update:modelValue', 90);

    expect(wrapper.emitted('update:valid')).toBeTruthy();
    expect(wrapper.emitted('update:valid')?.[0]).toEqual([true]);
  });

  it('emits update:valid with false for invalid duration', async () => {
    const wrapper = mount(DurationField, {
      props: {
        modelValue: 60,
      },
      global: {
        plugins: [i18n],
      },
    });

    const input = wrapper.findComponent({ name: 'BaseInput' });
    await input.vm.$emit('update:modelValue', 0);

    expect(wrapper.emitted('update:valid')).toBeTruthy();
    expect(wrapper.emitted('update:valid')?.[0]).toEqual([false]);
  });

  it('shows error message for invalid duration', async () => {
    const wrapper = mount(DurationField, {
      props: {
        modelValue: 0,
      },
      global: {
        plugins: [i18n],
      },
    });

    await wrapper.vm.$nextTick();

    const input = wrapper.findComponent({ name: 'BaseInput' });
    expect(input.props('error')).toBeTruthy();
  });
});

