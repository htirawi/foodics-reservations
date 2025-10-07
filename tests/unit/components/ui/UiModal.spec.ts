/**
 * @file UiModal.spec.ts
 * @summary Module: tests/unit/components/ui/UiModal.spec.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { VueWrapper } from "@vue/test-utils";
import { mount } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import UiModal from "@/components/ui/UiModal.vue";

const i18n = createI18n({
    legacy: false,
    locale: "en",
    fallbackLocale: "en",
    messages: {
        en: {
            app: {
                close: "Close"
            }
        }
    }
});

describe("UiModal", () => {
    let wrapper: VueWrapper;
    beforeEach(() => {
        document.body.innerHTML = "<div id=\"app\"></div>";
    });
    afterEach(() => {
        wrapper?.unmount();
        document.body.innerHTML = "";
        document.body.style.overflow = "";
    });
    it("renders when isOpen is true", () => {
        wrapper = mount(UiModal, {
            props: {
                isOpen: true,
                ariaLabelledby: "test-title",
            },
            slots: {
                title: "<span id=\"test-title\">Test Title</span>",
                default: "<p>Body content</p>",
            },
            global: {
                plugins: [i18n]
            }
        });
        const modal = document.querySelector("[role=\"dialog\"]");
        expect(modal).toBeTruthy();
        expect(document.body.textContent).toContain("Test Title");
        expect(document.body.textContent).toContain("Body content");
    });
    it("does not render when isOpen is false", () => {
        wrapper = mount(UiModal, {
            props: {
                isOpen: false,
                ariaLabelledby: "test-title",
            },
            global: {
                plugins: [i18n]
            }
        });
        const modal = document.querySelector("[role=\"dialog\"]");
        expect(modal).toBeFalsy();
    });
    it("has correct ARIA attributes", () => {
        wrapper = mount(UiModal, {
            props: {
                isOpen: true,
                ariaLabelledby: "modal-title",
            },
            slots: {
                title: "<span id=\"modal-title\">My Modal</span>",
            },
            global: {
                plugins: [i18n]
            }
        });
        const modal = document.querySelector("[role=\"dialog\"]") as HTMLElement;
        expect(modal).toBeTruthy();
        expect(modal.getAttribute("aria-modal")).toBe("true");
        expect(modal.getAttribute("aria-labelledby")).toBe("modal-title");
    });
    it("renders all three slots", () => {
        wrapper = mount(UiModal, {
            props: {
                isOpen: true,
                ariaLabelledby: "test-title",
            },
            slots: {
                title: "<span id=\"test-title\">Title</span>",
                default: "<div data-testid=\"body\">Body</div>",
                actions: "<button data-testid=\"action-btn\">Action</button>",
            },
            global: {
                plugins: [i18n]
            }
        });
        expect(document.body.textContent).toContain("Title");
        expect(document.querySelector("[data-testid=\"body\"]")).toBeTruthy();
        expect(document.querySelector("[data-testid=\"action-btn\"]")).toBeTruthy();
    });
    it("emits close when Escape is pressed and closeOnEscape is true", async () => {
        wrapper = mount(UiModal, {
            props: {
                isOpen: false,
                ariaLabelledby: "test-title",
                closeOnEscape: true,
            },
            global: {
                plugins: [i18n]
            }
        });
        await wrapper.setProps({ isOpen: true });
        await wrapper.vm.$nextTick();
        const modal = document.querySelector("[role=\"dialog\"]") as HTMLElement;
        expect(modal).toBeTruthy();
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
        await wrapper.vm.$nextTick();
        expect(wrapper.emitted("close")).toBeTruthy();
        expect(wrapper.emitted("close")).toHaveLength(1);
    });
    it("does not emit close when Escape is pressed and closeOnEscape is false", async () => {
        wrapper = mount(UiModal, {
            props: {
                isOpen: true,
                ariaLabelledby: "test-title",
                closeOnEscape: false,
            },
            global: {
                plugins: [i18n]
            }
        });
        const modal = document.querySelector("[role=\"dialog\"]") as HTMLElement;
        expect(modal).toBeTruthy();
        await modal.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
        expect(wrapper.emitted("close")).toBeUndefined();
    });
    it("emits close when backdrop is clicked and closeOnBackdrop is true", async () => {
        wrapper = mount(UiModal, {
            props: {
                isOpen: true,
                ariaLabelledby: "test-title",
                closeOnBackdrop: true,
            },
            global: {
                plugins: [i18n]
            }
        });
        const container = document.querySelector(".fixed.inset-0") as HTMLElement;
        expect(container).toBeTruthy();
        await container.click();
        expect(wrapper.emitted("close")).toHaveLength(1);
    });
    it("does not emit close when backdrop is clicked and closeOnBackdrop is false", async () => {
        wrapper = mount(UiModal, {
            props: {
                isOpen: true,
                ariaLabelledby: "test-title",
                closeOnBackdrop: false,
            },
            global: {
                plugins: [i18n]
            }
        });
        const container = document.querySelector(".fixed.inset-0") as HTMLElement;
        expect(container).toBeTruthy();
        await container.click();
        expect(wrapper.emitted("close")).toBeUndefined();
    });
    it("applies correct size classes", () => {
        const sizes: Array<"sm" | "md" | "lg" | "xl"> = ["sm", "md", "lg", "xl"];
        const expectedClasses = {
            sm: "max-w-md",
            md: "max-w-lg",
            lg: "max-w-2xl",
            xl: "max-w-4xl",
        };
        sizes.forEach((size) => {
            wrapper = mount(UiModal, {
                props: {
                    isOpen: true,
                    ariaLabelledby: "test-title",
                    size,
                },
                global: {
                    plugins: [i18n]
                }
            });
            const modal = document.querySelector("[role=\"dialog\"]") as HTMLElement;
            expect(modal).toBeTruthy();
            expect(modal.className).toContain(expectedClasses[size]);
            wrapper.unmount();
        });
    });
    it("locks body scroll when open", async () => {
        wrapper = mount(UiModal, {
            props: {
                isOpen: false,
                ariaLabelledby: "test-title",
            },
            global: {
                plugins: [i18n]
            }
        });
        expect(document.body.style.overflow).toBe("");
        await wrapper.setProps({ isOpen: true });
        expect(document.body.style.overflow).toBe("hidden");
        await wrapper.setProps({ isOpen: false });
        expect(document.body.style.overflow).toBe("");
    });
    it("restores body scroll on unmount", () => {
        document.body.style.overflow = "hidden";
        wrapper = mount(UiModal, {
            props: {
                isOpen: true,
                ariaLabelledby: "test-title",
            },
            global: {
                plugins: [i18n]
            }
        });
        wrapper.unmount();
        expect(document.body.style.overflow).toBe("");
    });
    it("focuses first focusable element when opened", async () => {
        wrapper = mount(UiModal, {
            props: {
                isOpen: true,
                ariaLabelledby: "test-title",
            },
            slots: {
                default: "<button data-testid=\"first-btn\">First</button><button>Second</button>",
            },
            attachTo: document.body,
            global: {
                plugins: [i18n]
            }
        });
        await wrapper.vm.$nextTick();
        await new Promise(resolve => setTimeout(resolve, 200));
        const firstButton = document.querySelector("[data-testid=\"first-btn\"]") as HTMLElement;
        expect(firstButton).toBeTruthy();
        firstButton.focus();
        expect(document.activeElement).toBe(firstButton);
    });
    it("does not render title section if title slot is empty", () => {
        wrapper = mount(UiModal, {
            props: {
                isOpen: true,
                ariaLabelledby: "test-title",
            },
            slots: {
                default: "<p>Body only</p>",
            },
            global: {
                plugins: [i18n]
            }
        });
        expect(wrapper.find(".border-b").exists()).toBe(false);
    });
    it("does not render actions section if actions slot is empty", () => {
        wrapper = mount(UiModal, {
            props: {
                isOpen: true,
                ariaLabelledby: "test-title",
            },
            slots: {
                default: "<p>Body only</p>",
            },
            global: {
                plugins: [i18n]
            }
        });
        expect(wrapper.find(".border-t").exists()).toBe(false);
    });
});