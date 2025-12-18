#!/usr/bin/env bun
/**
 * Validate content graph integrity
 * 
 * Checks that the content graph (defined by children/related metadata):
 * - Forms a DAG (no circular ancestry via children links)
 * - Has no broken links (all referenced pages exist)
 * - Excludes draft pages
 */

import { discoverContent } from '../src/lib/content.ts';
import { validateContentGraph } from '../src/lib/graph-validation.ts';

async function main() {
  console.log('🔍 Validating content graph...\n');
  
  try {
    // Discover all content
    const allContent = await discoverContent();
    console.log(`📄 Found ${allContent.length} content files`);
    
    // Build metadata map (excluding drafts)
    const allMeta: Record<string, any> = {};
    let draftCount = 0;
    
    for (const content of allContent) {
      if (content.meta.draft) {
        draftCount++;
        continue;
      }
      allMeta[content.id] = content.meta;
    }
    
    console.log(`✓ ${Object.keys(allMeta).length} non-draft pages`);
    console.log(`⊘ ${draftCount} draft pages (excluded)\n`);
    
    // Validate the graph
    validateContentGraph(allMeta);
    
    console.log('✅ Content graph is valid!');
    console.log('   - No circular ancestry');
    console.log('   - No broken links');
    console.log('   - Forms a valid DAG');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Content graph validation failed!\n');
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();



