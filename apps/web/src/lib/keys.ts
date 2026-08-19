import { randomBytes } from 'crypto'

/** proj_<16 hex chars> — e.g. proj_a3f7b2c1d8e94f2a */
export function generateProjectId(): string {
  return `proj_${randomBytes(8).toString('hex')}`
}

/** pk_live_<40 hex chars> */
export function generatePublicKey(): string {
  return `pk_live_${randomBytes(20).toString('hex')}`
}

/** sk_live_<40 hex chars> */
export function generateServerKey(): string {
  return `sk_live_${randomBytes(20).toString('hex')}`
}
