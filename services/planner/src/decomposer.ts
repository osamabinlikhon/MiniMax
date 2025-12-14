export function decomposeGoal(goal: string): string[] {
  // Very small heuristic-based decomposer for prototyping.
  // Splits the goal into sentences and produces 3-8 subgoals if possible.
  const sentences = goal
    .split(/[\.\n\?\!]+/)
    .map((s) => s.trim())
    .filter(Boolean)

  if (sentences.length <= 1) {
    // fallback: split by commas or reasonable chunk size
    const parts = goal.split(',').map((p) => p.trim()).filter(Boolean)
    if (parts.length > 1) return parts
    // else create heuristic steps
    const words = goal.split(' ')
    const chunkSize = Math.max(5, Math.floor(words.length / 3))
    const chunks: string[] = []
    for (let i = 0; i < words.length; i += chunkSize) {
      chunks.push(words.slice(i, i + chunkSize).join(' '))
    }
    return chunks
  }

  // Limit to 8 steps
  return sentences.slice(0, 8)
}
