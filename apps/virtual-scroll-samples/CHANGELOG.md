# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
