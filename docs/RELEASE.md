# How to release

Currently, the release process is not fully automated, so here is how we do it.

> We are very open for PRs that show how we can automate parts of this process or go for a fully automated process that is able to cover most of this process.
We are open to discuss things that are redundant in PRs. 

## Prerequisites

- [All changes to be included in the current milestone are landed on the default branch and the related tickets are closed](https://github.com/orgs/xmldom/projects/1/views/5).
- All related PRs are connected to the current milestone
- The default branch is checked out and up to date.
  `git fetch --all && git checkout -B master upstream/master`
- determine the upcoming `$NEXT_VERSION` number according to [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
    - it should already be reflected in the current milestone
    - if there are any breaking changes or new features: `$bump` is `minor`
    - otherwise `$bump` is `patch`
    - keep in mind we are not doing any `major` bumps so far!
    - keep in mind we are not using a `v` prefix anywhere! 

## 1. Generate update for CHANGELOG

- `npm run changelog`
- Tweak the result until it matches the previous entries
  - Remove the now repeated first lines
  - change the headline by replacing `Unreleased` and `HEAD` with `$NEXT_VERSION` (no `v` prefix!)
  - Split features/fixes/chore/docs/... according to the commit message
  - Mention people that contributed to PRs in the list Changes
  - Mention people that contributed to fixed issues by creating them or commenting
- Create a PR, review it (read the updated markdown on github once!) and land it

## 2. Create and publish the release

- `git fetch --all && git checkout -B master upstream/master`
- `npm run release -- $bump` and follow the instructions
- Copy the content of the changelog to the release draft
- Change the first headline to be just a link with the text `Commits`
- `npm run pack` and upload the new file as a binary
- If it's a minor bump: Check the box for creating a release discussion
- If it's a patch bump: update the related release discussion of the minor bump 
  by adding the changelog to the bottom.

## 3. Update Milestones

- Close the current milestone

### For minor bumps

- rename `next breaking/minor release` to the actual next minor version number
  - make sure all the tickets in it make sense
  - if there are no tickets, start the process of picking the next most important breaking change from `before 1.0.0`
- create a new milestone named `next breaking/minor release`
  - it doesn't have to contain a ticket yet, but pick from `before 1.0.0`

### For patch bumps

You only need to create a new milestone once you know you are going to release a patch release.
