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
  },

  electrolysis_of_water: {
    id: 'electrolysis_of_water',
    title: 'Electrolysis of Water',
    benchComponent: 'ElectrolysisBench',
    equipment: ['9V Battery', 'Beaker (H₂O)', 'Dilute H₂SO₄', 'Graphite Electrodes', 'Test Tubes', 'Wires'],
    steps: [
      { id: 'step_1', instruction: 'Add a few drops of dilute sulfuric acid (electrolyte) to the water.', targetElement: 'electrolyte', animation: 'drop' },
      { id: 'step_2', instruction: 'Place inverted water-filled test tubes over the electrodes.', targetElement: 'test_tubes', animation: 'place' },
      { id: 'step_3', instruction: 'Connect the wires from the electrodes to the 9V battery.', targetElement: 'wires', animation: 'connect' },
      { id: 'step_4', instruction: 'Turn on the power supply and observe the gas collection.', targetElement: 'power_switch', animation: 'electrolyze' }
    ],
    computeState: (actionState) => {
      return {
        hasElectrolyte: actionState >= 1,
        tubesPlaced: actionState >= 2,
        wiresConnected: actionState >= 3,
        powerOn: actionState >= 4,
        // H2 is produced at the Cathode, O2 at the Anode (2:1 ratio)
        h2Volume: actionState >= 4 ? 10.0 : 0.0, 
        o2Volume: actionState >= 4 ? 5.0 : 0.0,
        isComplete: actionState >= 4
      };
    }
  },

  osmosis_in_cells: {
    id: 'osmosis_in_cells',
    title: 'Osmosis in Cells',
    benchComponent: 'OsmosisBench',
    equipment: ['Microscope', 'Red Blood Cells', '0.9% NaCl (Isotonic)', 'Distilled H₂O (Hypotonic)', '10% NaCl (Hypertonic)'],
    steps: [
      { id: 'step_1', instruction: 'Place the red blood cell sample onto the microscope slide.', targetElement: 'slide', animation: 'place' },
      { id: 'step_2', instruction: 'Add Isotonic Saline (0.9% NaCl). Observe the normal biconcave shape.', targetElement: 'iso_drop', animation: 'drop' },
      { id: 'step_3', instruction: 'Flush with Distilled Water (Hypotonic). Water rushes IN, swelling the cells.', targetElement: 'hypo_drop', animation: 'drop' },
      { id: 'step_4', instruction: 'Flush with 10% NaCl (Hypertonic). Water rushes OUT, shriveling the cells (crenation).', targetElement: 'hyper_drop', animation: 'drop' }
    ],
    computeState: (actionState) => {
      return {
        hasSample: actionState >= 1,
        solutionType: actionState >= 4 ? 'Hypertonic' : actionState >= 3 ? 'Hypotonic' : actionState >= 2 ? 'Isotonic' : 'None',
        waterMovement: actionState >= 4 ? 'Net flow OUT' : actionState >= 3 ? 'Net flow IN' : actionState >= 2 ? 'Equilibrium' : '-',
        cellState: actionState >= 4 ? 'shriveled' : actionState >= 3 ? 'swollen' : actionState >= 1 ? 'normal' : 'invisible',
        isComplete: actionState >= 4
      };
    }
  },

  paper_chromatography: {
    id: 'paper_chromatography',
    title: 'Paper Chromatography',
    benchComponent: 'ChromatographyBench',
    equipment: ['Chromatography Paper', 'Beaker 250mL', 'Solvent', 'Black Ink', 'Pencil', 'Watch Glass'],
    steps: [
      { id: 'step_1', instruction: 'Draw a horizontal baseline near the bottom of the paper using a pencil.', targetElement: 'pencil', animation: 'draw' },
      { id: 'step_2', instruction: 'Spot the black ink mixture onto the center of the baseline.', targetElement: 'ink_dropper', animation: 'spot' },
      { id: 'step_3', instruction: 'Suspend the paper in the beaker so the solvent sits below the baseline.', targetElement: 'paper', animation: 'suspend' },
      { id: 'step_4', instruction: 'Cover the beaker with a watch glass and allow the solvent to develop.', targetElement: 'watch_glass', animation: 'develop' }
    ],
    computeState: (actionState) => {
      return {
        hasLine: actionState >= 1,
        hasSpot: actionState >= 2,
        isSuspended: actionState >= 3,
        isCovered: actionState >= 4,
        developmentPhase: actionState >= 4 ? 'Complete' : actionState >= 3 ? 'Submerged' : 'Preparation',
        isComplete: actionState >= 4
      };
    }
  },

  ph_scale_measurement: {
    id: 'ph_scale_measurement',
    title: 'pH Scale Measurement',
    benchComponent: 'PHScaleBench',
    equipment: ['Universal Indicator Paper', 'Watch Glasses', 'Lemon Juice (Acid)', 'Distilled H₂O (Neutral)', 'Ammonia (Base)', 'pH Color Chart'],
    steps: [
      { id: 'step_1', instruction: 'Place Universal Indicator paper strips onto the three watch glasses.', targetElement: 'paper_stack', animation: 'place' },
      { id: 'step_2', instruction: 'Add a drop of Lemon Juice to the first strip. Observe the acidic color change (Red).', targetElement: 'lemon_drop', animation: 'drop' },
      { id: 'step_3', instruction: 'Add Distilled Water to the second strip. Observe the neutral color (Green).', targetElement: 'water_drop', animation: 'drop' },
      { id: 'step_4', instruction: 'Add Ammonia to the third strip. Observe the alkaline color change (Dark Blue).', targetElement: 'ammonia_drop', animation: 'drop' }
    ],
    computeState: (actionState) => {
      return {
        papersPlaced: actionState >= 1,
        lemonTested: actionState >= 2,
        waterTested: actionState >= 3,
        ammoniaTested: actionState >= 4,
        activePH: actionState >= 4 ? 11 : actionState >= 3 ? 7 : actionState >= 2 ? 2.5 : null,
        activeClassification: actionState >= 4 ? 'Strong Base' : actionState >= 3 ? 'Neutral' : actionState >= 2 ? 'Strong Acid' : '-',
        isComplete: actionState >= 4
      };
    }
  },

  titration_curves: {
    id: 'titration_curves',
    title: 'Titration Curves',
    benchComponent: 'TitrationCurveBench',
    equipment: ['Burette (0.1M NaOH)', 'Beaker (25mL 0.1M HCl)', 'pH Probe', 'Magnetic Stirrer', 'Data Logger'],
    mlPerClick: 5,
    totalNeeded: 50,
    steps: [
      { id: 'step_1', instruction: 'Place the beaker of 0.1M HCl onto the magnetic stirrer.', targetElement: 'beaker', animation: 'place' },
      { id: 'step_2', instruction: 'Lower the digital pH probe into the acid solution.', targetElement: 'probe', animation: 'lower' },
      { id: 'step_3', instruction: 'Open the burette to add NaOH in 5mL increments. Observe the plotted curve.', targetElement: 'burette', animation: 'pour', repeatable: true }
    ],
    // Custom compute state that calculates logarithmic pH and tracks the volume
    computeState: (volume, config, stepCount = 0) => {
      let pH = 1.0;
      if (volume < 25) {
        pH = -Math.log10(((25 * 0.1) - (volume * 0.1)) / (25 + volume));
      } else if (volume === 25) {
        pH = 7.0;
      } else {
        const pOH = -Math.log10(((volume * 0.1) - (25 * 0.1)) / (25 + volume));
        pH = 14 - pOH;
      }
      
      const safePH = Math.max(0, Math.min(14, pH));

      let curvePhase = 'Initial Acid';
      if (volume > 5 && volume < 25) curvePhase = 'Gradual Rise';
      else if (volume === 25) curvePhase = 'Equivalence Point';
      else if (volume > 25) curvePhase = 'Alkaline Plateau';
      
      return {
        pH: safePH,
        volumeAdded: volume,
        beakerPlaced: stepCount >= 1,
        probeLowered: stepCount >= 2,
        curvePhase: curvePhase,
        isComplete: volume >= 50
      };
    }
  }
};


