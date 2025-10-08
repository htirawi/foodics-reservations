/**
 * @file BaseTable.spec.ts
 * @summary Unit tests for BaseTable component
 */
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import BaseTable from "@/components/ui/BaseTable.vue";

describe("BaseTable", () => {
  it("should render table element", () => {
    const wrapper = mount(BaseTable);

    expect(wrapper.find("table").exists()).toBe(true);
  });

  it("should render slot content", () => {
    const wrapper = mount(BaseTable, {
      slots: {
        default: "<thead><tr><th>Header</th></tr></thead>",
      },
    });

    expect(wrapper.html()).toContain("Header");
  });

  it("should have responsive wrapper", () => {
    const wrapper = mount(BaseTable);

    expect(wrapper.find(".overflow-x-auto").exists()).toBe(true);
  });

  it("should have thead with border", () => {
    const wrapper = mount(BaseTable);

    expect(wrapper.find("thead.border-b").exists()).toBe(true);
  });

  it("should have full width table", () => {
    const wrapper = mount(BaseTable);

    expect(wrapper.find("table.w-full").exists()).toBe(true);
  });
});
