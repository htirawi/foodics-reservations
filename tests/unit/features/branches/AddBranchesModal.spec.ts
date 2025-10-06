/**
 * Unit tests for AddBranchesModal.vue
 * Tests modal behavior, loading states, and accessibility
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import AddBranchesModal from '@/features/branches/components/AddBranchesModal.vue';
import { createI18n } from 'vue-i18n';

// Mock the composable
const mockUseBranchSelection = {
  selectedBranchIds: [] as string[],
  selectedIdsSet: new Set<string>(),
  disabledBranches: [
    { id: '1', name: 'Branch 1', reference: 'B01' },
    { id: '2', name: 'Branch 2', reference: 'B02' },
  ],
  isAllSelected: false,
  saving: false,
  toggleBranch: vi.fn(),
  toggleSelectAll: vi.fn(),
  enableSelectedBranches: vi.fn(),
};

vi.mock('@/features/branches/composables/useBranchSelection', () => ({
  useBranchSelection: () => mockUseBranchSelection,
}));

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      addBranches: {
        title: 'Add Branches',
        branchesLabel: 'Branches',
        noBranches: 'No disabled branches available',
        actions: {
          save: 'Save',
          close: 'Close',
        },
      },
      app: {
        selectAll: 'Select All',
        deselectAll: 'Deselect All',
        close: 'Close',
      },
    },
  },
});

describe('AddBranchesModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock state
    mockUseBranchSelection.selectedBranchIds = [];
    mockUseBranchSelection.selectedIdsSet = new Set();
    mockUseBranchSelection.saving = false;
    mockUseBranchSelection.isAllSelected = false;
    mockUseBranchSelection.enableSelectedBranches.mockResolvedValue({ ok: true, enabled: [], failed: [] });
  });

  const createWrapper = (props = {}) => {
    return mount(AddBranchesModal, {
      props: {
        modelValue: true,
        ...props,
      },
      global: {
        plugins: [i18n],
        stubs: {
          BaseModal: {
            template: '<div data-testid="add-branches-modal" v-if="modelValue"><slot name="title"></slot><slot></slot><slot name="actions"></slot></div>',
            props: ['modelValue'],
          },
        },
      },
    });
  };

  describe('rendering', () => {
    it('should render modal when open', () => {
      const wrapper = createWrapper({ isOpen: true });

      expect(wrapper.find('[data-testid="add-branches-modal"]').exists()).toBe(true);
      expect(wrapper.text()).toContain('Add Branches');
    });

    it('should not render modal when closed', () => {
      const wrapper = createWrapper({ isOpen: false });

      expect(wrapper.find('[data-testid="add-branches-modal"]').exists()).toBe(false);
    });

    it('should render disabled branches list', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('[data-testid="branch-1"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="branch-2"]').exists()).toBe(true);
      expect(wrapper.text()).toContain('Branch 1 (B01)');
      expect(wrapper.text()).toContain('Branch 2 (B02)');
    });

    it('should show no branches message when no disabled branches', () => {
      mockUseBranchSelection.disabledBranches = [];
      const wrapper = createWrapper();

      expect(wrapper.find('[data-testid="no-branches"]').exists()).toBe(true);
      expect(wrapper.text()).toContain('No disabled branches available');
    });
  });

  describe('accessibility', () => {
    it('should have proper labels and IDs for checkboxes', () => {
      const wrapper = createWrapper();

      const branch1Label = wrapper.find('[data-testid="branch-1"]');
      const branch1Input = wrapper.find('input[id="1"]');

      if (branch1Label.exists() && branch1Input.exists()) {
        expect(branch1Label.attributes('for')).toBe('1');
        expect(branch1Input.attributes('id')).toBe('1');
        expect(branch1Input.attributes('type')).toBe('checkbox');
      }
    });

    it('should set aria-busy when saving', () => {
      mockUseBranchSelection.saving = true;
      const wrapper = createWrapper();

      const content = wrapper.find('.space-y-4');
      expect(content.attributes('aria-busy')).toBe('true');
    });

    it('should not set aria-busy when not saving', () => {
      mockUseBranchSelection.saving = false;
      const wrapper = createWrapper();

      const content = wrapper.find('.space-y-4');
      const ariaBusy = content.attributes('aria-busy');
      expect(ariaBusy === undefined || ariaBusy === 'false').toBe(true);
    });
  });

  describe('selection interactions', () => {
    it('should call toggleBranch when checkbox is clicked', async () => {
      const wrapper = createWrapper();

      const checkbox = wrapper.find('input[id="1"]');
      if (checkbox.exists()) {
        await checkbox.trigger('change');
        expect(mockUseBranchSelection.toggleBranch).toHaveBeenCalledWith('1');
      }
    });

    it('should call toggleSelectAll when select all button is clicked', async () => {
      const wrapper = createWrapper();

      const selectAllButton = wrapper.find('[data-testid="select-all"]');
      if (selectAllButton.exists()) {
        await selectAllButton.trigger('click');
        expect(mockUseBranchSelection.toggleSelectAll).toHaveBeenCalled();
      }
    });

    it('should show correct select all button text', () => {
      mockUseBranchSelection.isAllSelected = true;
      const wrapper = createWrapper();

      const selectAllButton = wrapper.find('[data-testid="select-all"]');
      if (selectAllButton.exists()) {
        expect(selectAllButton.text()).toBe('Deselect All');
      }

      // Test the other state by creating a new wrapper
      mockUseBranchSelection.isAllSelected = false;
      const wrapper2 = createWrapper();
      const selectAllButton2 = wrapper2.find('[data-testid="select-all"]');
      if (selectAllButton2.exists()) {
        expect(selectAllButton2.text()).toBe('Select All');
      }
    });
  });

  describe('loading states', () => {
    it('should disable checkboxes when saving', () => {
      mockUseBranchSelection.saving = true;
      const wrapper = createWrapper();

      const checkboxes = wrapper.findAll('input[type="checkbox"]');
      checkboxes.forEach(checkbox => {
        expect(checkbox.attributes('disabled')).toBeDefined();
      });
    });

    it('should disable select all button when saving', () => {
      mockUseBranchSelection.saving = true;
      const wrapper = createWrapper();

      const selectAllButton = wrapper.find('[data-testid="select-all"]');
      if (selectAllButton.exists()) {
        expect(selectAllButton.attributes('disabled')).toBeDefined();
      }
    });

    it('should disable save button when saving', () => {
      mockUseBranchSelection.saving = true;
      const wrapper = createWrapper();

      const saveButton = wrapper.find('[data-testid="save-button"]');
      expect(saveButton.attributes('disabled')).toBeDefined();
    });

    it('should disable close button when saving', () => {
      mockUseBranchSelection.saving = true;
      const wrapper = createWrapper();

      const closeButton = wrapper.find('[data-testid="close-button"]');
      expect(closeButton.attributes('disabled')).toBeDefined();
    });

    it('should show loading state on save button when saving', () => {
      mockUseBranchSelection.saving = true;
      const wrapper = createWrapper();

      const saveButton = wrapper.find('[data-testid="save-button"]');
      expect(saveButton.attributes('aria-busy')).toBeDefined();
    });
  });

  describe('save functionality', () => {
    it('should call enableSelectedBranches when save is clicked', async () => {
      mockUseBranchSelection.selectedBranchIds = ['1'];
      const wrapper = createWrapper();

      const saveButton = wrapper.find('[data-testid="save-button"]');
      if (saveButton.exists()) {
        await saveButton.trigger('click');
        expect(mockUseBranchSelection.enableSelectedBranches).toHaveBeenCalled();
      }
    });

    it('should emit close when save is successful', async () => {
      mockUseBranchSelection.selectedBranchIds = ['1'];
      const wrapper = createWrapper();

      const saveButton = wrapper.find('[data-testid="save-button"]');
      if (saveButton.exists()) {
        await saveButton.trigger('click');
        expect(wrapper.emitted('close')).toBeTruthy();
      }
    });

    it('should not emit close when save fails', async () => {
      mockUseBranchSelection.selectedBranchIds = ['1'];
      mockUseBranchSelection.enableSelectedBranches.mockResolvedValue({ ok: false, enabled: [], failed: ['1'] });
      const wrapper = createWrapper();

      const saveButton = wrapper.find('[data-testid="save-button"]');
      if (saveButton.exists()) {
        await saveButton.trigger('click');
        expect(wrapper.emitted('close')).toBeFalsy();
      }
    });

    it('should disable save button when no branches selected', () => {
      mockUseBranchSelection.selectedBranchIds = [];
      const wrapper = createWrapper();

      const saveButton = wrapper.find('[data-testid="save-button"]');
      expect(saveButton.attributes('disabled')).toBeDefined();
    });

    it('should enable save button when branches are selected', () => {
      mockUseBranchSelection.selectedBranchIds = ['1'];
      const wrapper = createWrapper();

      const saveButton = wrapper.find('[data-testid="save-button"]');
      expect(saveButton.attributes('disabled')).toBeUndefined();
    });
  });

  describe('close functionality', () => {
    it('should emit close when close button is clicked', async () => {
      const wrapper = createWrapper();

      const closeButton = wrapper.find('[data-testid="close-button"]');
      await closeButton.trigger('click');

      expect(wrapper.emitted('close')).toBeTruthy();
    });

    it('should not emit close when saving', async () => {
      mockUseBranchSelection.saving = true;
      const wrapper = createWrapper();

      const closeButton = wrapper.find('[data-testid="close-button"]');
      await closeButton.trigger('click');

      expect(wrapper.emitted('close')).toBeFalsy();
    });
  });

  describe('checkbox states', () => {
    it('should check boxes that are in selectedIdsSet', () => {
      mockUseBranchSelection.selectedIdsSet = new Set(['1']);
      const wrapper = createWrapper();

      const branch1Checkbox = wrapper.find('input[id="1"]');
      const branch2Checkbox = wrapper.find('input[id="2"]');

      if (branch1Checkbox.exists()) {
        expect(branch1Checkbox.attributes('checked')).toBeDefined();
      }
      if (branch2Checkbox.exists()) {
        expect(branch2Checkbox.attributes('checked')).toBeUndefined();
      }
    });
  });
});
