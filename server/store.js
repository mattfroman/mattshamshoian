import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { config } from './config.js'

async function readRuns() {
  try {
    const raw = await readFile(config.persistence.file, 'utf8')
    return JSON.parse(raw)
  } catch (error) {
    if (error.code === 'ENOENT') return []
    throw error
  }
}

export async function saveCouncilRun(run) {
  const runs = await readRuns()
  runs.unshift(run)
  const trimmedRuns = runs.slice(0, 100)

  await mkdir(dirname(config.persistence.file), { recursive: true })
  await writeFile(config.persistence.file, `${JSON.stringify(trimmedRuns, null, 2)}\n`, 'utf8')
}

export async function listCouncilRuns(limit = 20) {
  const runs = await readRuns()
  return runs.slice(0, limit)
}
