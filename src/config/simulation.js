export const simulationConfigs = {
  acid_base_titration: {
    title: "Acid-Base Titration",
    equipment: ["Burette", "Beaker", "pH Meter", "Indicator (Phenolphthalein)"],
    initialVolume: 50,        // mL of acid in beaker
    acidConcentration: 0.1,   // mol/L
    baseConcentration: 0.1,   // mol/L
    initialpH: 2.5,
    targetpH: 7.0,
    indicator: {
      name: "Phenolphthalein",
      colorBelow: "colorless",
      colorAbove: "pink",
      transitionpH: 8.2
    },
    steps: [
      "Fill the burette with 0.1 M NaOH.",
      "Add 2–3 drops of phenolphthalein to the acid in the beaker.",
      "Slowly add NaOH from the burette while swirling the beaker.",
      "Stop when the solution turns pale pink and stays pink for 30 seconds.",
      "Record the volume of NaOH used."
    ],
    // simulation logic: given addedVolume (mL), compute new pH and indicator color
    computeState: (addedVolume, config) => {
      // Simple linear interpolation from initialpH to targetpH when full volume is added
      // Total volume needed is calculated from stoichiometry (here hardcoded to 50 mL for demo)
      const totalNeeded = 50; // mL of base to reach equivalence
      let pH = config.initialpH + (addedVolume / totalNeeded) * (config.targetpH - config.initialpH);
      pH = Math.min(Math.max(pH, 0), 14);
      let indicatorColor = config.indicator.colorBelow;
      if (pH >= config.indicator.transitionpH) indicatorColor = config.indicator.colorAbove;
      return { pH, indicatorColor, isComplete: Math.abs(pH - config.targetpH) < 0.2 };
    }
  },
  // add more experiments here later
};