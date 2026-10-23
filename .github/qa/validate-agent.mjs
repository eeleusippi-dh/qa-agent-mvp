import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Piloto del contador: estos criterios se fijan en el verificador, no los decide el modelo.
const requiredCriteria = ['CA-01', 'CA-02', 'CA-03'];
function check(condition, message) {
  if (!condition) throw new Error(message);
}
function text(value, label, max = 20000) {
  check(typeof value === 'string' && value.trim().length > 0 && value.length <= max,
    `${label}: texto vacio o longitud invalida`);
}
function strings(value) {
  return Array.isArray(value) && value.every(x => typeof x === 'string');
}

export function validateBundle(raw) {
  text(raw, 'Respuesta del agente', 50000);
  const bundle = JSON.parse(raw);
  check(bundle && typeof bundle === 'object', 'Respuesta JSON invalida');
  const summary = bundle.summary;
  check(summary && summary.status === 'generated', 'El agente no pudo completar la generacion');
  check(strings(summary.open_questions) && summary.open_questions.length === 0, 'Hay preguntas pendientes');
  check(strings(summary.uncovered_criteria) && summary.uncovered_criteria.length === 0, 'Hay criterios pendientes');
  check(strings(summary.covered_criteria), 'Falta covered_criteria');
  check(summary.covered_criteria.length === requiredCriteria.length &&
    requiredCriteria.every(id => summary.covered_criteria.includes(id)), 'Faltan criterios del contador');
  text(bundle.test_cases_markdown, 'Casos documentados');
  for (const id of requiredCriteria) check(bundle.test_cases_markdown.includes(id), `Falta ${id} en los casos`);
  check(Array.isArray(bundle.files) && bundle.files.length >= 1 && bundle.files.length <= 3,
    'Se requieren entre uno y tres archivos de test');
  const names = new Set();
  for (const file of bundle.files) {
    check(file && typeof file.path === 'string' &&
      /^tests\/generated\/[a-z0-9][a-z0-9-]*\.spec\.ts$/.test(file.path), 'Ruta de test no permitida');
    check(!names.has(file.path), 'Archivo de test duplicado');
    names.add(file.path);
    text(file.content, 'Contenido de test');
  }
  check(strings(summary.generated_files) && summary.generated_files.length === names.size &&
    new Set(summary.generated_files).size === names.size &&
    summary.generated_files.every(name => names.has(name)), 'La lista de archivos no coincide');
  return bundle;
}

// Controles estaticos acotados al MVP. No constituyen un sandbox ni prueban la calidad semantica.
export function inspectSource(source, ts) {
  const tree = ts.createSourceFile('generated.spec.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  check(tree.parseDiagnostics.length === 0, 'El test contiene errores de sintaxis');
  const forbiddenIdentifiers = new Set(['process', 'require', 'eval', 'Function', 'fetch', 'globalThis', '__dirname', '__filename']);
  const forbiddenMethods = new Set(['skip', 'fixme', 'only', 'waitForTimeout', 'route', 'routeFromHAR',
    'evaluate', 'evaluateHandle', 'addInitScript', 'exposeFunction']);
  let hasImport = false;
  function visit(node) {
    if (ts.isImportDeclaration(node)) {
      check(ts.isStringLiteral(node.moduleSpecifier) && node.moduleSpecifier.text === '@playwright/test',
        'Solo se admite importar @playwright/test');
      hasImport = true;
    }
    check(!ts.isExportDeclaration(node) && !ts.isImportEqualsDeclaration(node), 'Export o import no permitido');
    check(!(ts.isIdentifier(node) && forbiddenIdentifiers.has(node.text)), 'API de sistema no permitida');
    check(!(ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword), 'Import dinamico no permitido');
    if (ts.isPropertyAccessExpression(node)) {
      check(!forbiddenMethods.has(node.name.text), `Metodo no permitido: ${node.name.text}`);
    }
    check(!ts.isElementAccessExpression(node), 'Acceso dinamico no permitido en este piloto');
    ts.forEachChild(node, visit);
  }
  visit(tree);
  check(hasImport, 'Falta la importacion de Playwright');
}

export function validateResults(report) {
  check(report && Array.isArray(report.errors) && report.errors.length === 0, 'Hay errores globales de Playwright');
  check(Array.isArray(report.suites), 'Falta el reporte de suites');
  const specs = [];
  function collect(suites) {
    for (const suite of suites) {
      specs.push(...(suite.specs || []));
      collect(suite.suites || []);
    }
  }
  collect(report.suites);
  check(specs.length >= 3, 'Se requieren al menos tres tests ejecutados');
  const covered = new Set();
  for (const spec of specs) {
    check(spec.ok === true && Array.isArray(spec.tests) && spec.tests.length > 0, 'Test no aprobado');
    const match = /^(CA-\d{2}):\s*\S/.exec(spec.title);
    check(match && requiredCriteria.includes(match[1]), 'Titulo sin criterio valido');
    for (const test of spec.tests) {
      check(test.expectedStatus === 'passed' && test.status === 'expected', 'Test omitido o resultado inesperado');
      check(Array.isArray(test.results) && test.results.length === 1 &&
        test.results[0].status === 'passed', 'Se requiere una ejecucion aprobada sin reintentos');
    }
    covered.add(match[1]);
  }
  check(requiredCriteria.every(id => covered.has(id)), 'Faltan criterios en los tests realmente ejecutados');
  return specs.length;
}

async function main() {
  const mode = process.argv[2];
  if (mode === 'restore') {
    const bundle = validateBundle(process.env.QA_BUNDLE);
    const { default: ts } = await import('typescript');
    for (const file of bundle.files) inspectSource(file.content, ts);
    check(!fs.existsSync('tests/generated') && !fs.existsSync('qa-output'),
      'Las carpetas de salida deben estar ausentes en la copia limpia');
    fs.mkdirSync('tests/generated', { recursive: true });
    fs.mkdirSync('qa-output');
    for (const file of bundle.files) fs.writeFileSync(file.path, file.content, { flag: 'wx' });
    fs.writeFileSync('qa-output/test-cases.md', bundle.test_cases_markdown);
    fs.writeFileSync('qa-output/generation-summary.json', JSON.stringify(bundle.summary, null, 2));
    fs.writeFileSync('qa-output/run-context.json', JSON.stringify({
      commit: process.env.QA_COMMIT,
      run_id: process.env.GITHUB_RUN_ID,
      mode: 'baseline',
      required_criteria: requiredCriteria,
    }, null, 2));
    console.log('Archivos recuperados y controles iniciales aprobados. Falta ejecutar Playwright.');
  } else if (mode === 'results') {
    const report = JSON.parse(fs.readFileSync('qa-output/generated-results.json', 'utf8'));
    console.log(`Validados ${validateResults(report)} tests y los tres criterios del contador.`);
  } else {
    throw new Error('Modo esperado: restore o results');
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    console.error(`QA bloqueado: ${error.message}`);
    process.exitCode = 1;
  });
}
