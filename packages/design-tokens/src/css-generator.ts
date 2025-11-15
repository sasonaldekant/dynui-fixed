import { tokens } from './token-map'

type TokenPrimitive = string | number | boolean
type TokenValue = TokenPrimitive | readonly TokenPrimitive[] | TokenGroup

interface TokenGroup {
  [key: string]: TokenValue
}

function sanitizeTokenKey(key: string): string {
  return key
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-') // Replace periods and other invalid chars with dashes
    .replace(/-+/g, '-')  // Collapse multiple dashes
    .replace(/^-|-$/g, '') // Remove leading/trailing dashes
}

function normalizeValue(value: TokenPrimitive | readonly TokenPrimitive[]): string {
  if (Array.isArray(value)) {
    return value.join(', ')
  }

  return String(value)
}

function toCSSVars(record: TokenGroup, prefix: string[] = []): string[] {
  return Object.entries(record).flatMap(([key, value]) => {
    const sanitizedKey = sanitizeTokenKey(key)
    const nextPrefix = [...prefix, sanitizedKey]

    if (Array.isArray(value)) {
      const cssVar = `--dyn-${nextPrefix.join('-')}`
      return `${cssVar}: ${normalizeValue(value)};`
    }

    if (value !== null && typeof value === 'object') {
      return toCSSVars(value as TokenGroup, nextPrefix)
    }

    const cssVar = `--dyn-${nextPrefix.join('-')}`
    return `${cssVar}: ${normalizeValue(value as TokenPrimitive)};`
  })
}

const prefixMap: Record<string, string> = {
  colors: 'color',
  spacing: 'spacing',
  typography: 'typography',
  radii: 'radius',
  shadows: 'shadow'
}

/**
 * Builds a CSS string containing custom properties for every token.
 * Consumers can pipe this into a CSS writer during build pipelines.
 */
export function buildDesignTokenCSS(): string {
  const lines = Object.entries(tokens).flatMap(([sectionKey, sectionValue]) => {
    const mappedPrefix = prefixMap[sectionKey] ?? sectionKey
    return toCSSVars(sectionValue as TokenGroup, [mappedPrefix])
  })

  return [':root {', ...lines.map((line) => `  ${line}`), '}'].join('\n')
}