import { promises as fs } from 'fs';
import _ from 'lodash';
import MarkdownIt from 'markdown-it';
import { parseHTML } from './parse-table';
import { BundleProposals, IndividualProposal } from '../types/bundle';

const markdown = new MarkdownIt();

export async function readAllProposals() {
  interface Job {
    tags: IndividualProposal['tags'];
    stages: number[];
    path: string;
  }
  const jobs: Job[] = [
    // ECMA-262
    { tags: ['ECMA-262'], stages: [4], path: 'finished-proposals' },
    { tags: ['ECMA-262'], stages: [3, 2], path: 'README' },
    { tags: ['ECMA-262'], stages: [1], path: 'stage-1-proposals' },
    { tags: ['ECMA-262'], stages: [0], path: 'stage-0-proposals' },
    { tags: ['ECMA-262'], stages: [-1], path: 'inactive-proposals' },
    // ECMA-402
    { tags: ['ECMA-402'], stages: [4], path: 'ecma402/finished-proposals' },
    { tags: ['ECMA-402'], stages: [3, 2, 1], path: 'ecma402/README' },
    { tags: ['ECMA-402'], stages: [0], path: 'ecma402/stage-0-proposals' },
  ];
  const records: BundleProposals = [];
  for (const { tags, stages, path } of jobs) {
    records.push(...readProposals(tags, stages, await fs.readFile(`proposals/${path}.md`, 'utf-8')));
  }
  return records;
}

function* readProposals(tags: IndividualProposal['tags'], stages: number[], content: string): Generator<BundleProposals[0]> {
  let i = 0;
  for (const table of parseHTML(markdown.render(content), renameHeader)) {
    console.log(`Parsing ${tags[0]} Stage ${stages[i]}`);
    for (const row of table) {
      const test = _.values(row.tests?.links)[0]?.trim();
      const meeting = _.values(row.meeting?.links)[0]?.trim();
      yield {
        tags: Array.from(tags) as any,
        stage: stages[i],
        name: row.name?.text?.trim()!,
        url: _.values(row.name?.links)[0]?.trim(),
        authors: (splitPeopleNames(row.author?.text) ?? []) as any,
        champions: (splitPeopleNames(row.champion?.text) ?? []) as any,
        notes: meeting
          ? [
              {
                date: getMeetingAt(meeting)?.toISOString()!,
                url: meeting,
              },
            ]
          : undefined,
        tests: test ? [test] : undefined,
        rationale: row.rationale?.text?.trim(),
        edition: row.edition ? +row.edition.text : undefined,
      };
    }
    i++;
  }
}

function renameHeader(name: string): string {
  if (/proposal/i.test(name)) {
    return 'name';
  } else if (/author/i.test(name)) {
    return 'author';
  } else if (/champion/i.test(name)) {
    return 'champion';
  } else if (/meeting|presented/i.test(name)) {
    return 'meeting';
  } else if (/tests/i.test(name)) {
    return 'tests';
  } else if (/rationale/i.test(name)) {
    return 'rationale';
  } else if (/publication/i.test(name)) {
    return 'edition';
  }
  return name;
}

function splitPeopleNames(text: string | undefined) {
  if (_.isNil(text)) {
    return;
  }
  const texts = text
    .split(/<br\s*\/?>/gi)
    .flatMap((text) => {
      if (text.includes('previously')) {
        return text;
      }
      return text.split(/,\s+|\s+(?:&|and)\s+/g);
    })
    .map((text) => text.trim())
    .filter((text) => text.length);
  if (texts.length === 0) {
    return;
  }
  return texts;
}

function getMeetingAt(meeting?: string) {
  if (meeting && /\/meetings\/(\d+)\-(\d+)\/\w+\-(\d+)\.md/.test(meeting)) {
    return new Date(+RegExp.$1, +RegExp.$2 - 1, +RegExp.$3);
  }
  return;
}
