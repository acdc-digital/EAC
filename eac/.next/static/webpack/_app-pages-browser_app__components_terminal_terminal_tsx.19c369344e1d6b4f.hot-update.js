/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("_app-pages-browser_app__components_terminal_terminal_tsx",{

/***/ "(app-pages-browser)/./app/_components/terminal/_components/agentsPanel.tsx":
/*!**************************************************************!*\
  !*** ./app/_components/terminal/_components/agentsPanel.tsx ***!
  \**************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



;
    // Wrapped in an IIFE to avoid polluting the global scope
    ;
    (function () {
        var _a, _b;
        // Legacy CSS implementations will `eval` browser code in a Node.js context
        // to extract CSS. For backwards compatibility, we need to check we're in a
        // browser context before continuing.
        if (typeof self !== 'undefined' &&
            // AMP / No-JS mode does not inject these helpers:
            '$RefreshHelpers$' in self) {
            // @ts-ignore __webpack_module__ is global
            var currentExports = module.exports;
            // @ts-ignore __webpack_module__ is global
            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;
            // This cannot happen in MainTemplate because the exports mismatch between
            // templating and execution.
            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);
            // A module can be accepted automatically based on its exports, e.g. when
            // it is a Refresh Boundary.
            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {
                // Save the previous exports signature on update so we can compare the boundary
                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)
                module.hot.dispose(function (data) {
                    data.prevSignature =
                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);
                });
                // Unconditionally accept an update to this module, we'll check if it's
                // still a Refresh Boundary later.
                // @ts-ignore importMeta is replaced in the loader
                module.hot.accept();
                // This field is set when the previous version of this module was a
                // Refresh Boundary, letting us know we need to check for invalidation or
                // enqueue an update.
                if (prevSignature !== null) {
                    // A boundary can become ineligible if its exports are incompatible
                    // with the previous exports.
                    //
                    // For example, if you add/remove/change exports, we'll want to
                    // re-execute the importing modules, and force those components to
                    // re-render. Similarly, if you convert a class component to a
                    // function, we want to invalidate the boundary.
                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {
                        module.hot.invalidate();
                    }
                    else {
                        self.$RefreshHelpers$.scheduleUpdate();
                    }
                }
            }
            else {
                // Since we just executed the code for the module, it's possible that the
                // new exports made it ineligible for being a boundary.
                // We only care about the case when we were _previously_ a boundary,
                // because we already accepted this update (accidental side effect).
                var isNoLongerABoundary = prevSignature !== null;
                if (isNoLongerABoundary) {
                    module.hot.invalidate();
                }
            }
        }
    })();


/***/ }),

