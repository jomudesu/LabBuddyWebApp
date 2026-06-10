import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Atom, Weight, Info, Search, ArrowLeft, Thermometer, Layers } from 'lucide-react';

// The full 118 Element Database
const elementsData = [
  // Row 1
  { num: 1, sym: 'H', name: 'Hydrogen', mass: '1.008', col: 1, row: 1, group: 'nonmetal', desc: 'Lightest element, highly flammable gas.' },
  { num: 2, sym: 'He', name: 'Helium', mass: '4.0026', col: 18, row: 1, group: 'noble-gas', desc: 'Inert, lighter-than-air gas.' },
  // Row 2
  { num: 3, sym: 'Li', name: 'Lithium', mass: '6.94', col: 1, row: 2, group: 'alkali', desc: 'Soft, silvery-white alkali metal.' },
  { num: 4, sym: 'Be', name: 'Beryllium', mass: '9.0122', col: 2, row: 2, group: 'alkaline-earth', desc: 'Light, strong, brittle metal.' },
  { num: 5, sym: 'B', name: 'Boron', mass: '10.81', col: 13, row: 2, group: 'metalloid', desc: 'Metalloid used in glass and ceramics.' },
  { num: 6, sym: 'C', name: 'Carbon', mass: '12.011', col: 14, row: 2, group: 'nonmetal', desc: 'Basis of all known organic life.' },
  { num: 7, sym: 'N', name: 'Nitrogen', mass: '14.007', col: 15, row: 2, group: 'nonmetal', desc: 'Makes up 78% of Earth\'s atmosphere.' },
  { num: 8, sym: 'O', name: 'Oxygen', mass: '15.999', col: 16, row: 2, group: 'nonmetal', desc: 'Highly reactive nonmetal, essential for life.' },
  { num: 9, sym: 'F', name: 'Fluorine', mass: '18.998', col: 17, row: 2, group: 'halogen', desc: 'Most electronegative and reactive element.' },
  { num: 10, sym: 'Ne', name: 'Neon', mass: '20.180', col: 18, row: 2, group: 'noble-gas', desc: 'Inert noble gas, glows reddish-orange.' },
  // Row 3
  { num: 11, sym: 'Na', name: 'Sodium', mass: '22.990', col: 1, row: 3, group: 'alkali', desc: 'Highly reactive metal, commonly found in salt.' },
  { num: 12, sym: 'Mg', name: 'Magnesium', mass: '24.305', col: 2, row: 3, group: 'alkaline-earth', desc: 'Lightweight metal, burns bright white.' },
  { num: 13, sym: 'Al', name: 'Aluminum', mass: '26.982', col: 13, row: 3, group: 'post-transition', desc: 'Lightweight, corrosion-resistant metal.' },
  { num: 14, sym: 'Si', name: 'Silicon', mass: '28.085', col: 14, row: 3, group: 'metalloid', desc: 'Crucial semiconductor used in electronics.' },
  { num: 15, sym: 'P', name: 'Phosphorus', mass: '30.974', col: 15, row: 3, group: 'nonmetal', desc: 'Highly reactive, essential for biology.' },
  { num: 16, sym: 'S', name: 'Sulfur', mass: '32.06', col: 16, row: 3, group: 'nonmetal', desc: 'Yellow nonmetal, found in amino acids.' },
  { num: 17, sym: 'Cl', name: 'Chlorine', mass: '35.45', col: 17, row: 3, group: 'halogen', desc: 'Toxic, pale-green gas, used as a disinfectant.' },
  { num: 18, sym: 'Ar', name: 'Argon', mass: '39.95', col: 18, row: 3, group: 'noble-gas', desc: 'Inert gas, used in lighting and welding.' },
  // Row 4
  { num: 19, sym: 'K', name: 'Potassium', mass: '39.098', col: 1, row: 4, group: 'alkali', desc: 'Highly reactive metal, essential for nerves.' },
  { num: 20, sym: 'Ca', name: 'Calcium', mass: '40.078', col: 2, row: 4, group: 'alkaline-earth', desc: 'Reactive metal, essential for bones.' },
  { num: 21, sym: 'Sc', name: 'Scandium', mass: '44.956', col: 3, row: 4, group: 'transition', desc: 'Soft, silvery transition metal.' },
  { num: 22, sym: 'Ti', name: 'Titanium', mass: '47.867', col: 4, row: 4, group: 'transition', desc: 'Strong, lightweight, corrosion-resistant.' },
  { num: 23, sym: 'V', name: 'Vanadium', mass: '50.942', col: 5, row: 4, group: 'transition', desc: 'Hard, silvery-grey transition metal.' },
  { num: 24, sym: 'Cr', name: 'Chromium', mass: '51.996', col: 6, row: 4, group: 'transition', desc: 'Hard, shiny metal used in stainless steel.' },
  { num: 25, sym: 'Mn', name: 'Manganese', mass: '54.938', col: 7, row: 4, group: 'transition', desc: 'Hard, brittle metal used in steel alloys.' },
  { num: 26, sym: 'Fe', name: 'Iron', mass: '55.845', col: 8, row: 4, group: 'transition', desc: 'Most common element on Earth by mass.' },
  { num: 27, sym: 'Co', name: 'Cobalt', mass: '58.933', col: 9, row: 4, group: 'transition', desc: 'Magnetic metal used in batteries.' },
  { num: 28, sym: 'Ni', name: 'Nickel', mass: '58.693', col: 10, row: 4, group: 'transition', desc: 'Corrosion-resistant metal used in coins.' },
  { num: 29, sym: 'Cu', name: 'Copper', mass: '63.546', col: 11, row: 4, group: 'transition', desc: 'Excellent conductor of heat and electricity.' },
  { num: 30, sym: 'Zn', name: 'Zinc', mass: '65.38', col: 12, row: 4, group: 'transition', desc: 'Used to galvanize iron to prevent rusting.' },
  { num: 31, sym: 'Ga', name: 'Gallium', mass: '69.723', col: 13, row: 4, group: 'post-transition', desc: 'Metal that melts near room temperature.' },
  { num: 32, sym: 'Ge', name: 'Germanium', mass: '72.630', col: 14, row: 4, group: 'metalloid', desc: 'Important semiconductor used in optics.' },
  { num: 33, sym: 'As', name: 'Arsenic', mass: '74.922', col: 15, row: 4, group: 'metalloid', desc: 'Toxic metalloid used in semiconductors.' },
  { num: 34, sym: 'Se', name: 'Selenium', mass: '78.971', col: 16, row: 4, group: 'nonmetal', desc: 'Nonmetal with photovoltaic properties.' },
  { num: 35, sym: 'Br', name: 'Bromine', mass: '79.904', col: 17, row: 4, group: 'halogen', desc: 'Red-brown liquid halogen.' },
  { num: 36, sym: 'Kr', name: 'Krypton', mass: '83.798', col: 18, row: 4, group: 'noble-gas', desc: 'Colorless, odorless noble gas.' },
  // Row 5
  { num: 37, sym: 'Rb', name: 'Rubidium', mass: '85.468', col: 1, row: 5, group: 'alkali', desc: 'Highly reactive, ignites spontaneously in air.' },
  { num: 38, sym: 'Sr', name: 'Strontium', mass: '87.62', col: 2, row: 5, group: 'alkaline-earth', desc: 'Soft silver-white yellowish metallic element.' },
  { num: 39, sym: 'Y', name: 'Yttrium', mass: '88.906', col: 3, row: 5, group: 'transition', desc: 'Silvery-metallic transition metal.' },
  { num: 40, sym: 'Zr', name: 'Zirconium', mass: '91.224', col: 4, row: 5, group: 'transition', desc: 'Strong, highly corrosion-resistant metal.' },
  { num: 41, sym: 'Nb', name: 'Niobium', mass: '92.906', col: 5, row: 5, group: 'transition', desc: 'Used in superconducting materials.' },
  { num: 42, sym: 'Mo', name: 'Molybdenum', mass: '95.95', col: 6, row: 5, group: 'transition', desc: 'Withstands extreme temperatures without expanding.' },
  { num: 43, sym: 'Tc', name: 'Technetium', mass: '(98)', col: 7, row: 5, group: 'transition', desc: 'First predominantly artificial element.' },
  { num: 44, sym: 'Ru', name: 'Ruthenium', mass: '101.07', col: 8, row: 5, group: 'transition', desc: 'Rare transition metal belonging to the platinum group.' },
  { num: 45, sym: 'Rh', name: 'Rhodium', mass: '102.91', col: 9, row: 5, group: 'transition', desc: 'Hard, silvery, highly reflective metal.' },
  { num: 46, sym: 'Pd', name: 'Palladium', mass: '106.42', col: 10, row: 5, group: 'transition', desc: 'Used heavily in catalytic converters.' },
  { num: 47, sym: 'Ag', name: 'Silver', mass: '107.87', col: 11, row: 5, group: 'transition', desc: 'Highest electrical conductivity of any element.' },
  { num: 48, sym: 'Cd', name: 'Cadmium', mass: '112.41', col: 12, row: 5, group: 'transition', desc: 'Soft, bluish-white metal, toxic.' },
  { num: 49, sym: 'In', name: 'Indium', mass: '114.82', col: 13, row: 5, group: 'post-transition', desc: 'Very soft, silvery-white metal.' },
  { num: 50, sym: 'Sn', name: 'Tin', mass: '118.71', col: 14, row: 5, group: 'post-transition', desc: 'Silvery metal used to coat other metals.' },
  { num: 51, sym: 'Sb', name: 'Antimony', mass: '121.76', col: 15, row: 5, group: 'metalloid', desc: 'Lustrous gray metalloid.' },
  { num: 52, sym: 'Te', name: 'Tellurium', mass: '127.60', col: 16, row: 5, group: 'metalloid', desc: 'Brittle, mildly toxic, rare silver-white metalloid.' },
  { num: 53, sym: 'I', name: 'Iodine', mass: '126.90', col: 17, row: 5, group: 'halogen', desc: 'Purple-black nonmetallic solid.' },
  { num: 54, sym: 'Xe', name: 'Xenon', mass: '131.29', col: 18, row: 5, group: 'noble-gas', desc: 'Dense, colorless noble gas.' },
  // Row 6
  { num: 55, sym: 'Cs', name: 'Cesium', mass: '132.91', col: 1, row: 6, group: 'alkali', desc: 'Extremely reactive, liquid at near room temp.' },
  { num: 56, sym: 'Ba', name: 'Barium', mass: '137.33', col: 2, row: 6, group: 'alkaline-earth', desc: 'Highly reactive silvery alkaline earth metal.' },
  { num: 72, sym: 'Hf', name: 'Hafnium', mass: '178.49', col: 4, row: 6, group: 'transition', desc: 'Lustrous, silvery ductile transition metal.' },
  { num: 73, sym: 'Ta', name: 'Tantalum', mass: '180.95', col: 5, row: 6, group: 'transition', desc: 'Highly corrosion-resistant metal.' },
  { num: 74, sym: 'W', name: 'Tungsten', mass: '183.84', col: 6, row: 6, group: 'transition', desc: 'Has the highest melting point of all elements.' },
  { num: 75, sym: 'Re', name: 'Rhenium', mass: '186.21', col: 7, row: 6, group: 'transition', desc: 'One of the rarest elements in the Earth\'s crust.' },
  { num: 76, sym: 'Os', name: 'Osmium', mass: '190.23', col: 8, row: 6, group: 'transition', desc: 'Densest naturally occurring element.' },
  { num: 77, sym: 'Ir', name: 'Iridium', mass: '192.22', col: 9, row: 6, group: 'transition', desc: 'Most corrosion-resistant metal known.' },
  { num: 78, sym: 'Pt', name: 'Platinum', mass: '195.08', col: 10, row: 6, group: 'transition', desc: 'Dense, malleable, highly unreactive precious metal.' },
  { num: 79, sym: 'Au', name: 'Gold', mass: '196.97', col: 11, row: 6, group: 'transition', desc: 'Highly sought-after dense precious metal.' },
  { num: 80, sym: 'Hg', name: 'Mercury', mass: '200.59', col: 12, row: 6, group: 'transition', desc: 'Only metal that is liquid at room temperature.' },
  { num: 81, sym: 'Tl', name: 'Thallium', mass: '204.38', col: 13, row: 6, group: 'post-transition', desc: 'Highly toxic, soft gray post-transition metal.' },
  { num: 82, sym: 'Pb', name: 'Lead', mass: '207.2', col: 14, row: 6, group: 'post-transition', desc: 'Heavy, dense, toxic, malleable metal.' },
  { num: 83, sym: 'Bi', name: 'Bismuth', mass: '208.98', col: 15, row: 6, group: 'post-transition', desc: 'Diamagnetic metal with low toxicity.' },
  { num: 84, sym: 'Po', name: 'Polonium', mass: '(209)', col: 16, row: 6, group: 'metalloid', desc: 'Highly radioactive and toxic metal.' },
  { num: 85, sym: 'At', name: 'Astatine', mass: '(210)', col: 17, row: 6, group: 'halogen', desc: 'Extremely rare radioactive halogen.' },
  { num: 86, sym: 'Rn', name: 'Radon', mass: '(222)', col: 18, row: 6, group: 'noble-gas', desc: 'Radioactive, colorless, odorless noble gas.' },
  // Row 7
  { num: 87, sym: 'Fr', name: 'Francium', mass: '(223)', col: 1, row: 7, group: 'alkali', desc: 'Highly radioactive alkali metal.' },
  { num: 88, sym: 'Ra', name: 'Radium', mass: '(226)', col: 2, row: 7, group: 'alkaline-earth', desc: 'Luminescent, highly radioactive metal.' },
  { num: 104, sym: 'Rf', name: 'Rutherfordium', mass: '(267)', col: 4, row: 7, group: 'transition', desc: 'Highly radioactive synthetic element.' },
  { num: 105, sym: 'Db', name: 'Dubnium', mass: '(268)', col: 5, row: 7, group: 'transition', desc: 'Highly radioactive synthetic element.' },
  { num: 106, sym: 'Sg', name: 'Seaborgium', mass: '(269)', col: 6, row: 7, group: 'transition', desc: 'Highly radioactive synthetic element.' },
  { num: 107, sym: 'Bh', name: 'Bohrium', mass: '(270)', col: 7, row: 7, group: 'transition', desc: 'Highly radioactive synthetic element.' },
  { num: 108, sym: 'Hs', name: 'Hassium', mass: '(277)', col: 8, row: 7, group: 'transition', desc: 'Highly radioactive synthetic element.' },
  { num: 109, sym: 'Mt', name: 'Meitnerium', mass: '(278)', col: 9, row: 7, group: 'transition', desc: 'Highly radioactive synthetic element.' },
  { num: 110, sym: 'Ds', name: 'Darmstadtium', mass: '(281)', col: 10, row: 7, group: 'transition', desc: 'Highly radioactive synthetic element.' },
  { num: 111, sym: 'Rg', name: 'Roentgenium', mass: '(282)', col: 11, row: 7, group: 'transition', desc: 'Highly radioactive synthetic element.' },
  { num: 112, sym: 'Cn', name: 'Copernicium', mass: '(285)', col: 12, row: 7, group: 'transition', desc: 'Highly radioactive synthetic element.' },
  { num: 113, sym: 'Nh', name: 'Nihonium', mass: '(286)', col: 13, row: 7, group: 'post-transition', desc: 'Highly radioactive synthetic element.' },
  { num: 114, sym: 'Fl', name: 'Flerovium', mass: '(289)', col: 14, row: 7, group: 'post-transition', desc: 'Highly radioactive synthetic element.' },
  { num: 115, sym: 'Mc', name: 'Moscovium', mass: '(290)', col: 15, row: 7, group: 'post-transition', desc: 'Highly radioactive synthetic element.' },
  { num: 116, sym: 'Lv', name: 'Livermorium', mass: '(293)', col: 16, row: 7, group: 'post-transition', desc: 'Highly radioactive synthetic element.' },
  { num: 117, sym: 'Ts', name: 'Tennessine', mass: '(294)', col: 17, row: 7, group: 'halogen', desc: 'Highly radioactive synthetic element.' },
  { num: 118, sym: 'Og', name: 'Oganesson', mass: '(294)', col: 18, row: 7, group: 'noble-gas', desc: 'Heaviest synthetic element known.' },
  
  // Lanthanides (Row 9, starting Col 4)
  { num: 57, sym: 'La', name: 'Lanthanum', mass: '138.91', col: 4, row: 9, group: 'lanthanide', desc: 'Soft, ductile, silvery-white rare-earth metal.' },
  { num: 58, sym: 'Ce', name: 'Cerium', mass: '140.12', col: 5, row: 9, group: 'lanthanide', desc: 'Most abundant of the rare-earth metals.' },
  { num: 59, sym: 'Pr', name: 'Praseodymium', mass: '140.91', col: 6, row: 9, group: 'lanthanide', desc: 'Soft, silvery, malleable rare-earth metal.' },
  { num: 60, sym: 'Nd', name: 'Neodymium', mass: '144.24', col: 7, row: 9, group: 'lanthanide', desc: 'Used to make powerful permanent magnets.' },
  { num: 61, sym: 'Pm', name: 'Promethium', mass: '(145)', col: 8, row: 9, group: 'lanthanide', desc: 'Radioactive lanthanide.' },
  { num: 62, sym: 'Sm', name: 'Samarium', mass: '150.36', col: 9, row: 9, group: 'lanthanide', desc: 'Silvery metal, used in magnets and lasers.' },
  { num: 63, sym: 'Eu', name: 'Europium', mass: '151.96', col: 10, row: 9, group: 'lanthanide', desc: 'Most reactive of the rare-earth elements.' },
  { num: 64, sym: 'Gd', name: 'Gadolinium', mass: '157.25', col: 11, row: 9, group: 'lanthanide', desc: 'Silvery-white, malleable rare-earth metal.' },
  { num: 65, sym: 'Tb', name: 'Terbium', mass: '158.93', col: 12, row: 9, group: 'lanthanide', desc: 'Soft, silvery-white rare-earth metal.' },
  { num: 66, sym: 'Dy', name: 'Dysprosium', mass: '162.50', col: 13, row: 9, group: 'lanthanide', desc: 'Rare earth metal with a metallic silver luster.' },
  { num: 67, sym: 'Ho', name: 'Holmium', mass: '164.93', col: 14, row: 9, group: 'lanthanide', desc: 'Highest magnetic strength of any element.' },
  { num: 68, sym: 'Er', name: 'Erbium', mass: '167.26', col: 15, row: 9, group: 'lanthanide', desc: 'Silvery-white solid metal artificially isolated.' },
  { num: 69, sym: 'Tm', name: 'Thulium', mass: '168.93', col: 16, row: 9, group: 'lanthanide', desc: 'Second-least abundant of the lanthanides.' },
  { num: 70, sym: 'Yb', name: 'Ytterbium', mass: '173.05', col: 17, row: 9, group: 'lanthanide', desc: 'Soft, malleable, ductile silvery metal.' },
  { num: 71, sym: 'Lu', name: 'Lutetium', mass: '174.97', col: 18, row: 9, group: 'lanthanide', desc: 'Hardest and densest of the lanthanides.' },

  // Actinides (Row 10, starting Col 4)
  { num: 89, sym: 'Ac', name: 'Actinium', mass: '(227)', col: 4, row: 10, group: 'actinide', desc: 'Highly radioactive, glows in the dark.' },
  { num: 90, sym: 'Th', name: 'Thorium', mass: '232.04', col: 5, row: 10, group: 'actinide', desc: 'Weakly radioactive, useful as nuclear fuel.' },
  { num: 91, sym: 'Pa', name: 'Protactinium', mass: '231.04', col: 6, row: 10, group: 'actinide', desc: 'Dense, silvery-gray radioactive metal.' },
  { num: 92, sym: 'U', name: 'Uranium', mass: '238.03', col: 7, row: 10, group: 'actinide', desc: 'Heavy metal used as fuel in nuclear reactors.' },
  { num: 93, sym: 'Np', name: 'Neptunium', mass: '(237)', col: 8, row: 10, group: 'actinide', desc: 'Radioactive synthetic element.' },
  { num: 94, sym: 'Pu', name: 'Plutonium', mass: '(244)', col: 9, row: 10, group: 'actinide', desc: 'Radioactive synthetic metal used in reactors.' },
  { num: 95, sym: 'Am', name: 'Americium', mass: '(243)', col: 10, row: 10, group: 'actinide', desc: 'Radioactive element used in smoke detectors.' },
  { num: 96, sym: 'Cm', name: 'Curium', mass: '(247)', col: 11, row: 10, group: 'actinide', desc: 'Hard, dense, silvery-white radioactive metal.' },
  { num: 97, sym: 'Bk', name: 'Berkelium', mass: '(247)', col: 12, row: 10, group: 'actinide', desc: 'Soft, silvery-white radioactive metal.' },
  { num: 98, sym: 'Cf', name: 'Californium', mass: '(251)', col: 13, row: 10, group: 'actinide', desc: 'Radioactive metal, strong neutron emitter.' },
  { num: 99, sym: 'Es', name: 'Einsteinium', mass: '(252)', col: 14, row: 10, group: 'actinide', desc: 'Synthetic highly radioactive element.' },
  { num: 100, sym: 'Fm', name: 'Fermium', mass: '(257)', col: 15, row: 10, group: 'actinide', desc: 'Synthetic highly radioactive element.' },
  { num: 101, sym: 'Md', name: 'Mendelevium', mass: '(258)', col: 16, row: 10, group: 'actinide', desc: 'Synthetic highly radioactive element.' },
  { num: 102, sym: 'No', name: 'Nobelium', mass: '(259)', col: 17, row: 10, group: 'actinide', desc: 'Synthetic highly radioactive element.' },
  { num: 103, sym: 'Lr', name: 'Lawrencium', mass: '(266)', col: 18, row: 10, group: 'actinide', desc: 'Synthetic highly radioactive element.' }
];

