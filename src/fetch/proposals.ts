import { Endpoints } from '@octokit/types';
import _ from 'lodash-es';
import parseGithubURL from 'parse-github-url';
import { github } from './github.js';
import { readAllProposals } from './proposal-markdown.js';
import { getTC39Repos } from './repos.js';
import { BundleProposals } from '../types/bundle.js';

const fetchWithRetry = async (url: RequestInfo, init: RequestInit, retryCount = 3) => {
  for (let i = 0; i < retryCount; i++) {
    try {
      return await fetch(url, init);
    } catch (error) {
      if (i === retryCount - 1) throw error;
    }
    // exponential backoff: 100ms, 400ms, 900ms
    await new Promise((resolve) => setTimeout(resolve, (i + 1) ** 2 * 100));
  }
  throw new Error('Unreachable');
};

export async function getProposals() {
  const repos = await getTC39Repos();
  const records: BundleProposals = [];
  for (const proposal of await readAllProposals()) {
    let data: Endpoints['GET /repos/{owner}/{repo}']['response']['data'] | Endpoints['GET /orgs/{org}/repos']['response']['data'][number] | undefined;
    if (proposal.url?.includes('github.com')) {
      const result = parseGithubURL(proposal.url)!;
      data = repos.find(({ owner, name }) => owner?.login === result.owner && name === result.name);
      if (_.isNil(data)) {
        try {
          const response = await github.repos.get({ owner: result.owner!, repo: result.name! });
          data = response.data;
        } catch (error) {
          console.error('::error::[Skip]', proposal.url, (error as any).message);
          continue;
        }
      }
      if (data.owner?.login !== result.owner || data.name !== result.name) {
        console.error('::error::[Transferred]', proposal.url, '->', data.html_url);
      }
    }
    console.log(`Added \`${proposal.name}\``);
    let spec: string | undefined;
    {
      const specURL =
        data?.owner?.login === 'tc39' && /^proposal-/.test(data.name)
          ? `https://tc39.es/${data.name}/`
          : `https://${data?.owner?.login}.github.io/${data?.name}/`;

      const response = await fetchWithRetry(specURL, { redirect: 'manual' });

      // This is the default spec text at https://github.com/tc39/template-for-proposals/blob/HEAD/spec.emu
      if (response.status !== 200) spec = undefined;
      else if ((await response.text()).includes('Proposal Title Goes Here')) spec = undefined;
      else spec = specURL;
    }

    if (proposal.rationale && /withdrawn/i.test(proposal.rationale)) {
      proposal.tags.push('withdrawn');
    } else if (proposal.stage === -1) {
      proposal.tags.push('inactive');
    }
    if (data?.archived) {
      proposal.tags.push('archived');
    }
    records.push({
      'tags': proposal.tags,
      'stage': proposal.stage,
      'name': proposal.name,

      'id': data?.name && /^proposal-/.test(data?.name) ? data?.name : undefined,
      'description': data?.description?.trim() ?? undefined,

      'url': proposal.url?.includes('/blob/master/') ? proposal.url : data?.html_url ?? proposal.url,
      'tests': proposal.tests,
      'notes': proposal.notes,

      'has-specification': Boolean(spec),

      'authors': proposal.authors,
      'champions': proposal.champions,

      'rationale': proposal.rationale,
      'edition': proposal.edition ? +proposal.edition : undefined,

      'pushed_at': data?.pushed_at ? new Date(data?.pushed_at).toISOString() : undefined,
    });
  }
  return _.chain(records)
    .sortBy(({ pushed_at }) => (pushed_at ? new Date(pushed_at).getTime() : 0))
    .reverse()
    .value();
}
