# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.7.1](https://github.com/TheCandidStartup/infinisheet/compare/v0.7.0...v0.7.1) (2025-02-25)

**Note:** Version bump only for package @candidstartup/virtual-scroll-samples





# [0.7.0](https://github.com/TheCandidStartup/infinisheet/compare/v0.6.2...v0.7.0) (2025-02-25)

**Note:** Version bump only for package @candidstartup/virtual-scroll-samples





## [0.6.2](https://github.com/TheCandidStartup/infinisheet/compare/v0.6.1...v0.6.2) (2024-11-26)

**Note:** Version bump only for package virtual-scroll-samples





## [0.6.1](https://github.com/TheCandidStartup/infinisheet/compare/v0.6.0...v0.6.1) (2024-11-13)


### Features

* **react-virtual-scroll:** Added verticalOffset and horizontalOffset to props passed to VirtualScroll children. ([20895a3](https://github.com/TheCandidStartup/infinisheet/commit/20895a32cf65550ea0bb0192989fb12e67159fd5))





# [0.6.0](https://github.com/TheCandidStartup/infinisheet/compare/v0.5.0...v0.6.0) (2024-11-11)


### Bug Fixes

* **react-virtual-scroll:** AutoSizer now responds to resizes that don't trigger a render ([75a7bb1](https://github.com/TheCandidStartup/infinisheet/commit/75a7bb19f190f09cc4bae341c4c57c00d93b5cf1))
* **virtual-scroll-samples:** Added entry point for auto-sizer sample ([03fcd09](https://github.com/TheCandidStartup/infinisheet/commit/03fcd0953c3e99ca00d888dde8f40c9e73791a60))
* **virtual-scroll-samples:** Fixed padding sample to work with new structure ([4e69ff5](https://github.com/TheCandidStartup/infinisheet/commit/4e69ff52ca45ca679fc4b2618628a71bec67b4fa))
* **virtual-scroll-samples:** More appropriate size for VirtualScroll sample ([76842fa](https://github.com/TheCandidStartup/infinisheet/commit/76842fa1bcb98f5fa8e3b95a19a57e25c7aaea03))


### Features

* **react-virtual-scroll:** Added AutoSizer component ([1dd2023](https://github.com/TheCandidStartup/infinisheet/commit/1dd2023b3ee699f56f28912b1acc72765aa17473))
* **react-virtual-scroll:** Added DisplayGrid component ([7c422b1](https://github.com/TheCandidStartup/infinisheet/commit/7c422b1c15c900d0c513e198d19b05ff0162ddd3))
* **react-virtual-scroll:** Added DisplayList component that displays a window onto the contents of a virtualized list ([20e13a6](https://github.com/TheCandidStartup/infinisheet/commit/20e13a6c0fd546cb82b16c85cff5ce0f2af80241))
* **react-virtual-scroll:** Added VirtualContainer component that provides a generic customizable div ([aefccfd](https://github.com/TheCandidStartup/infinisheet/commit/aefccfd927681d2f0198da967620fb1aa7a76aad))
* **react-virtual-scroll:** Added VirtualScroll component ([2c9f9a2](https://github.com/TheCandidStartup/infinisheet/commit/2c9f9a28fd3dbdc975066f9d196b9834bdd6e5ea))
* **react-virtual-scroll:** Content render prop now passed to VirtualScroll as a child rather than explicit contentRender prop ([ca838a4](https://github.com/TheCandidStartup/infinisheet/commit/ca838a4887834e031376f5f18447cb514212e0d4))
* **react-virtual-scroll:** Reimplemented Virtual list using VirtualScroll + AutoSizer + DisplayList ([a3a5ba5](https://github.com/TheCandidStartup/infinisheet/commit/a3a5ba5264727e14bf7e48f974a24cd8fc145e70))
* **virtual-scroll-samples:** Added DisplayList sample ([fa8fb53](https://github.com/TheCandidStartup/infinisheet/commit/fa8fb535d5e66f5d25a2188063d4e0f4ced0ff96))
* **virtual-scroll-samples:** Removed DisplayList and AutoSizer from virtual-scroll sample so that it just focuses on VirtualScroll ([923feb4](https://github.com/TheCandidStartup/infinisheet/commit/923feb42e7dfc1868f3d6ca80390bd53c2feeec6))


### BREAKING CHANGES

* **react-virtual-scroll:** Internal layout has radically changed, customization dependent on old structure will need to be reworked
* **react-virtual-scroll:** VirtualListItem type removed, replace with DIsplayListItem





# [0.5.0](https://github.com/TheCandidStartup/infinisheet/compare/v0.4.0...v0.5.0) (2024-10-08)


### Bug Fixes

* **virtual-scroll-samples:** Use useRef instead of createRef for modern React ([bb6c8db](https://github.com/TheCandidStartup/infinisheet/commit/bb6c8db00c5203909b1bbeab0dba06bb3e33784c))


### Features

* **react-virtual-scroll:** Customization of inner and outer divs in VirtualList and VirtualGrid is now provided using render props ([8569034](https://github.com/TheCandidStartup/infinisheet/commit/8569034f0088c9e5c67bd0313777101e4dec1cf0))


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


### Features

* **virtual-scroll-samples:** Added Paging Functional Test sample ([c4f2fb4](https://github.com/TheCandidStartup/infinisheet/commit/c4f2fb4a14dc710c7a36cd37e7dbbf1c06a43db6))
* **virtual-scroll-samples:** List and Grid ScrollToItem updates both components ([7149a8e](https://github.com/TheCandidStartup/infinisheet/commit/7149a8e1ab95e608faa5a1ec8b9b96c44e1934e1))





# [0.2.0](https://github.com/TheCandidStartup/infinisheet/compare/v0.1.2...v0.2.0) (2024-05-15)


### Features

* **react-virtual-scroll:** VirtualList now supports choice of vertical(default) or horizontal layout ([042b97d](https://github.com/TheCandidStartup/infinisheet/commit/042b97dbefdbd35d902e3b2d45b500cc4c8b8a99))
* **virtual-scroll-samples:** Restructured as a multi-page app with each sample as a separate page ([b6f140f](https://github.com/TheCandidStartup/infinisheet/commit/b6f140fcc32aa2c3cafab4af3a98aadca1bd8718))





## [0.1.2](https://github.com/TheCandidStartup/infinisheet/compare/v0.1.1...v0.1.2) (2024-05-07)

**Note:** Version bump only for package virtual-scroll-samples





## [0.1.1](https://github.com/TheCandidStartup/infinisheet/compare/v0.1.0...v0.1.1) (2024-05-07)

**Note:** Version bump only for package virtual-scroll-samples





# [0.1.0](https://github.com/TheCandidStartup/infinisheet/compare/v0.0.1...v0.1.0) (2024-05-02)

**Note:** Version bump only for package virtual-scroll-samples





## 0.0.1 (2024-05-02)

**Note:** Version bump only for package virtual-scroll-samples
