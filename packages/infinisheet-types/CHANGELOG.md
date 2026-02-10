# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.13.1](https://github.com/TheCandidStartup/infinisheet/compare/v0.13.0...v0.13.1) (2026-02-10)

**Note:** Version bump only for package @candidstartup/infinisheet-types

# [0.13.0](https://github.com/TheCandidStartup/infinisheet/compare/v0.12.0...v0.13.0) (2026-01-20)

### Bug Fixes

* **infinisheet-types:** PendingWorkflowMessage interface now extends WorkerMessage ([8a60a23](https://github.com/TheCandidStartup/infinisheet/commit/8a60a23a8b6faa510ac044f5fb9bc8706c6f1d9f))

### Features

* **event-sourced-spreadsheet-data:** Added save/load CellMap as snapshot ([9c56368](https://github.com/TheCandidStartup/infinisheet/commit/9c56368b08934f617843643bc69c7a4a9d693086))
* **event-sourced-spreadsheet-data:** First attempt at saving and restoring spreadsheet snapshots ([82d5dc7](https://github.com/TheCandidStartup/infinisheet/commit/82d5dc726c7f9204a7e52ef53580aea7968dfb06))
* **event-sourced-spreadsheet-data:** Notices completed snapshot and forks segment when entries added to log ([0d61d2e](https://github.com/TheCandidStartup/infinisheet/commit/0d61d2e359939d9d4a941acc235be51265c65173))
* **infinisheet-types:** Added optional snapshotId argument to EventLog addEntry and query methods ([09d75bc](https://github.com/TheCandidStartup/infinisheet/commit/09d75bc062ffa5cb21a2cadbe1bee80ed7b29d70))
* **infinisheet:** Added first cut at BlobStore interface ([e8a914e](https://github.com/TheCandidStartup/infinisheet/commit/e8a914e051ffa77df5954e71f6614e8cb003dc9c))
* **infinisheet:** Added NoContinuationError for use by BlobStore.query ([ae94afd](https://github.com/TheCandidStartup/infinisheet/commit/ae94afde1812942a357ecca6f8143e2231d7ac8c))
* **infinisheet:** Added viewport to SpreadsheetData ([c90e7de](https://github.com/TheCandidStartup/infinisheet/commit/c90e7de1544fb839a9d4d1555d33934a8fefed3b))
* **infinisheet:** Continuing to evolve Workers interfaces while trying to integrate into EventSourcedSpreadsheetData ([9dc58ce](https://github.com/TheCandidStartup/infinisheet/commit/9dc58ced0e30a9f886d50f7338150a05ccbdca23))
* **infinisheet:** First cut at a Workers interface and SimpleWorkers reference implementation ([3b74059](https://github.com/TheCandidStartup/infinisheet/commit/3b740595eb5d11b5b6e8bb9dc3a895c3db38e12e))

# [0.12.0](https://github.com/TheCandidStartup/infinisheet/compare/v0.11.0...v0.12.0) (2025-06-13)

### Features

* **infinisheet:** First attempt at making SpreadsheetData.setCellValueAndFormat async ([b0f55f0](https://github.com/TheCandidStartup/infinisheet/commit/b0f55f0eae1f0c0b817a77b13347b99fc7185046))

### BREAKING CHANGES

* **infinisheet:** setCellValueAndFormat return type changed from Result to ResultAsync

# [0.11.0](https://github.com/TheCandidStartup/infinisheet/compare/v0.10.0...v0.11.0) (2025-05-28)

### Features

* **infinisheet:** Added InfinisheetError base interface ([ce28da5](https://github.com/TheCandidStartup/infinisheet/commit/ce28da53a9c3ed61ecaa995168c173f783090e71))
* **infinisheet:** Added setMetadata method to EventLog interface ([800586e](https://github.com/TheCandidStartup/infinisheet/commit/800586e05760a5f82db40d76991bd180ede70d55))
* **infinisheet:** Initial work on EventLog type and SimpleEventLog reference implementation ([2e1aa3e](https://github.com/TheCandidStartup/infinisheet/commit/2e1aa3e23e7df45bf7272603a0909074a0029bd9))
* **infinisheet:** Made EventLog API asynchronous with ResultAsync ([b2fcbbf](https://github.com/TheCandidStartup/infinisheet/commit/b2fcbbf5406fbbe9281cd19956fe4eadb1f27fc4))
* **infinisheet:** Made EventLog generic on LogEntry type ([e40ee1f](https://github.com/TheCandidStartup/infinisheet/commit/e40ee1f1c6646ff3f99071b732ebc96d9ff21489))

# [0.10.0](https://github.com/TheCandidStartup/infinisheet/compare/v0.9.0...v0.10.0) (2025-04-17)

### Features

* **infinisheet:** Added neverthrow Result type for clean error handling ([baf5390](https://github.com/TheCandidStartup/infinisheet/commit/baf539097e6ad38f94bf89b0f580e0a67ab5a023))
* **react-spreadsheet:** Added error handling when SpreadsheetData setCellValueAndFormat method fails ([2e33d05](https://github.com/TheCandidStartup/infinisheet/commit/2e33d05044e95cf4c9b9dbc28f119d797e3b5de8))

### BREAKING CHANGES

* **infinisheet:** Return type of SpreadsheetData.setCellValueAndFormat changed from `boolean` to `Result<void,SpreadsheetDataError>`

# [0.9.0](https://github.com/TheCandidStartup/infinisheet/compare/v0.8.0...v0.9.0) (2025-03-20)

### Features

* **infinisheet:** API now compatible with  TypeScript `exactOptionalPropertyTypes` and `noUncheckedIndexedAccess` options ([4159992](https://github.com/TheCandidStartup/infinisheet/commit/4159992699e50fd85aef9ce86d9910ed084bd573))

### BREAKING CHANGES

* **infinisheet:** API signatures changed to add explicit `| undefined` to optional props

# [0.8.0](https://github.com/TheCandidStartup/infinisheet/compare/v0.7.1...v0.8.0) (2025-03-06)

**Note:** Version bump only for package @candidstartup/infinisheet-types

## [0.7.1](https://github.com/TheCandidStartup/infinisheet/compare/v0.7.0...v0.7.1) (2025-02-25)

**Note:** Version bump only for package @candidstartup/infinisheet-types

# [0.7.0](https://github.com/TheCandidStartup/infinisheet/compare/v0.6.2...v0.7.0) (2025-02-25)

### Build System

* **infinisheet:** Preparing to publish react-spreadsheet, react-virtual-scroll and infinisheet-types packages ([9008fe5](https://github.com/TheCandidStartup/infinisheet/commit/9008fe56dc7e4a09b30048181300b33c7c45ed48))

### BREAKING CHANGES

* **infinisheet:** Moved `ItemOffsetMapping` into new `infinisheet-types` package
