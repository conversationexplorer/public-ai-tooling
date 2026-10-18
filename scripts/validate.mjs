#!/usr/bin/env node
// Validates the skill repo: SKILL.md frontmatter, skills.json paths, plugin manifests, and the
// copy rule (no em dashes, en dashes, or " - " used as a dash in any markdown or manifest text).
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, relative } from 'node:path'

const root = new URL('..', import.meta.url).pathname
const errors = []
const fail = (msg) => errors.push(msg)

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.git') continue
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}
const files = walk(root)
const rel = (p) => relative(root, p)

// 1. Every SKILL.md has valid frontmatter.
const skillFiles = files.filter((f) => f.endsWith('/SKILL.md'))
if (skillFiles.length === 0) fail('no SKILL.md found')
for (const f of skillFiles) {
  const text = readFileSync(f, 'utf8')
  const m = text.match(/^---\n([\s\S]*?)\n---\n/)
  if (!m) { fail(`${rel(f)}: missing frontmatter`); continue }
  const fm = m[1]
  for (const key of ['name:', 'description:', 'license:']) {
    if (!new RegExp(`^${key}`, 'm').test(fm)) fail(`${rel(f)}: frontmatter missing ${key}`)
  }
  if (!/^\s+version:\s*"?\d+\.\d+\.\d+/m.test(fm)) fail(`${rel(f)}: frontmatter missing metadata.version`)
}

// 2. skills.json: every path exists and has a SKILL.md; JSON manifests parse.
const readJson = (p) => {
  try { return JSON.parse(readFileSync(join(root, p), 'utf8')) } catch (e) { fail(`${p}: ${e.message}`); return null }
}
const skillsJson = readJson('skills.json')
for (const s of skillsJson?.skills ?? []) {
  if (!existsSync(join(root, s.path, 'SKILL.md'))) fail(`skills.json: ${s.path}/SKILL.md does not exist`)
}
for (const m of ['.claude-plugin/plugin.json', '.claude-plugin/marketplace.json', '.cursor-plugin/plugin.json', 'package.json']) readJson(m)
const claudePlugin = readJson('.claude-plugin/plugin.json')
for (const s of claudePlugin?.skills ?? []) {
  if (!existsSync(join(root, s, 'SKILL.md'))) fail(`.claude-plugin/plugin.json: ${s}/SKILL.md does not exist`)
}

// 3. Copy rule: no em/en dashes, no " - " used as a dash, in markdown or manifests.
const DASH = /[—–]|\S - /
for (const f of files.filter((f) => /\.(md|json)$/.test(f) && !f.endsWith('LICENSE'))) {
  readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
    if (DASH.test(line)) fail(`${rel(f)}:${i + 1}: dash in copy: ${line.trim().slice(0, 80)}`)
  })
}

// 4. No real-looking API keys committed.
for (const f of files.filter((f) => /\.(md|json|mjs)$/.test(f))) {
  const t = readFileSync(f, 'utf8')
  if (/pk_[A-Za-z0-9_-]{20,}/.test(t)) fail(`${rel(f)}: contains something that looks like a real pk_ key`)
}

if (errors.length) {
  console.error(errors.map((e) => `FAIL ${e}`).join('\n'))
  process.exit(1)
}
console.log(`OK: ${skillFiles.length} skill(s), ${files.length} files checked`)
