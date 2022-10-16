# Roadmap and Releases

## Milestones

We always have the following [open milestones](https://github.com/xmldom/xmldom/milestones) for transparency regarding priority

- **0.M.0**\
  the upcoming/planned minor bump release for new features or breaking changes
- **0.M.x**\
  This milestone might not exist if no patch release is planned yet.\
  If `0.M.0` was released: the upcoming/planned patch bump(s) release(s) for bug fixes.\
  If `0.M.0` was not released: the things to work on right after the next planned minor bump
- **[next breaking/minor release](https://github.com/xmldom/xmldom/milestone/12)** \
  The topics that will be picked up once the milestones with specified versions have been released
- **[before 1.0.0](https://github.com/xmldom/xmldom/milestone/5)** \
  The issues in this milestone are going to be worked on.\
  After each minor or patch release we pick topics from this milestone and put them into the "next patch release" or "next minor release" milestones.\
  All of these will be worked on before we consider planning for a 1.0.0 release.
- **[planning 1.0.0](https://github.com/xmldom/xmldom/milestone/4)** \
  There is no timeline for when this is going to happen.\
  For issues in this milestone to become relevant for maintainers we will have to finish all issues in the `before 1.0.0` milestone.\
  In most cases maintainers didn't even invest time to think through, how to handle them.\
  It might even happen that we decide to not include them into `1.0.0`.

  For external contributors: Before creating a PR for these, communicate in the issue, how to go about it. Ideally with a proposal and arguments.

## How to release

Currently, the release process is not fully automated, so here is how we do it.

> We are very open for PRs that show how we can automate parts of this process or go for a fully automated process that is able to cover most of this process.
We are open to discuss things that are redundant in PRs.
> I can imagine that we could automatically create pre-releases when anything relevant lands on master. Those pre-release versions won't appear in the changelog, but the github release can (automatically) have all the information.

### 0. Prerequisites for a release

- [All changes to be included in the current milestone are landed on the default branch and the related tickets are closed](https://github.com/orgs/xmldom/projects/1/views/5).
- All related PRs are connected to the current milestone
- The default branch is checked out and up to date.
  `git fetch --all && git checkout -B master upstream/master`
- Make sure all dependencies up-to-date locally: `nvm i 12 && npm ci`
- determine the upcoming `$NEXT_VERSION` number according to [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
    - it should already be reflected in the current milestone
    - if there are any breaking changes or new features: `$bump` is `minor`
    - otherwise `$bump` is `patch`
    - keep in mind we are not doing any `major` bumps so far!
    - keep in mind we are not using a `v` prefix anywhere! 

### 1. Generate update for CHANGELOG

- `npm run changelog`
- Tweak the result until it matches the previous entries
  - Remove the now repeated first lines
  - change the headline by replacing `Unreleased` and `HEAD` with `$NEXT_VERSION` (no `v` prefix!)
  - Split features/fixes/chore/docs/... according to the commit message
  - Mention people that contributed to PRs in the list Changes
  - Mention people that contributed to fixed issues by creating them or commenting
- Create a PR, review it (read the updated markdown on github once!) and land it

`npm run release` ( => `np` => `npm run version` => `changelog-has-version.sh`) asserts that the new version is part of the changelog before publishing.

### 2. Create and publish the release

- `git fetch --all && git checkout -B master upstream/master`
- `npm run release -- $bump` and follow the instructions
  - to release an update to an oder minor version from a `release-0.N.x` branch, you have to use `npm run release -- $bump --branch release-0.N.x`.
    The script doesn't exist in the `release-0.7.x` branch, replace `npm run release` with `npx np -no-yarn`.
  - When releasing versions on older release branches, make sure that the `latest` dist tag points to the right current version, by using `npm dist-tag ls @xmldom/xmldom` and `npm dist-tag add @xmldom/xmldom@VERSION latest`
- Copy the content of the changelog to the release draft
- Change the first headline to be just a link with the text `Commits`
- Run `npm pack @xmldom/xmldom[@version-or-dist-tag]` to **download** the published binary 
  and **upload** the file to the release
- If it's a minor bump: Check the box for creating a release discussion
- If it's a patch bump: update the related release discussion of the minor bump 
  by adding the changelog to the bottom and changing the discussion title to have an `x` in the patch part of the version.

### 3. Update Milestones

Edit the current milestone:
- set the due date to the release date and
- Set the description to the release discussion
- close it

Create a new milestone named `0.M.0` or `0.M.x` if it doesn't exist yet.\
Pick and add the issue(s) / pr(s) from (in that order)
1. [`next breaking/minor release`](https://github.com/xmldom/xmldom/milestone/12) 
2. [`before 1.0.0`](https://github.com/xmldom/xmldom/milestone/5)

Update the [project board](https://github.com/orgs/xmldom/projects/1/views/5) to point to the new milestone.
