import { SubjectConfig, GradeBand, Topic, TopicProgress, SubjectProgress } from "./types";

export const CURRICULUM: Record<string, SubjectConfig> = {
  math: {
    label: "Math", icon: "✦", color: "#d97706", colorLight: "#fef3c7", colorMid: "#fde68a",
    topics: {
      "K-1": [
        { id: "counting_20", name: "Counting to 20", desc: "Counting forward and backward" },
        { id: "number_sense", name: "Number Sense", desc: "Comparing numbers: more, less, equal" },
        { id: "add_within_10", name: "Addition within 10", desc: "Combining small groups" },
        { id: "sub_within_10", name: "Subtraction within 10", desc: "Taking away from small groups" },
        { id: "shapes_2d", name: "2D Shapes", desc: "Circles, squares, triangles, rectangles" },
        { id: "patterns", name: "Patterns", desc: "What comes next?" },
      ],
      "2-3": [
        { id: "place_value_2d", name: "Place Value: Tens & Ones", desc: "What digits are worth in 2-digit numbers" },
        { id: "place_value_3d", name: "Place Value: Hundreds", desc: "Expanding to 3-digit numbers" },
        { id: "expanded_form", name: "Expanded Form", desc: "Breaking numbers into hundreds + tens + ones" },
        { id: "add_regroup", name: "Addition with Regrouping", desc: "Carrying when ones add to 10+" },
        { id: "sub_regroup", name: "Subtraction with Regrouping", desc: "Borrowing from the tens place" },
        { id: "mental_math", name: "Mental Math Strategies", desc: "Adding and subtracting in your head" },
        { id: "estimation", name: "Estimation", desc: "Rounding and estimating sums/differences" },
        { id: "word_problems_2step", name: "Two-Step Word Problems", desc: "Problems with multiple operations" },
        { id: "equal_groups", name: "Equal Groups", desc: "Intro to multiplication as groups" },
        { id: "arrays", name: "Arrays & Multiplication", desc: "Rows and columns as multiplication" },
        { id: "mult_facts", name: "Multiplication Facts", desc: "Building fluency: 2s, 5s, 10s, then 3s and 4s" },
        { id: "intro_division", name: "Intro to Division", desc: "Sharing equally and grouping" },
        { id: "fractions_intro", name: "Fractions", desc: "Halves, thirds, fourths: parts of a whole" },
      ],
      "4-5": [
        { id: "multi_digit_mult", name: "Multi-Digit Multiplication", desc: "Multiplying 2- and 3-digit numbers" },
        { id: "long_division", name: "Long Division", desc: "Dividing with remainders" },
        { id: "fractions_ops", name: "Fraction Operations", desc: "Adding, subtracting, comparing fractions" },
        { id: "decimals", name: "Decimals", desc: "Place value, comparing, and operations with decimals" },
        { id: "order_of_ops", name: "Order of Operations", desc: "PEMDAS: which operation goes first?" },
        { id: "area_perimeter", name: "Area & Perimeter", desc: "Measuring space and boundaries" },
        { id: "geometry_angles", name: "Angles & Geometry", desc: "Measuring and classifying angles" },
        { id: "data_graphs", name: "Data & Graphs", desc: "Reading and creating charts and graphs" },
        { id: "pre_algebra", name: "Pre-Algebra Thinking", desc: "Variables, expressions, and equations" },
      ],
    },
  },
  reading: {
    label: "Reading", icon: "◈", color: "#7c3aed", colorLight: "#f5f3ff", colorMid: "#ddd6fe",
    topics: {
      "K-1": [
        { id: "letter_sounds", name: "Letter Sounds", desc: "Connecting letters to their sounds" },
        { id: "sight_words", name: "Sight Words", desc: "Recognizing common words instantly" },
        { id: "simple_sentences", name: "Simple Sentences", desc: "Reading and understanding short sentences" },
        { id: "story_elements_basic", name: "Characters & Setting", desc: "Who is in the story? Where does it happen?" },
        { id: "retelling", name: "Retelling", desc: "What happened in the story?" },
      ],
      "2-3": [
        { id: "detail_finding", name: "Detail Finding", desc: "Who, what, where, when in a passage" },
        { id: "sequencing", name: "Sequencing", desc: "Ordering events: first, then, finally" },
        { id: "main_idea", name: "Main Idea", desc: "What is the passage mostly about?" },
        { id: "inference", name: "Making Inferences", desc: "Reading between the lines" },
        { id: "cause_effect", name: "Cause & Effect", desc: "Why did it happen?" },
        { id: "compare_contrast", name: "Compare & Contrast", desc: "How are two things alike and different?" },
        { id: "vocab_context", name: "Vocabulary in Context", desc: "Figuring out word meaning from clues" },
        { id: "sentence_building", name: "Sentence Construction", desc: "Building clear, complete sentences" },
        { id: "paragraph_structure", name: "Paragraph Structure", desc: "Topic sentences, details, conclusions" },
        { id: "fact_opinion", name: "Fact vs. Opinion", desc: "Can you prove it, or is it a belief?" },
      ],
      "4-5": [
        { id: "theme", name: "Theme & Central Message", desc: "What lesson does the story teach?" },
        { id: "point_of_view", name: "Point of View", desc: "Who is telling the story and why it matters" },
        { id: "figurative_lang", name: "Figurative Language", desc: "Similes, metaphors, idioms, hyperbole" },
        { id: "text_structure", name: "Text Structure", desc: "How authors organize information" },
        { id: "argument_evidence", name: "Argument & Evidence", desc: "Claims, reasons, and supporting details" },
        { id: "summary_writing", name: "Summary Writing", desc: "Condensing a text to its key points" },
        { id: "multi_paragraph", name: "Multi-Paragraph Writing", desc: "Organizing ideas across paragraphs" },
        { id: "research_skills", name: "Research Skills", desc: "Finding and evaluating sources" },
      ],
    },
  },
  science: {
    label: "Science", icon: "◉", color: "#0891b2", colorLight: "#ecfeff", colorMid: "#a5f3fc",
    topics: {
      "K-1": [
        { id: "five_senses", name: "Five Senses", desc: "Observing the world around you" },
        { id: "living_things", name: "Living & Non-Living", desc: "What makes something alive?" },
        { id: "weather_basic", name: "Weather", desc: "Sunny, rainy, cloudy, snowy" },
        { id: "animals_basic", name: "Animals & Their Needs", desc: "Food, water, shelter" },
        { id: "plants_basic", name: "Plants & Their Needs", desc: "Sun, water, soil" },
      ],
      "2-3": [
        { id: "animal_habitats", name: "Animal Habitats", desc: "Where animals live and why" },
        { id: "life_cycles", name: "Life Cycles", desc: "How plants and animals grow and change" },
        { id: "states_of_matter", name: "States of Matter", desc: "Solid, liquid, gas" },
        { id: "weather_seasons", name: "Weather & Seasons", desc: "Patterns in weather throughout the year" },
        { id: "earth_materials", name: "Earth Materials", desc: "Rocks, soil, water" },
        { id: "simple_machines", name: "Simple Machines", desc: "Levers, ramps, wheels, pulleys" },
        { id: "force_motion", name: "Force & Motion", desc: "Pushes, pulls, and how things move" },
        { id: "ecosystems", name: "Ecosystems & Food Chains", desc: "How living things depend on each other" },
        { id: "solar_system_basic", name: "Earth, Moon & Sun", desc: "Day, night, and seasons" },
        { id: "scientific_method", name: "Scientific Method", desc: "Ask, predict, test, observe, conclude" },
      ],
      "4-5": [
        { id: "energy_forms", name: "Forms of Energy", desc: "Light, heat, sound, electrical" },
        { id: "electricity", name: "Electricity & Circuits", desc: "How electricity flows" },
        { id: "human_body", name: "Human Body Systems", desc: "Skeletal, muscular, digestive, circulatory" },
        { id: "earth_layers", name: "Earth Layers", desc: "Crust, mantle, core" },
        { id: "water_cycle", name: "Water Cycle", desc: "Evaporation, condensation, precipitation" },
        { id: "ecosystems_adv", name: "Advanced Ecosystems", desc: "Producers, consumers, decomposers" },
        { id: "space_adv", name: "Solar System", desc: "Planets, orbits, gravity" },
        { id: "engineering_design", name: "Engineering Design", desc: "Define, plan, build, test, improve" },
      ],
    },
  },
  geography: {
    label: "Geography", icon: "🌍", color: "#059669", colorLight: "#ecfdf5", colorMid: "#a7f3d0",
    topics: {
      "K-1": [
        { id: "my_neighborhood", name: "My Neighborhood", desc: "Where I live: home, street, town" },
        { id: "maps_basics", name: "Maps & Globes", desc: "What maps show us and how to read them" },
        { id: "continents", name: "7 Continents", desc: "The big land areas of the world" },
        { id: "oceans", name: "5 Oceans", desc: "The big bodies of water on Earth" },
        { id: "land_water", name: "Land & Water", desc: "Mountains, rivers, lakes, islands" },
      ],
      "2-3": [
        { id: "us_states_regions", name: "US States & Regions", desc: "The 50 states and major regions" },
        { id: "geo_hierarchy_us", name: "How Places Fit Together (US)", desc: "City, county, state, country: places inside places" },
        { id: "countries_world", name: "Countries of the World", desc: "Major countries on each continent" },
        { id: "geo_hierarchy_world", name: "How Places Fit Together (World)", desc: "Cities, provinces, and countries around the globe" },
        { id: "capitals", name: "Capital Cities", desc: "Capital cities of US states and world countries" },
        { id: "currencies_intro", name: "Money Around the World", desc: "Dollars, euros, yen, pounds: what people use to buy things" },
        { id: "cardinal_directions", name: "Directions & Compass", desc: "North, south, east, west on a map" },
        { id: "landmarks", name: "Famous Landmarks", desc: "Statue of Liberty, Eiffel Tower, Great Wall and more" },
      ],
      "4-5": [
        { id: "world_regions", name: "World Regions & Cultures", desc: "How geography shapes how people live" },
        { id: "geo_hierarchy_deep", name: "Government Layers", desc: "Counties, provinces, states, territories across countries" },
        { id: "currencies_exchange", name: "Currencies & Exchange", desc: "Why money is different and how exchange works" },
        { id: "climate_zones", name: "Climate Zones", desc: "Tropical, temperate, polar: why weather differs" },
        { id: "natural_resources", name: "Natural Resources", desc: "What the earth provides and where" },
        { id: "population_cities", name: "Population & Major Cities", desc: "Where people live and why cities grow" },
        { id: "map_skills_adv", name: "Advanced Map Skills", desc: "Latitude, longitude, scale, and legends" },
        { id: "cultural_geography", name: "Cultural Geography", desc: "Languages, traditions, and food around the world" },
      ],
    },
  },
  history: {
    label: "History", icon: "📜", color: "#b45309", colorLight: "#fffbeb", colorMid: "#fde68a",
    topics: {
      "K-1": [
        { id: "holidays_why", name: "Holidays & Celebrations", desc: "Why we celebrate special days" },
        { id: "community_helpers", name: "Community Helpers", desc: "People who help us: then and now" },
        { id: "famous_americans_k", name: "Famous Americans", desc: "People who made a difference" },
        { id: "long_ago_now", name: "Long Ago & Today", desc: "How life has changed over time" },
        { id: "my_family_history", name: "Family History", desc: "Where your family comes from" },
      ],
      "2-3": [
        { id: "native_peoples", name: "First Peoples", desc: "The first people who lived in America" },
        { id: "explorers", name: "Explorers & Discovery", desc: "People who traveled to find new lands" },
        { id: "colonial_life", name: "Colonial Life", desc: "What life was like in early America" },
        { id: "independence", name: "American Independence", desc: "How America became its own country" },
        { id: "civil_rights_intro", name: "Fairness & Equal Rights", desc: "People who stood up for what is right" },
        { id: "ancient_egypt", name: "Ancient Egypt", desc: "Pharaohs, pyramids, and the Nile" },
        { id: "ancient_greece", name: "Ancient Greece", desc: "Democracy, Olympics, and great thinkers" },
        { id: "inventions", name: "Inventions That Changed the World", desc: "Light bulbs, telephones, and more" },
      ],
      "4-5": [
        { id: "ancient_rome", name: "Ancient Rome", desc: "Republic, empire, and lasting ideas" },
        { id: "medieval_world", name: "Medieval World", desc: "Castles, knights, and trade routes" },
        { id: "renaissance", name: "Renaissance", desc: "A rebirth of art, science, and ideas" },
        { id: "american_growth", name: "America Grows", desc: "Westward expansion and new states" },
        { id: "immigration_stories", name: "Immigration Stories", desc: "People coming to America for a better life" },
        { id: "modern_leaders", name: "Leaders Who Changed the World", desc: "People who shaped the modern world" },
        { id: "space_race", name: "Space Race", desc: "The journey to reach the moon" },
        { id: "tech_revolution", name: "Technology Revolution", desc: "Computers, internet, and how the world connected" },
      ],
    },
  },
  bible: {
    label: "Faith & Values", icon: "✡", color: "#6d28d9", colorLight: "#f5f3ff", colorMid: "#c4b5fd",
    topics: {
      "K-1": [
        { id: "creation", name: "Creation", desc: "How God made the world and everything in it" },
        { id: "adam_eve", name: "Adam & Eve", desc: "The first people in the Garden of Eden" },
        { id: "noahs_ark", name: "Noah and the Ark", desc: "Noah builds a big boat and saves the animals" },
        { id: "abraham_sarah", name: "Abraham & Sarah", desc: "A family that trusted God and started a great nation" },
        { id: "baby_moses", name: "Baby Moses", desc: "A baby saved from a river who became a leader" },
        { id: "david_goliath", name: "David & Goliath", desc: "A brave boy who stood up to a giant" },
        { id: "shabbat_rest", name: "Shabbat: A Day of Rest", desc: "Why resting and being with family is special" },
        { id: "kindness_stories", name: "Being Kind Like God Wants", desc: "Stories about helping others and being good" },
      ],
      "2-3": [
        { id: "torah_intro", name: "The Torah: Our Oldest Guide", desc: "The five books that teach us how to live well" },
        { id: "exodus_freedom", name: "Exodus: The Journey to Freedom", desc: "Moses leading people out of slavery to the Promised Land" },
        { id: "ten_commandments", name: "Ten Commandments", desc: "Rules both Jews and Christians follow for a good life" },
        { id: "israel_homeland", name: "Israel: The Jewish Homeland", desc: "Why Israel is so important to the Jewish people" },
        { id: "ruth_naomi", name: "Ruth & Naomi", desc: "A story of loyalty, love, and choosing family" },
        { id: "esther_courage", name: "Esther and Purim", desc: "A queen who saved her people with courage" },
        { id: "psalms_prayers", name: "Psalms & Prayers", desc: "Songs of praise shared by Jews and Christians" },
        { id: "jesus_jewish_teacher", name: "Jesus the Jewish Teacher", desc: "How Jesus grew up Jewish and taught lessons from the Torah" },
        { id: "parables_values", name: "Parables: Stories With Lessons", desc: "Stories Jesus told based on Jewish wisdom about being good" },
        { id: "holidays_meaning", name: "Holidays and Their Meaning", desc: "Shabbat, Passover, Easter, Hanukkah: why we celebrate and what they teach" },
        { id: "tikkun_olam", name: "Tikkun Olam: Repairing the World", desc: "The Jewish idea that we must help make the world better" },
        { id: "family_traditions", name: "Family Traditions Matter", desc: "Why traditions bring families together and keep our values alive" },
      ],
      "4-5": [
        { id: "shared_roots", name: "Shared Roots", desc: "How Judaism and Christianity grew from the same tree" },
        { id: "kings_israel", name: "Kings of Israel", desc: "Saul, David, Solomon and the kingdom in the land of Israel" },
        { id: "prophets_justice", name: "Prophets and Justice", desc: "People who spoke up for fairness and caring for the poor" },
        { id: "wisdom_proverbs", name: "Wisdom & Proverbs", desc: "Wise sayings from Jewish tradition about living well" },
        { id: "jesus_in_context", name: "Jesus in Jewish Context", desc: "Understanding Jesus as a Jew who built on the Torah and Jewish values" },
        { id: "acts_early_church", name: "The Early Followers", desc: "How the first followers spread teachings rooted in Jewish tradition" },
        { id: "mitzvot_good_deeds", name: "Mitzvot: Good Deeds", desc: "The Jewish tradition of doing good deeds and why it matters" },
        { id: "charity_tzedakah", name: "Tzedakah and Charity", desc: "Why giving to others is not optional but a duty" },
        { id: "values_character", name: "Values & Character", desc: "Faith, hope, love, kindness, forgiveness: what both traditions teach" },
        { id: "caring_for_family", name: "Honoring Family", desc: "What the Bible teaches about respecting parents and caring for family" },
      ],
    },
  },
};

