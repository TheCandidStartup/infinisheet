# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
