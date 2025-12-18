#!/usr/bin/env bun
/**
 * Display the extracted link graph
 * 
 * Shows which pages link to which, based on automatic link extraction.
 */

import { discoverContent } from '../src/lib/content.ts';

async function main() {
  console.log('🔗 Extracting link graph from content...\n');
  
  try {
    // Discover all content (this now includes link extraction)
    const allContent = await discoverContent();
    
    // Filter to non-draft, non-variant pages
    const pages = allContent.filter(c => !c.meta.draft && !c.id.includes('/'));
    
    console.log(`📄 Found ${pages.length} pages\n`);
    
    // Show link graph
    console.log('Link Graph:');
    console.log('===========\n');
    
    let totalLinks = 0;
    
    for (const page of pages) {
      const links = page.meta.links || [];
      totalLinks += links.length;
      
      if (links.length > 0) {
        console.log(`${page.id} (${page.meta.title})`);
        console.log(`  → ${links.join(', ')}`);
        console.log();
      }
    }
    
    console.log(`\n📊 Statistics:`);
    console.log(`   Total pages: ${pages.length}`);
    console.log(`   Total links: ${totalLinks}`);
    console.log(`   Avg links per page: ${(totalLinks / pages.length).toFixed(1)}`);
    
    // Find pages with no outgoing links
    const noLinks = pages.filter(p => !p.meta.links || p.meta.links.length === 0);
    if (noLinks.length > 0) {
      console.log(`\n⚠️  Pages with no outgoing links: ${noLinks.length}`);
      noLinks.forEach(p => console.log(`   - ${p.id}`));
    }
    
    // Find most linked pages
    const incomingLinks = new Map<string, number>();
    for (const page of pages) {
      for (const link of page.meta.links || []) {
        incomingLinks.set(link, (incomingLinks.get(link) || 0) + 1);
      }
    }
    
    const topLinked = Array.from(incomingLinks.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    if (topLinked.length > 0) {
      console.log(`\n🔝 Most linked-to pages:`);
      topLinked.forEach(([id, count]) => {
        const page = pages.find(p => p.id === id);
        console.log(`   ${count}× ${id} (${page?.meta.title || id})`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to extract link graph!\n');
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();



