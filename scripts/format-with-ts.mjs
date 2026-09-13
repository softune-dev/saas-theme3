/**
 * Reformat TS/TSX files using the TypeScript compiler's own formatter — the
 * same engine VS Code's "Format Document" uses. Kept here because this repo has
 * no Prettier dependency and indentation was lost in a bulk edit.
 *
 * Usage: node scripts/format-with-ts.mjs <file...>
 */
import ts from "typescript";
import { readFileSync, writeFileSync } from "node:fs";

const files = process.argv.slice(2);

const options = {
  ...ts.getDefaultFormatCodeSettings("\n"),
  indentSize: 2,
  tabSize: 2,
  convertTabsToSpaces: true,
  indentStyle: ts.IndentStyle.Smart,
  insertSpaceAfterCommaDelimiter: true,
  insertSpaceAfterKeywordsInControlFlowStatements: true,
  insertSpaceBeforeAndAfterBinaryOperators: true,
  insertSpaceAfterSemicolonInForStatements: true,
  insertSpaceAfterTypeAssertion: true,
  semicolons: ts.SemicolonPreference.Ignore,
};

function applyEdits(text, edits) {
  // Apply back-to-front so earlier spans keep their offsets.
  return [...edits]
    .sort((a, b) => b.span.start - a.span.start)
    .reduce(
      (acc, e) =>
        acc.slice(0, e.span.start) +
        e.newText +
        acc.slice(e.span.start + e.span.length),
      text,
    );
}

for (const file of files) {
  const text = readFileSync(file, "utf8");

  // A one-file language service is enough: formatting is purely syntactic, so
  // it needs no type information and no module resolution.
  const host = {
    getCompilationSettings: () => ({ jsx: ts.JsxEmit.Preserve }),
    getScriptFileNames: () => [file],
    getScriptVersion: () => "1",
    getScriptSnapshot: (name) =>
      name === file ? ts.ScriptSnapshot.fromString(text) : undefined,
    getCurrentDirectory: () => process.cwd(),
    getDefaultLibFileName: () => "lib.d.ts",
    readFile: (name) => (name === file ? text : undefined),
    fileExists: (name) => name === file,
  };

  const service = ts.createLanguageService(host, ts.createDocumentRegistry());
  const edits = service.getFormattingEditsForDocument(file, options);
  const formatted = applyEdits(text, edits);

  if (formatted !== text) {
    writeFileSync(file, formatted, "utf8");
    console.log("formatted", file);
  } else {
    console.log("unchanged", file);
  }
}
