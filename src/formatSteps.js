const coord = item => `${String.fromCharCode(0x41 + item.y)}${item.x + 1}`;

const formatSteps = steps => {
  return steps
    ? steps
        .map((step, i) => {
          const title = `${i + 1}: ${step.type}: `;
          let data = "";
          if (step.solved) {
            data += step.solved.map(
              solved =>
                `${solved.value || solved.candidates[0]} at ${coord(solved)}`
            );
          } else if (step.tuple) {
            data += `${step.tuple} `;
          }
          if (step.eliminations) {
            data += `because of ${step.cause
              .map(a => `${coord(a)}`)
              .join(", ")} eliminate ${step.eliminations
              .map(
                elimination =>
                  `${JSON.stringify(
                    elimination.eliminatedCandidates
                  )} at ${coord(elimination)}`
              )
              .join(", ")}`;
          }
          /* `${step.cell.value} at (${step.cell.x},${
              step.cell.y
            })` */
          return title + data;
        })
        .join("\n")
    : "";
};

export default formatSteps;
