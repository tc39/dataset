import $RefParser from '@apidevtools/json-schema-ref-parser';
import { promises as fs } from 'fs';
import { JSONSchema4 } from 'json-schema';
import { compile } from 'json-schema-to-typescript';

async function main() {
  await fs.mkdir('./dist/schema', { recursive: true });

  const bundleSchema = await $RefParser.dereference('./schema/bundle.json');
  const individualSchema = await $RefParser.dereference('./schema/individual.json');
  await fs.writeFile('./src/types/bundle.d.ts', await compile(bundleSchema as JSONSchema4, 'BundleProposals'));
  await fs.writeFile('./src/types/individual.d.ts', await compile(individualSchema as JSONSchema4, 'IndividualProposal'));
  await fs.writeFile('./dist/schema/bundle.json', JSON.stringify(bundleSchema, null, 2));
  await fs.writeFile('./dist/schema/individual.json', JSON.stringify(individualSchema, null, 2));
}

main();
