
export interface MaterialCatalogItem {
    id?: string;
    category: string;
    name: string;
    price: number;
    unit: string;
}

export const MATERIAL_CATALOG: MaterialCatalogItem[] = [
    // --- SOFTSCAPE ---
    { category: "Trees (TreeSource Vendor)", name: "Cedar, Columnar Blue Atlas 6' B&B", price: 285.00, unit: "EA" },
    { category: "Trees (TreeSource Vendor)", name: "Juniper, Moonglow 6'", price: 188.38, unit: "EA" },
    { category: "Trees (TreeSource Vendor)", name: "Hornbeam, Frans Fontaine #25", price: 232.27, unit: "EA" },
    { category: "Trees (TreeSource Vendor)", name: "Desert Olive, New Mexican #15 MS", price: 146.03, unit: "EA" },
    { category: "Trees (TreeSource Vendor)", name: "Ginkgo, Autumn Gold #25", price: 246.37, unit: "EA" },
    { category: "Trees (TreeSource Vendor)", name: "Crabapple, Spring Snow #25", price: 204.54, unit: "EA" },
    { category: "Trees (TreeSource Vendor)", name: "Oak, Columnar English #25", price: 225.34, unit: "EA" },
    { category: "Trees (TreeSource Vendor)", name: "Elm, Athena #25 STD", price: 284.99, unit: "EA" },
    { category: "Trees (TreeSource Vendor)", name: "Zelkova, Burgundy Vase #25", price: 302.05, unit: "EA" },

    { category: "Shrubs #5 (TreeSource Vendor)", name: "Serviceberry, Regent #5 MS", price: 24.85, unit: "EA" },
    { category: "Shrubs #5 (TreeSource Vendor)", name: "Barberry, Concorde #5 MS", price: 26.97, unit: "EA" },
    { category: "Shrubs #5 (TreeSource Vendor)", name: "Butterfly Bush, Miss Molly #5 MS", price: 39.66, unit: "EA" },
    { category: "Shrubs #5 (TreeSource Vendor)", name: "Smoke Bush, Royal Purple #5 MS", price: 23.46, unit: "EA" },
    { category: "Shrubs #5 (TreeSource Vendor)", name: "Apache Plume #5 MS", price: 35.42, unit: "EA" },
    { category: "Shrubs #5 (TreeSource Vendor)", name: "Sand Cherry, Pawnee Buttes #5 MS", price: 20.05, unit: "EA" },
    { category: "Shrubs #5 (TreeSource Vendor)", name: "Sumac, Autumn Amber #5 MS", price: 23.45, unit: "EA" },
    { category: "Shrubs #5 (TreeSource Vendor)", name: "Spirea, Birchleaf #5 MS", price: 16.82, unit: "EA" },
    { category: "Shrubs #5 (TreeSource Vendor)", name: "Viburnum, Mini Man #5 MS", price: 32.68, unit: "EA" },
    { category: "Shrubs #5 (TreeSource Vendor)", name: "Scotch Broom, Spanish Gold #5 MS", price: 32.46, unit: "EA" },
    { category: "Shrubs #5 (TreeSource Vendor)", name: "Rose, Flower Carpet Coral #5 MS", price: 37.63, unit: "EA" },

    { category: "Grasses & Percs (TreeSource Vendor)", name: "Feather Reed Grass, Karl Foerster #1", price: 7.04, unit: "EA" },
    { category: "Grasses & Percs (TreeSource Vendor)", name: "Flame Grass (Purpurascens) #1", price: 7.73, unit: "EA" },
    { category: "Grasses & Percs (TreeSource Vendor)", name: "Maiden Grass, Morning Light #2", price: 19.00, unit: "EA" },
    { category: "Grasses & Percs (TreeSource Vendor)", name: "Fescue Grass, Atlas #1", price: 9.91, unit: "EA" },
    { category: "Grasses & Percs (TreeSource Vendor)", name: "Speedwell, Turkish 32ct Flat", price: 29.60, unit: "FLAT" },

    { category: "Generic: Evergreen Trees", name: "Evergreen (6 ft)", price: 250.00, unit: "EA" },
    { category: "Generic: Evergreen Trees", name: "Evergreen (8 ft)", price: 375.00, unit: "EA" },
    { category: "Generic: Evergreen Trees", name: "Evergreen (10 ft)", price: 550.00, unit: "EA" },
    { category: "Generic: Evergreen Trees", name: "Evergreen (12+ ft)", price: 800.00, unit: "EA" },

    { category: "Generic: Caliper Trees", name: "Deciduous Tree (2 inch Cal)", price: 325.00, unit: "EA" },
    { category: "Generic: Caliper Trees", name: "Ornamental Tree (2 inch Cal)", price: 345.00, unit: "EA" },
    { category: "Generic: Caliper Trees", name: "Fruit Tree (2 inch Cal)", price: 360.00, unit: "EA" },

    { category: "Generic: Shrubs & Perennials", name: "Shrub (1 Gallon)", price: 12.00, unit: "EA" },
    { category: "Generic: Shrubs & Perennials", name: "Shrub (3 Gallon)", price: 26.00, unit: "EA" },
    { category: "Generic: Shrubs & Perennials", name: "Shrub (5 Gallon)", price: 42.00, unit: "EA" },
    { category: "Generic: Shrubs & Perennials", name: "Perennial (1 Gallon)", price: 10.50, unit: "EA" },
    { category: "Generic: Shrubs & Perennials", name: "Ornamental Grass (3 Gallon)", price: 24.00, unit: "EA" },

    { category: "Sod & Soil", name: "Kentucky Bluegrass Sod", price: 0.43, unit: "SF" },
    { category: "Sod & Soil", name: "Fescue Blend Sod", price: 0.46, unit: "SF" },
    { category: "Sod & Soil", name: "Screened Topsoil", price: 32.00, unit: "CY" },
    { category: "Sod & Soil", name: "Premium Garden Soil", price: 45.00, unit: "CY" },
    { category: "Sod & Soil", name: "Soil Prep / Compost", price: 28.00, unit: "CY" },

    // --- HARDSCAPE ---
    { category: "General: Site Prep", name: "Silt Fence (Installed)", price: 2.50, unit: "LF" },
    { category: "General: Site Prep", name: "Construction Entrance (Rock)", price: 450.00, unit: "EA" },
    { category: "General: Site Prep", name: "Porta Potty Rental (Month)", price: 125.00, unit: "MO" },
    { category: "General: Site Prep", name: "Dumpster (30 Yard Roll-off)", price: 650.00, unit: "EA" },
    { category: "General: Site Prep", name: "Safety Fence (Orange)", price: 0.85, unit: "LF" },

    { category: "Site Prep & Demo", name: "Sod Removal (Machine)", price: 0.10, unit: "SF" },
    { category: "Site Prep & Demo", name: "Concrete Demo (4\" Thick)", price: 2.50, unit: "SF" },
    { category: "Site Prep & Demo", name: "Dirt Excavation (Cut/Fill)", price: 15.00, unit: "CY" },
    { category: "Site Prep & Demo", name: "Rough Grading (Skid Steer)", price: 0.15, unit: "SF" },
    { category: "Site Prep & Demo", name: "Final Grading (Rake)", price: 0.20, unit: "SF" },
    { category: "Site Prep & Demo", name: "Tree Removal (Small <6\")", price: 250.00, unit: "EA" },
    { category: "Site Prep & Demo", name: "Tree Removal (Medium 6-12\")", price: 650.00, unit: "EA" },
    { category: "Site Prep & Demo", name: "Tree Removal (Large 12\"+)", price: 1200.00, unit: "EA" },
    { category: "Site Prep & Demo", name: "Stump Grinding", price: 150.00, unit: "EA" },

    { category: "General: Drainage", name: "4\" ADS Solid Pipe", price: 0.85, unit: "LF" },
    { category: "General: Drainage", name: "4\" ADS Perforated Pipe", price: 0.85, unit: "LF" },
    { category: "General: Drainage", name: "Catch Basin (12 inch)", price: 65.00, unit: "EA" },
    { category: "General: Drainage", name: "Pop-up Emitter", price: 15.00, unit: "EA" },
    { category: "General: Drainage", name: "French Drain Gravel", price: 32.00, unit: "TON" },

    { category: "General: Fencing", name: "Cedar Picket (6ft)", price: 3.50, unit: "EA" },
    { category: "General: Fencing", name: "4x4 Pressure Treated Post", price: 18.00, unit: "EA" },
    { category: "General: Fencing", name: "2x4 Rail (8ft)", price: 6.50, unit: "EA" },
    { category: "General: Fencing", name: "Concrete (Bag)", price: 5.50, unit: "BAG" },
    { category: "General: Fencing", name: "Gate Hardware Kit", price: 45.00, unit: "EA" },

    { category: "General: Lighting", name: "Transformer (300W)", price: 250.00, unit: "EA" },
    { category: "General: Lighting", name: "LED Path Light (Brass)", price: 65.00, unit: "EA" },
    { category: "General: Lighting", name: "LED Up Light (Brass)", price: 75.00, unit: "EA" },
    { category: "General: Lighting", name: "Low Voltage Wire (12/2 500ft)", price: 180.00, unit: "ROLL" },
    { category: "General: Lighting", name: "Waterproof Connectors (Bag)", price: 25.00, unit: "BAG" },

    { category: "Concrete: Mixes", name: "4000 PSI Flatwork (6.0 Sack)", price: 218.00, unit: "CY" },
    { category: "Concrete: Mixes", name: "4500 PSI Flatwork (6.5 Sack)", price: 222.00, unit: "CY" },
    { category: "Concrete: Mixes", name: "3500 PSI Pea Gravel (7.5 Sack)", price: 236.00, unit: "CY" },
    { category: "Concrete: Mixes", name: "Flowable Fill (2 Sack)", price: 160.00, unit: "CY" },
    { category: "Concrete: Mixes", name: "High Early (Upgrade)", price: 15.00, unit: "CY" },

    { category: "Concrete: Reinforcement", name: "#4 Rebar (1/2 inch) - 20ft Stick", price: 10.00, unit: "EA" },
    { category: "Concrete: Reinforcement", name: "#3 Rebar (3/8 inch) - 20ft Stick", price: 7.50, unit: "EA" },
    { category: "Concrete: Reinforcement", name: "Wire Mesh (6x6 10ga) - Sheet", price: 45.00, unit: "EA" },
    { category: "Concrete: Reinforcement", name: "Rebar Chairs (Bag 50)", price: 25.00, unit: "BAG" },
    { category: "Concrete: Reinforcement", name: "Smooth Dowels (18 inch)", price: 4.50, unit: "EA" },

    { category: "Concrete: Additives & Finish", name: "Fiber Mesh", price: 9.00, unit: "CY" },
    { category: "Concrete: Additives & Finish", name: "Calcium Chloride (1%)", price: 9.00, unit: "CY" },
    { category: "Concrete: Additives & Finish", name: "Cure & Seal (5 Gallon)", price: 125.00, unit: "EA" },
    { category: "Concrete: Additives & Finish", name: "Form Release Oil (5 Gallon)", price: 85.00, unit: "EA" },
    { category: "Concrete: Additives & Finish", name: "Color: Charcoal / Dark Gray", price: 85.00, unit: "DOSE" },
    { category: "Concrete: Additives & Finish", name: "Color: Mocha / Light Brown", price: 95.00, unit: "DOSE" },
    { category: "Concrete: Additives & Finish", name: "Color: Sandstone / Tan", price: 95.00, unit: "DOSE" },
    { category: "Concrete: Additives & Finish", name: "Color: Slate / Blue Gray", price: 110.00, unit: "DOSE" },

    { category: "Concrete: Base & Prep", name: "Roadbase (Concrete 1\" Minus)", price: 10.50, unit: "TON" },
    { category: "Concrete: Base & Prep", name: "Gravel (3/4\" Clean)", price: 28.00, unit: "TON" },
    { category: "Concrete: Base & Prep", name: "Expansion Joint (Felt 1/2\" x 4\")", price: 6.50, unit: "LF" },
    { category: "Concrete: Base & Prep", name: "Vapor Barrier (10mil - 1000SF)", price: 150.00, unit: "ROLL" },
    { category: "Concrete: Base & Prep", name: "Form Lumber (2x4x16)", price: 14.00, unit: "EA" },

    { category: "Concrete: Pumping & Services", name: "Line Pump (Ground Pump)", price: 900.00, unit: "EA" },
    { category: "Concrete: Pumping & Services", name: "Spider Pump (Boom Pump)", price: 1250.00, unit: "EA" },
    { category: "Concrete: Pumping & Services", name: "Concrete Buggy Rental", price: 400.00, unit: "DAY" },
    { category: "Concrete: Pumping & Services", name: "Pump Washout Fee", price: 150.00, unit: "EA" },

    { category: "Pavers: Standard", name: "Cambridge Cobble 6x6 (Victorian)", price: 4.30, unit: "SF" },
    { category: "Pavers: Standard", name: "Cambridge Cobble 6x9 (Victorian)", price: 4.30, unit: "SF" },
    { category: "Pavers: Standard", name: "Holland Stone 4x8 (Rio)", price: 4.19, unit: "SF" },
    { category: "Pavers: Standard", name: "Catalina Grana 3pc", price: 5.50, unit: "SF" },
    { category: "Pavers: Standard", name: "Lafitt Grana Slab", price: 6.80, unit: "SF" },

    { category: "Pavers: Premium Slabs", name: "Dimensions 6 (Rio)", price: 5.78, unit: "SF" },
    { category: "Pavers: Premium Slabs", name: "Dimensions 12 (Scan. Gray)", price: 7.45, unit: "SF" },
    { category: "Pavers: Premium Slabs", name: "Dimensions 18 (Scan. Gray)", price: 9.18, unit: "SF" },
    { category: "Pavers: Premium Slabs", name: "Origins 12 (Rio)", price: 7.30, unit: "SF" },
    { category: "Pavers: Premium Slabs", name: "Origins 18 (Rio)", price: 8.44, unit: "SF" },
    { category: "Pavers: Premium Slabs", name: "Plaza Paver 24x24 (Graphite)", price: 20.69, unit: "EA" },
    { category: "Pavers: Premium Slabs", name: "Porcelain Paver 24x24", price: 11.50, unit: "SF" },

    { category: "Hardscape: Base & Bedding", name: "Roadbase (Concrete 1\" Minus)", price: 10.50, unit: "TON" },
    { category: "Hardscape: Base & Bedding", name: "Roadbase (Asphalt 1\" Minus)", price: 5.00, unit: "TON" },
    { category: "Hardscape: Base & Bedding", name: "Bedding Sand (Concrete Sand)", price: 22.00, unit: "TON" },
    { category: "Hardscape: Base & Bedding", name: "Bedding Chip (ASTM #8)", price: 38.00, unit: "TON" },
    { category: "Hardscape: Base & Bedding", name: "Landscape Fabric (Heavy Duty)", price: 0.15, unit: "SF" },

    { category: "Hardscape: Poly Sand & Edge", name: "Poly Sand (HP NextGel)", price: 36.89, unit: "BAG" },
    { category: "Hardscape: Poly Sand & Edge", name: "Poly Sand (G2 Maxx)", price: 45.30, unit: "BAG" },
    { category: "Hardscape: Poly Sand & Edge", name: "Paver Edging (Snap Edge)", price: 13.50, unit: "EA" },
    { category: "Hardscape: Poly Sand & Edge", name: "10 Inch Spikes (Box 50)", price: 45.00, unit: "BOX" },
    { category: "Hardscape: Poly Sand & Edge", name: "Concrete Bond Beam (Mix)", price: 6.50, unit: "BAG" },
    { category: "Hardscape: Poly Sand & Edge", name: "Permeable Chip (ASTM #9)", price: 42.00, unit: "TON" },

    { category: "Decorative Rock", name: "Cherokee Red Sandstone (1-2\")", price: 75.00, unit: "TON" },
    { category: "Decorative Rock", name: "Wasatch Gray Crushed (1\")", price: 55.00, unit: "TON" },
    { category: "Decorative Rock", name: "Wasatch Gray Crushed (1.5\")", price: 60.00, unit: "TON" },
    { category: "Decorative Rock", name: "Southern Sunset Crushed (2-4\")", price: 40.00, unit: "TON" },
    { category: "Decorative Rock", name: "Southern Sunset Crushed (1-2\")", price: 35.00, unit: "TON" },
    { category: "Decorative Rock", name: "Benjamin Gray Crushed (2-4\")", price: 35.00, unit: "TON" },
    { category: "Decorative Rock", name: "Island Storm Crushed (1.5\")", price: 45.00, unit: "TON" },
    { category: "Decorative Rock", name: "Charcoal Breeze", price: 65.00, unit: "TON" },
    { category: "Decorative Rock", name: "Sunburst Gold (1-2\")", price: 68.00, unit: "TON" },
    { category: "Decorative Rock", name: "Black Lava Rock (1.5\")", price: 95.00, unit: "TON" },

    { category: "Cobble & Pebbles", name: "Mexican Pebbles (1.5\")", price: 875.00, unit: "TON" },
    { category: "Cobble & Pebbles", name: "Mexican Pebbles (2-3\")", price: 900.00, unit: "TON" },
    { category: "Cobble & Pebbles", name: "Washed South Town Cobble (1.25\")", price: 50.00, unit: "TON" },
    { category: "Cobble & Pebbles", name: "Washed South Town Cobble (3-6\")", price: 55.00, unit: "TON" },
    { category: "Cobble & Pebbles", name: "Nebo Brown Cobble (3-8\")", price: 65.00, unit: "TON" },
    { category: "Cobble & Pebbles", name: "Rainbow Cobble (4-8\")", price: 72.00, unit: "TON" },

    { category: "Boulders", name: "Standard Boulder (18-24 inch)", price: 75.00, unit: "EA" },
    { category: "Boulders", name: "Large Boulder (2-3 ft)", price: 90.00, unit: "EA" },
    { category: "Boulders", name: "Extra Large Boulder (3-4 ft)", price: 125.00, unit: "EA" },
    { category: "Boulders", name: "Placement Labor (Per Boulder)", price: 45.00, unit: "EA" },

    { category: "Soils & Mulch", name: "Topsoil (Riverton Site)", price: 30.00, unit: "CY" },
    { category: "Soils & Mulch", name: "Topsoil (Payson Site)", price: 20.00, unit: "CY" },
    { category: "Soils & Mulch", name: "Shredded Bark Mulch (Dark)", price: 105.00, unit: "CY" },
    { category: "Soils & Mulch", name: "Shredded Bark Mulch (Natural)", price: 95.00, unit: "CY" },
    { category: "Soils & Mulch", name: "Playground Chips (Certified)", price: 55.00, unit: "CY" },
    { category: "Soils & Mulch", name: "Compost (Generic)", price: 28.00, unit: "CY" },

    { category: "Construction Aggregates", name: "Roadbase (1.5\" Minus)", price: 13.25, unit: "TON" },
    { category: "Construction Aggregates", name: "Bedding Sand (3/4\" Minus)", price: 7.95, unit: "TON" },
    { category: "Construction Aggregates", name: "Drain Rock (1\" Minus)", price: 20.75, unit: "TON" },
    { category: "Construction Aggregates", name: "Recycled Asphalt (2\" Minus)", price: 14.00, unit: "TON" },
    { category: "Construction Aggregates", name: "Structural Fill (3\" Minus)", price: 9.50, unit: "TON" },
    { category: "Construction Aggregates", name: "Granular Borrow (4\" Minus)", price: 8.50, unit: "TON" },

    { category: "Disposal Services", name: "Disposal Fee (Weight Based)", price: 30.00, unit: "TON" },
    { category: "Disposal Services", name: "Disposal: Clean Concrete (Load)", price: 60.00, unit: "EA" },
    { category: "Disposal Services", name: "Disposal: Mixed/Dirty Load (Load)", price: 250.00, unit: "EA" },

    { category: "Walls & Caps", name: "Tandem Next Modular Wall", price: 3.12, unit: "EA" },
    { category: "Walls & Caps", name: "Tandem Melville Rio", price: 8.30, unit: "SF" },
    { category: "Walls & Caps", name: "Diamond Pro Air (Split Face Gray)", price: 8.67, unit: "SF" },
    { category: "Walls & Caps", name: "Diamond Pro Corner (Gray)", price: 13.07, unit: "EA" },
    { category: "Walls & Caps", name: "Melville Wall (Rio)", price: 24.39, unit: "SF" },
    { category: "Walls & Caps", name: "Melville Cap (Rio)", price: 13.38, unit: "EA" },
    { category: "Walls & Caps", name: "Weston Stone Universal (Victorian)", price: 15.68, unit: "SF" },
    { category: "Walls & Caps", name: "Geogrid (Structural)", price: 1.50, unit: "SF" },
    { category: "Walls & Caps", name: "4\" Perforated Drain Pipe", price: 1.25, unit: "LF" },

    { category: "Kits & Steps", name: "Landings Step (Graphite)", price: 195.07, unit: "EA" },
    { category: "Kits & Steps", name: "Melville Wedge Firepit Kit (Scan. Gray)", price: 502.18, unit: "KIT" },

    { category: "Miscellaneous / Contingency", name: "Excess Material Buffer", price: 1.00, unit: "DOLLAR" },
    { category: "Miscellaneous / Contingency", name: "Site Protection / Cleanup Misc", price: 1.00, unit: "DOLLAR" },
    { category: "Miscellaneous / Contingency", name: "Extra Fuel / Transport Surcharge", price: 1.00, unit: "DOLLAR" },

    { category: "Irrigation: Smart Controls", name: "Rain Bird ESP-ME3 WiFi Ready", price: 165.00, unit: "EA" },
    { category: "Irrigation: Smart Controls", name: "Hunter Pro-HC Hydrawise", price: 285.00, unit: "EA" },
    { category: "Irrigation: Smart Controls", name: "Rain Bird LNK2 WiFi Module", price: 115.00, unit: "EA" },
    { category: "Irrigation: Smart Controls", name: "Rain Bird WR2 Wireless Rain Sensor", price: 48.00, unit: "EA" },
    { category: "Irrigation: Smart Controls", name: "Hunter Wireless Rain-Clik", price: 52.00, unit: "EA" },

    { category: "Irrigation: Rotors & Sprays", name: "Rain Bird 5004-PC Rotor", price: 12.50, unit: "EA" },
    { category: "Irrigation: Rotors & Sprays", name: "Rain Bird 1804 Spray Body", price: 4.50, unit: "EA" },
    { category: "Irrigation: Rotors & Sprays", name: "Hunter Pro-Spray Body", price: 4.75, unit: "EA" },
    { category: "Irrigation: Rotors & Sprays", name: "Hunter MP Rotator Nozzle", price: 9.50, unit: "EA" },
    { category: "Irrigation: Rotors & Sprays", name: "Rain Bird HE-VAN Nozzle", price: 2.25, unit: "EA" },

    { category: "Irrigation: Valves & Drip", name: "Rain Bird DV Valve (1 Inch)", price: 24.00, unit: "EA" },
    { category: "Irrigation: Valves & Drip", name: "Rain Bird PGA Valve (Commercial)", price: 38.00, unit: "EA" },
    { category: "Irrigation: Valves & Drip", name: "Valve Box (Standard Rectangular)", price: 45.00, unit: "EA" },
    { category: "Irrigation: Valves & Drip", name: "Valve Box (Round 10\")", price: 22.00, unit: "EA" },
    { category: "Irrigation: Valves & Drip", name: "Netafim Techline (0.9 GPH 12\")", price: 0.65, unit: "LF" },
    { category: "Irrigation: Valves & Drip", name: "Rain Bird XFS Dripline", price: 0.58, unit: "LF" },

    { category: "Irrigation: Infrastructure", name: "PVC Pipe Sch 40 (1 Inch)", price: 0.85, unit: "LF" },
    { category: "Irrigation: Infrastructure", name: "PVC Pipe Sch 40 (3/4 Inch)", price: 0.65, unit: "LF" },
    { category: "Irrigation: Infrastructure", name: "Poly Pipe (Funny Pipe)", price: 0.45, unit: "LF" },
    { category: "Irrigation: Infrastructure", name: "Wire (Multi-Strand)", price: 0.40, unit: "LF" },
    { category: "Irrigation: Infrastructure", name: "Mainline Fittings (Assorted)", price: 2.50, unit: "EA" },
    { category: "Irrigation: Infrastructure", name: "Lateral Fittings (Assorted)", price: 1.25, unit: "EA" },

    { category: "Outdoor Kitchens", name: "Ewing Bistros: Panel End", price: 130.00, unit: "EA" },
    { category: "Outdoor Kitchens", name: "Ewing Bistros: Beam", price: 22.00, unit: "EA" },
    { category: "Outdoor Kitchens", name: "Ewing Bistros: Countertop Support", price: 102.00, unit: "EA" },
    { category: "Outdoor Kitchens", name: "Uniframe Module (Galvanized)", price: 150.00, unit: "LF" },
    { category: "Outdoor Kitchens", name: "CMU Block 8x8x16", price: 2.50, unit: "EA" },
    { category: "Outdoor Kitchens", name: "Concrete Bag (80lb)", price: 6.50, unit: "BAG" },
    { category: "Outdoor Kitchens", name: "Rebar #4 (20ft)", price: 10.00, unit: "EA" },
    { category: "Outdoor Kitchens", name: "Mortar Mix (80lb)", price: 8.00, unit: "BAG" },
    { category: "Outdoor Kitchens", name: "Blaze Prelude LBM 32in Grill", price: 1800.00, unit: "EA" },
    { category: "Outdoor Kitchens", name: "Big Green Egg (Large)", price: 1300.00, unit: "EA" },
    { category: "Outdoor Kitchens", name: "Ooni Pizza Oven", price: 600.00, unit: "EA" },
    { category: "Outdoor Kitchens", name: "Outdoor Fridge (Compact)", price: 750.00, unit: "EA" },
    { category: "Outdoor Kitchens", name: "Access Door (Stainless 30in)", price: 250.00, unit: "EA" },
    { category: "Outdoor Kitchens", name: "Joyside Cedar Gazebo 15x13", price: 2200.00, unit: "EA" },
    { category: "Outdoor Kitchens", name: "Stone Veneer (Material)", price: 15.00, unit: "SF" },
    { category: "Outdoor Kitchens", name: "Granite Slab (Material)", price: 50.00, unit: "SF" },
    { category: "Outdoor Kitchens", name: "Stucco Base Coat", price: 3.50, unit: "SF" },
    { category: "Outdoor Kitchens", name: "Concrete Countertop Mix", price: 18.00, unit: "BAG" },
    { category: "Outdoor Kitchens", name: "Belgard Tandem Next Wall Unit", price: 3.12, unit: "EA" },
    { category: "Outdoor Kitchens", name: "Belgard Tandem Veneer (Melville/Ashlar)", price: 8.83, unit: "SF" },
    { category: "Outdoor Kitchens", name: "Belgard Tandem Connector (Plastic)", price: 0.68, unit: "EA" },
    { category: "Outdoor Kitchens", name: "Belgard U-Start Base Block", price: 6.50, unit: "EA" },
    { category: "Outdoor Kitchens", name: "Belgard Weston Universal Stone", price: 15.68, unit: "SF" },
    { category: "Outdoor Kitchens", name: "Construction Adhesive (29oz)", price: 15.40, unit: "EA" },
    { category: "Outdoor Kitchens", name: "Belgard Diamond Pro Air (Gray)", price: 8.67, unit: "SF" },
    { category: "Outdoor Kitchens", name: "Belgard Diamond Pro Air (Sandstone)", price: 10.33, unit: "SF" },
    { category: "Outdoor Kitchens", name: "Belgard Diamond Pro Corner", price: 13.07, unit: "EA" },
    { category: "Outdoor Kitchens", name: "Belgard Melville Wall (Rio)", price: 24.39, unit: "SF" },
    { category: "Outdoor Kitchens", name: "Belgard Melville Cap (Rio)", price: 13.38, unit: "EA" },
    { category: "Outdoor Kitchens", name: "Belgard Universal Cap", price: 8.48, unit: "EA" }
];

export const CONCRETE_MIXES = MATERIAL_CATALOG.filter(m => m.category === "Concrete: Mixes");
export const PUMP_SERVICES = MATERIAL_CATALOG.filter(m => m.category === "Concrete: Pumping & Services");
export const PAVERS_STANDARD = MATERIAL_CATALOG.filter(m => m.category === "Pavers: Standard");
export const PAVERS_PREMIUM = MATERIAL_CATALOG.filter(m => m.category === "Pavers: Premium Slabs");
export const WALL_BLOCKS = MATERIAL_CATALOG.filter(m => m.category === "Walls & Caps" && m.unit === "SF");
export const WALL_CAPS = MATERIAL_CATALOG.filter(m => m.category === "Walls & Caps" && m.unit === "EA" && m.name.includes("Cap"));
