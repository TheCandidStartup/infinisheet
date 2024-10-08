# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
