import { Endpoints } from '@octokit/types';
import _ from 'lodash';
import fetch from 'node-fetch';
import parseGithubURL from 'parse-github-url';
import { github } from './github';
import { readAllProposals } from './proposal-markdown';
import { getTC39Repos } from './repos';
import { BundleProposals } from '../types/bundle';

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
          console.error('::error::[Skip]', proposal.url, error.message);
          continue;
        }
      }
      if (data.owner?.login !== result.owner || data.name !== result.name) {
        console.error('::error::[Transferred]', proposal.url, '->', data.html_url);
      }
    }
    console.log(`Added \`${proposal.name}\``);
    let spec: string | undefined;
    if (data?.owner?.login === 'tc39' && /^proposal-/.test(data.name)) {
      spec = `https://tc39.es/${data.name}/`;
      const response = await fetch(spec, { method: 'HEAD', redirect: 'manual' });
      if (response.status !== 200) {
        spec = undefined;
      }
    } else if (data?.owner?.login !== 'tc39') {
      spec = `https://${data?.owner?.login}.github.io/${data?.name}/`;
      const response = await fetch(spec, { method: 'HEAD', redirect: 'manual' });
      if (response.status !== 200) {
        spec = undefined;
      }
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
