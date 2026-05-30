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

  flame_test: {
    id: 'flame_test',
    title: 'Flame Test Analysis',
    benchComponent: 'FlameTestBench',
    equipment: ['Bunsen Burner', 'Nichrome Wire', 'Copper (Cu)', 'Strontium (Sr)', 'Sodium (Na)'],
    steps: [
      { id: 'step_1', instruction: 'Turn on the Bunsen burner to establish a base blue flame.', targetElement: 'burner_valve', animation: 'ignite' },
      { id: 'step_2', instruction: 'Dip the nichrome wire into the Copper (Cu) sample.', targetElement: 'sample_cu', animation: 'dip' },
      { id: 'step_3', instruction: 'Place the coated wire into the flame and observe the color.', targetElement: 'flame', animation: 'burn_cu' },
      { id: 'step_4', instruction: 'Clean the wire and dip it into the Strontium (Sr) sample.', targetElement: 'sample_sr', animation: 'dip' },
      { id: 'step_5', instruction: 'Place the wire into the flame and observe the color.', targetElement: 'flame', animation: 'burn_sr' }
    ],
    computeState: (actionState) => {
      return {
        isBurnerOn: actionState >= 1,
        // Keep the sample active while dipping AND burning
        activeSample: (actionState === 2 || actionState === 3) ? 'Copper (Cu)' : (actionState === 4 || actionState === 5) ? 'Strontium (Sr)' : null,
        flameColor: actionState === 3 ? 'green' : actionState === 5 ? 'red' : actionState >= 1 ? 'blue' : 'none',
        isComplete: actionState >= 5
      };
    }
  },
  crystal_growth: {
    id: 'crystal_growth',
    title: 'Crystal Growth (Copper Sulfate)',
    benchComponent: 'CrystalGrowthBench',
    equipment: ['Hot Plate', 'Beaker 250mL', 'CuSO₄ Powder', 'Stirring Rod', 'Seed Crystal'],
    steps: [
      { id: 'step_1', instruction: 'Turn on the hot plate to heat the water to 80°C.', targetElement: 'hot_plate', animation: 'heat' },
      { id: 'step_2', instruction: 'Add Copper(II) Sulfate powder to the heated water.', targetElement: 'solute_jar', animation: 'pour' },
      { id: 'step_3', instruction: 'Stir the solution until the powder is fully dissolved.', targetElement: 'stirring_rod', animation: 'stir' },
      { id: 'step_4', instruction: 'Suspend the seed crystal string into the saturated solution.', targetElement: 'seed_string', animation: 'suspend' },
      { id: 'step_5', instruction: 'Turn off the heat and let the solution cool to grow the crystal.', targetElement: 'hot_plate', animation: 'cool_grow' }
    ],
    computeState: (actionState) => {
      // actionState tracks the number of completed steps
      return {
        isHeaterOn: actionState >= 1 && actionState < 5,
        temperature: actionState >= 1 && actionState < 5 ? 80 : 25, // Heats up, then cools down
        waterColor: actionState >= 2 ? 'rgba(37, 99, 235, 0.7)' : 'rgba(255, 255, 255, 0.2)', // Turns blue when powder added
        saturation: actionState >= 3 ? 'Saturated' : actionState >= 2 ? 'Mixing' : 'None',
        crystalState: actionState >= 5 ? 'grown' : actionState >= 4 ? 'seed' : 'none',
        isComplete: actionState >= 5
      };
    }
  }
};


