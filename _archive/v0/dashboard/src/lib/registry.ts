import fs from 'node:fs/promises';
import path from 'node:path';
import { productConfigSchema, type ProductConfig } from './types';

const PRODUCTS_DIR = path.resolve(process.cwd(), '..', 'products');

export async function loadRegistry(): Promise<ProductConfig[]> {
  const entries = await fs.readdir(PRODUCTS_DIR, { withFileTypes: true });
  const configs: ProductConfig[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith('_')) continue;
    const configPath = path.join(PRODUCTS_DIR, entry.name, 'product.config.json');
    try {
      const raw = await fs.readFile(configPath, 'utf-8');
      const parsed = productConfigSchema.safeParse(JSON.parse(raw));
      if (parsed.success) configs.push(parsed.data);
      else console.warn(`Invalid product.config.json at ${configPath}:`, parsed.error.flatten());
    } catch (err) {
      // Skip products without a config; they're just folders
    }
  }

  return configs.sort((a, b) => a.slug.localeCompare(b.slug));
}
