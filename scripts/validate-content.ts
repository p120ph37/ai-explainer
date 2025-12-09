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
        // 403 often indicates bot blocking, not a broken link
        // 429 is rate limiting
        if (response.status === 403 || response.status === 429) {
          warnings.push(`Link returned ${response.status} (may be bot-blocked): ${link}`);
        } else {
          errors.push(`Broken link (${response.status}): ${link}`);
        }
      }
    } catch (e) {
      // Try GET if HEAD fails (some servers don't support HEAD)
      try {
        const response = await fetch(link, { 
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        });
        if (!response.ok) {
          // 403 often indicates bot blocking, not a broken link
          // 429 is rate limiting
          if (response.status === 403 || response.status === 429) {
            warnings.push(`Link returned ${response.status} (may be bot-blocked): ${link}`);
          } else {
            errors.push(`Broken link (${response.status}): ${link}`);
          }
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

// Find all MDX files in src/content
async function findMdxFiles(dir: string): Promise<string[]> {
  const glob = new Bun.Glob('**/*.mdx');
  const files: string[] = [];
  for await (const file of glob.scan({ cwd: dir, absolute: true })) {
    files.push(file);
  }
  return files.sort();
}

// Main
const args = process.argv.slice(2);
let filesToValidate: string[];

if (args.length === 0) {
  // No arguments - validate all MDX files in src/content
  console.log('\n📂 No file specified - validating all content files...\n');
  filesToValidate = await findMdxFiles('src/content');
  
  if (filesToValidate.length === 0) {
    console.log('No MDX files found in src/content/');
    process.exit(0);
  }
  
  console.log(`Found ${filesToValidate.length} MDX files to validate\n`);
} else {
  filesToValidate = [args[0]];
}

let allPassed = true;
let totalErrors = 0;
let totalWarnings = 0;

for (const filePath of filesToValidate) {
  console.log(`\n📄 Validating: ${filePath}\n`);
  console.log('─'.repeat(60));

  const result = await validateContent(filePath);

  if (result.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    for (const error of result.errors) {
      console.log(`   • ${error}`);
    }
    totalErrors += result.errors.length;
  }

  if (result.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    for (const warning of result.warnings) {
      console.log(`   • ${warning}`);
    }
    totalWarnings += result.warnings.length;
  }

  console.log('\n' + '─'.repeat(60));

  if (result.passed) {
    console.log('✅ PASSED\n');
  } else {
    console.log('❌ FAILED\n');
    allPassed = false;
  }
}

// Summary for multi-file validation
if (filesToValidate.length > 1) {
  console.log('\n' + '═'.repeat(60));
  console.log('SUMMARY');
  console.log('═'.repeat(60));
  console.log(`Files validated: ${filesToValidate.length}`);
  console.log(`Total errors: ${totalErrors}`);
  console.log(`Total warnings: ${totalWarnings}`);
  console.log('═'.repeat(60));
}

if (allPassed) {
  console.log('\n✅ VALIDATION PASSED\n');
  process.exit(0);
} else {
  console.log('\n❌ VALIDATION FAILED - Fix errors before proceeding\n');
  process.exit(1);
}

