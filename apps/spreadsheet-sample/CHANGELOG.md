# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.10.0](https://github.com/TheCandidStartup/infinisheet/compare/v0.9.0...v0.10.0) (2025-04-17)


### Features

* **react-spreadsheet:** Added error handling when SpreadsheetData setCellValueAndFormat method fails ([2e33d05](https://github.com/TheCandidStartup/infinisheet/commit/2e33d05044e95cf4c9b9dbc28f119d797e3b5de8))





# [0.9.0](https://github.com/TheCandidStartup/infinisheet/compare/v0.8.0...v0.9.0) (2025-03-20)


### Features

* **infinisheet:** React 19  compatibility ([fdee127](https://github.com/TheCandidStartup/infinisheet/commit/fdee127d86f5d0513f7beac48e4e9f8ff9ac7b64))


### BREAKING CHANGES

* **infinisheet:** Types exposed in react-virtual-scroll API have changed. In most cases you won't notice but possible something might break.





# [0.8.0](https://github.com/TheCandidStartup/infinisheet/compare/v0.7.1...v0.8.0) (2025-03-06)


### Features

* **storybook:** All data sources are now editable ([27982aa](https://github.com/TheCandidStartup/infinisheet/commit/27982aaa1c9b3bf35ec04f0ad928fa8ee394f67b))





## [0.7.1](https://github.com/TheCandidStartup/infinisheet/compare/v0.7.0...v0.7.1) (2025-02-25)

**Note:** Version bump only for package @candidstartup/spreadsheet-sample





# [0.7.0](https://github.com/TheCandidStartup/infinisheet/compare/v0.6.2...v0.7.0) (2025-02-25)


### Features

* **react-spreadsheet:** Added setCellValueAndFormat to SpreadsheetData interface ([ba96a9d](https://github.com/TheCandidStartup/infinisheet/commit/ba96a9d0cbb191d970bf0342142e7f2504c30d78))
* **react-spreadsheet:** Cell width/height now specified via SpreadsheetData interface ([cf612f0](https://github.com/TheCandidStartup/infinisheet/commit/cf612f00cea0ab6fd5b5937b6853e67de4840470))
* **react-spreadsheet:** Spreadsheet width and height props now apply to whole component rather than just the grid ([0a79402](https://github.com/TheCandidStartup/infinisheet/commit/0a7940211c5a725b9d5b1018ea931066472a98bc))
* **storybook:** Added initial VirtualSpreadsheet stories ([382a934](https://github.com/TheCandidStartup/infinisheet/commit/382a934e2a3fdb2ea8ce8ef538abf7daff1a4f44))
* **virtual-spreadsheet:** Cell content aligned depending on type ([65d9968](https://github.com/TheCandidStartup/infinisheet/commit/65d996800a4f85d76f56e950ccdacb8ce49558d7))





## [0.6.2](https://github.com/TheCandidStartup/infinisheet/compare/v0.6.1...v0.6.2) (2024-11-26)

**Note:** Version bump only for package spreadsheet-sample





# [0.6.0](https://github.com/TheCandidStartup/infinisheet/compare/v0.5.0...v0.6.0) (2024-11-11)

**Note:** Version bump only for package spreadsheet-sample





# [0.5.0](https://github.com/TheCandidStartup/infinisheet/compare/v0.4.0...v0.5.0) (2024-10-08)


### Bug Fixes

* **spreadsheet-sample:** Data returned is now snapshot dependent ([64d4b12](https://github.com/TheCandidStartup/infinisheet/commit/64d4b12c5f270473413002ee7bac647ce977d895))


### Features

* **react-spreadsheet:** Added infinite scrolling to extend size of grid when you scroll to end ([abbdabd](https://github.com/TheCandidStartup/infinisheet/commit/abbdabd55d8fb2a8fc74173382d02010d6fb805b))
* **react-spreadsheet:** Decided to use Google Sheets compatible data formatting ([5d5b055](https://github.com/TheCandidStartup/infinisheet/commit/5d5b05525bd2c09121a3f0322ee62c883871094e))
* **react-spreadsheet:** First cut at SpreadsheetData interface ([5ded2a8](https://github.com/TheCandidStartup/infinisheet/commit/5ded2a8e792853bc85400285ef842c8e11b103fb))
* **react-spreadsheet:** SpreadsheetData  and VirtualSpreadsheet now generic on Snapshot type ([4abd7a0](https://github.com/TheCandidStartup/infinisheet/commit/4abd7a0ac3c8c682be9cb12f4f099161f9dcc8f2))
* **react-spreadsheet:** SpreadsheetData interface now supports Excel data model ([d4dcca8](https://github.com/TheCandidStartup/infinisheet/commit/d4dcca840a680284f8827a02bf38f2a746751b4f))
* **spreadsheet-sample:** Added data source that recreates the world's most boring spreadsheet ([3522a92](https://github.com/TheCandidStartup/infinisheet/commit/3522a92d03733b10cf7454e9f0e835cc6ddfec10))
* **spreadsheet-sample:** Added some app styling so it works better when iframed into blog posts ([d2df43c](https://github.com/TheCandidStartup/infinisheet/commit/d2df43c75b03668fafd5a98d47b4cfecb4266043))
* **spreadsheet-sample:** BoringData now based on current date/time for live simulation of incoming sales ([f777950](https://github.com/TheCandidStartup/infinisheet/commit/f777950dacc651eabad65646451b76da464f39c8))
* **spreadsheet-sample:** Highlight element with focus in green to aid debugging ([b407661](https://github.com/TheCandidStartup/infinisheet/commit/b4076619a3b204d8d27fae4c0a3205af08025429))
