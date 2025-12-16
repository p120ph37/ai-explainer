/**
 * Griffel AOT Plugin for Bun
 * 
 * Applies Griffel's ahead-of-time Babel transform to convert
 * makeStyles() calls into pre-computed atomic CSS classes.
 * 
 * This plugin only does the AOT transform.
 * React aliasing is handled separately by preact-alias-plugin.ts
 * 
 * Usage: Import from @griffel/react (not @griffel/core)
 * 
 *   import { makeStyles, mergeClasses } from '@griffel/react';
 *   
 *   const useStyles = makeStyles({
 *     root: { color: 'red' },
 *   });
 *   
 *   function MyComponent() {
 *     const styles = useStyles();
 *     return <div className={styles.root} />;
 *   }
 */

import * as babel from '@babel/core';
import type { BunPlugin } from 'bun';

/**
 * Transform a file using Griffel's Babel preset
 */
async function transformGriffel(code: string, filename: string): Promise<string | null> {
  try {
    const result = await babel.transformAsync(code, {
      filename,
      presets: [
        ['@griffel/babel-preset', {
          modules: [
            { moduleSource: '@griffel/react', importName: 'makeStyles' },
            { moduleSource: '@griffel/react', importName: 'makeResetStyles' },
          ],
        }],
      ],
      // Let Bun handle JSX/TypeScript - we just transform Griffel
      parserOpts: {
        plugins: ['jsx', 'typescript'],
      },
    });
    
    return result?.code || null;
  } catch (error) {
    console.warn(`[griffel] Transform failed for ${filename}:`, error);
    return null;
  }
}

export const griffelPlugin: BunPlugin = {
  name: 'griffel-aot',
  
  setup(build) {
    // Only transform source files that use @griffel/react
    build.onLoad({ filter: /src\/.*\.(tsx?|jsx?)$/ }, async (args) => {
      const code = await Bun.file(args.path).text();
      
      // Skip files that don't import @griffel/react
      if (!code.includes('@griffel/react')) {
        return undefined; // Let Bun handle normally
      }
      
      const transformed = await transformGriffel(code, args.path);
      
      if (!transformed) {
        return undefined; // Transform failed, let Bun handle
      }
      
      return {
        contents: transformed,
        loader: args.path.endsWith('.tsx') ? 'tsx' : 
                args.path.endsWith('.ts') ? 'ts' :
                args.path.endsWith('.jsx') ? 'jsx' : 'js',
      };
    });
  },
};

export default griffelPlugin;
