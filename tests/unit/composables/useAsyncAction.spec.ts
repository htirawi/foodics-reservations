import { describe, it, expect, vi } from 'vitest';
import { useAsyncAction } from '@/composables/useAsyncAction';

describe('useAsyncAction', () => {
  it('should initialize with correct default state', () => {
    const { busy, error, reset } = useAsyncAction();

    expect(busy.value).toBe(false);
    expect(error.value).toBe(null);
    expect(typeof reset).toBe('function');
  });

  it('should handle successful async operations', async () => {
    const { busy, error, run } = useAsyncAction();
    const mockFn = vi.fn().mockResolvedValue('success');

    const result = await run(mockFn);

    expect(result).toBe('success');
    expect(busy.value).toBe(false);
    expect(error.value).toBe(null);
    expect(mockFn).toHaveBeenCalledOnce();
  });

  it('should handle failed async operations', async () => {
    const { busy, error, run } = useAsyncAction();
    const mockError = new Error('Test error');
    const mockFn = vi.fn().mockRejectedValue(mockError);

    await expect(run(mockFn)).rejects.toThrow('Test error');

    expect(busy.value).toBe(false);
    expect(error.value).toBe('Test error');
  });

  it('should handle non-Error rejections', async () => {
    const { busy, error, run } = useAsyncAction();
    const mockFn = vi.fn().mockRejectedValue('string error');

    await expect(run(mockFn)).rejects.toBe('string error');

    expect(busy.value).toBe(false);
    expect(error.value).toBe('An error occurred');
  });

  it('should reset state correctly', () => {
    const { busy, error, reset } = useAsyncAction();
    
    // Simulate some state
    busy.value = true;
    error.value = 'Some error';

    reset();

    expect(busy.value).toBe(false);
    expect(error.value).toBe(null);
  });

  it('should set busy state during async operation', async () => {
    const { busy, run } = useAsyncAction();
    let busyDuringExecution = false;

    const mockFn = vi.fn().mockImplementation(async () => {
      busyDuringExecution = busy.value;
      return 'success';
    });

    await run(mockFn);

    expect(busyDuringExecution).toBe(true);
    expect(busy.value).toBe(false);
  });
});
