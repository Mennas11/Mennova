import axiosInstance from "./axiosInstance";

// Check the slugs at https://dummyjson.com/products/categories
const SOURCES = [
  { slug: "womens-dresses", group: "clothing", gender: "women" },
  { slug: "tops", group: "clothing", gender: "women" },
  { slug: "mens-shirts", group: "clothing", gender: "men" },
  { slug: "womens-shoes", group: "shoes", gender: "women" },
  { slug: "mens-shoes", group: "shoes", gender: "men" },
  { slug: "fragrances", group: "perfumes", gender: "unisex" },
  { slug: "beauty", group: "makeup", gender: "women" },
];

const BY_SLUG = Object.fromEntries(SOURCES.map((s) => [s.slug, s]));

export const GROUPS = [
  { id: "all", label: "All" },
  { id: "clothing", label: "Clothing" },
  { id: "shoes", label: "Shoes" },
  { id: "perfumes", label: "Perfumes" },
  { id: "makeup", label: "Makeup" },
];

// sizes depend on the kind of product
export function sizesFor(group) {
  if (group === "clothing") return ["XS", "S", "M", "L", "XL"];
  if (group === "shoes") return ["36", "37", "38", "39", "40", "41", "42", "43", "44"];
  return []; // perfumes and makeup have no size
}

export async function fetchAllProducts() {
  const responses = await Promise.all(
    SOURCES.map((s) =>
      axiosInstance.get(`/products/category/${s.slug}?limit=0`)
    )
  );

  return responses.flatMap((res, i) =>
    res.data.products.map((p) => ({
      ...p,
      group: SOURCES[i].group,
      gender: SOURCES[i].gender,
    }))
  );
}

export async function fetchProduct(id) {
  const { data } = await axiosInstance.get(`/products/${id}`);
  const source = BY_SLUG[data.category];
  return {
    ...data,
    group: source?.group || "other",
    gender: source?.gender || "unisex",
  };
}