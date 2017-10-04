const assert = require('assert');
const svgComp = require('../src/svgComp.js');

// good svg
const svg1 = '<svg width="240" height="240" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg"><path d="M20 135h200v-30H20z" fill-rule="nonzero"/></svg>';
const jsxSvg1 = '<svg width={240} height={240} viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" {...props}><path d="M20 135h200v-30H20z" fillRule="nonzero" /></svg>';

// bad svg
const svg2 = '<svg width="240" height="240" viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg"><path d="M20 135h200v-30H20z" fill-rule="nonzero"/></svg>';

// missing viewBox
const svg3 = '<svg width="240" height="240" xmlns="http://www.w3.org/2000/svg"><path d="M20 135h200v-30H20z" fill-rule="nonzero"/></svg>';

assert.equal(svgComp.processSvg(svg1).trim(), jsxSvg1);

assert.equal(svgComp.processSvg(svg2), undefined);

assert.equal(svgComp.processSvg(svg3), undefined);
