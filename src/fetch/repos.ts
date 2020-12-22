import { ReposListForOrgResponseData } from '@octokit/types';
import { github } from './github';

async function getRepos(org: string) {
  let repos: ReposListForOrgResponseData = [];
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
