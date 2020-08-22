export default function toConcerns (rawConcerns) {
  return rawConcerns.map(({ concern, classes, lines: rawLines }) => {
    const lines = rawLines
      .map(rawLine => {
        if (typeof rawLine === 'number') {
          return [rawLine]
        } else {
          const [start, end] = rawLine.split('-').map(rawPoint => Number(rawPoint.trim()))

          let lines = []
          for (let i = start; i < end + 1; i++) {
            lines.push(i)
          }

          return lines
        }
      })
      .reduce((lines, ensuredArray) => [...lines, ...ensuredArray], [])

      return { concern, classes, lines }
  })
}
