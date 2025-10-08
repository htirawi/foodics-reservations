/**
 * @file BaseSelect.spec.ts
 * @summary Unit tests for BaseSelect component
 */
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import BaseSelect from "@/components/ui/BaseSelect.vue";

describe("BaseSelect", () => {
  it("should render select element", () => {
    const wrapper = mount(BaseSelect, {
      props: {
        modelValue: "",
      },
    });

    expect(wrapper.find("select").exists()).toBe(true);
  });

  it("should display label when provided", () => {
    const wrapper = mount(BaseSelect, {
      props: {
        modelValue: "",
        label: "Select an option",
      },
    });

    expect(wrapper.find("label").text()).toContain("Select an option");
  });

  it("should render placeholder option when provided", () => {
    const wrapper = mount(BaseSelect, {
      props: {
        modelValue: "",
        placeholder: "Choose...",
      },
    });

    const placeholderOption = wrapper.find("option[value='']");
    expect(placeholderOption.exists()).toBe(true);
    expect(placeholderOption.text()).toBe("Choose...");
    expect(placeholderOption.attributes("disabled")).toBeDefined();
  });

  it("should render slot content (options)", () => {
    const wrapper = mount(BaseSelect, {
      props: {
        modelValue: "option1",
      },
      slots: {
        default: `
          <option value="option1">Option 1</option>
          <option value="option2">Option 2</option>
        `,
      },
    });

    expect(wrapper.findAll("option")).toHaveLength(2);
  });

  it("should emit update:modelValue on change", async () => {
    const wrapper = mount(BaseSelect, {
      props: {
        modelValue: "",
      },
      slots: {
        default: `
          <option value="option1">Option 1</option>
          <option value="option2">Option 2</option>
        `,
      },
    });

    await wrapper.find("select").setValue("option2");

    expect(wrapper.emitted("update:modelValue")).toBeTruthy();
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["option2"]);
  });

  it("should disable select when disabled prop is true", () => {
    const wrapper = mount(BaseSelect, {
      props: {
        modelValue: "",
        disabled: true,
      },
    });

    expect(wrapper.find("select").element.disabled).toBe(true);
  });

  it("should mark as required when required prop is true", () => {
    const wrapper = mount(BaseSelect, {
      props: {
        modelValue: "",
        required: true,
      },
    });

    expect(wrapper.find("select").element.required).toBe(true);
  });

  it("should apply data-testid attribute", () => {
    const wrapper = mount(BaseSelect, {
      props: {
        modelValue: "",
        dataTestid: "my-select",
      },
    });

    expect(wrapper.find("select").attributes("data-testid")).toBe("my-select");
  });

  it("should show asterisk for required fields", () => {
    const wrapper = mount(BaseSelect, {
      props: {
        modelValue: "",
        label: "Country",
        required: true,
      },
    });

    expect(wrapper.html()).toContain("*");
  });
});
