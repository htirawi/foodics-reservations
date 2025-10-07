/**
 * @file useRTL.ts
 * @summary Module: src/composables/useRTL.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import { computed } from "vue";
import { useLocale } from "@/composables/useLocale";

export const useRTL = () => {
    const { isRTL } = useLocale();
    
    /**
     * Get RTL-aware classes for directional elements
     */
    const getRTLClasses = (baseClasses: string, rtlClasses?: string) => {
        if (!rtlClasses) return baseClasses;
        return computed(() => isRTL.value ? rtlClasses : baseClasses).value;
    };
    
    /**
     * Get RTL-aware transform for icons that need flipping
     */
    const getIconTransform = (needsFlip = true) => {
        return computed(() => {
            if (!needsFlip) return "";
            return isRTL.value ? "rtl:rotate-180" : "";
        }).value;
    };
    
    /**
     * Get logical positioning classes
     */
    const getLogicalPosition = (position: "start" | "end" | "center") => {
        const positions = {
            start: "justify-start",
            end: "justify-end", 
            center: "justify-center"
        };
        return positions[position];
    };
    
    /**
     * Get logical text alignment classes
     */
    const getLogicalTextAlign = (align: "start" | "end" | "center") => {
        const aligns = {
            start: "text-start",
            end: "text-end",
            center: "text-center"
        };
        return aligns[align];
    };
    
    return {
        isRTL,
        getRTLClasses,
        getIconTransform,
        getLogicalPosition,
        getLogicalTextAlign,
    };
};