export const GRADE_BANDS = [
  { id: "K-1" as GradeBand, label: "Kindergarten - 1st Grade" },
  { id: "2-3" as GradeBand, label: "2nd - 3rd Grade" },
  { id: "4-5" as GradeBand, label: "4th - 5th Grade" },
];

export const LEARNING_STYLES = [
  { id: "visual", label: "Visual", desc: "Sees it drawn or modeled", icon: "👁️" },
  { id: "auditory", label: "Auditory", desc: "Learns by hearing explanations", icon: "👂" },
  { id: "kinesthetic", label: "Hands-On", desc: "Learns by doing and touching", icon: "✋" },
  { id: "verbal", label: "Verbal", desc: "Learns by talking through it", icon: "💬" },
  { id: "visual_audio", label: "Visual + Audio", desc: "Sees it, hears it, then reflects", icon: "👁️👂" },
];

export const AVATARS = [
  "🦊", "🐱", "🦉", "🐸", "🦋", "🐼", "🦁", "🐰", "🐢",
  "🌟", "🚀", "🎨", "🎵", "⚡", "🌈", "🔥",
  "🕷️", "🧑‍🚒", "🐶",
];

export const MASTERY = { advance: 4, struggle: 2, masteredPct: 85, minQ: 10, minLevel: 5 };

