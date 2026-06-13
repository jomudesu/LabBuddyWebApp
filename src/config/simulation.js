export const simulationConfigs = {
  acid_base_titration: {
    id: 'acid_base_titration',
    title: "Acid-Base Titration",
    benchComponent: "TitrationBench",
    difficulty: "Beginner", 
    
    introduction: "Welcome to the Acid-Base Titration experiment. In this module, you will determine the unknown concentration of a solution by carefully adding a titrant (NaOH) until the neutralization point is reached. Pay close attention to the pH telemetry and the color of your indicator.",
    
    equipment: ["0.1M NaOH Solution", "Burette 50mL", "Beaker 250mL", "pH Meter", "Indicator (Phenolphthalein)"],
    
    equipmentDetails: {
      "0.1M NaOH Solution": "A strong base of known concentration used as the titrant to neutralize the acidic analyte.",
      "Burette 50mL": "A graduated glass tube with a tap at one end, used for delivering highly accurate volumes of a liquid.",
      "Beaker 250mL": "A cylindrical glass container for holding, mixing, and heating liquids.",
      "pH Meter": "An electronic telemetry device used to accurately measure the acidity or alkalinity of the solution in real-time.",
      "Indicator (Phenolphthalein)": "A chemical compound that remains colorless in acidic solutions and turns pink in basic solutions."
    },

    initialVolume: 50,       
    acidConcentration: 0.1,  
    baseConcentration: 0.1,  
    initialpH: 2.5,
    targetpH: 7.0,
    totalNeeded: 50,         
    mlPerClick: 5,           

    indicator: {
      name: "Phenolphthalein",
      colorBelow: "colorless",
      colorAbove: "pink",
      transitionpH: 8.2,
    },

    steps: [
      {
        id: 'fill_burette',
        targetElement: 'naoh_bottle',
        animation: 'fill',
        instruction: 'Click the 0.1M NaOH bottle to fill the burette.',
        repeatable: false,
        explanation: "Filling the burette with a known concentration of Sodium Hydroxide (NaOH) prepares the system. This allows us to measure exactly how much base is needed to neutralize the acid."
      },
      {
        id: 'add_indicator',
        targetElement: 'indicator',
        animation: 'drop',
        instruction: 'Click the indicator bottle to add 2–3 drops of phenolphthalein.',
        repeatable: false,
        explanation: "Phenolphthalein is added as a visual marker. Because acid and base solutions are mostly clear, the indicator will turn pink the moment the solution crosses into a basic pH, visually signaling the endpoint."
      },
      {
        id: 'add_base',
        targetElement: 'burette',
        animation: 'pour',
        instruction: 'Click the burette to add NaOH drop by drop until the colour changes to pink.',
        repeatable: true,
        explanation: "As the NaOH drops into the HCl, a neutralization reaction occurs forming water and salt (NaCl). The pH slowly rises. Watch the curve closely as it approaches the equivalence point."
      },
      {
        id: 'record_volume',
        targetElement: 'burette',
        animation: 'none',
        instruction: 'Click the burette scale to record the final volume reading.',
        repeatable: false,
        explanation: "The solution has turned pink, meaning excess base is now present. Recording this exact volume allows us to calculate the unknown concentration of the original acid."
      },
    ],

    conclusion: "Experiment Complete! You have successfully reached the equivalence point where the moles of acid equal the moles of base. The permanent pink color of the phenolphthalein confirms the solution has passed pH 7 into the basic range, successfully completing the titration.",

    computeState: (addedVolume, config) => {
      const { totalNeeded, initialpH, targetpH, indicator } = config;
      let pH;
      if (addedVolume <= totalNeeded) {
        pH = initialpH + (addedVolume / totalNeeded) * (targetpH - initialpH);
      } else {
        const excessFraction = (addedVolume - totalNeeded) / (totalNeeded * 0.2);
        pH = targetpH + excessFraction * 4;
      }
      pH = Math.min(Math.max(pH, 0), 14);
      const indicatorColor = pH >= indicator.transitionpH ? indicator.colorAbove : indicator.colorBelow;
      const buretteFill = Math.max(0, 80 - (addedVolume / totalNeeded) * 80);
      const beakerFill = Math.min(68, 40 + (addedVolume / totalNeeded) * 28);
      const isComplete = indicatorColor === indicator.colorAbove;

      return { pH, indicatorColor, isComplete, buretteFill, beakerFill };
    },
  },

  flame_test: {
    id: 'flame_test',
    title: 'Flame Test Analysis',
    benchComponent: 'FlameTestBench',
    difficulty: 'Beginner', 
    
    introduction: "Welcome to the Flame Test Analysis simulation. In this module, you will observe the emission spectra of various metal ions. When heated, electrons in these atoms are excited and then fall back to lower energy levels, releasing photons of specific colors.",
    
    equipment: ['Bunsen Burner', 'Nichrome Wire', 'Copper (Cu)', 'Strontium (Sr)', 'Sodium (Na)'],
    
    equipmentDetails: {
      "Bunsen Burner": "A common laboratory gas burner that produces a single open gas flame, used for heating, sterilization, and combustion.",
      "Nichrome Wire": "An alloy wire with a high melting point, ideal for holding chemical samples in a hot flame without interfering with the flame's color.",
      "Copper (Cu)": "A transition metal. Its salts characteristically burn with a vibrant green or blue-green flame.",
      "Strontium (Sr)": "An alkaline earth metal known for producing a brilliant, deep red or crimson flame.",
      "Sodium (Na)": "An alkali metal that produces an intense, bright yellow-orange flame when heated."
    },

    steps: [
      { 
        id: 'step_1', 
        instruction: 'Turn the gas valve to ignite the Bunsen burner.', 
        targetElement: 'burner_valve', 
        animation: 'ignite',
        explanation: "A clean blue flame indicates complete combustion of the gas. This is crucial because a yellow or orange safety flame would mask the delicate colors of our chemical samples."
      },
      { 
        id: 'step_2', 
        instruction: 'Dip the nichrome wire into the Copper (Cu) sample.', 
        targetElement: 'sample_cu', 
        animation: 'dip',
        explanation: "By dipping the nichrome wire into the solution, we collect a small amount of Copper ions (Cu²⁺) on the loop, ready for thermal excitation."
      },
      { 
        id: 'step_3', 
        instruction: 'Place the coated wire into the flame and observe the color.', 
        targetElement: 'flame', 
        animation: 'burn_cu',
        explanation: "The thermal energy excites the copper electrons to a higher orbital. As they immediately fall back down, they release a photon corresponding to a green wavelength of light."
      },
      { 
        id: 'step_4', 
        instruction: 'Clean the wire and dip it into the Strontium (Sr) sample.', 
        targetElement: 'sample_sr', 
        animation: 'dip',
        explanation: "Before testing a new sample, the wire must be thoroughly cleaned (often in hydrochloric acid) so the previous copper emission does not contaminate our next observation."
      },
      { 
        id: 'step_5', 
        instruction: 'Place the wire into the flame and observe the color.', 
        targetElement: 'flame', 
        animation: 'burn_sr',
        explanation: "The heat excites the Strontium electrons. The energy gap between their excited state and ground state is different from copper, so they emit a photon corresponding to a bright red wavelength."
      }
    ],

    conclusion: "Experiment Complete! You have successfully observed how different metal ions produce distinct flame colors. This principle—atomic emission spectroscopy—is fundamentally how we identify unknown elements in chemistry and astronomy, and it's also the secret behind the vibrant colors in fireworks.",

    computeState: (actionState) => {
      return {
        isBurnerOn: actionState >= 1,
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
    difficulty: 'Intermediate', 
    
    introduction: "Welcome to the Crystal Growth simulation. In this module, you will explore how temperature affects solubility by creating a supersaturated solution of Copper(II) Sulfate (CuSO₄). By carefully cooling the solution, you will observe the fascinating process of crystallization around a seed.",
    
    equipment: ['Hot Plate', 'Beaker 250mL', 'CuSO₄ Powder', 'Stirring Rod', 'Seed Crystal'],
    
    equipmentDetails: {
      "Hot Plate": "An adjustable electronic heating source used to safely and uniformly heat liquids.",
      "Beaker 250mL": "A glass container holding distilled water, acting as the solvent for this experiment.",
      "CuSO₄ Powder": "Copper(II) Sulfate, a bright blue ionic compound that acts as our solute.",
      "Stirring Rod": "A solid glass rod used to agitate the mixture, rapidly increasing the rate of dissolution.",
      "Seed Crystal": "A small, pre-formed crystal of CuSO₄ suspended on a string. It provides a structured 'nucleation site' for new growth."
    },

    steps: [
      { 
        id: 'step_1', 
        instruction: 'Turn on the hot plate to heat the water to 80°C.', 
        targetElement: 'hot_plate', 
        animation: 'heat',
        explanation: "Heating the water increases the kinetic energy of the solvent molecules. This increased energy allows significantly more solute to dissolve than would be possible at room temperature."
      },
      { 
        id: 'step_2', 
        instruction: 'Add Copper(II) Sulfate powder to the heated water.', 
        targetElement: 'solute_jar', 
        animation: 'pour',
        explanation: "Adding the Copper(II) Sulfate introduces the solute to the hot solvent. Notice how the water immediately begins turning a deep blue color as the ionic bonds break apart."
      },
      { 
        id: 'step_3', 
        instruction: 'Stir the solution until the powder is fully dissolved.', 
        targetElement: 'stirring_rod', 
        animation: 'stir',
        explanation: "Stirring the mixture ensures that the solute is fully dispersed. Because the water is hot, we can dissolve a large amount of powder, creating a highly saturated solution."
      },
      { 
        id: 'step_4', 
        instruction: 'Suspend the seed crystal string into the saturated solution.', 
        targetElement: 'seed_string', 
        animation: 'suspend',
        explanation: "The seed crystal acts as a nucleation point. As the solution becomes supersaturated, the excess dissolved molecules need a physical surface to latch onto to begin forming a solid structure."
      },
      { 
        id: 'step_5', 
        instruction: 'Turn off the heat and let the solution cool to grow the crystal.', 
        targetElement: 'hot_plate', 
        animation: 'cool_grow',
        explanation: "As the heat is removed, the temperature drops. Cool water cannot hold as much dissolved solute as hot water. The excess CuSO₄ is forced out of the solution and precisely deposits onto the seed, growing a massive crystal!"
      }
    ],

    conclusion: "Experiment Complete! You have successfully grown a massive Copper(II) Sulfate crystal. This demonstrates the core chemical principles of temperature-dependent solubility, supersaturation, and nucleation. Remember: in real life, the slower a solution is allowed to cool, the larger and more flawless the resulting crystal will be.",

    computeState: (actionState) => {
      return {
        isHeaterOn: actionState >= 1 && actionState < 5,
        temperature: actionState >= 1 && actionState < 5 ? 80 : 25, 
        waterColor: actionState >= 2 ? 'rgba(37, 99, 235, 0.7)' : 'rgba(255, 255, 255, 0.2)', 
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
    difficulty: 'Advanced', 
    
    introduction: "Welcome to the Electrolysis of Water simulation. In this experiment, you will use electrical energy to drive a non-spontaneous chemical reaction, splitting liquid water into hydrogen and oxygen gases. Pay close attention to the volume of gas collected at each electrode.",
    
    equipment: ['9V Battery', 'Beaker (H₂O)', 'Dilute H₂SO₄', 'Graphite Electrodes', 'Test Tubes', 'Wires'],
    
    equipmentDetails: {
      "9V Battery": "Provides the direct current (DC) electrical energy required to force the water molecules to split apart.",
      "Beaker (H₂O)": "Contains the distilled water which serves as the primary reactant for our decomposition reaction.",
      "Dilute H₂SO₄": "Sulfuric acid acts as an electrolyte. Pure water is a poor conductor of electricity, so the acid provides mobile ions to close the circuit.",
      "Graphite Electrodes": "Conductive carbon rods that transfer electrons into and out of the solution without chemically reacting themselves.",
      "Test Tubes": "Inverted glass tubes used to capture and measure the exact volume of the produced gases.",
      "Wires": "Conductive copper wires that transport electrons from the battery terminals to the graphite electrodes."
    },

    steps: [
      { 
        id: 'step_1', 
        instruction: 'Add a few drops of dilute sulfuric acid (electrolyte) to the water.', 
        targetElement: 'electrolyte', 
        animation: 'drop',
        explanation: "Distilled water lacks free ions and conducts electricity very poorly. Adding a few drops of sulfuric acid provides H⁺ and SO₄²⁻ ions, dramatically increasing the water's electrical conductivity."
      },
      { 
        id: 'step_2', 
        instruction: 'Place inverted water-filled test tubes over the electrodes.', 
        targetElement: 'test_tubes', 
        animation: 'place',
        explanation: "The inverted test tubes are initially filled with water. As gases are produced at the electrodes, they will bubble up and displace the water downward, allowing us to capture and measure them."
      },
      { 
        id: 'step_3', 
        instruction: 'Connect the wires from the electrodes to the 9V battery.', 
        targetElement: 'wires', 
        animation: 'connect',
        explanation: "Connecting the wires establishes a complete circuit. The electrode connected to the negative terminal becomes the cathode (where reduction occurs), and the positive terminal becomes the anode (where oxidation occurs)."
      },
      { 
        id: 'step_4', 
        instruction: 'Turn on the power supply and observe the gas collection.', 
        targetElement: 'power_switch', 
        animation: 'electrolyze',
        explanation: "When power flows, water is reduced at the cathode to form Hydrogen gas (H₂), and oxidized at the anode to form Oxygen gas (O₂). Notice that the volume of Hydrogen produced is exactly twice the volume of Oxygen!"
      }
    ],

    conclusion: "Experiment Complete! You have successfully split water into its constituent elements using electrical energy. The 2:1 ratio of hydrogen to oxygen gas produced visually proves the stoichiometry of the water molecule (H₂O). The electrical energy was successfully converted into chemical potential energy stored in the bonds of the diatomic gases.",

    computeState: (actionState) => {
      return {
        hasElectrolyte: actionState >= 1,
        tubesPlaced: actionState >= 2,
        wiresConnected: actionState >= 3,
        powerOn: actionState >= 4,
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
    difficulty: 'Intermediate',
    
    introduction: "Welcome to the Osmosis in Cells simulation. In this module, you will observe the effects of different solute concentrations on mammalian red blood cells. By applying isotonic, hypotonic, and hypertonic solutions, you will see firsthand how water moves across a selectively permeable membrane to achieve equilibrium.",
    
    equipment: ['Microscope', 'Red Blood Cells', '0.9% NaCl (Isotonic)', 'Distilled H₂O (Hypotonic)', '10% NaCl (Hypertonic)'],
    
    equipmentDetails: {
      "Microscope": "A high-powered optical instrument used to observe the microscopic structural changes in the red blood cells.",
      "Red Blood Cells": "Erythrocytes used as our biological model. Their lack of a rigid cell wall makes them highly susceptible to osmotic pressure.",
      "0.9% NaCl (Isotonic)": "A saline solution with the exact same solute concentration as the intracellular fluid of a healthy red blood cell.",
      "Distilled H₂O (Hypotonic)": "Pure water containing zero solutes. It has a significantly lower solute concentration than the inside of the cell.",
      "10% NaCl (Hypertonic)": "A highly concentrated salt solution. It has a significantly higher solute concentration than the intracellular fluid."
    },

    steps: [
      { 
        id: 'step_1', 
        instruction: 'Place the red blood cell sample onto the microscope slide.', 
        targetElement: 'slide', 
        animation: 'place',
        explanation: "Placing the sample on the microscope stage allows us to establish a baseline observation. Currently, the red blood cells exhibit their normal, healthy biconcave disc shape."
      },
      { 
        id: 'step_2', 
        instruction: 'Add Isotonic Saline (0.9% NaCl). Observe the normal biconcave shape.', 
        targetElement: 'iso_drop', 
        animation: 'drop',
        explanation: "Because the 0.9% NaCl solution has the same solute concentration as the cell's interior, water moves in and out of the cell at an equal rate. The cell maintains its normal shape due to this dynamic equilibrium."
      },
      { 
        id: 'step_3', 
        instruction: 'Flush with Distilled Water (Hypotonic). Water rushes IN, swelling the cells.', 
        targetElement: 'hypo_drop', 
        animation: 'drop',
        explanation: "Distilled water has essentially zero solutes. To balance the concentration, water rapidly diffuses INTO the cell through osmosis. The cell swells and may eventually burst (lyse) because it has no rigid cell wall to protect it."
      },
      { 
        id: 'step_4', 
        instruction: 'Flush with 10% NaCl (Hypertonic). Water rushes OUT, shriveling the cells (crenation).', 
        targetElement: 'hyper_drop', 
        animation: 'drop',
        explanation: "The 10% NaCl solution is highly concentrated. Water rapidly moves OUT of the cell to dilute the surrounding environment. This sudden loss of volume causes the cell to shrivel up, a process known as crenation."
      }
    ],

    conclusion: "Experiment Complete! You have successfully demonstrated the principles of osmosis. You observed that cells maintain their shape in isotonic solutions, swell and lyse in hypotonic solutions, and shrivel (crenate) in hypertonic solutions. This illustrates exactly why maintaining strict osmotic balance is critical for cellular survival in living organisms.",

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
    difficulty: 'Beginner', 
    
    introduction: "Welcome to the Paper Chromatography simulation. In this module, you will separate a mixture of pigments found in black ink using capillary action. By observing how different pigments travel at different rates, you will explore the fundamental principles of the mobile and stationary phases.",
    
    equipment: ['Chromatography Paper', 'Beaker 250mL', 'Solvent', 'Black Ink', 'Pencil', 'Watch Glass'],
    
    equipmentDetails: {
      "Chromatography Paper": "A highly porous paper that serves as the stationary phase. The solvent travels up its microscopic fibers via capillary action.",
      "Beaker 250mL": "Acts as the development chamber, holding the solvent pool at the bottom and safely containing the chromatography paper.",
      "Solvent": "The mobile phase (typically water or an alcohol mixture) that travels up the paper, carrying the dissolved ink pigments with it.",
      "Black Ink": "The sample mixture. While it appears as a single solid color, it is actually a homogeneous mixture of several distinct colored pigments.",
      "Pencil": "Used to draw the starting baseline. Pencil graphite (carbon) is insoluble in the solvent and will not travel up the paper.",
      "Watch Glass": "Placed over the beaker to seal the chamber. This prevents the solvent from evaporating and keeps the internal atmosphere saturated."
    },

    steps: [
      { 
        id: 'step_1', 
        instruction: 'Draw a horizontal baseline near the bottom of the paper using a pencil.', 
        targetElement: 'pencil', 
        animation: 'draw',
        explanation: "The baseline must be drawn with a graphite pencil because it is completely insoluble in the solvent. If a regular pen were used, its ink would dissolve, separate, and completely ruin the experiment."
      },
      { 
        id: 'step_2', 
        instruction: 'Spot the black ink mixture onto the center of the baseline.', 
        targetElement: 'ink_dropper', 
        animation: 'spot',
        explanation: "A highly concentrated spot of the mixture is placed on the baseline. This spot must sit slightly higher than the initial solvent level to prevent the ink from simply washing down into the main solvent pool."
      },
      { 
        id: 'step_3', 
        instruction: 'Suspend the paper in the beaker so the solvent sits below the baseline.', 
        targetElement: 'paper', 
        animation: 'suspend',
        explanation: "As soon as the edge of the paper touches the liquid, capillary action begins. The solvent (mobile phase) is drawn upward through the microscopic cellulose gaps in the paper (stationary phase) against gravity."
      },
      { 
        id: 'step_4', 
        instruction: 'Cover the beaker with a watch glass and allow the solvent to develop.', 
        targetElement: 'watch_glass', 
        animation: 'develop',
        explanation: "Covering the beaker saturates the internal air, ensuring the solvent doesn't evaporate off the paper mid-climb. As the solvent front moves up, it carries the ink pigments at varying speeds based on their individual solubility and molecular mass."
      }
    ],

    conclusion: "Experiment Complete! You have successfully separated black ink into its distinct component colors. The pigments that traveled the furthest are the most soluble in the mobile phase and have the lowest affinity for the paper. This powerful analytical technique is widely used in forensics, pharmaceuticals, and biochemistry to isolate and identify complex compounds.",

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
    difficulty: 'Beginner',
    
    introduction: "Welcome to the pH Scale Measurement simulation. In this module, you will test various household and laboratory liquids using Universal Indicator paper. By classifying these liquids as acids, bases, or neutral, you will gain a practical understanding of the pH scale and hydrogen ion concentrations.",
    
    equipment: ['Universal Indicator Paper', 'Watch Glasses', 'Lemon Juice (Acid)', 'Distilled H₂O (Neutral)', 'Ammonia (Base)', 'pH Color Chart'],
    
    equipmentDetails: {
      "Universal Indicator Paper": "Paper treated with a mixture of pH indicators that exhibits a smooth color change over a wide pH range.",
      "Watch Glasses": "Circular concave pieces of glass used as a safe, unreactive surface to hold the indicator paper during testing.",
      "Lemon Juice (Acid)": "A natural source of citric acid. It has a high concentration of free hydrogen ions, making it a strong household acid.",
      "Distilled H₂O (Neutral)": "Pure water with perfectly equal concentrations of H⁺ and OH⁻ ions, making it completely neutral.",
      "Ammonia (Base)": "A common alkaline compound. It accepts hydrogen ions in water, drastically raising the pH.",
      "pH Color Chart": "A visual reference scale used to visually match the color of the tested indicator paper to a specific numeric pH value."
    },

    steps: [
      { 
        id: 'step_1', 
        instruction: 'Place Universal Indicator paper strips onto the three watch glasses.', 
        targetElement: 'paper_stack', 
        animation: 'place',
        explanation: "Placing the dry indicator strips on the glass prepares them for testing. Universal indicator contains a mix of chemicals like thymol blue and methyl red that will structurally change color depending on the hydrogen ion concentration."
      },
      { 
        id: 'step_2', 
        instruction: 'Add a drop of Lemon Juice to the first strip. Observe the acidic color change.', 
        targetElement: 'lemon_drop', 
        animation: 'drop',
        explanation: "Lemon juice contains high levels of citric acid. The massive concentration of H⁺ ions reacts with the indicator dyes, shifting their molecular structure to reflect red light, indicating a low pH of around 2.5."
      },
      { 
        id: 'step_3', 
        instruction: 'Add Distilled Water to the second strip. Observe the neutral color.', 
        targetElement: 'water_drop', 
        animation: 'drop',
        explanation: "Pure distilled water has a perfectly equal concentration of H⁺ and OH⁻ ions. This delicate balance yields a neutral pH reading of exactly 7.0, triggering the green color state of the indicator."
      },
      { 
        id: 'step_4', 
        instruction: 'Add Ammonia to the third strip. Observe the alkaline color change.', 
        targetElement: 'ammonia_drop', 
        animation: 'drop',
        explanation: "Ammonia (NH₃) is a base. It produces hydroxide ions (OH⁻) which consume free hydrogen ions. The indicator detects this exceptionally low concentration of H⁺ and turns dark blue, showing a high pH of around 11.0."
      }
    ],

    conclusion: "Experiment Complete! You have successfully measured and classified various liquids across the pH spectrum using universal indicator paper. You visually confirmed that acids turn the paper warm colors (Red/Orange, pH < 7), pure water turns it Green (pH = 7), and bases turn it cool colors (Blue/Purple, pH > 7).",

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
    difficulty: 'Advanced', 
    
    introduction: "Welcome to the Titration Curves simulation. In this advanced module, you will perform a strong acid-strong base titration while continuously logging the pH. By plotting pH against the volume of titrant added, you will generate a titration curve and visually identify the precise equivalence point.",
    
    equipment: ['Burette (0.1M NaOH)', 'Beaker (25mL 0.1M HCl)', 'pH Probe', 'Magnetic Stirrer', 'Data Logger'],
    
    equipmentDetails: {
      "Burette (0.1M NaOH)": "A graduated glass tube used to accurately dispense the strong base titrant into the analyte.",
      "Beaker (25mL 0.1M HCl)": "Contains our analyte, a strong acid, starting with a very low pH.",
      "pH Probe": "An electronic sensor that continuously measures the hydrogen ion concentration in real-time.",
      "Magnetic Stirrer": "Ensures the solution is completely homogeneous so the pH probe reads an accurate, uniform value after every drop.",
      "Data Logger": "A digital interface that automatically plots the measured pH against the volume of NaOH added."
    },

    mlPerClick: 5,
    totalNeeded: 50,
    
    steps: [
      { 
        id: 'step_1', 
        instruction: 'Place the beaker of 0.1M HCl onto the magnetic stirrer.', 
        targetElement: 'beaker', 
        animation: 'place',
        explanation: "Placing the beaker on the magnetic stirrer ensures the analyte is ready for continuous mixing. Proper mixing is essential to avoid localized pockets of unreacted base, which would cause erratic pH spikes."
      },
      { 
        id: 'step_2', 
        instruction: 'Lower the digital pH probe into the acid solution.', 
        targetElement: 'probe', 
        animation: 'lower',
        explanation: "Submerging the pH probe establishes our baseline reading. Because we are starting with 0.1M HCl, a strong acid, the initial pH will be extremely low (exactly 1.0)."
      },
      { 
        id: 'step_3', 
        instruction: 'Open the burette to add NaOH in 5mL increments. Observe the plotted curve.', 
        targetElement: 'burette', 
        animation: 'pour', 
        repeatable: true,
        explanation: "As you add NaOH, the pH rises gradually at first. Notice what happens exactly at 25mL: the pH spikes dramatically! This steep vertical section is the equivalence point, where the moles of base added exactly equal the initial moles of acid."
      }
    ],

    conclusion: "Experiment Complete! You have successfully plotted a strong acid-strong base titration curve. You observed that the pH changes very slowly initially, spikes rapidly through the neutral pH of 7 at the equivalence point (25 mL), and then levels off into an alkaline plateau as excess base is added. This sigmoidal curve shape is the hallmark of acid-base neutralization.",

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