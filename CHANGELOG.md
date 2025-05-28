# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.11.0](https://github.com/TheCandidStartup/infinisheet/compare/v0.10.0...v0.11.0) (2025-05-28)


### Features

* **event-sourced-spreadsheet-data:** First attempt at implementing EventSourcedSpreadsheetData ([53e0756](https://github.com/TheCandidStartup/infinisheet/commit/53e07561bf8c07ee42a0606a7916cb611c9c8283))
* **infinisheet:** Added InfinisheetError base interface ([ce28da5](https://github.com/TheCandidStartup/infinisheet/commit/ce28da53a9c3ed61ecaa995168c173f783090e71))
* **infinisheet:** Added setMetadata method to EventLog interface ([800586e](https://github.com/TheCandidStartup/infinisheet/commit/800586e05760a5f82db40d76991bd180ede70d55))
* **infinisheet:** Initial work on EventLog type and SimpleEventLog reference implementation ([2e1aa3e](https://github.com/TheCandidStartup/infinisheet/commit/2e1aa3e23e7df45bf7272603a0909074a0029bd9))
* **infinisheet:** Made EventLog API asynchronous with ResultAsync ([b2fcbbf](https://github.com/TheCandidStartup/infinisheet/commit/b2fcbbf5406fbbe9281cd19956fe4eadb1f27fc4))
* **infinisheet:** Made EventLog generic on LogEntry type ([e40ee1f](https://github.com/TheCandidStartup/infinisheet/commit/e40ee1f1c6646ff3f99071b732ebc96d9ff21489))
* **storybook:** Added EventSourceSync story ([599cb29](https://github.com/TheCandidStartup/infinisheet/commit/599cb29296884e9cb501ce0dcd2a142f3a950830))





# [0.10.0](https://github.com/TheCandidStartup/infinisheet/compare/v0.9.0...v0.10.0) (2025-04-17)


### Features

* **infinisheet:** Added neverthrow Result type for clean error handling ([baf5390](https://github.com/TheCandidStartup/infinisheet/commit/baf539097e6ad38f94bf89b0f580e0a67ab5a023))
* **react-spreadsheet:** Added error handling when SpreadsheetData setCellValueAndFormat method fails ([2e33d05](https://github.com/TheCandidStartup/infinisheet/commit/2e33d05044e95cf4c9b9dbc28f119d797e3b5de8))
* **storybook:** Added Data Error story ([aa0859b](https://github.com/TheCandidStartup/infinisheet/commit/aa0859b6e9b3724da156c942265889c18b80bc11))


### BREAKING CHANGES

* **infinisheet:** Return type of SpreadsheetData.setCellValueAndFormat changed from `boolean` to `Result<void,SpreadsheetDataError>`





# [0.9.0](https://github.com/TheCandidStartup/infinisheet/compare/v0.8.0...v0.9.0) (2025-03-20)


### Bug Fixes

* **storybook:** Control displays correctly for optional args ([a6d53e5](https://github.com/TheCandidStartup/infinisheet/commit/a6d53e5a39dcb34cc05916d9c6818d18b2848264))


### Features

* **infinisheet:** API now compatible with  TypeScript `exactOptionalPropertyTypes` and `noUncheckedIndexedAccess` options ([4159992](https://github.com/TheCandidStartup/infinisheet/commit/4159992699e50fd85aef9ce86d9910ed084bd573))
* **infinisheet:** React 19  compatibility ([fdee127](https://github.com/TheCandidStartup/infinisheet/commit/fdee127d86f5d0513f7beac48e4e9f8ff9ac7b64))


### BREAKING CHANGES

* **infinisheet:** API signatures changed to add explicit `| undefined` to optional props
* **infinisheet:** Types exposed in react-virtual-scroll API have changed. In most cases you won't notice but possible something might break.





# [0.8.0](https://github.com/TheCandidStartup/infinisheet/compare/v0.7.1...v0.8.0) (2025-03-06)


### Build System

* **infinisheet:** Target es2022 ([14555d9](https://github.com/TheCandidStartup/infinisheet/commit/14555d99f7f975aa976af86a28ffd2616349be1c))


### Features

* **react-spreadsheet:** VirtualSpreadsheet no longer needs a type parameter ([f53882c](https://github.com/TheCandidStartup/infinisheet/commit/f53882cd3c0f56737a8e6b10fed998d2979db5fb))
* **simple-spreadsheet-data:** Added LayeredSpreadsheetData class ([eba3276](https://github.com/TheCandidStartup/infinisheet/commit/eba32765e7d7df95590278f62c434be80e22bc4a))
* **storybook:** All data sources are now editable ([27982aa](https://github.com/TheCandidStartup/infinisheet/commit/27982aaa1c9b3bf35ec04f0ad928fa8ee394f67b))


### BREAKING CHANGES

* **react-spreadsheet:** Code that used VirtualSpreadsheet or VirtualSpreadsheetProps with a type parameter needs to either remove the parameter or switch to the generic version.
* **infinisheet:** Requires native support for JavaScript private fields





## [0.7.1](https://github.com/TheCandidStartup/infinisheet/compare/v0.7.0...v0.7.1) (2025-02-25)

**Note:** Version bump only for package root





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
* **storybook:** Added "Interactive" args to VirtualList ([a51e0ca](https://github.com/TheCandidStartup/infinisheet/commit/a51e0ca1a7ca103db942f39618d8b8e56d1726de))
* **storybook:** Added AutoSizer story ([1e407bd](https://github.com/TheCandidStartup/infinisheet/commit/1e407bd29c00eef99b383d49d2cf09d5c18420a9))
* **storybook:** Added Candid Startup theming and favicon ([9fdb1da](https://github.com/TheCandidStartup/infinisheet/commit/9fdb1da5bcc5e5a0717a10854979ab6586bea48a))
* **storybook:** Added DisplayGrid and DisplayList stories ([da5c1eb](https://github.com/TheCandidStartup/infinisheet/commit/da5c1eba7418d64a4cd88da736b92aeccbebc9b2))
* **storybook:** Added docs landing pages for InfiniSheet, react-spreadsheet and react-virtual-scroll ([75d9b18](https://github.com/TheCandidStartup/infinisheet/commit/75d9b189e1f6aa920176f041176286c0666c7d7f))
* **storybook:** Added full width and full screen VirtualSpreadsheet stories ([899a410](https://github.com/TheCandidStartup/infinisheet/commit/899a4105973b5f35499ee98ce06290a255fe51be))
* **storybook:** Added initial VirtualSpreadsheet stories ([382a934](https://github.com/TheCandidStartup/infinisheet/commit/382a934e2a3fdb2ea8ce8ef538abf7daff1a4f44))
* **storybook:** Added interactive controls to VirtualGrid ([d9a0ccf](https://github.com/TheCandidStartup/infinisheet/commit/d9a0ccfd6449eab58948338bf09439906a79e1b9))
* **storybook:** Added interactive ScrollTo controls to VirtualScroll ([15c27f1](https://github.com/TheCandidStartup/infinisheet/commit/15c27f1f5ac61ea54a01caa8acdb92fe9316ecdb))
* **storybook:** Added stories for useIsScrolling prop ([d859e17](https://github.com/TheCandidStartup/infinisheet/commit/d859e170e1029ec5646174ef8bd7f256b75b4e34))
* **storybook:** Added VirtualGrid stories ([60e9701](https://github.com/TheCandidStartup/infinisheet/commit/60e970194c98be7217199f9c1fb8a224987957a2))
* **storybook:** Added VirtualScroll stories ([faad3d6](https://github.com/TheCandidStartup/infinisheet/commit/faad3d65fc96b07ad12b38c964943e7a09187897))
* **storybook:** Added VirtualSpreadsheet interaction stories that use play function to reach different visual states ([9841da5](https://github.com/TheCandidStartup/infinisheet/commit/9841da54909a017413eabb3adfedafb5075b2b83))
* **storybook:** Cleaned up and completed VirtualList stories ([f925283](https://github.com/TheCandidStartup/infinisheet/commit/f925283c6a6382b41cc4940cad04ea510d9bc46e))
* **storybook:** Extracted default values from TSDoc comments ([48f182a](https://github.com/TheCandidStartup/infinisheet/commit/48f182ab0cea10047bdba53d1f26b3d719a5cf12))
* **storybook:** Improved autodocs type display for enums and unions ([b1973f4](https://github.com/TheCandidStartup/infinisheet/commit/b1973f4c97752b6daf00f8bb67d9cb5cec65c769))
* **storybook:** Remove Typedoc [@group](https://github.com/group) tags from component description ([99adf79](https://github.com/TheCandidStartup/infinisheet/commit/99adf799f4b45bfb82f6cb6d9835c83693510e4d))
* **storybook:** Replaced TSDoc link tags with link target using code markup ([eea549a](https://github.com/TheCandidStartup/infinisheet/commit/eea549a59450709e04d75bfc3cdc9dcc688f5ad5))
* **virtual-spreadsheet:** Cell content aligned depending on type ([65d9968](https://github.com/TheCandidStartup/infinisheet/commit/65d996800a4f85d76f56e950ccdacb8ce49558d7))


### BREAKING CHANGES

* **infinisheet:** Moved `ItemOffsetMapping` into new `infinisheet-types` package





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
