/**
 * Seed script — imports all_products.json into MongoDB.
 * Run: node scripts/seed.js
 * Requires MONGO_URI in .env
 *
 * Source file: ../vgp-offical/scripts/all_products.json (19.8 MB, ~5,209 products)
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const mongoose    = require('mongoose');
const path        = require('path');
const Product     = require('../src/models/Product');
const PromoCode   = require('../src/models/PromoCode');

const SOURCE_FILE = path.join(__dirname, '../../vgp-offical/scripts/all_products.json');
const BATCH_SIZE  = 500;

function makeSlug(productCode) {
  return productCode.toLowerCase().replace(/\s+/g, '-');
}

async function seedPromos() {
  await PromoCode.deleteMany({});
  await PromoCode.insertMany([
    { code: 'TENPERCENT',  percentage: 10, active: true },
    { code: 'FIVEPERCENT', percentage: 5,  active: true },
  ]);
  console.log('  Promo codes seeded (TENPERCENT, FIVEPERCENT)');
}

async function seedProducts() {
  let allProducts;
  try {
    allProducts = require(SOURCE_FILE);
  } catch (e) {
    console.error(`Cannot read source file: ${SOURCE_FILE}`);
    console.error('Make sure vgp-offical/scripts/all_products.json exists.');
    process.exit(1);
  }

  console.log(`Source file loaded: ${allProducts.length} total products`);

  // Only import products marked for display
  const displayProducts = allProducts.filter((p) => p.isDisplay !== false);
  console.log(`Importing ${displayProducts.length} (isDisplay: true) products...`);

  await Product.deleteMany({});

  const docs = displayProducts.map((p) => ({
    productCode:   p.productCode,
    slug:          makeSlug(p.productCode),
    name:          p.name,
    price:         p.price || 0,
    discountPrice: p.discountPrice || 0,
    description:   p.description || '',
    brand:         p.brand || null,
    images:        Array.isArray(p.images) ? p.images : [],
    category:      p.category || '',
    subcategory:   p.subcategory || '',
    quantity:      p.quantity || 0,
    isDisplay:     true,
    sale:          !!p.sale,
    highlighted:   !!p.highlighted,
    relatedProducts: (p.relatedProducts || []).map((r) => ({
      productCode:   r.productCode,
      name:          r.name,
      price:         r.price,
      discountPrice: r.discountPrice,
      link:          r.link,
      image:         r.image,
    })),
    partProducts: (p.partProducts || []).map((r) => ({
      productCode: r.productCode,
      name:        r.name,
      price:       r.price,
      link:        r.link,
      image:       r.image,
    })),
    attachments: (p.attachments || []).map((a) => ({ name: a.name, link: a.link })),
    ratings: {
      star_ratings: p.ratings?.star_ratings || 0,
      votes:        p.ratings?.votes || 0,
    },
  }));

  let inserted = 0;
  let skipped  = 0;

  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = docs.slice(i, i + BATCH_SIZE);
    try {
      const result = await Product.insertMany(batch, { ordered: false });
      inserted += result.length;
    } catch (err) {
      // ordered:false continues on duplicate key errors; count what made it through
      if (err.insertedDocs) inserted += err.insertedDocs.length;
      if (err.writeErrors)  skipped  += err.writeErrors.length;
    }
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(docs.length / BATCH_SIZE);
    process.stdout.write(`\r  Batch ${batchNum}/${totalBatches} — inserted: ${inserted}, skipped: ${skipped}`);
  }

  console.log(`\nDone. Inserted: ${inserted}, Skipped (duplicates): ${skipped}`);
}

async function main() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected.\n');

  console.log('--- Seeding promo codes ---');
  await seedPromos();

  console.log('\n--- Seeding products ---');
  await seedProducts();

  await mongoose.disconnect();
  console.log('\nSeed complete. MongoDB disconnected.');
}

main().catch((err) => {
  console.error('\nSeed failed:', err.message);
  process.exit(1);
});
