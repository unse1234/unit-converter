# SEO_SPEC.md — Search and Programmatic SEO Specification

## 1. SEO Goal

Build an organic-search-friendly utility site where each important conversion intent can be reached through a clean, useful, canonical URL.

The goal is not to maximize URL count. The goal is to maximize useful search coverage without creating thin or duplicate pages.

## 2. URL Architecture

### Homepage

`/`

### Category

`/length/`
`/weight/`
`/temperature/`
`/volume/`
...

### Conversion intent

`/length/meters-to-feet`
`/length/feet-to-meters`
`/weight/kilograms-to-pounds`
`/temperature/celsius-to-fahrenheit`

Rules:

- lowercase
- hyphen-separated
- stable
- human-readable
- no unnecessary query strings
- one canonical URL for an indexable conversion intent

## 3. Indexing Strategy

Index pages that have meaningful user/search intent and sufficient useful content.

Do not automatically index every theoretical pair if the result would create near-duplicate or low-value pages.

Create an explicit indexability flag in the data model where needed.

## 4. Page Template

Every indexable conversion page should support:

1. breadcrumb/context
2. H1
3. short explanatory introduction
4. interactive converter
5. direct conversion statement
6. formula
7. formula explanation
8. common examples
9. conversion table
10. related conversions
11. related units/category links
12. FAQ when useful

## 5. Metadata

Every page must have generated metadata:

- title
- meta description
- canonical
- Open Graph title
- Open Graph description
- Open Graph URL
- suitable social image if available

Metadata should be unique and generated from structured conversion data.

Do not create keyword-stuffed titles.

## 6. Example Metadata

Example:

Title:

`Meters to Feet Converter – Convert m to ft`

Description:

`Convert meters to feet instantly with our free m to ft converter. Get accurate results, formulas, examples, and common conversion values.`

Treat examples as patterns, not immutable strings.

## 7. Canonicalization

The conversion page itself is canonical.

Query parameters such as:

`?value=10`

must not create separate indexed canonical pages.

Canonical URLs must remain stable.

## 8. Internal Linking

Every conversion page should connect naturally to:

- parent category
- reverse conversion
- related conversions
- related units
- relevant educational content

Avoid generic link farms.

Example graph:

```text
Length
 ├─ Meters to Feet
 ├─ Feet to Meters
 ├─ Meters to Inches
 ├─ Inches to Meters
 └─ Kilometers to Miles
```

## 9. Breadcrumbs

Use breadcrumbs to expose hierarchy to users and search engines where appropriate.

Example:

`Home → Length → Meters to Feet`

## 10. Structured Data

Use structured data only when the schema genuinely matches the content and expected search behavior.

Do not add arbitrary schema merely for perceived SEO benefit.

Validate structured data as part of QA.

## 11. XML Sitemap

Generate sitemap files from actual indexable routes.

Requirements:

- no accidental duplicates
- no non-indexable URLs
- updated route generation
- scalable beyond a small number of pages

Use sitemap indexes if the number of URLs warrants multiple sitemap files.

## 12. robots.txt

Allow normal crawling of useful public content.

Do not accidentally block CSS, JS, or important resources required for rendering.

Do not use robots.txt as a substitute for canonicalization or proper indexing controls.

## 13. Programmatic Content Rules

Programmatic SEO pages must not be blank templates with substituted unit names.

Each page should provide conversion-specific useful information:

- exact relationship
- formula
- realistic examples
- common values
- related conversions
- unit explanation

Avoid adding paragraphs merely to increase word count.

## 14. Search Intent Matching

Recognize common intent patterns such as:

- `kg to lb`
- `kilograms to pounds`
- `convert kg to pounds`
- `10 kg in pounds`

These should resolve to the appropriate conversion experience rather than creating a new page for every wording variation.

## 15. Internal Search

The application search should route direct intent to the most relevant conversion page where possible.

Example:

`kg to lbs` → `/weight/kilograms-to-pounds`

## 16. Technical SEO

Require:

- SSR/SSG-friendly page output
- valid semantic HTML
- canonical tags
- sitemap
- robots.txt
- clean headings
- descriptive link text
- 404 handling
- stable URLs
- correct status codes
- no accidental noindex

## 17. Duplicate Content Prevention

Avoid creating separate indexable pages for:

- alternate spellings
- aliases
- case variations
- symbols
- query parameters

Use aliases for matching/search, not unnecessary indexable URLs.

## 18. Pagination / Large Catalogs

Category pages should remain usable even with many units.

Do not expose thousands of links in an unreadable wall of text.

Use grouping, search, or sensible sections.

## 19. SEO QA Checklist

Before release verify:

- titles are unique
- descriptions are meaningful
- canonical URLs are correct
- sitemap contains expected URLs
- robots.txt behaves correctly
- internal links resolve
- no orphaned critical pages
- indexable pages contain useful content
- no accidental duplicate routes
- no placeholder metadata
- no accidental `noindex`
- 404 responses are correct
