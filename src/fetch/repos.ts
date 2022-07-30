import { Endpoints } from '@octokit/types';
import { github } from './github.js';

async function getRepos(org: string) {
  let repos: Endpoints['GET /orgs/{org}/repos']['response']['data'] = [];
  let page = 0;
  while (true) {
    const { data } = await github.repos.listForOrg({ org, per_page: 100, page });
    repos.push(...data);
    if (data.length < 100) {
      break;
    }
    page++;
  }
  return repos;
}

export const getTC39Repos = () => getRepos('tc39');
