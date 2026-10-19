import { describe, expect, test } from "bun:test";
import { matchesDepartment, resolveProductAudience } from "./product-audience";

describe("strict shopping departments", () => {
  const rows = [
    { name: "Men's jacket", category: "Jackets" },
    { name: "Women's jacket", category: "Jackets" },
    { name: "Kids jacket", category: "Jackets" },
    { name: "Unassigned jacket", category: "Jackets" },
  ];
  test("Mens shows only mens products", () => {
    expect(rows.filter(p => matchesDepartment(resolveProductAudience(p), "Mens")).map(p => p.name)).toEqual(["Men's jacket"]);
  });
  test("Womens shows only womens products", () => {
    expect(rows.filter(p => matchesDepartment(resolveProductAudience(p), "Womens")).map(p => p.name)).toEqual(["Women's jacket"]);
  });
  test("Kids shows only kids products", () => {
    expect(rows.filter(p => matchesDepartment(resolveProductAudience(p), "Kids")).map(p => p.name)).toEqual(["Kids jacket"]);
  });
  test("explicit category and tags override old mens fallback", () => {
    expect(resolveProductAudience({ category: "Womens", name: "Shirt" }, "Men")).toBe("Womens");
    expect(resolveProductAudience({ category: "Shirts", features: ["Kids"] }, "Men")).toBe("Kids");
  });
});