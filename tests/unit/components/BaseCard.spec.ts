/**
 * @file BaseCard.spec.ts
 * @summary Unit tests for BaseCard component
 */
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import BaseCard from "@/components/ui/BaseCard.vue";

describe("BaseCard", () => {
  it("should render card element", () => {
    const wrapper = mount(BaseCard);

    expect(wrapper.find(".bg-white").exists()).toBe(true);
  });

  it("should render slot content", () => {
    const wrapper = mount(BaseCard, {
      slots: {
        default: "<p>Card Content</p>",
      },
    });

    expect(wrapper.html()).toContain("Card Content");
  });

  it("should have border styling", () => {
    const wrapper = mount(BaseCard);

    expect(wrapper.find(".border").exists()).toBe(true);
  });
});
