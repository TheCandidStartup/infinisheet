# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.6.2](https://github.com/TheCandidStartup/infinisheet/compare/v0.6.1...v0.6.2) (2024-11-26)


### Bug Fixes

* **react-spreadsheet:** Moving around grid with arrow keys now reliably extends grid when you reach the end ([01dd87c](https://github.com/TheCandidStartup/infinisheet/commit/01dd87c8e7cc9dba2b5b2eb63223109452ac1d03))
* **react-virtual-scroll:** Scroll position was jumping forwards and backwards when scrolling across a virtual page boundary ([a7379b4](https://github.com/TheCandidStartup/infinisheet/commit/a7379b407ece077c3d6c2b00adcfec371ba37799))


### Features

* **react-virtual-scroll:** Added useOffsets prop to VirtualScroll ([3ffa9fe](https://github.com/TheCandidStartup/infinisheet/commit/3ffa9fe932354f929feccd739cae243bd6317305))
* **react-virtual-scroll:** Provided access to current scroll position on scroll proxys ([3864862](https://github.com/TheCandidStartup/infinisheet/commit/386486253af0a4e353f25a7da4b1ea010b18e683))





## [0.6.1](https://github.com/TheCandidStartup/infinisheet/compare/v0.6.0...v0.6.1) (2024-11-13)


### Features

* **react-virtual-scroll:** Added verticalOffset and horizontalOffset to props passed to VirtualScroll children. ([20895a3](https://github.com/TheCandidStartup/infinisheet/commit/20895a32cf65550ea0bb0192989fb12e67159fd5))





# [0.6.0](https://github.com/TheCandidStartup/infinisheet/compare/v0.5.0...v0.6.0) (2024-11-11)


### Bug Fixes

* **react-spreadsheet:** Make sure focus sink correctly positioned and rendered ([b740c53](https://github.com/TheCandidStartup/infinisheet/commit/b740c534998b4ecc05712214e4977b2e73e0d50a))
* **react-spreadsheet:** Off by one error when sizing grid to include focus cell ([75efe88](https://github.com/TheCandidStartup/infinisheet/commit/75efe8856162609e5d82e49d7947fba5a3b39344))
* **react-virtual-scroll:** AutoSizer now responds to resizes that don't trigger a render ([75a7bb1](https://github.com/TheCandidStartup/infinisheet/commit/75a7bb19f190f09cc4bae341c4c57c00d93b5cf1))
* **virtual-scroll-samples:** Added entry point for auto-sizer sample ([03fcd09](https://github.com/TheCandidStartup/infinisheet/commit/03fcd0953c3e99ca00d888dde8f40c9e73791a60))
* **virtual-scroll-samples:** Fixed padding sample to work with new structure ([4e69ff5](https://github.com/TheCandidStartup/infinisheet/commit/4e69ff52ca45ca679fc4b2618628a71bec67b4fa))
* **virtual-scroll-samples:** More appropriate size for VirtualScroll sample ([76842fa](https://github.com/TheCandidStartup/infinisheet/commit/76842fa1bcb98f5fa8e3b95a19a57e25c7aaea03))


### Features

* **react-spreadsheet:** Click to select in row header, column header and grid with name of selected item updated in name box ([22344c8](https://github.com/TheCandidStartup/infinisheet/commit/22344c84ba37c1077906859815355c7f8df6d06e))
* **react-spreadsheet:** First cut at selection using mouse and keyboard ([e4da3b5](https://github.com/TheCandidStartup/infinisheet/commit/e4da3b50272c34715856a40c977e0f822dc711cc))
* **react-spreadsheet:** Focus cell is automatically scrolled into view on update ([b89d7e6](https://github.com/TheCandidStartup/infinisheet/commit/b89d7e66cebe9cd76fa7e0d396e335f78f5b5376))
* **react-virtual-scroll:** Added AutoSizer component ([1dd2023](https://github.com/TheCandidStartup/infinisheet/commit/1dd2023b3ee699f56f28912b1acc72765aa17473))
* **react-virtual-scroll:** Added DisplayGrid component ([7c422b1](https://github.com/TheCandidStartup/infinisheet/commit/7c422b1c15c900d0c513e198d19b05ff0162ddd3))
* **react-virtual-scroll:** Added DisplayList component that displays a window onto the contents of a virtualized list ([20e13a6](https://github.com/TheCandidStartup/infinisheet/commit/20e13a6c0fd546cb82b16c85cff5ce0f2af80241))
* **react-virtual-scroll:** Added isScrolling convenience prop to DisplayList ([3e026b2](https://github.com/TheCandidStartup/infinisheet/commit/3e026b2329bfb46a69d0d0d6c9b92271f12b7415))
* **react-virtual-scroll:** Added optional argument to ScrollToItem methods that controls how scroll is performed ([226e6e7](https://github.com/TheCandidStartup/infinisheet/commit/226e6e76374d10fa0ccb0346929e3254a94a6a7e))
* **react-virtual-scroll:** Added ScrollToArea to VirtualScroll proxy ([8c84fc2](https://github.com/TheCandidStartup/infinisheet/commit/8c84fc29aed74c4ac768f6f6e378636dbda6fa59))
* **react-virtual-scroll:** Added VirtualContainer component that provides a generic customizable div ([aefccfd](https://github.com/TheCandidStartup/infinisheet/commit/aefccfd927681d2f0198da967620fb1aa7a76aad))
* **react-virtual-scroll:** Added virtualGridScrollToItem and virtualListScrollToItem functions ([a3ecc81](https://github.com/TheCandidStartup/infinisheet/commit/a3ecc8107171707140d9a4dcbe0f60aa5b3e1b06))
* **react-virtual-scroll:** Added VirtualScroll component ([2c9f9a2](https://github.com/TheCandidStartup/infinisheet/commit/2c9f9a28fd3dbdc975066f9d196b9834bdd6e5ea))
* **react-virtual-scroll:** Content render prop now passed to VirtualScroll as a child rather than explicit contentRender prop ([ca838a4](https://github.com/TheCandidStartup/infinisheet/commit/ca838a4887834e031376f5f18447cb514212e0d4))
* **react-virtual-scroll:** Exposed getOffsetToScrollRange and getRangeToScroll ([2259816](https://github.com/TheCandidStartup/infinisheet/commit/22598166d9a5417c6e9b39c50ac5cfbd1b80be73))
* **react-virtual-scroll:** Improvements to DisplayList ([17e07cf](https://github.com/TheCandidStartup/infinisheet/commit/17e07cf5fb212a59607f98754e4e4b2f202810e3))
* **react-virtual-scroll:** Reimplemented Virtual list using VirtualScroll + AutoSizer + DisplayList ([a3a5ba5](https://github.com/TheCandidStartup/infinisheet/commit/a3a5ba5264727e14bf7e48f974a24cd8fc145e70))
* **react-virtual-scroll:** Reimplemented VirtualGrid as VirtualScroll + AutoSizer + DisplayGrid ([a3a670e](https://github.com/TheCandidStartup/infinisheet/commit/a3a670e56ac9741141e13acb1633b94454299643))
* **virtual-scroll-samples:** Added DisplayList sample ([fa8fb53](https://github.com/TheCandidStartup/infinisheet/commit/fa8fb535d5e66f5d25a2188063d4e0f4ced0ff96))
* **virtual-scroll-samples:** Removed DisplayList and AutoSizer from virtual-scroll sample so that it just focuses on VirtualScroll ([923feb4](https://github.com/TheCandidStartup/infinisheet/commit/923feb42e7dfc1868f3d6ca80390bd53c2feeec6))


### Performance Improvements

* **react-spreadsheet:** Using DisplayList instead of VirtualList for headers ([7f5a512](https://github.com/TheCandidStartup/infinisheet/commit/7f5a512e8d8b17ba1b168b8d5fcf2e301e682a6b))
* **react-virtual-scroll:** Removed overscan items from DIsplayList and DisplayGrid ([4acb018](https://github.com/TheCandidStartup/infinisheet/commit/4acb0189ebcf6abcbd28017a732cd3d50d42832a))


### BREAKING CHANGES

* **react-virtual-scroll:** Internal layout has radically changed, customization dependent on old structure may need to be reworked
* **react-virtual-scroll:** VirtualGridItem type removed, replace with DIsplayGridItem
* **react-virtual-scroll:** Internal layout has radically changed, customization dependent on old structure will need to be reworked
* **react-virtual-scroll:** VirtualListItem type removed, replace with DIsplayListItem





# [0.5.0](https://github.com/TheCandidStartup/infinisheet/compare/v0.4.0...v0.5.0) (2024-10-08)


### Bug Fixes

* **react-spreadsheet:** Pass maxCssSize and minNumPages props through to internal VirtualList and VirtualGrid ([a689078](https://github.com/TheCandidStartup/infinisheet/commit/a6890788396201253f4d81b891fb91fcc0bcc422))
* **react-virtual-scroll:** Fix errors found by API extractor ([d3007e6](https://github.com/TheCandidStartup/infinisheet/commit/d3007e61add6e18753ba056e44d772e08af4b7d9))
* **spreadsheet-sample:** Data returned is now snapshot dependent ([64d4b12](https://github.com/TheCandidStartup/infinisheet/commit/64d4b12c5f270473413002ee7bac647ce977d895))
* **virtual-scroll-samples:** Use useRef instead of createRef for modern React ([bb6c8db](https://github.com/TheCandidStartup/infinisheet/commit/bb6c8db00c5203909b1bbeab0dba06bb3e33784c))
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
* **react-virtual-scroll:**  Made row and column optional arguments in VirtualGrid scrollTo and scrollToItem ([a6c2815](https://github.com/TheCandidStartup/infinisheet/commit/a6c2815f6ffa7449979e2c977963d1e7dc95a603))
* **react-virtual-scroll:** Added clientWidth and clientHeight properties to VirtualGridProxy ([22bc29f](https://github.com/TheCandidStartup/infinisheet/commit/22bc29fa4354b490bd683cf3d63d37da15121051))
* **react-virtual-scroll:** Customization of inner and outer divs in VirtualList and VirtualGrid is now provided using render props ([8569034](https://github.com/TheCandidStartup/infinisheet/commit/8569034f0088c9e5c67bd0313777101e4dec1cf0))
* **spreadsheet-sample:** Added data source that recreates the world's most boring spreadsheet ([3522a92](https://github.com/TheCandidStartup/infinisheet/commit/3522a92d03733b10cf7454e9f0e835cc6ddfec10))
* **spreadsheet-sample:** Added some app styling so it works better when iframed into blog posts ([d2df43c](https://github.com/TheCandidStartup/infinisheet/commit/d2df43c75b03668fafd5a98d47b4cfecb4266043))
* **spreadsheet-sample:** BoringData now based on current date/time for live simulation of incoming sales ([f777950](https://github.com/TheCandidStartup/infinisheet/commit/f777950dacc651eabad65646451b76da464f39c8))
* **spreadsheet-sample:** Highlight element with focus in green to aid debugging ([b407661](https://github.com/TheCandidStartup/infinisheet/commit/b4076619a3b204d8d27fae4c0a3205af08025429))
* **virtual-spreadsheet:** Added proper grid lines by cunning use of CSS borders and box-sizing ([17a23fc](https://github.com/TheCandidStartup/infinisheet/commit/17a23fc564a42b02827685d847d4f695de5ddc2d))


### Performance Improvements

* **virtual-spreadsheet:** Memoize data.subscribe.bind so that React doesn't unsubscribe and resubscribe every render ([a8fa44c](https://github.com/TheCandidStartup/infinisheet/commit/a8fa44c63aac38107368de14fa4c311a276bb8a1))


### BREAKING CHANGES

* **react-virtual-scroll:** Consumers need to change their custom outer/inner components to render functions and use outerRender/innerRender props instead of outerComponent/innerComponent
Note that only the function declaration needs to change when converting from component to render function.





# [0.4.0](https://github.com/TheCandidStartup/infinisheet/compare/v0.3.1...v0.4.0) (2024-06-24)


### Bug Fixes

* Typed style as React.CSSProperties rather than  Object or any ([89dddda](https://github.com/TheCandidStartup/infinisheet/commit/89dddda55d47b267165d5465fdafd405dcb08112))


### Features

* Added className prop to VirtualList and VirtualGrid ([14c5965](https://github.com/TheCandidStartup/infinisheet/commit/14c5965ea10acf88c8288f2809d90f47d68a8012))
* Added className, innerClassName, outerComponent, innerComponent customization props to list and grid ([8ae1169](https://github.com/TheCandidStartup/infinisheet/commit/8ae1169a47a55005e4534c7aac7907bfc6115851))
* **virtual-scroll-samples:** Spreadsheet sample now looks vaguely like a spreadsheet ([bb86c5c](https://github.com/TheCandidStartup/infinisheet/commit/bb86c5c41051725d1c6858defaebff71eae0aa27))





# [0.3.0](https://github.com/TheCandidStartup/infinisheet/compare/v0.2.0...v0.3.0) (2024-06-04)


### Bug Fixes

* **react-virtual-scroll:** Added OnScroll unit test for VirtualList and fixed bug caused by missing dependencies in imperative handle declaration. ([08b4b1a](https://github.com/TheCandidStartup/infinisheet/commit/08b4b1a48301214f1c8978721042745f7d09434c))


### Features

* **react-virtual-scroll:** Added onScroll support to VirtualGrid ([6287d28](https://github.com/TheCandidStartup/infinisheet/commit/6287d28281bcdfa9c04891c15602c505bf59a69a))
* **react-virtual-scroll:** Exposed optional maxCssSize and minNumPages props ([70d3112](https://github.com/TheCandidStartup/infinisheet/commit/70d3112f179ae8362816a86306e5c2acd7459f3d))
* **virtual-scroll-samples:** Added Paging Functional Test sample ([c4f2fb4](https://github.com/TheCandidStartup/infinisheet/commit/c4f2fb4a14dc710c7a36cd37e7dbbf1c06a43db6))
* **virtual-scroll-samples:** List and Grid ScrollToItem updates both components ([7149a8e](https://github.com/TheCandidStartup/infinisheet/commit/7149a8e1ab95e608faa5a1ec8b9b96c44e1934e1))





# [0.2.0](https://github.com/TheCandidStartup/infinisheet/compare/v0.1.2...v0.2.0) (2024-05-15)


### Bug Fixes

* **react-virtual-scroll:** Broken link in README.md ([f020a0c](https://github.com/TheCandidStartup/infinisheet/commit/f020a0cdd1d262270e40c42910c356670b9165d4))


### Features

* **react-virtual-scroll:** VirtualList now supports choice of vertical(default) or horizontal layout ([042b97d](https://github.com/TheCandidStartup/infinisheet/commit/042b97dbefdbd35d902e3b2d45b500cc4c8b8a99))
* **virtual-scroll-samples:** Restructured as a multi-page app with each sample as a separate page ([b6f140f](https://github.com/TheCandidStartup/infinisheet/commit/b6f140fcc32aa2c3cafab4af3a98aadca1bd8718))





## [0.1.2](https://github.com/TheCandidStartup/infinisheet/compare/v0.1.1...v0.1.2) (2024-05-07)


### Bug Fixes

* **react-virtual-scroll:** Adding explicit types metadata to try and get npm to show the TS badge for types included ([6de0f80](https://github.com/TheCandidStartup/infinisheet/commit/6de0f80b26ee6ed7f3b9b4fc43184c4e931dcc71))





## [0.1.1](https://github.com/TheCandidStartup/infinisheet/compare/v0.1.0...v0.1.1) (2024-05-07)


### Bug Fixes

* **react-virtual-scroll:** Added package.json metadata needed for npm publish ([9de13ca](https://github.com/TheCandidStartup/infinisheet/commit/9de13caccaff2a9399bfbbddc509808f297777ee))





# [0.1.0](https://github.com/TheCandidStartup/infinisheet/compare/v0.0.1...v0.1.0) (2024-05-02)


### Features

* **react-virtual-scroll:** Export a complete set of VirtualGrid and VirtualList related types ([23388d9](https://github.com/TheCandidStartup/infinisheet/commit/23388d926c32cdcdbe83d75fd91a5f446c1a5e6e))





## 0.0.1 (2024-05-02)

**Note:** Version bump only for package root
