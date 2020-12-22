import { promises as fs } from 'fs';
import { getRateLimit } from './fetch/github';
import { getProposals } from './fetch/proposals';

async function main() {
  console.log(await getRateLimit());

  console.log('Fetch TC39 Proposals');
  const proposals = await getProposals();
  await fs.writeFile('dist/proposals.json', JSON.stringify(proposals));
  await fs.writeFile('dist/proposals.min.json', JSON.stringify(proposals));

  console.log(await getRateLimit());
}

main().catch((err) => {
  console.error(':error:', err);
  process.exit(1);
});
