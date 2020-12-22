export interface ProposalRecord {
  tags: string[];
  stage?: number;
  name?: string;
  link?: string;
  authors?: string[];
  champions?: string[];
  meeting?: string;
  tests?: string;
  rationale?: string;
  edition?: number;
}

export interface ExportedProposalRecord {
  tags: string[];

  stage?: number;
  name?: string;

  description?: string;
  rationale?: string;

  link?: string;
  spec?: string;
  tests?: string;
  meeting?: string;
  edition?: number;

  authors?: string[];
  champions?: string[];

  forks_count?: number;
  open_issues_count?: number;
  stargazers_count?: number;

  created_at?: Date;
  meeting_at?: Date;
  pushed_at?: Date;
}

export interface GitHubMember {
  name: string;
  username: string;
  url: string;
  avatar_url: string;
  company?: string;
  location?: string;
  bio?: string;
}

export interface ECMAMember {
  category: string;
  name: string;
  logo: string;
  href: string;
}
