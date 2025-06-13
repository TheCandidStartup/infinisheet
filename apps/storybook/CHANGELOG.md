# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.12.0](https://github.com/TheCandidStartup/infinisheet/compare/v0.11.0...v0.12.0) (2025-06-13)


### Features

* **storybook:** Added latency controls for EventSourceSync story ([8c7a81a](https://github.com/TheCandidStartup/infinisheet/commit/8c7a81aef5d9b9312fd6af5d82eb02ee1c9e3775))
* **storybook:** Added latency to EventSourceSync story ([1c32bbb](https://github.com/TheCandidStartup/infinisheet/commit/1c32bbbeee8fe56427c3dff36afc65eb2bf6a5cf))
* **storybook:** Added on screen description of latency setttings to EventSourceSync story ([dd9b208](https://github.com/TheCandidStartup/infinisheet/commit/dd9b208dbe3eaec86fadc169031f38671a239eb2))





# [0.11.0](https://github.com/TheCandidStartup/infinisheet/compare/v0.10.0...v0.11.0) (2025-05-28)


### Features

* **storybook:** Added EventSourceSync story ([599cb29](https://github.com/TheCandidStartup/infinisheet/commit/599cb29296884e9cb501ce0dcd2a142f3a950830))





# [0.10.0](https://github.com/TheCandidStartup/infinisheet/compare/v0.9.0...v0.10.0) (2025-04-17)


### Features

* **storybook:** Added Data Error story ([aa0859b](https://github.com/TheCandidStartup/infinisheet/commit/aa0859b6e9b3724da156c942265889c18b80bc11))





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


### Features

* **react-spreadsheet:** VirtualSpreadsheet no longer needs a type parameter ([f53882c](https://github.com/TheCandidStartup/infinisheet/commit/f53882cd3c0f56737a8e6b10fed998d2979db5fb))
* **storybook:** All data sources are now editable ([27982aa](https://github.com/TheCandidStartup/infinisheet/commit/27982aaa1c9b3bf35ec04f0ad928fa8ee394f67b))


### BREAKING CHANGES

* **react-spreadsheet:** Code that used VirtualSpreadsheet or VirtualSpreadsheetProps with a type parameter needs to either remove the parameter or switch to the generic version.





## [0.7.1](https://github.com/TheCandidStartup/infinisheet/compare/v0.7.0...v0.7.1) (2025-02-25)

**Note:** Version bump only for package @candidstartup/storybook





# [0.7.0](https://github.com/TheCandidStartup/infinisheet/compare/v0.6.2...v0.7.0) (2025-02-25)


### Features

* **react-spreadsheet:** Added readOnly prop to VirtualSpreadsheet ([e731c93](https://github.com/TheCandidStartup/infinisheet/commit/e731c9332c9eab94b54a44384aa8701c218e609b))
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
