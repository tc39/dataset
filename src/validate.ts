import $RefParser from '@apidevtools/json-schema-ref-parser';
import { Ajv } from 'ajv';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import type { JSONSchema4 } from 'json-schema';

const require = createRequire(import.meta.url);
const addFormats: (ajv: Ajv) => Ajv = require('ajv-formats');

const bundleSchema = await $RefParser.dereference('./schema/bundle.json');

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
const validate = ajv.compile(bundleSchema as JSONSchema4);

const proposals = JSON.parse(await readFile('./dist/proposals.json', 'utf8'));

if (!validate(proposals)) {
  console.error(validate.errors);
  process.exit(1);
}

console.log('dist/proposals.json is valid against schema/bundle.json');
