import { describe, test } from "node:test";
import { deepStrictEqual, strictEqual } from "node:assert";
import { matchesDepartment, resolveProductAudience } from "./product-audience";

describe("strict shopping departments", () => {
  const rows = [
    { name: "Men's jacket", category: "Jackets" },
    { name: "Women's jacket", category: "Jackets" },
    { name: "Kids jacket", category: "Jackets" },
    { name: "Unassigned jacket", category: "Jackets" },
  ];
  test("Mens shows only mens products", () => {
    deepStrictEqual(rows.filter(p => matchesDepartment(resolveProductAudience(p), "Mens")).map(p => p.name), ["Men's jacket"]);
  });
  test("Womens shows only womens products", () => {
    deepStrictEqual(rows.filter(p => matchesDepartment(resolveProductAudience(p), "Womens")).map(p => p.name), ["Women's jacket"]);
  });
  test("Kids shows only kids products", () => {
    deepStrictEqual(rows.filter(p => matchesDepartment(resolveProductAudience(p), "Kids")).map(p => p.name), ["Kids jacket"]);
  });
  test("explicit category and tags override old mens fallback", () => {
    strictEqual(resolveProductAudience({ category: "Womens", name: "Shirt" }, "Men"), "Womens");
    strictEqual(resolveProductAudience({ category: "Shirts", features: ["Kids"] }, "Men"), "Kids");
  });
  test("unisex and unknown products do not leak into a department", () => {
    strictEqual(resolveProductAudience({ gender: "Unisex" }, "Men"), "");
    strictEqual(resolveProductAudience({ name: "Plain shirt" }), "");
    strictEqual(resolveProductAudience({ name: "Girls dress" }), "Kids");
  });
});