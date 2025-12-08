#!/usr/bin/env bun
/**
 * Content Validation Script
 * 
 * Validates MDX content files against style guide requirements.
 * Run: bun run scripts/validate-content.ts <file.mdx>
 * 
 * Checks:
 * - Required components present
 * - AI-slop phrases absent
 * - External links valid
 * - Em-dash usage
 * - Structure requirements
 */

// Patterns that indicate AI-slop (using regex for word boundaries)
const AI_SLOP_PATTERNS = [
  // Faux-enthusiasm openers
  /\blet['']s dive in\b/i,
  /\blet['']s explore\b/i,
  /\bget ready to discover\b/i,
  /\blet['']s unpack\b/i,
  /\blet['']s break down\b/i,
  
  // Hollow connectives
  /\bhere['']s the thing\b/i,
  /\bit['']s actually quite fascinating\b/i,
  /\bthe truth is\b/i,
  /\bhere['']s what you need to know\b/i,
  
  // Performative significance (at start of sentence)
  /[.!?]\s*why does this matter\b/i,
  /[.!?]\s*why this matters\b/i,
  /\bthe key takeaway\b/i,
  /\bit['']s important to understand that\b/i,
  /\bit['']s crucial to note\b/i,
  
  // False intimacy
  /\bthink of it this way\b/i,
  /\byou might be wondering\b/i,
  /\bimagine for a moment\b/i,
  /\bpicture this\b/i,
  
  // Padding phrases (standalone, not part of larger phrase)
  /[.!?]\s*in other words\b/i,
  /\bat the end of the day\b/i,
  
  // Excessive qualifiers
  /\bit['']s worth noting that\b/i,
  /\bit['']s important to remember that\b/i,
  /\bit goes without saying\b/i,
  
  // AI writing markers (standalone transitions)
  /[.!?]\s*in conclusion\b/i,
  /[.!?]\s*to summarize\b/i,
  /[.!?]\s*in summary\b/i,
  /\bas we['']ve seen\b/i,
  /\bas mentioned earlier\b/i,
];

interface ValidationResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
}

async function validateContent(filePath: string): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Read file
  let content: string;
  try {
    content = await Bun.file(filePath).text();
  } catch (e) {
    return { passed: false, errors: [`Could not read file: ${filePath}`], warnings: [] };
  }
  
  const contentLower = content.toLowerCase();
  
  // Check for meta (either YAML frontmatter or export)
  const hasYamlFrontmatter = content.startsWith('---') && content.indexOf('---', 3) > 0;
  const hasMetaExport = content.includes('export const meta');
  
  if (!hasYamlFrontmatter && !hasMetaExport) {
    errors.push('Missing: meta (need YAML frontmatter or export const meta)');
  }
  
  // Check for title in meta
  if (!content.includes("title:") && !content.includes("title :") && !content.includes('title"')) {
    errors.push('Missing: title in meta');
  }
  
  // Check for summary
  if (!content.includes("summary:") && !content.includes("summary :") && !content.includes('summary"')) {
    warnings.push('Missing: summary in meta (recommended)');
  }
  
  // Check for Sources component
  if (!content.includes('<Sources>') && !content.includes('<Sources ')) {
    errors.push('Missing: Sources section');
  }
  
  // Check for at least one engagement component
  const hasRecognition = content.includes('<Recognition');
  const hasTryThis = content.includes('<TryThis');
  const hasMetaphor = content.includes('<Metaphor');
  const hasQuestion = content.includes('<Question');
  
  if (!hasRecognition && !hasTryThis) {
    warnings.push('Missing: Recognition or TryThis block (at least one recommended)');
  }
  
  // Check for AI-slop patterns
  const foundSlop: string[] = [];
  for (const pattern of AI_SLOP_PATTERNS) {
    if (pattern.test(content)) {
      // Extract the pattern description from the regex
      const match = content.match(pattern);
      if (match) {
        foundSlop.push(match[0].trim());
      }
    }
  }
  if (foundSlop.length > 0) {
    errors.push(`AI-slop phrases detected: "${foundSlop.join('", "')}"`);
  }
  
  // Check em-dash usage
  const emDashCount = (content.match(/—/g) || []).length;
  const unspacedEmDash = /\w—\w/.test(content);
  
  if (emDashCount > 3) {
    warnings.push(`Em-dash usage: ${emDashCount} found (should be rare)`);
  }
  if (unspacedEmDash) {
    errors.push('Em-dashes should be spaced: "word — word" not "word—word"');
  }
  
  // Extract and validate external links
  const linkRegex = /https?:\/\/[^\s\)"'<>]+/g;
  const links = content.match(linkRegex) || [];
  const uniqueLinks = [...new Set(links)];
  
  console.log(`\nValidating ${uniqueLinks.length} external links...`);
  
  for (const link of uniqueLinks) {
    try {
      const response = await fetch(link, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      if (!response.ok) {
        errors.push(`Broken link (${response.status}): ${link}`);
      }
    } catch (e) {
      // Try GET if HEAD fails (some servers don't support HEAD)
      try {
        const response = await fetch(link, { 
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        });
        if (!response.ok) {
          errors.push(`Broken link (${response.status}): ${link}`);
        }
      } catch (e2) {
        warnings.push(`Could not verify link: ${link}`);
      }
    }
  }
  
  // Check for question-led structure (markdown headings OR bold questions)
  const mdHeadingQuestions = (content.match(/^##[^#].*\?/gm) || []).length;
  const boldQuestions = (content.match(/^\*\*[^*]+\?\*\*/gm) || []).length;
  
  if (mdHeadingQuestions === 0 && boldQuestions === 0) {
    warnings.push('No question-led sections found (style guide recommends these)');
  }
  
  return {
    passed: errors.length === 0,
    errors,
    warnings
  };
}

// Main
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: bun run scripts/validate-content.ts <file.mdx>');
  console.log('       bun run scripts/validate-content.ts src/content/intro/what-is-llm.mdx');
  process.exit(1);
}

const filePath = args[0];
console.log(`\n📄 Validating: ${filePath}\n`);
console.log('─'.repeat(60));

const result = await validateContent(filePath);

if (result.errors.length > 0) {
  console.log('\n❌ ERRORS:');
  for (const error of result.errors) {
    console.log(`   • ${error}`);
  }
}

if (result.warnings.length > 0) {
  console.log('\n⚠️  WARNINGS:');
  for (const warning of result.warnings) {
    console.log(`   • ${warning}`);
  }
}

console.log('\n' + '─'.repeat(60));

if (result.passed) {
  console.log('✅ VALIDATION PASSED\n');
  process.exit(0);
} else {
  console.log('❌ VALIDATION FAILED - Fix errors before proceeding\n');
  process.exit(1);
}

