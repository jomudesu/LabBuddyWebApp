export const simulationConfigs = {
  acid_base_titration: {
    title: "Acid-Base Titration",
    benchComponent: "TitrationBench",
    equipment: ["Burette 50mL", "Beaker 250mL", "pH Meter", "Indicator (Phenolphthalein)"],
    initialVolume: 50,       // mL of HCl in beaker
    acidConcentration: 0.1,  // mol/L
    baseConcentration: 0.1,  // mol/L
    initialpH: 2.5,
    targetpH: 7.0,
    totalNeeded: 50,         // mL of NaOH to reach equivalence point
    mlPerClick: 5,           // mL added per burette click during add_base step

    indicator: {
      name: "Phenolphthalein",
      colorBelow: "colorless",
      colorAbove: "pink",
      transitionpH: 8.2,
    },

    steps: [
      {
        id: 'fill_burette',
        targetElement: 'burette',
        animation: 'fill',
        instruction: 'Click the burette to fill it with 0.1 M NaOH solution.',
        repeatable: false,
      },
      {
        id: 'add_indicator',
        targetElement: 'indicator',
        animation: 'drop',
        instruction: 'Click the indicator bottle to add 2–3 drops of phenolphthalein.',
        repeatable: false,
      },
      {
        id: 'add_base',
        targetElement: 'burette',
        animation: 'pour',
        instruction: 'Click the burette to add NaOH drop by drop until the colour changes to pink.',
        repeatable: true,
      },
      {
        id: 'record_volume',
        targetElement: 'burette',
        animation: 'none',
        instruction: 'Click the burette scale to record the final volume reading.',
        repeatable: false,
      },
    ],

    /**
     * Single source of truth for all simulation-derived state.
     * @param {number} addedVolume - mL of NaOH added so far
     * @param {object} config     - this config object
     * @returns {{ pH, indicatorColor, isComplete, buretteFill, beakerFill }}
     */
    computeState: (addedVolume, config) => {
      const { totalNeeded, initialpH, targetpH, indicator } = config;

      // pH model:
      //   0 → totalNeeded mL: linear rise from initialpH to targetpH (equivalence)
      //   past equivalence   : steep jump into basic range (reflects real titration curve)
      let pH;
      if (addedVolume <= totalNeeded) {
        pH = initialpH + (addedVolume / totalNeeded) * (targetpH - initialpH);
      } else {
        // Past equivalence – excess base drives pH steeply upward
        const excessFraction = (addedVolume - totalNeeded) / (totalNeeded * 0.2);
        pH = targetpH + excessFraction * 4;
      }
      pH = Math.min(Math.max(pH, 0), 14);

      // Indicator flips at transitionpH
      const indicatorColor =
        pH >= indicator.transitionpH ? indicator.colorAbove : indicator.colorBelow;

      // Burette drains from 80 % → 0 % as addedVolume goes 0 → totalNeeded
      const buretteFill = Math.max(0, 80 - (addedVolume / totalNeeded) * 80);

      // Beaker liquid rises from 40 % → 68 % as NaOH is added
      const beakerFill = Math.min(68, 40 + (addedVolume / totalNeeded) * 28);

      // Experiment step is complete once indicator has changed colour
      const isComplete = indicatorColor === indicator.colorAbove;

      return { pH, indicatorColor, isComplete, buretteFill, beakerFill };
    },
  },

  // ── Add more experiment configs here ──────────────────────────────────────
};