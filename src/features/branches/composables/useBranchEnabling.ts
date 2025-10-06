/**
 * Branch enabling logic with async handling
 */

import { type Ref } from 'vue';
import { useAsyncAction } from '@/composables/useAsyncAction';

export interface EnableBranchesResult {
  ok: boolean;
  enabled: string[];
  failed: string[];
}

function useBranchEnablingLogic(
  selectedBranchIds: Ref<string[]>,
  branchesStore: { enableBranches: (ids: string[]) => Promise<void> }
) {
  async function enableBranches(): Promise<{ enabled: string[]; failed: string[] }> {
    const enabled: string[] = [];
    const failed: string[] = [];

    await Promise.allSettled(
      selectedBranchIds.value.map(async (id) => {
        try {
          await branchesStore.enableBranches([id]);
          enabled.push(id);
        } catch {
          failed.push(id);
        }
      })
    );

    return { enabled, failed };
  }

  return { enableBranches };
}

export function useBranchEnabling(
  selectedBranchIds: Ref<string[]>,
  branchesStore: { enableBranches: (ids: string[]) => Promise<void> },
  toast: { success: (msg: string) => void; error: (msg: string) => void },
  t: (key: string, params?: Record<string, unknown>) => string
) {
  const { busy, run } = useAsyncAction();
  const { enableBranches } = useBranchEnablingLogic(selectedBranchIds, branchesStore);

  async function enableSelectedBranches(): Promise<EnableBranchesResult> {
    if (selectedBranchIds.value.length === 0) {
      return { ok: true, enabled: [], failed: [] };
    }

    return run(async () => {
      const { enabled, failed } = await enableBranches();
      const result: EnableBranchesResult = { 
        ok: failed.length === 0, 
        enabled, 
        failed 
      };

      if (result.ok) {
        toast.success(t('reservations.toast.enableAllSuccess', { count: enabled.length }));
      } else if (enabled.length > 0) {
        toast.success(t('reservations.toast.enablePartialSuccess', { 
          enabledCount: enabled.length, 
          failedCount: failed.length 
        }));
      } else {
        toast.error(t('reservations.toast.enableError'));
      }

      selectedBranchIds.value = failed;
      return result;
    }).catch(() => {
      toast.error(t('reservations.toast.enableError'));
      return { ok: false, enabled: [], failed: selectedBranchIds.value };
    });
  }

  return {
    enableSelectedBranches,
    saving: busy,
  };
}
