import { onMounted, onUnmounted, type Ref } from "vue";

export interface KeyboardShortcutOptions {
    isEnabled: Ref<boolean>;
    onEscape?: () => void | Promise<void>;
    onSave?: () => void | Promise<void>;
    canSave?: Ref<boolean>;
}

function handleEscapeKey(onEscape?: () => void | Promise<void>): void {
    if (onEscape) {
        onEscape();
    }
}

function handleSaveShortcut(
    event: KeyboardEvent,
    onSave?: () => void | Promise<void>,
    canSave?: Ref<boolean>
): void {
    if (!onSave) return;
    event.preventDefault();
    if (!canSave || canSave.value) {
        onSave();
    }
}

export function useKeyboardShortcuts(options: KeyboardShortcutOptions) {
    const { isEnabled, onEscape, onSave, canSave } = options;

    function handleKeyDown(event: KeyboardEvent): void {
        if (!isEnabled.value) return;

        if (event.key === 'Escape') {
            handleEscapeKey(onEscape);
            return;
        }

        if ((event.ctrlKey || event.metaKey) && event.key === 's') {
            handleSaveShortcut(event, onSave, canSave);
        }
    }

    onMounted(() => {
        window.addEventListener('keydown', handleKeyDown);
    });

    onUnmounted(() => {
        window.removeEventListener('keydown', handleKeyDown);
    });

    return {
        handleKeyDown,
    };
}
