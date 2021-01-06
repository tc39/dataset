import $RefParser from '@apidevtools/json-schema-ref-parser';
import { promises as fs } from 'fs';
import { JSONSchema4 } from 'json-schema';
import { compile } from 'json-schema-to-typescript';

async function main() {
  await fs.mkdir('./dist/schema', { recursive: true });

  const individualSchema = await $RefParser.bundle('./schema/individual.json');
  const bundleSchema = await $RefParser.bundle('./schema/bundle.json');
  await fs.writeFile('./src/types/bundle.d.ts', await compile(bundleSchema as JSONSchema4, 'BundleProposals', { ignoreMinAndMaxItems: true }));
  await fs.writeFile('./dist/schema/bundle.json', JSON.stringify(bundleSchema));
  await fs.writeFile('./dist/schema/individual.json', JSON.stringify(individualSchema));
}

main();
