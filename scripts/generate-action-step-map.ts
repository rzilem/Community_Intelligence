import 'ts-node/register';
import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';

export type ActionStepMap = { [actionStep: string]: string };

function parseSheet(filePath: string): ActionStepMap {
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json<Record<string, string>>(sheet, { defval: '' });
  const map: ActionStepMap = {};
  for (const row of rows) {
    const actionStep =
      row['Action Step'] || row['action step'] || row['ActionStep'] || row['Action'] || row['Step'];
    const templateId =
      row['Template ID'] || row['template id'] || row['Workflow Template ID'] || row['templateId'];
    if (actionStep && templateId) {
      map[String(actionStep).trim()] = String(templateId).trim();
    }
  }
  return map;
}

function writeOutput(map: ActionStepMap, outPath: string) {
  const ext = path.extname(outPath).toLowerCase();
  if (ext === '.json') {
    fs.writeFileSync(outPath, JSON.stringify(map, null, 2));
  } else {
    const content = `export type ActionStepMap = { [actionStep: string]: string };\n\nexport const actionStepMap: ActionStepMap = ${JSON.stringify(
      map,
      null,
      2
    )};\n`;
    fs.writeFileSync(outPath, content);
  }
}

const input = process.argv[2];
if (!input) {
  console.error('Usage: node scripts/generate-action-step-map.ts <spreadsheet> [output]');
  process.exit(1);
}
const output = process.argv[3] || 'src/data/actionStepMap.ts';
const actionStepMap = parseSheet(input);
writeOutput(actionStepMap, output);
console.log(`Wrote ${Object.keys(actionStepMap).length} mappings to ${output}`);
