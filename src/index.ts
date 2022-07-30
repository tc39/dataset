import { writeFile } from 'node:fs/promises';
import { getRateLimit } from './fetch/github.js';
import { getProposals } from './fetch/proposals.js';

async function main() {
  console.log(await getRateLimit());

  console.log('Fetch TC39 Proposals');
  const proposals = await getProposals();
  await writeFile('dist/proposals.json', JSON.stringify(proposals));
  await writeFile('dist/proposals.min.json', JSON.stringify(proposals));

  console.log(await getRateLimit());
}

main().catch((err) => {
  console.error(':error:', err);
  process.exit(1);
});
