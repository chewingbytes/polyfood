# Food at Poly - Sanity Schema Structure

This project uses Sanity CMS to manage content for a food ordering platform for polytechnics in Singapore.

## Content Hierarchy

The content is organized in a 4-level hierarchy:

```
Polytechnics
  └── Canteens
        └── Stores
              └── Food Products
```

## Document Types

### 1. Polytechnic (`polytechnic`)
Represents a polytechnic institution in Singapore.

**Fields:**
- `name` - Full name (e.g., "Singapore Polytechnic")
- `shortName` - Abbreviation (e.g., "SP", "NP", "TP", "NYP", "RP")
- `slug` - URL-friendly identifier
- `description` - About the polytechnic
- `address` - Physical address
- `website` - Official website URL
- `image` - Main image
- `logo` - Polytechnic logo
- `color` - Brand color
- `isActive` - Visibility toggle

### 2. Canteen (`canteen`)
Represents a food court or canteen within a polytechnic.

**Fields:**
- `name` - Canteen name
- `slug` - URL-friendly identifier
- `polytechnic` - **Reference to Polytechnic** (required)
- `description` - About the canteen
- `location` - Physical location (e.g., "Building A, Level 1")
- `openingHours` - Operating hours text
- `image` - Canteen photo
- `isActive` - Visibility toggle

### 3. Store (`store`)
Represents a food stall or vendor within a canteen.

**Fields:**
- `name` - Store name
- `slug` - URL-friendly identifier
- `canteen` - **Reference to Canteen** (required)
- `description` - About the store
- `cuisine` - Type of cuisine (e.g., "Chinese", "Western", "Japanese")
- `stallNumber` - Physical stall number (e.g., "#01-23")
- `image` - Store photo
- `contactNumber` - Phone number
- `isActive` - Visibility toggle

### 4. Food Product (`foodProduct`)
Represents a menu item sold by a store.

**Fields:**
- `name` - Product name
- `slug` - URL-friendly identifier
- `store` - **Reference to Store** (required)
- `description` - Product description
- `price` - Price in SGD (number)
- `image` - Product photo
- `category` - Type: "main", "side", "beverage", "dessert", "snack"
- `isVegetarian` - Vegetarian flag
- `isHalal` - Halal certification flag
- `spicyLevel` - 0-4 scale (0=Not Spicy, 4=Extra Hot)
- `isAvailable` - Stock availability
- `preparationTime` - Estimated prep time in minutes

## Data Fetching

Use the provided helper functions in `src/data/sanity/index.ts`:

```typescript
// Get all polytechnics
const polytechnics = await getAllPolytechnics();

// Get a specific polytechnic with its canteens
const poly = await getPolytechnic("sp"); // slug

// Get all canteens (with polytechnic info)
const canteens = await getAllCanteens();

// Get a specific canteen with its stores
const canteen = await getCanteen("canteen-1"); // slug

// Get all stores (with canteen and polytechnic info)
const stores = await getAllStores();

// Get a specific store with its products
const store = await getStore("western-stall"); // slug

// Get all food products (with full hierarchy)
const products = await getAllFoodProducts();

// Get a specific food product
const product = await getFoodProduct("chicken-rice"); // slug
```

## GROQ Queries

All queries are defined in `src/data/sanity/groq.ts`:

- `ALL_POLYTECHNICS_QUERY` - List all active polytechnics
- `POLYTECHNIC_QUERY` - Single polytechnic with canteens
- `ALL_CANTEENS_QUERY` - List all active canteens with polytechnic refs
- `CANTEEN_QUERY` - Single canteen with stores
- `ALL_STORES_QUERY` - List all active stores with full parent hierarchy
- `STORE_QUERY` - Single store with products
- `ALL_FOOD_PRODUCTS_QUERY` - List all available products with full hierarchy
- `FOOD_PRODUCT_QUERY` - Single product with full parent hierarchy

## Example: Building a Page

```astro
---
// src/pages/polytechnics.astro
import { getAllPolytechnics } from '@/data/sanity';

const polytechnics = await getAllPolytechnics();
---

<div>
  {polytechnics?.map((poly) => (
    <a href={`/polytechnics/${poly.slug}`}>
      <h2>{poly.name} ({poly.shortName})</h2>
      <p>{poly.description}</p>
    </a>
  ))}
</div>
```

## Shopify Integration

The original Shopify-related documents (`product`, `collection`, `productVariant`) are still in the schema but can be removed if not needed. They are kept separate from the Food at Poly documents.

## Type Safety

After modifying queries, regenerate TypeScript types:

```bash
npm run typegen
```

This will update `src/data/sanity/types.generated.ts` with the latest query result types.
