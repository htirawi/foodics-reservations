// scripts/strip-comments-add-jsdoc.mjs
/* eslint-disable no-restricted-syntax, complexity, max-depth, no-console */
import fs from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';
import ts from 'typescript';
// import { parse as parseSFC } from '@vue/compiler-sfc'; // Not used in regex-based approach
import MagicString from 'magic-string';

const DRY = process.argv.includes('--dry');

const ROOT = process.cwd();
const GLOBS = [
  'src/**/*.ts',
  'src/**/*.tsx',
  'types/**/*.ts',
  'tests/**/*.ts',
  'tests/**/*.tsx',
  'src/**/*.vue',
];
const IGNORE = [
  '**/node_modules/**',
  '**/dist/**',
  '**/.git/**',
  '**/coverage/**',
  'docs/**',
  '.cursor/**',
  '.husky/**',
  '**/.env*',
];

function jsdocHeaderFor(filePath) {
  const rel = path.relative(ROOT, filePath).replace(/\\/g, '/');
  const base = path.basename(filePath);
  return `/**
 * @file ${base}
 * @summary Module: ${rel}
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
`;
}

function stripCommentsTSOrJS(code, isTSX = false) {
  // Parse as TS/JS and reprint with comments removed (safe).
  const source = ts.createSourceFile(
    'tmp.tsx',
    code,
    ts.ScriptTarget.Latest,
    /*setParentNodes*/ false,
    isTSX ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );
  const printer = ts.createPrinter({ removeComments: true, newLine: ts.NewLineKind.LineFeed });
  return printer.printFile(source);
}

async function processTSLike(file) {
  const orig = await fs.readFile(file, 'utf8');
  const isTSX = file.endsWith('.tsx');
  const stripped = stripCommentsTSOrJS(orig, isTSX);

  // Ensure a single leading newline after header; preserve BOM absence.
  const header = jsdocHeaderFor(file);
  // If the first non-whitespace starts with '/** @file', assume previously run (idempotent)
  const alreadyHasHeader = /^\s*\/\*\*\s*@file/m.test(stripped.slice(0, 200));
  const finalCode = (alreadyHasHeader ? stripped : header + stripped).replace(/^\s+$/m, '');

  if (!DRY) await fs.writeFile(file, finalCode, 'utf8');
  return { file, changed: finalCode !== orig };
}

function removeHtmlComments(template) {
  // Remove <!-- ... --> in templates (do not nest).
  return template.replace(/<!--[\s\S]*?-->/g, '');
}

async function processVue(file) {
  const orig = await fs.readFile(file, 'utf8');
  
  // Use regex-based approach for Vue files to avoid SFC parser issues
  const ms = new MagicString(orig);
  
  // 1) Strip HTML comments from template
  const templateMatch = orig.match(/<template[^>]*>([\s\S]*?)<\/template>/);
  if (templateMatch) {
    const templateStart = templateMatch.index + templateMatch[0].indexOf('>') + 1;
    const templateEnd = templateMatch.index + templateMatch[0].lastIndexOf('<');
    const templateContent = orig.slice(templateStart, templateEnd);
    const cleanedTemplate = removeHtmlComments(templateContent);
    ms.overwrite(templateStart, templateEnd, cleanedTemplate);
  }
  
  // 2) Handle <script setup> first (preferred in Vue 3)
  const scriptSetupMatch = orig.match(/<script\s+setup[^>]*>([\s\S]*?)<\/script>/);
  if (scriptSetupMatch) {
    const scriptStart = scriptSetupMatch.index + scriptSetupMatch[0].indexOf('>') + 1;
    const scriptEnd = scriptSetupMatch.index + scriptSetupMatch[0].lastIndexOf('<');
    const scriptContent = orig.slice(scriptStart, scriptEnd);
    
    // Check if it's TSX
    const isTSX = scriptSetupMatch[0].includes('tsx') || /\.tsx$/.test(file);
    const strippedContent = stripCommentsTSOrJS(scriptContent, isTSX);
    
    // Prepend file-level JSDoc inside the script block
    const hasHeader = /^\s*\/\*\*\s*@file/m.test(strippedContent.slice(0, 200));
    const contentWithHeader = (hasHeader ? strippedContent : jsdocHeaderFor(file) + strippedContent);
    
    ms.overwrite(scriptStart, scriptEnd, contentWithHeader);
    
    if (!DRY) await fs.writeFile(file, ms.toString(), 'utf8');
    return { file, changed: ms.toString() !== orig };
  }
  
  // 3) Handle classic <script> (lang=ts/js)
  const scriptMatch = orig.match(/<script[^>]*>([\s\S]*?)<\/script>/);
  if (scriptMatch) {
    const scriptStart = scriptMatch.index + scriptMatch[0].indexOf('>') + 1;
    const scriptEnd = scriptMatch.index + scriptMatch[0].lastIndexOf('<');
    const scriptContent = orig.slice(scriptStart, scriptEnd);
    
    const isTSX = false; // classic scripts in Vue are usually TS or JS (not TSX)
    const strippedContent = stripCommentsTSOrJS(scriptContent, isTSX);
    
    const hasHeader = /^\s*\/\*\*\s*@file/m.test(strippedContent.slice(0, 200));
    const contentWithHeader = (hasHeader ? strippedContent : jsdocHeaderFor(file) + strippedContent);
    
    ms.overwrite(scriptStart, scriptEnd, contentWithHeader);
    
    if (!DRY) await fs.writeFile(file, ms.toString(), 'utf8');
    return { file, changed: ms.toString() !== orig };
  }
  
  // 4) No script blocks → only template comments removed (don't inject script)
  if (!DRY) await fs.writeFile(file, ms.toString(), 'utf8');
  return { file, changed: ms.toString() !== orig };
}

async function main() {
  const files = await fg(GLOBS, { ignore: IGNORE, onlyFiles: true, dot: false });
  const results = [];
  for (const file of files) {
    try {
      if (file.endsWith('.vue')) {
        results.push(await processVue(file));
      } else {
        results.push(await processTSLike(file));
      }
    } catch (err) {
      console.error(`✖ Failed ${file}:`, err.message);
    }
  }
  const changed = results.filter(r => r?.changed).length;
  console.log(`\n✅ Done. Processed ${results.length} files. Changed ${changed}. DRY=${DRY}\n`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});

/* eslint-enable no-restricted-syntax, complexity, max-depth, no-console */
