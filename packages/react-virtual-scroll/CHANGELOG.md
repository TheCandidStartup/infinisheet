# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.6.0](https://github.com/TheCandidStartup/infinisheet/compare/v0.5.0...v0.6.0) (2024-11-11)


### Bug Fixes

* **react-virtual-scroll:** AutoSizer now responds to resizes that don't trigger a render ([75a7bb1](https://github.com/TheCandidStartup/infinisheet/commit/75a7bb19f190f09cc4bae341c4c57c00d93b5cf1))


### Features

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


### Performance Improvements

* **react-virtual-scroll:** Removed overscan items from DIsplayList and DisplayGrid ([4acb018](https://github.com/TheCandidStartup/infinisheet/commit/4acb0189ebcf6abcbd28017a732cd3d50d42832a))


### BREAKING CHANGES

* **react-virtual-scroll:** Internal layout has radically changed, customization dependent on old structure may need to be reworked
* **react-virtual-scroll:** VirtualGridItem type removed, replace with DIsplayGridItem
* **react-virtual-scroll:** Internal layout has radically changed, customization dependent on old structure will need to be reworked
* **react-virtual-scroll:** VirtualListItem type removed, replace with DIsplayListItem





# [0.5.0](https://github.com/TheCandidStartup/infinisheet/compare/v0.4.0...v0.5.0) (2024-10-08)


### Bug Fixes

* **react-virtual-scroll:** Fix errors found by API extractor ([d3007e6](https://github.com/TheCandidStartup/infinisheet/commit/d3007e61add6e18753ba056e44d772e08af4b7d9))
* **virtual-scroll-samples:** Use useRef instead of createRef for modern React ([bb6c8db](https://github.com/TheCandidStartup/infinisheet/commit/bb6c8db00c5203909b1bbeab0dba06bb3e33784c))


### Features

* **react-virtual-scroll:**  Made row and column optional arguments in VirtualGrid scrollTo and scrollToItem ([a6c2815](https://github.com/TheCandidStartup/infinisheet/commit/a6c2815f6ffa7449979e2c977963d1e7dc95a603))
* **react-virtual-scroll:** Added clientWidth and clientHeight properties to VirtualGridProxy ([22bc29f](https://github.com/TheCandidStartup/infinisheet/commit/22bc29fa4354b490bd683cf3d63d37da15121051))
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





# [0.3.0](https://github.com/TheCandidStartup/infinisheet/compare/v0.2.0...v0.3.0) (2024-06-04)


### Bug Fixes

* **react-virtual-scroll:** Added OnScroll unit test for VirtualList and fixed bug caused by missing dependencies in imperative handle declaration. ([08b4b1a](https://github.com/TheCandidStartup/infinisheet/commit/08b4b1a48301214f1c8978721042745f7d09434c))


### Features

* **react-virtual-scroll:** Added onScroll support to VirtualGrid ([6287d28](https://github.com/TheCandidStartup/infinisheet/commit/6287d28281bcdfa9c04891c15602c505bf59a69a))
* **react-virtual-scroll:** Exposed optional maxCssSize and minNumPages props ([70d3112](https://github.com/TheCandidStartup/infinisheet/commit/70d3112f179ae8362816a86306e5c2acd7459f3d))





# [0.2.0](https://github.com/TheCandidStartup/infinisheet/compare/v0.1.2...v0.2.0) (2024-05-15)


### Bug Fixes

* **react-virtual-scroll:** Broken link in README.md ([f020a0c](https://github.com/TheCandidStartup/infinisheet/commit/f020a0cdd1d262270e40c42910c356670b9165d4))


### Features

* **react-virtual-scroll:** VirtualList now supports choice of vertical(default) or horizontal layout ([042b97d](https://github.com/TheCandidStartup/infinisheet/commit/042b97dbefdbd35d902e3b2d45b500cc4c8b8a99))





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

**Note:** Version bump only for package @candidstartup/react-virtual-scroll
