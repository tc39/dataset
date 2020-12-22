import { Octokit } from '@octokit/rest';

export const github = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export async function getRateLimit() {
  const { data } = await github.rateLimit.get();
  const { limit, remaining } = data.rate;
  const reset = new Date(data.rate.reset * 1000).toISOString();
  return `Rate limit: ${limit}, Remaining: ${remaining}, Reset Date: ${reset}`;
}
