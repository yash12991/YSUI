import { PlannerOutput, GeneratorOutput, ComponentType, ProjectFile } from '@/types';
import { callAI } from './aiProvider';
import { getComponentDescriptions } from '../validation';

const ALL_COMPONENTS: ComponentType[] = [
  'Button', 'Card', 'Input', 'Table', 'Modal', 'Sidebar', 'Navbar',
  'Chart', 'Badge', 'Avatar', 'Progress', 'Stat', 'Alert', 'Toggle',
  'Tabs', 'Divider', 'Select',
];

const LAYOUT_TEMPLATES: Record<string, string> = {
  landing: `Hero section with gradient heading, description, two CTA buttons
Features section: 3-column card grid with emoji icons
Stats bar: 4 stat items showing numbers
Footer with links`,
  dashboard: `Navbar at top with brand + nav items + action buttons
Sidebar left (~220px) with grouped navigation
KPI stats row: 4 stat cards in a grid
Charts row: line chart (2fr) + pie chart (1fr)
Full-width table card below`,
  form: `Centered card on gradient background
Card container with title + subtitle
Form fields with labels stacked vertically
Submit button with gradient background
Footer links below card`,
  centered: `Full viewport centered content
Glassy card with emoji + title + subtitle
Content stacked vertically inside card`,
};

const GENERATOR_SYSTEM_PROMPT = `You are the GENERATOR agent. You produce production-ready React/TSX UI code.

MISSION: Generate STUNNING, PREMIUM React TSX UI that looks like it belongs on Dribbble.

OUTPUT FORMAT: Return a JSON object (NO markdown, NO code fences):

{
  "mainCode": "<the full TSX code — everything in ONE self-contained file>",
  "componentList": ["Button", "Card", ...]
}

RULES:
- 'use client' as first line
- Import ONLY React and components from '@/components/ui': Button, Card, Input, Table, Modal, Sidebar, Navbar, Chart, Badge, Avatar, Progress, Stat, Alert, Toggle, Tabs, Divider, Select
- NO imports from relative paths (no './' or '../')
- Define ALL helper components and mock data INSIDE the main file
- Default export function GeneratedUI()
- NO external libraries
- Single self-contained file — do NOT split into multiple files

${getComponentDescriptions()}

PREMIUM DESIGN RULES:
1. GRADIENT TEXT: h1/h2 use background: 'linear-gradient(135deg, #f0f2f5 0%, #10b981 60%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
2. AMBIENT BG: minHeight: '100vh', background: 'radial-gradient(ellipse at 15% 10%, rgba(16,185,129,0.09) 0%, transparent 45%), radial-gradient(ellipse at 85% 80%, rgba(59,130,246,0.07) 0%, transparent 40%), #09090b'
3. GLASSMORPHISM: background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 24, backdropFilter: 'blur(12px)'
4. HOVER EFFECTS: useState for hover state, translateY(-5px) scale(1.015) on hover, smooth transition
5. REAL DATA: actual names, numbers, dates - no placeholder text
6. EMOJI ICONS: section headers, nav items, stat icons

LAYOUT GUIDANCE BY TYPE:

landing-page:
- Full-width hero with giant gradient h1 (4rem+) + subtitle + 2 CTAs
- 3-column features grid with hover cards
- Stats section with 4 metrics
- Bottom CTA section

dashboard / app-shell:
- Navbar (brand + items + actions) + Sidebar (groups with items)
- Header row: gradient h1 + live Badge
- KPI grid: 4 Stat components
- Charts: line chart card + pie chart card side by side
- Table card at bottom

centered / form-page:
- Centered on viewport with glow orb behind card
- Card: title with emoji + subtitle + inputs/buttons
- Social auth buttons row
- Footer micro-copy

single-column / two-column:
- Vertical stack in centered column (max 800px)
- Ambient radial bg, dense content
- Two-column: left nav pills + right content area

Return ONLY the JSON object.`;

export async function runGenerator(plan: PlannerOutput): Promise<GeneratorOutput> {
  const userMessage = `Convert this plan into a single self-contained TSX file.

PLAN:
${JSON.stringify(plan, null, 2)}

REQUIREMENTS:
1. Layout: "${plan.layout}"
2. Use these components: ${plan.components.map(c => c.type).filter((v, i, a) => a.indexOf(v) === i).join(', ')}
3. Apply all premium design rules
4. Define ALL helper components and data inside the main file
5. Use realistic data
6. NO relative imports (no './' or '../')

${getLayoutGuidance(plan.layout)}

Return JSON with mainCode and componentList.`;

  const response = await callAI(userMessage, GENERATOR_SYSTEM_PROMPT);
  return parseGeneratorResponse(response, plan);
}

