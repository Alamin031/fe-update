import { CategorySlider } from "./components/home/category-slider";
import { categoriesService } from "./lib/api/services/categories";
import { ProductSectionLazy } from "./components/home/product-section-lazy";
import { BrandSlider } from "./components/home/brand-slider";
import { brandsService } from "./lib/api/services/brands";
import { Navbar } from "./components/layout/navbar";
import { Footer } from "./components/layout/footer";
import { homecategoriesService } from "./lib/api/services/homecategories";
import { LazySection } from "./components/home/lazy-section";
import { HeroBanner } from "./components/home/hero-banner";
import { BottomBanner } from "./components/home/bottom-banner";
import { MiddleBanner } from "./components/home/middel-banner";

export const dynamic = 'force-dynamic';

export default async function Page() {
  // Fetch brands for the slider
  const brands = await brandsService.findAll();
  // Fetch categories for the slider
  const categories = await categoriesService.getAll();
  // Ensure slug is always a string to match the app types
  const normalizedCategories: import("./types").Category[] = categories.map(
    (c) => ({
      ...c,
      slug: c.slug ?? "",
    })
  );

  // Fetch all homecategories and sort by priority
  const homecategories = await homecategoriesService.list();
  console.log('Fetched homecategories:', homecategories);
  const sortedHomecategories = [...homecategories].sort(
    (a, b) => (a.priority ?? 999) - (b.priority ?? 999)
  );

  // Use products directly from homecategory response

  const flashSaleEndTime = new Date();
  flashSaleEndTime.setHours(flashSaleEndTime.getHours() + 24);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 flex flex-col">
        {/* Hero Banner */}
        <section className="mx-auto w-full max-w-7xl px-4 py-6">
          <HeroBanner />
        </section>

        {/* Show Shop by Category only if categories exist */}
        {normalizedCategories.length > 0 && (
          <section className="mx-auto w-full max-w-7xl px-4 py-8">
            <h2 className="mb-6 text-center text-2xl font-bold tracking-tight">
              Shop by Category
            </h2>
            <CategorySlider categories={normalizedCategories} />
          </section>
        )}

        {/* Dynamic Homecategory Sections (first 2) using ProductSectionLazy */}
        {sortedHomecategories.slice(0, 2).map((hc) => (
          <section key={hc.id} className="mx-auto w-full max-w-7xl px-4 py-8">
            <LazySection>
              <ProductSectionLazy
                title={hc.name}
                subtitle={hc.description}
                products={hc.products}
                viewAllLink={
                  hc.products && hc.products.length > 0
                    ? `/products?homecategory=${hc.id}`
                    : undefined
                }
              />
            </LazySection>
          </section>
        ))}

        {/* Middle Banner after first 2 homecategory sections */}
        <section className="mx-auto w-full max-w-7xl px-4 py-6">
          <MiddleBanner />
        </section>

        {/* Dynamic Homecategory Sections (remaining) using LazySection and ProductSectionLazy */}
        {sortedHomecategories.slice(2).map((hc) => (
          <section key={hc.id} className="mx-auto w-full max-w-7xl px-4 py-8">
            <LazySection>
              <ProductSectionLazy
                title={hc.name}
                subtitle={hc.description}
                products={hc.products}
                viewAllLink={
                  hc.products && hc.products.length > 0
                    ? `/products?homecategory=${hc.id}`
                    : undefined
                }
              />
            </LazySection>
          </section>
        ))}

        {/* Bottom Hero Banner before CTA Section */}
        <section className="mx-auto w-full max-w-7xl px-4 py-6">
          <BottomBanner />
        </section>

        {/* Show Brands section only if brands exist */}
        {brands.length > 0 && (
          <section className="mx-auto w-full max-w-7xl px-4 py-12">
            <BrandSlider brands={brands} />
          </section>
        )}

        {/* Newsletter / CTA Section */}
        <section className="bg-muted">
          <div className="mx-auto max-w-7xl px-4 py-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Stay Updated</h2>
            <p className="mt-2 text-muted-foreground">
              Get exclusive deals, new arrivals, and tech news delivered to your
              inbox.
            </p>
            <form className="mx-auto mt-6 flex max-w-md gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-lg border border-input bg-background px-4 py-2 text-sm"
              />
              <button
                type="submit"
                className="rounded-lg bg-foreground px-6 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
              >
                Subscribe
              </button>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
