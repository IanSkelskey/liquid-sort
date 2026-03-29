import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

const TS_EXTENSIONS = ['.ts', '.tsx'];

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function isRelativePath(specifier) {
  return specifier.startsWith('./') || specifier.startsWith('../') || specifier.startsWith('/');
}

export async function resolve(specifier, context, defaultResolve) {
  if (isRelativePath(specifier)) {
    const parentUrl = context.parentURL ?? pathToFileURL(`${process.cwd()}${path.sep}`).href;
    const hasExtension = path.extname(specifier).length > 0;

    if (!hasExtension) {
      for (const extension of TS_EXTENSIONS) {
        const candidateUrl = new URL(`${specifier}${extension}`, parentUrl);

        if (await fileExists(fileURLToPath(candidateUrl))) {
          return {
            url: candidateUrl.href,
            shortCircuit: true,
          };
        }
      }
    }

    if (TS_EXTENSIONS.includes(path.extname(specifier))) {
      const resolvedUrl = new URL(specifier, parentUrl);

      return {
        url: resolvedUrl.href,
        shortCircuit: true,
      };
    }
  }

  return defaultResolve(specifier, context, defaultResolve);
}

export async function load(url, context, defaultLoad) {
  if (TS_EXTENSIONS.includes(path.extname(new URL(url).pathname))) {
    const filePath = fileURLToPath(url);
    const source = await readFile(filePath, 'utf8');
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.Bundler,
        target: ts.ScriptTarget.ES2023,
        jsx: ts.JsxEmit.ReactJSX,
        verbatimModuleSyntax: true,
      },
      fileName: filePath,
    });

    return {
      format: 'module',
      source: outputText,
      shortCircuit: true,
    };
  }

  return defaultLoad(url, context, defaultLoad);
}
