# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.12.0](https://github.com/TheCandidStartup/infinisheet/compare/v0.11.0...v0.12.0) (2025-06-13)


### Features

* **infinisheet:** First attempt at making SpreadsheetData.setCellValueAndFormat async ([b0f55f0](https://github.com/TheCandidStartup/infinisheet/commit/b0f55f0eae1f0c0b817a77b13347b99fc7185046))
* **react-spreadsheet:** Added display of load status ([513eee7](https://github.com/TheCandidStartup/infinisheet/commit/513eee7e4b2363f7a0018f463a164422620cf9b9))
* **react-spreadsheet:** Improved UX for conflict errors ([f411f24](https://github.com/TheCandidStartup/infinisheet/commit/f411f24f207c559d511b29d828aeebb24843fe7d))
* **react-spreadsheet:** Using optimistic update pattern when editing cells ([d98429d](https://github.com/TheCandidStartup/infinisheet/commit/d98429d7dede531b1c76a79f9ee77bf9bc0a9325))


### BREAKING CHANGES

* **infinisheet:** setCellValueAndFormat return type changed from Result to ResultAsync





# [0.11.0](https://github.com/TheCandidStartup/infinisheet/compare/v0.10.0...v0.11.0) (2025-05-28)

**Note:** Version bump only for package @candidstartup/react-spreadsheet





# [0.10.0](https://github.com/TheCandidStartup/infinisheet/compare/v0.9.0...v0.10.0) (2025-04-17)


### Features

* **react-spreadsheet:** Added error handling when SpreadsheetData setCellValueAndFormat method fails ([2e33d05](https://github.com/TheCandidStartup/infinisheet/commit/2e33d05044e95cf4c9b9dbc28f119d797e3b5de8))





# [0.9.0](https://github.com/TheCandidStartup/infinisheet/compare/v0.8.0...v0.9.0) (2025-03-20)


### Features

* **infinisheet:** API now compatible with  TypeScript `exactOptionalPropertyTypes` and `noUncheckedIndexedAccess` options ([4159992](https://github.com/TheCandidStartup/infinisheet/commit/4159992699e50fd85aef9ce86d9910ed084bd573))
* **infinisheet:** React 19  compatibility ([fdee127](https://github.com/TheCandidStartup/infinisheet/commit/fdee127d86f5d0513f7beac48e4e9f8ff9ac7b64))


### BREAKING CHANGES

* **infinisheet:** API signatures changed to add explicit `| undefined` to optional props
* **infinisheet:** Types exposed in react-virtual-scroll API have changed. In most cases you won't notice but possible something might break.





# [0.8.0](https://github.com/TheCandidStartup/infinisheet/compare/v0.7.1...v0.8.0) (2025-03-06)


### Features

* **react-spreadsheet:** VirtualSpreadsheet no longer needs a type parameter ([f53882c](https://github.com/TheCandidStartup/infinisheet/commit/f53882cd3c0f56737a8e6b10fed998d2979db5fb))


### BREAKING CHANGES

* **react-spreadsheet:** Code that used VirtualSpreadsheet or VirtualSpreadsheetProps with a type parameter needs to either remove the parameter or switch to the generic version.





## [0.7.1](https://github.com/TheCandidStartup/infinisheet/compare/v0.7.0...v0.7.1) (2025-02-25)

**Note:** Version bump only for package @candidstartup/react-spreadsheet





# [0.7.0](https://github.com/TheCandidStartup/infinisheet/compare/v0.6.2...v0.7.0) (2025-02-25)


### Bug Fixes

* **react-spreadsheet:** Mouse click handler now copes with bogus client XY coords ([c2b54a6](https://github.com/TheCandidStartup/infinisheet/commit/c2b54a65d46bf1318169227571793416bacc4bc8))


### Build System

* **infinisheet:** Preparing to publish react-spreadsheet, react-virtual-scroll and infinisheet-types packages ([9008fe5](https://github.com/TheCandidStartup/infinisheet/commit/9008fe56dc7e4a09b30048181300b33c7c45ed48))


### Features

* **react-spreadsheet:** Added edit mode ([83e3ed1](https://github.com/TheCandidStartup/infinisheet/commit/83e3ed1b7c9ea3e585b657a61bb04ff8a77c5675))
* **react-spreadsheet:** Added formula input field ([7356cce](https://github.com/TheCandidStartup/infinisheet/commit/7356cce5a8c72ce5dbc6ba7aa3ed38bc5d910e45))
* **react-spreadsheet:** Added inputBarHeight, columnHeaderHeight, rowHeaderWidth props ([676319b](https://github.com/TheCandidStartup/infinisheet/commit/676319bfcc3e30df5a1ec31bebecf9b815b67dd2))
* **react-spreadsheet:** Added readOnly prop to VirtualSpreadsheet ([e731c93](https://github.com/TheCandidStartup/infinisheet/commit/e731c9332c9eab94b54a44384aa8701c218e609b))
* **react-spreadsheet:** Added setCellValueAndFormat to SpreadsheetData interface ([ba96a9d](https://github.com/TheCandidStartup/infinisheet/commit/ba96a9d0cbb191d970bf0342142e7f2504c30d78))
* **react-spreadsheet:** Cell width/height now specified via SpreadsheetData interface ([cf612f0](https://github.com/TheCandidStartup/infinisheet/commit/cf612f00cea0ab6fd5b5937b6853e67de4840470))
* **react-spreadsheet:** Complete key handling for arrow keys, return, tab and escape ([70bea38](https://github.com/TheCandidStartup/infinisheet/commit/70bea38b65d7ca6c63d7c394191a0529a71ca133))
* **react-spreadsheet:** Spreadsheet width and height props now apply to whole component rather than just the grid ([0a79402](https://github.com/TheCandidStartup/infinisheet/commit/0a7940211c5a725b9d5b1018ea931066472a98bc))
* **storybook:** Added stories for useIsScrolling prop ([d859e17](https://github.com/TheCandidStartup/infinisheet/commit/d859e170e1029ec5646174ef8bd7f256b75b4e34))
* **virtual-spreadsheet:** Cell content aligned depending on type ([65d9968](https://github.com/TheCandidStartup/infinisheet/commit/65d996800a4f85d76f56e950ccdacb8ce49558d7))


### BREAKING CHANGES

* **infinisheet:** Moved `ItemOffsetMapping` into new `infinisheet-types` package





## [0.6.2](https://github.com/TheCandidStartup/infinisheet/compare/v0.6.1...v0.6.2) (2024-11-26)


### Bug Fixes

* **react-spreadsheet:** Moving around grid with arrow keys now reliably extends grid when you reach the end ([01dd87c](https://github.com/TheCandidStartup/infinisheet/commit/01dd87c8e7cc9dba2b5b2eb63223109452ac1d03))


### Features

* **react-virtual-scroll:** Added useOffsets prop to VirtualScroll ([3ffa9fe](https://github.com/TheCandidStartup/infinisheet/commit/3ffa9fe932354f929feccd739cae243bd6317305))





# [0.6.0](https://github.com/TheCandidStartup/infinisheet/compare/v0.5.0...v0.6.0) (2024-11-11)


### Bug Fixes

* **react-spreadsheet:** Make sure focus sink correctly positioned and rendered ([b740c53](https://github.com/TheCandidStartup/infinisheet/commit/b740c534998b4ecc05712214e4977b2e73e0d50a))
* **react-spreadsheet:** Off by one error when sizing grid to include focus cell ([75efe88](https://github.com/TheCandidStartup/infinisheet/commit/75efe8856162609e5d82e49d7947fba5a3b39344))


### Features

* **react-spreadsheet:** Click to select in row header, column header and grid with name of selected item updated in name box ([22344c8](https://github.com/TheCandidStartup/infinisheet/commit/22344c84ba37c1077906859815355c7f8df6d06e))
* **react-spreadsheet:** First cut at selection using mouse and keyboard ([e4da3b5](https://github.com/TheCandidStartup/infinisheet/commit/e4da3b50272c34715856a40c977e0f822dc711cc))
* **react-spreadsheet:** Focus cell is automatically scrolled into view on update ([b89d7e6](https://github.com/TheCandidStartup/infinisheet/commit/b89d7e66cebe9cd76fa7e0d396e335f78f5b5376))
* **react-virtual-scroll:** Added VirtualContainer component that provides a generic customizable div ([aefccfd](https://github.com/TheCandidStartup/infinisheet/commit/aefccfd927681d2f0198da967620fb1aa7a76aad))
* **react-virtual-scroll:** Improvements to DisplayList ([17e07cf](https://github.com/TheCandidStartup/infinisheet/commit/17e07cf5fb212a59607f98754e4e4b2f202810e3))


### Performance Improvements

* **react-spreadsheet:** Using DisplayList instead of VirtualList for headers ([7f5a512](https://github.com/TheCandidStartup/infinisheet/commit/7f5a512e8d8b17ba1b168b8d5fcf2e301e682a6b))
* **react-virtual-scroll:** Removed overscan items from DIsplayList and DisplayGrid ([4acb018](https://github.com/TheCandidStartup/infinisheet/commit/4acb0189ebcf6abcbd28017a732cd3d50d42832a))





# [0.5.0](https://github.com/TheCandidStartup/infinisheet/compare/v0.4.0...v0.5.0) (2024-10-08)


### Bug Fixes

* **react-spreadsheet:** Pass maxCssSize and minNumPages props through to internal VirtualList and VirtualGrid ([a689078](https://github.com/TheCandidStartup/infinisheet/commit/a6890788396201253f4d81b891fb91fcc0bcc422))
* **virtual-spreadsheet:** Headers and grid stay aligned when scrolled right to the end ([20fb6dc](https://github.com/TheCandidStartup/infinisheet/commit/20fb6dc33bbf232a430b715308ecf42216220dcd))


### Features

* **react-spreadsheet:** Added infinite scrolling to extend size of grid when you scroll to end ([abbdabd](https://github.com/TheCandidStartup/infinisheet/commit/abbdabd55d8fb2a8fc74173382d02010d6fb805b))
* **react-spreadsheet:** Added modifier styles for selected row and selected column with default style based on  Google Sheets ([5c0ed15](https://github.com/TheCandidStartup/infinisheet/commit/5c0ed15380d9ae915fe605196d703758678afa8e))
* **react-spreadsheet:** Auto-size grid when jumping to row, col or cell outside current grid extents ([061095b](https://github.com/TheCandidStartup/infinisheet/commit/061095b1216527faa7fb3b455e11fb2f35d3a01d))
* **react-spreadsheet:** Cell selected highlights in header when row or column selected ([ba520b1](https://github.com/TheCandidStartup/infinisheet/commit/ba520b1eaad17bea4aedebbce4bb3b654dbfd1ed))
* **react-spreadsheet:** Decided to use Google Sheets compatible data formatting ([5d5b055](https://github.com/TheCandidStartup/infinisheet/commit/5d5b05525bd2c09121a3f0322ee62c883871094e))
* **react-spreadsheet:** First cut at SpreadsheetData interface ([5ded2a8](https://github.com/TheCandidStartup/infinisheet/commit/5ded2a8e792853bc85400285ef842c8e11b103fb))
* **react-spreadsheet:** Highlight Row and Column in header when Cell is selected ([d26ff86](https://github.com/TheCandidStartup/infinisheet/commit/d26ff86a2edaee9421aae2793f4960d88260c9ae))
* **react-spreadsheet:** Selected cell now given focus with highlighting via a CSS modifier class ([b0eb093](https://github.com/TheCandidStartup/infinisheet/commit/b0eb09375ecaff2593c76569d577ba96ac26d3d7))
* **react-spreadsheet:** SpreadsheetData  and VirtualSpreadsheet now generic on Snapshot type ([4abd7a0](https://github.com/TheCandidStartup/infinisheet/commit/4abd7a0ac3c8c682be9cb12f4f099161f9dcc8f2))
* **react-spreadsheet:** SpreadsheetData interface now supports Excel data model ([d4dcca8](https://github.com/TheCandidStartup/infinisheet/commit/d4dcca840a680284f8827a02bf38f2a746751b4f))
* **react-spreadsheet:** Switched to classic spreadsheet column and cell identifiers ("A", "A1") ([5e8d821](https://github.com/TheCandidStartup/infinisheet/commit/5e8d82179fe4162cd722b9607a30d04dd7220807))
* **react-spreadsheet:** Use full BEM style class names in theme ([925a7c1](https://github.com/TheCandidStartup/infinisheet/commit/925a7c1d4a3691d405a3427889d3ab2714630ca2))
* **react-virtual-scroll:** Customization of inner and outer divs in VirtualList and VirtualGrid is now provided using render props ([8569034](https://github.com/TheCandidStartup/infinisheet/commit/8569034f0088c9e5c67bd0313777101e4dec1cf0))
* **virtual-spreadsheet:** Added proper grid lines by cunning use of CSS borders and box-sizing ([17a23fc](https://github.com/TheCandidStartup/infinisheet/commit/17a23fc564a42b02827685d847d4f695de5ddc2d))


### Performance Improvements

* **virtual-spreadsheet:** Memoize data.subscribe.bind so that React doesn't unsubscribe and resubscribe every render ([a8fa44c](https://github.com/TheCandidStartup/infinisheet/commit/a8fa44c63aac38107368de14fa4c311a276bb8a1))


### BREAKING CHANGES

* **react-virtual-scroll:** Consumers need to change their custom outer/inner components to render functions and use outerRender/innerRender props instead of outerComponent/innerComponent
Note that only the function declaration needs to change when converting from component to render function.
