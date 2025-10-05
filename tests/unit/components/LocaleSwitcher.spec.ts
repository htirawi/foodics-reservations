/**
 * LocaleSwitcher Unit Tests
 * Validates locale toggling and dir attribute updates
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import LocaleSwitcher from '@/components/ui/LocaleSwitcher.vue';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      app: {
        switchToArabic: 'العربية',
        switchToEnglish: 'English',
      },
    },
    ar: {
      app: {
        switchToArabic: 'العربية',
        switchToEnglish: 'English',
      },
    },
  },
});

describe('LocaleSwitcher', () => {
  beforeEach(() => {
    i18n.global.locale.value = 'en';
    document.documentElement.removeAttribute('dir');
    document.documentElement.removeAttribute('lang');
  });

  it('renders with English locale by default', () => {
    const wrapper = mount(LocaleSwitcher, {
      global: {
        plugins: [i18n],
      },
    });

    expect(wrapper.text()).toBe('العربية');
  });

  it('has data-testid attribute', () => {
    const wrapper = mount(LocaleSwitcher, {
      global: {
        plugins: [i18n],
      },
    });

    expect(wrapper.find('[data-testid="locale-switcher"]').exists()).toBe(true);
  });

  it('toggles locale on click', async () => {
    const wrapper = mount(LocaleSwitcher, {
      global: {
        plugins: [i18n],
      },
    });

    expect(i18n.global.locale.value).toBe('en');

    await wrapper.find('button').trigger('click');

    expect(i18n.global.locale.value).toBe('ar');
  });

  it('updates dir attribute when locale changes', async () => {
    const wrapper = mount(LocaleSwitcher, {
      global: {
        plugins: [i18n],
      },
    });

    await wrapper.find('button').trigger('click');

    expect(document.documentElement.getAttribute('dir')).toBe('rtl');
    expect(document.documentElement.getAttribute('lang')).toBe('ar');
  });

  it('toggles back to English', async () => {
    const wrapper = mount(LocaleSwitcher, {
      global: {
        plugins: [i18n],
      },
    });

    await wrapper.find('button').trigger('click');
    expect(i18n.global.locale.value).toBe('ar');

    await wrapper.find('button').trigger('click');
    expect(i18n.global.locale.value).toBe('en');
    expect(document.documentElement.getAttribute('dir')).toBe('ltr');
    expect(document.documentElement.getAttribute('lang')).toBe('en');
  });

  it('displays correct label based on current locale', async () => {
    const wrapper = mount(LocaleSwitcher, {
      global: {
        plugins: [i18n],
      },
    });

    expect(wrapper.text()).toBe('العربية');

    await wrapper.find('button').trigger('click');

    expect(wrapper.text()).toBe('English');
  });

  it('has proper aria-label', () => {
    const wrapper = mount(LocaleSwitcher, {
      global: {
        plugins: [i18n],
      },
    });

    expect(wrapper.find('button').attributes('aria-label')).toBe('العربية');
  });
});