function parseGeneratorResponse(response: string, plan: PlannerOutput): GeneratorOutput {
  // Try parsing as JSON first (new multi-file format)
  let clean = response.trim();
  if (clean.startsWith('`')) {
    clean = clean.replace(/^`{3}(?:json)?\s*\n?/, '').replace(/\n?`{3}\s*$/, '');
  }

  try {
    const parsed = JSON.parse(clean);
    if (parsed.mainCode && parsed.componentList) {
      const code = sanitizeGeneratedCode(parsed.mainCode);
      const componentList = parsed.componentList.filter((c: string) =>
        ALL_COMPONENTS.includes(c as ComponentType)
      ) as ComponentType[];
      const files: ProjectFile[] = Array.isArray(parsed.files) ? parsed.files.map((f: { path: string; content: string }) => ({
        path: f.path,
        content: f.content,
      })) : [];
      return { code, componentList, files };
    }
  } catch {}

  // Fallback: treat the whole response as a single TSX file
  let code = clean;
  // Strip bare 'use client;' lines (AI sometimes emits them without quotes)
  code = code.replace(/^['"]?use client['"]?;\s*\n/gm, '');
  if (!code.startsWith("'use client'") && !code.startsWith('"use client"')) {
    code = `'use client';\n${code}`;
  }
  if (!code.includes("from 'react'") && !code.includes('from "react"')) {
    code = code.replace("'use client';\n", "'use client';\nimport React from 'react';\n");
  }
  if (!code.includes("from '@/components/ui'") && !code.includes('from "@/components/ui"')) {
    const used = extractUsedComponents(code);
    if (used.length > 0) {
      const imp = `import { ${used.join(', ')} } from '@/components/ui';\n`;
      const nl = code.indexOf('\n');
      code = code.slice(0, nl + 1) + imp + code.slice(nl + 1);
    }
  }
  if (!code.includes('export default')) {
    code = code.replace(/^(export )?function GeneratedUI/m, 'export default function GeneratedUI');
    if (!code.includes('export default')) code += '\nexport default GeneratedUI;';
  }
  const componentList = extractUsedComponents(code);
  return { code, componentList };
}

function sanitizeGeneratedCode(code: string): string {
  let c = code.trim();
  // Strip bare 'use client;' or "use client;" lines (AI sometimes emits them without quotes)
  c = c.replace(/^['"]?use client['"]?;\s*\n/gm, '');
  if (!c.startsWith("'use client'") && !c.startsWith('"use client"')) {
    c = `'use client';\n${c}`;
  }
  if (!c.includes("from 'react'") && !c.includes('from "react"')) {
    c = c.replace("'use client';\n", "'use client';\nimport React from 'react';\n");
  }
  if (!c.includes('export default')) {
    c = c.replace(/^(export )?function GeneratedUI/m, 'export default function GeneratedUI');
    if (!c.includes('export default')) c += '\nexport default GeneratedUI;';
  }
  return c;
}

function getLayoutGuidance(layout: string): string {
  const guides: Record<string, string> = {
    'single-column': `LAYOUT: Single Column. Stack vertically (max 800px). ${LAYOUT_TEMPLATES['form']}`,
    'two-column': `LAYOUT: Two Column. Grid 1fr 2fr. Left nav + right content. ${LAYOUT_TEMPLATES['form']}`,
    'sidebar-layout': `LAYOUT: Sidebar Layout. Fixed left 220px sidebar + scrollable main. ${LAYOUT_TEMPLATES['dashboard']}`,
    'dashboard': `LAYOUT: Dashboard. Navbar + Sidebar + KPI grid + Charts + Table. ${LAYOUT_TEMPLATES['dashboard']}`,
    'centered': `LAYOUT: Centered. Content centered + glow orb. ${LAYOUT_TEMPLATES['centered']}`,
    'full-width': `LAYOUT: Full Width. Hero + features + stats + CTA. ${LAYOUT_TEMPLATES['landing']}`,
    'landing-page': `LAYOUT: Landing Page. Hero (4rem h1) + features grid + stats + CTA. ${LAYOUT_TEMPLATES['landing']}`,
    'form-page': `LAYOUT: Form Page. Centered glass card with form fields. ${LAYOUT_TEMPLATES['form']}`,
    'app-shell': `LAYOUT: App Shell. Navbar + Sidebar + scrollable main. ${LAYOUT_TEMPLATES['dashboard']}`,
  };
  return guides[layout] || guides['single-column'];
}

function extractUsedComponents(code: string): ComponentType[] {
  return ALL_COMPONENTS.filter(comp => new RegExp(`<${comp}[\\s/>{]`).test(code));
}