const groupColors = {
  'nonmetal': 'bg-yellow-100 text-yellow-900 border-yellow-300 hover:bg-yellow-200',
  'noble-gas': 'bg-green-100 text-green-900 border-green-300 hover:bg-green-200',
  'alkali': 'bg-red-100 text-red-900 border-red-300 hover:bg-red-200',
  'alkaline-earth': 'bg-orange-100 text-orange-900 border-orange-300 hover:bg-orange-200',
  'metalloid': 'bg-teal-100 text-teal-900 border-teal-300 hover:bg-teal-200',
  'halogen': 'bg-pink-100 text-pink-900 border-pink-300 hover:bg-pink-200',
  'post-transition': 'bg-indigo-100 text-indigo-900 border-indigo-300 hover:bg-indigo-200',
  'transition': 'bg-blue-100 text-blue-900 border-blue-300 hover:bg-blue-200',
  'lanthanide': 'bg-cyan-100 text-cyan-900 border-cyan-300 hover:bg-cyan-200',
  'actinide': 'bg-fuchsia-100 text-fuchsia-900 border-fuchsia-300 hover:bg-fuchsia-200',
};

const getPhase = (num) => {
  const gases = [1, 2, 7, 8, 9, 10, 17, 18, 36, 54, 86];
  const liquids = [35, 80];
  if (gases.includes(num)) return 'Gas';
  if (liquids.includes(num)) return 'Liquid';
  if (num >= 104) return 'Synthetic';
  return 'Solid';
};

