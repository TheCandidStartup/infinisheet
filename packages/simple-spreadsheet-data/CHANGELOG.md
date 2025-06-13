# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.12.0](https://github.com/TheCandidStartup/infinisheet/compare/v0.11.0...v0.12.0) (2025-06-13)


### Features

* **infinisheet:** First attempt at making SpreadsheetData.setCellValueAndFormat async ([b0f55f0](https://github.com/TheCandidStartup/infinisheet/commit/b0f55f0eae1f0c0b817a77b13347b99fc7185046))
* **simple-spreadsheet-data:** Added DelayEventLog for simulating latency ([9b5872d](https://github.com/TheCandidStartup/infinisheet/commit/9b5872d2abf6b68bb580433f7a85b310bbb59a0d))


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

**Note:** Version bump only for package @candidstartup/simple-spreadsheet-data





# [0.8.0](https://github.com/TheCandidStartup/infinisheet/compare/v0.7.1...v0.8.0) (2025-03-06)


### Features

* **simple-spreadsheet-data:** Added LayeredSpreadsheetData class ([eba3276](https://github.com/TheCandidStartup/infinisheet/commit/eba32765e7d7df95590278f62c434be80e22bc4a))
