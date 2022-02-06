#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'node-builtin-modules');
const MODULES = ['fs', 'path', 'child_process'];

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
MODULES.forEach((name) => {
  console.log(name);
  fs.writeFileSync(
    path.join(OUTPUT_DIR, `${name}.js`),
    `import '../node-require-hack.cjs';\nexport default __cc_ru_hacked_require('${name}');\n`,
  );
  fs.writeFileSync(
    path.join(OUTPUT_DIR, `${name}.d.ts`),
    `import * as ${name} from '${name}';\nexport default ${name};\n`,
  );
});