const getBlock = (group) => {
  if (['alkali', 'alkaline-earth'].includes(group)) return 's-block';
  if (['transition'].includes(group)) return 'd-block';
  if (['lanthanide', 'actinide'].includes(group)) return 'f-block';
  return 'p-block';
};

const PeriodicTable = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedElement, setSelectedElement] = useState(elementsData.find(e => e.sym === 'C')); 
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (location.state?.selectedElement) {
      const el = elementsData.find(e => e.sym === location.state.selectedElement);
      if (el) setSelectedElement(el);
    }
  }, [location]);

  return (
    <div className="w-full h-screen overflow-hidden bg-slate-50 flex flex-col animate-fade-in">
      <div className="max-w-[1500px] w-full mx-auto flex flex-col h-full p-4 md:p-6">
        
        <button 
          onClick={() => navigate(-1)} 
          className="group flex items-center gap-2 text-slate-500 hover:text-purple-600 font-bold transition-all mb-3 w-fit px-1 shrink-0"
        >
          <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" /> 
          <span className="text-sm">Return to Library</span>
        </button>

        <div className="bg-gradient-to-r from-purple-600 to-fuchsia-700 rounded-2xl p-4 md:px-6 md:py-4 text-white shadow-md mb-4 flex items-center justify-between relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex items-center gap-4">
            <div className="bg-white/10 border border-white/20 p-2 rounded-xl backdrop-blur-sm hidden sm:block">
              <Atom size={24} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-sm">Interactive Guide</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-none">Periodic Table of Elements</h1>
            </div>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-4 flex-1 min-h-0">
          
          <div className="flex-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col min-w-0">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <h2 className="text-base font-bold text-slate-800">Standard Layout (1-118)</h2>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="text" 
                  placeholder="Search element..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 outline-none w-48 sm:w-60"
                />
              </div>
            </div>

            {/* ✨ FIX: Added p-2.5 "Safe Zone" inside the scrolling container, lowered min-w to 750px */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar">
              <div className="min-w-[750px] h-full grid gap-1 p-2.5" style={{ gridTemplateColumns: 'repeat(18, minmax(0, 1fr))', gridTemplateRows: 'repeat(10, minmax(0, 1fr))' }}>
                
                <div style={{ gridColumn: 3, gridRow: 6 }} className="flex flex-col items-center justify-center border border-slate-200 border-dashed rounded-md bg-slate-50 opacity-70">
                  <span className="text-[9px] font-bold text-slate-400">57-71</span>
                </div>
                <div style={{ gridColumn: 3, gridRow: 7 }} className="flex flex-col items-center justify-center border border-slate-200 border-dashed rounded-md bg-slate-50 opacity-70">
                  <span className="text-[9px] font-bold text-slate-400">89-103</span>
                </div>

                <div style={{ gridColumn: '1 / -1', gridRow: 8 }} className="h-1.5"></div>

                {elementsData.map(el => {
                  const isSelected = selectedElement.num === el.num;
                  const isSearched = searchQuery && (el.sym.toLowerCase().includes(searchQuery.toLowerCase()) || el.name.toLowerCase().includes(searchQuery.toLowerCase()));
                  const opacityClass = searchQuery && !isSearched ? 'opacity-20' : 'opacity-100';
                  
                  return (
                    <button
                      key={el.num}
                      onClick={() => setSelectedElement(el)}
                      style={{ gridColumn: el.col, gridRow: el.row }}
                      className={`
                        p-1 flex flex-col items-center justify-center border rounded-md transition-all duration-200
                        ${groupColors[el.group]} ${isSelected ? 'ring-2 ring-purple-600 scale-[1.15] shadow-md z-10' : ''}
                        ${opacityClass} hover:scale-[1.15] hover:z-10 hover:shadow-md
                      `}
                    >
                      <span className="text-[8px] font-semibold self-start ml-0.5 opacity-60 leading-none">{el.num}</span>
                      <span className="font-black text-sm md:text-base leading-none my-0.5">{el.sym}</span>
                      <span className="text-[7px] font-medium truncate w-full text-center opacity-80">{el.mass}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="w-full xl:w-[320px] shrink-0 flex flex-col">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
              
              <div className={`h-32 shrink-0 flex items-center justify-center relative ${groupColors[selectedElement.group].split(' ')[0]}`}>
                 <span className="absolute top-3 left-4 text-xs font-bold opacity-50">{selectedElement.num}</span>
                 <span className="absolute top-3 right-4 text-xs font-bold opacity-50">{selectedElement.mass}</span>
                 <span className={`text-6xl font-black ${groupColors[selectedElement.group].split(' ')[1]}`}>
                    {selectedElement.sym}
                 </span>
              </div>
              
              <div className="p-5 flex flex-col flex-1 overflow-y-auto">
                
                <div className="flex justify-between items-end mb-5 border-b border-slate-100 pb-4">
                  <div className="min-w-0 pr-2">
                    <h3 className="text-2xl font-black text-slate-800 truncate">{selectedElement.name}</h3>
                    <p className="text-sm font-bold text-slate-500 capitalize truncate mt-0.5">{selectedElement.group.replace('-', ' ')}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Atomic No.</span>
                    <p className="text-3xl font-black text-slate-800 leading-none mt-1">{selectedElement.num}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Atomic Mass</span>
                    <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><Weight size={14} className="text-slate-400"/> {selectedElement.mass} u</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Standard State</span>
                    <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><Thermometer size={14} className="text-slate-400"/> {getPhase(selectedElement.num)}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Element Block</span>
                    <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><Layers size={14} className="text-slate-400"/> {getBlock(selectedElement.group)}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Category</span>
                    <span className="text-sm font-bold text-slate-700 truncate block capitalize">{selectedElement.group.replace('-', ' ')}</span>
                  </div>
                </div>
                
                <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <Info size={16} className="text-blue-500" />
                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Overview</span>
                  </div>
                  <p className="text-sm font-medium text-slate-700 leading-relaxed flex-1">
                    {selectedElement.desc}
                  </p>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PeriodicTable;