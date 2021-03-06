// eslint-disable-next-line node/no-unsupported-features/node-builtins
const { promises: fsPromise } = require("fs");
const { expect } = require("chai");
const wrap = require("../../../src/extract/transpile/svelte-wrap")(
  require("../../../src/extract/transpile/typescript-wrap")(true)
);
const normalizeSource = require("../normalize-source.utl");

describe("svelte transpiler", () => {
  it("tells the svelte transpiler is available", () => {
    expect(wrap.isAvailable()).to.equal(true);
  });
  [
    ["ts", (pSource) => pSource],
    [
      "js",
      (pSource) =>
        pSource.replace(
          'import "./Header.svelte";',
          'import Header from "./Header.svelte";'
        ),
    ],
  ].forEach(([variant, transformExpected]) => {
    it(`'transpiles' svelte with "<script lang='${variant}'>"'`, async () => {
      const observedPromise = fsPromise
        .readFile(
          `./test/extract/transpile/fixtures/svelte-${variant}.svelte`,
          "utf8"
        )
        .then((pSourceCode) => wrap.transpile(pSourceCode));
      const expectedPromise = fsPromise.readFile(
        "./test/extract/transpile/fixtures/svelte.js",
        "utf8"
      );

      const [observed, expected] = await Promise.all([
        observedPromise,
        expectedPromise,
      ]);
      expect(normalizeSource(observed)).to.equal(
        normalizeSource(transformExpected(expected))
      );
    });
  });
});
