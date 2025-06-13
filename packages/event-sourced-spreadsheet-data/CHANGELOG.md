# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.12.0](https://github.com/TheCandidStartup/infinisheet/compare/v0.11.0...v0.12.0) (2025-06-13)


### Bug Fixes

* **event-sourced-spreadsheet-data:** Was adding duplicate entries to in-memory log segment if setCellValueAndFormat completes during a sync ([a6cdbc5](https://github.com/TheCandidStartup/infinisheet/commit/a6cdbc5d90d961e107c3f8e3abbd5c7e91592bf6))


### Features

* **infinisheet:** First attempt at making SpreadsheetData.setCellValueAndFormat async ([b0f55f0](https://github.com/TheCandidStartup/infinisheet/commit/b0f55f0eae1f0c0b817a77b13347b99fc7185046))
* **react-spreadsheet:** Improved UX for conflict errors ([f411f24](https://github.com/TheCandidStartup/infinisheet/commit/f411f24f207c559d511b29d828aeebb24843fe7d))


### BREAKING CHANGES

* **infinisheet:** setCellValueAndFormat return type changed from Result to ResultAsync





# [0.11.0](https://github.com/TheCandidStartup/infinisheet/compare/v0.10.0...v0.11.0) (2025-05-28)


### Features

* **event-sourced-spreadsheet-data:** First attempt at implementing EventSourcedSpreadsheetData ([53e0756](https://github.com/TheCandidStartup/infinisheet/commit/53e07561bf8c07ee42a0606a7916cb611c9c8283))
* **storybook:** Added EventSourceSync story ([599cb29](https://github.com/TheCandidStartup/infinisheet/commit/599cb29296884e9cb501ce0dcd2a142f3a950830))