/***/ "(app-pages-browser)/./app/_components/terminal/_components/index.ts":
/*!*******************************************************!*\
  !*** ./app/_components/terminal/_components/index.ts ***!
  \*******************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   AgentsPanel: () => (/* reexport safe */ _agentsPanel__WEBPACK_IMPORTED_MODULE_0__.AgentsPanel),\n/* harmony export */   ChatInput: () => (/* reexport safe */ _chatInput__WEBPACK_IMPORTED_MODULE_1__.ChatInput),\n/* harmony export */   ChatMessages: () => (/* reexport safe */ _chatMessages__WEBPACK_IMPORTED_MODULE_2__.ChatMessages),\n/* harmony export */   RealTerminal: () => (/* reexport safe */ _realTerminal__WEBPACK_IMPORTED_MODULE_3__.RealTerminal),\n/* harmony export */   SessionsPanel: () => (/* reexport safe */ _sessionsPanel__WEBPACK_IMPORTED_MODULE_4__.SessionsPanel),\n/* harmony export */   SessionsRow: () => (/* reexport safe */ _sessionsRow__WEBPACK_IMPORTED_MODULE_5__.SessionsRow),\n/* harmony export */   ToolSelector: () => (/* reexport safe */ _toolSelector__WEBPACK_IMPORTED_MODULE_6__.ToolSelector),\n/* harmony export */   ToolsToggle: () => (/* reexport safe */ _toolsToggle__WEBPACK_IMPORTED_MODULE_7__.ToolsToggle)\n/* harmony export */ });\n/* harmony import */ var _agentsPanel__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./agentsPanel */ \"(app-pages-browser)/./app/_components/terminal/_components/agentsPanel.tsx\");\n/* harmony import */ var _agentsPanel__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_agentsPanel__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _chatInput__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./chatInput */ \"(app-pages-browser)/./app/_components/terminal/_components/chatInput.tsx\");\n/* harmony import */ var _chatMessages__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./chatMessages */ \"(app-pages-browser)/./app/_components/terminal/_components/chatMessages.tsx\");\n/* harmony import */ var _realTerminal__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./realTerminal */ \"(app-pages-browser)/./app/_components/terminal/_components/realTerminal.tsx\");\n/* harmony import */ var _sessionsPanel__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./sessionsPanel */ \"(app-pages-browser)/./app/_components/terminal/_components/sessionsPanel.tsx\");\n/* harmony import */ var _sessionsRow__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./sessionsRow */ \"(app-pages-browser)/./app/_components/terminal/_components/sessionsRow.tsx\");\n/* harmony import */ var _toolSelector__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./toolSelector */ \"(app-pages-browser)/./app/_components/terminal/_components/toolSelector.tsx\");\n/* harmony import */ var _toolsToggle__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./toolsToggle */ \"(app-pages-browser)/./app/_components/terminal/_components/toolsToggle.tsx\");\n// Terminal Components Exports\n// /Users/matthewsimon/Projects/EAC/eac/app/_components/terminal/_components/index.ts\n\n\n\n\n\n\n\n\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwcC1wYWdlcy1icm93c2VyKS8uL2FwcC9fY29tcG9uZW50cy90ZXJtaW5hbC9fY29tcG9uZW50cy9pbmRleC50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDhCQUE4QjtBQUM5QixxRkFBcUY7QUFFekM7QUFDSjtBQUNNO0FBQ0E7QUFDRTtBQUNKO0FBQ0U7QUFDRiIsInNvdXJjZXMiOlsiL1VzZXJzL21hdHRoZXdzaW1vbi9Qcm9qZWN0cy9lYWMvZWFjL2FwcC9fY29tcG9uZW50cy90ZXJtaW5hbC9fY29tcG9uZW50cy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBUZXJtaW5hbCBDb21wb25lbnRzIEV4cG9ydHNcbi8vIC9Vc2Vycy9tYXR0aGV3c2ltb24vUHJvamVjdHMvRUFDL2VhYy9hcHAvX2NvbXBvbmVudHMvdGVybWluYWwvX2NvbXBvbmVudHMvaW5kZXgudHNcblxuZXhwb3J0IHsgQWdlbnRzUGFuZWwgfSBmcm9tICcuL2FnZW50c1BhbmVsJztcbmV4cG9ydCB7IENoYXRJbnB1dCB9IGZyb20gJy4vY2hhdElucHV0JztcbmV4cG9ydCB7IENoYXRNZXNzYWdlcyB9IGZyb20gJy4vY2hhdE1lc3NhZ2VzJztcbmV4cG9ydCB7IFJlYWxUZXJtaW5hbCB9IGZyb20gJy4vcmVhbFRlcm1pbmFsJztcbmV4cG9ydCB7IFNlc3Npb25zUGFuZWwgfSBmcm9tICcuL3Nlc3Npb25zUGFuZWwnO1xuZXhwb3J0IHsgU2Vzc2lvbnNSb3cgfSBmcm9tICcuL3Nlc3Npb25zUm93JztcbmV4cG9ydCB7IFRvb2xTZWxlY3RvciB9IGZyb20gJy4vdG9vbFNlbGVjdG9yJztcbmV4cG9ydCB7IFRvb2xzVG9nZ2xlIH0gZnJvbSAnLi90b29sc1RvZ2dsZSc7XG5cbiJdLCJuYW1lcyI6WyJBZ2VudHNQYW5lbCIsIkNoYXRJbnB1dCIsIkNoYXRNZXNzYWdlcyIsIlJlYWxUZXJtaW5hbCIsIlNlc3Npb25zUGFuZWwiLCJTZXNzaW9uc1JvdyIsIlRvb2xTZWxlY3RvciIsIlRvb2xzVG9nZ2xlIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(app-pages-browser)/./app/_components/terminal/_components/index.ts\n"));

/***/ })

});