export function buildProgressDefaults(gradeBand: GradeBand): { subject: string; topic_id: string; unlocked: boolean }[] {
  const rows: { subject: string; topic_id: string; unlocked: boolean }[] = [];
  for (const [subj, data] of Object.entries(CURRICULUM)) {
    const topics = data.topics[gradeBand] || [];
    topics.forEach((t, i) => {
      rows.push({ subject: subj, topic_id: t.id, unlocked: i === 0 });
    });
  }
  return rows;
}

export function getTopics(subject: string, gradeBand: GradeBand): Topic[] {
  return CURRICULUM[subject]?.topics[gradeBand] || [];
}

/* ─── PLACEMENT TEST QUESTIONS ─── */
export type PlacementQ = { q: string; opts: string[]; correct: number; level: number };
export const PLACEMENT_QUESTIONS: Record<string, PlacementQ[]> = {
  math: [
    { q: "What is 7 + 5?", opts: ["11","12","13","10"], correct: 1, level: 2 },
    { q: "What is 48 + 35?", opts: ["73","83","82","93"], correct: 1, level: 3 },
    { q: "What is 7 × 8?", opts: ["54","56","48","64"], correct: 1, level: 5 },
    { q: "Which fraction is larger: 3/4 or 2/3?", opts: ["3/4","2/3","They are equal","Cannot tell"], correct: 0, level: 6 },
    { q: "If 4x + 3 = 19, what is x?", opts: ["3","4","5","6"], correct: 1, level: 8 },
  ],
  reading: [
    { q: "Which word rhymes with 'cake'?", opts: ["Cook","Lake","Kick","Cup"], correct: 1, level: 2 },
    { q: "What is the 'main idea' of a passage?", opts: ["The first sentence","What it's mostly about","The longest paragraph","The title"], correct: 1, level: 3 },
    { q: "'The wind whispered through the trees.' This is an example of:", opts: ["Simile","Alliteration","Personification","Hyperbole"], correct: 2, level: 5 },
    { q: "An author writes to persuade. What is their purpose?", opts: ["To entertain","To inform","To convince you of something","To describe a place"], correct: 2, level: 6 },
    { q: "A narrator who knows all characters' thoughts is called:", opts: ["First person","Second person","Third person limited","Third person omniscient"], correct: 3, level: 8 },
  ],
  science: [
    { q: "Which of these is a living thing?", opts: ["Rock","Water","Tree","Cloud"], correct: 2, level: 2 },
    { q: "Water turning into ice is called:", opts: ["Melting","Evaporation","Freezing","Condensation"], correct: 2, level: 3 },
    { q: "Plants make their own food using sunlight. This process is called:", opts: ["Respiration","Photosynthesis","Digestion","Germination"], correct: 1, level: 5 },
    { q: "In a food chain, what do we call an animal that eats other animals?", opts: ["Producer","Decomposer","Predator","Herbivore"], correct: 2, level: 6 },
    { q: "Which type of energy transformation happens in a battery-powered flashlight?", opts: ["Light → Chemical","Chemical → Electrical → Light","Nuclear → Heat","Sound → Light"], correct: 1, level: 8 },
  ],
  geography: [
    { q: "How many continents are there?", opts: ["5","6","7","8"], correct: 2, level: 2 },
    { q: "Which is the largest ocean?", opts: ["Atlantic","Indian","Arctic","Pacific"], correct: 3, level: 3 },
    { q: "A capital city is where a country's _____ is located.", opts: ["Biggest mall","Government","Largest population","Best weather"], correct: 1, level: 5 },
    { q: "Lines of latitude measure distance from the:", opts: ["Prime Meridian","North Pole","Equator","International Date Line"], correct: 2, level: 6 },
    { q: "Which climate zone is found near the equator?", opts: ["Polar","Temperate","Tropical","Arid"], correct: 2, level: 8 },
  ],
  history: [
    { q: "Who was the first President of the United States?", opts: ["Abraham Lincoln","George Washington","Thomas Jefferson","John Adams"], correct: 1, level: 2 },
    { q: "What did explorers do?", opts: ["Built houses","Traveled to find new lands","Invented computers","Painted pictures"], correct: 1, level: 3 },
    { q: "What is democracy?", opts: ["One person rules","People vote to decide","Nobody is in charge","Only rich people decide"], correct: 1, level: 5 },
    { q: "The Renaissance was a period of renewed interest in:", opts: ["War and conquest","Art, science, and learning","Farming only","Sports and games"], correct: 1, level: 6 },
    { q: "What was the main cause of the American Revolution?", opts: ["Disagreements about food","Taxation without representation","Land disputes with France","Religious differences"], correct: 1, level: 8 },
  ],
  bible: [
    { q: "Who built the ark in the Bible?", opts: ["Moses","Abraham","Noah","David"], correct: 2, level: 2 },
    { q: "How many commandments did Moses receive?", opts: ["5","7","10","12"], correct: 2, level: 3 },
    { q: "What does 'Tikkun Olam' mean?", opts: ["Rest on Shabbat","Repairing the world","Reading the Torah","Lighting candles"], correct: 1, level: 5 },
    { q: "What is Tzedakah?", opts: ["A holiday","A prayer","Charity and giving","A type of bread"], correct: 2, level: 6 },
    { q: "The Torah consists of how many books?", opts: ["3","4","5","7"], correct: 2, level: 8 },
  ],
};

export function scorePlacement(correct: number): number {
  if (correct <= 0) return 1;
  if (correct === 1) return 2;
  if (correct === 2) return 3;
  if (correct === 3) return 5;
  if (correct === 4) return 6;
  return 8;
}
