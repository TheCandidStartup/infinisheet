# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.13.1](https://github.com/TheCandidStartup/infinisheet/compare/v0.13.0...v0.13.1) (2026-02-10)

**Note:** Version bump only for package @candidstartup/event-sourced-spreadsheet-data

# [0.13.0](https://github.com/TheCandidStartup/infinisheet/compare/v0.12.0...v0.13.0) (2026-01-20)

### Bug Fixes

* **event-sourced-spreadsheet-data:** Forking segment now gives same result as loading from snapshot ([673c7fe](https://github.com/TheCandidStartup/infinisheet/commit/673c7fe9abe58606396711929605cd658a5d0fb3))

### Features

* **event-sourced-spreadsheet-data:** Added save/load CellMap as snapshot ([9c56368](https://github.com/TheCandidStartup/infinisheet/commit/9c56368b08934f617843643bc69c7a4a9d693086))
* **event-sourced-spreadsheet-data:** Added SpreadsheetCellMap in-memory representation ([19e886b](https://github.com/TheCandidStartup/infinisheet/commit/19e886bbd631cd55ffc90f1c3efbd2990bc843e9))
* **event-sourced-spreadsheet-data:** First attempt at saving and restoring spreadsheet snapshots ([82d5dc7](https://github.com/TheCandidStartup/infinisheet/commit/82d5dc726c7f9204a7e52ef53580aea7968dfb06))
* **event-sourced-spreadsheet-data:** Handles snapshot completion when syncing log entries ([4748f04](https://github.com/TheCandidStartup/infinisheet/commit/4748f0403435d33417c3eb6371da129e450b812b))
* **event-sourced-spreadsheet-data:** Multi-blob snapshot format ([5f68495](https://github.com/TheCandidStartup/infinisheet/commit/5f6849537a37c9fe8be493fac78d90b380c6831a))
* **event-sourced-spreadsheet-data:** Notices completed snapshot and forks segment when entries added to log ([0d61d2e](https://github.com/TheCandidStartup/infinisheet/commit/0d61d2e359939d9d4a941acc235be51265c65173))
* **infinisheet-types:** Added optional snapshotId argument to EventLog addEntry and query methods ([09d75bc](https://github.com/TheCandidStartup/infinisheet/commit/09d75bc062ffa5cb21a2cadbe1bee80ed7b29d70))
* **infinisheet:** Added viewport to SpreadsheetData ([c90e7de](https://github.com/TheCandidStartup/infinisheet/commit/c90e7de1544fb839a9d4d1555d33934a8fefed3b))
* **infinisheet:** Continuing to evolve Workers interfaces while trying to integrate into EventSourcedSpreadsheetData ([9dc58ce](https://github.com/TheCandidStartup/infinisheet/commit/9dc58ced0e30a9f886d50f7338150a05ccbdca23))

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
