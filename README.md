# TC39 Proposal dataset

This project provide TC39 proposal latest status

## "API"

- Structured [tc39/proposals](https://github.com/tc39/proposals)
  <br><https://tc39.es/dataset/proposals.json>
  <br><https://tc39.es/dataset/proposals.min.json> (Production)

## Development

Setup:

```sh
git clone https://github.com/tc39/dataset
cd dataset
# Install dependencies
npm ci
# Clone tc39/proposals and tc39/notes for make dataset
git clone https://github.com/tc39/notes
git clone https://github.com/tc39/proposal
```

Update dist files:

```sh
npm run build
GITHUB_TOKEN=xxx npm run make-dataset # Pass GITHUB_TOKEN for avoid rate limit
npm run make-scheme
```

## LICENSE

[UNLICENSE](LICENSE)

<!-- Trigger actions update -->
