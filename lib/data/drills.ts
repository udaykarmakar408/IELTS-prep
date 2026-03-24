export interface Question {
  id: string;
  text: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface Drill {
  id: string;
  type: string;
  title: string;
  mins: number;
  difficulty: string;
  questions: Question[];
}

export const DRILLS: Drill[] = [
  {
    id: "r1",
    type: "reading",
    title: "Academic Reading: The Future of Urban Farming",
    mins: 20,
    difficulty: "Medium",
    questions: [
      {
        id: "q1",
        text: "What is the primary benefit of vertical farming mentioned in the text?",
        options: ["Reduced water usage", "Lower labor costs", "Faster crop rotation", "Better taste"],
        correct: 0,
        explanation: "The text explicitly states that vertical farming uses 95% less water than traditional methods."
      },
      {
        id: "q2",
        text: "Vertical farming requires more energy than traditional farming.",
        options: ["True", "False", "Not Given"],
        correct: 0,
        explanation: "The passage mentions that the high cost of LED lighting and climate control leads to higher energy consumption."
      }
    ]
  },
  {
    id: "l1",
    type: "listening",
    title: "Section 1: Library Membership Application",
    mins: 10,
    difficulty: "Easy",
    questions: [
      {
        id: "q3",
        text: "What is the student's main area of study?",
        options: ["History", "Architecture", "Economics", "Engineering"],
        correct: 1,
        explanation: "The speaker mentions they are in their second year of Architecture."
      }
    ]
  },
  {
    id: "r2",
    type: "reading",
    title: "Academic Reading: The Psychology of Color",
    mins: 15,
    difficulty: "Easy",
    questions: [
      {
        id: "q4",
        text: "Which color is often associated with calmness and trust?",
        options: ["Red", "Yellow", "Blue", "Green"],
        correct: 2,
        explanation: "Blue is widely recognized in psychology as a color that promotes feelings of tranquility and reliability."
      },
      {
        id: "q5",
        text: "Red can increase heart rate and appetite.",
        options: ["True", "False", "Not Given"],
        correct: 0,
        explanation: "The text mentions that red is a stimulating color that can have physiological effects like increased heart rate."
      }
    ]
  },
  {
    id: "l2",
    type: "listening",
    title: "Section 3: Research Project Discussion",
    mins: 15,
    difficulty: "Hard",
    questions: [
      {
        id: "q6",
        text: "What was the main problem with the initial data collection?",
        options: ["Small sample size", "Biased questions", "Incorrect timing", "Technical failure"],
        correct: 1,
        explanation: "The students discuss how their survey questions led participants toward specific answers, creating bias."
      }
    ]
  },
  {
    id: "r3",
    type: "reading",
    title: "Academic Reading: Renewable Energy Trends",
    mins: 20,
    difficulty: "Medium",
    questions: [
      {
        id: "q7",
        text: "Which renewable energy source is growing the fastest according to the text?",
        options: ["Wind", "Solar", "Hydro", "Geothermal"],
        correct: 1,
        explanation: "The passage highlights that solar energy installations have seen a 30% annual increase, outpacing other renewables."
      },
      {
        id: "q8",
        text: "Intermittency is a major challenge for wind and solar power.",
        options: ["True", "False", "Not Given"],
        correct: 0,
        explanation: "The text explains that because the sun doesn't always shine and wind doesn't always blow, storage solutions are needed."
      }
    ]
  },
  {
    id: "l3",
    type: "listening",
    title: "Section 1: Travel Agency Booking",
    mins: 10,
    difficulty: "Easy",
    questions: [
      {
        id: "q9",
        text: "What type of accommodation does the customer prefer?",
        options: ["Hotel", "Hostel", "Self-catering apartment", "Camping"],
        correct: 2,
        explanation: "The customer explicitly asks for an apartment where they can cook their own meals."
      }
    ]
  },
  {
    id: "r4",
    type: "reading",
    title: "Academic Reading: The History of the Printing Press",
    mins: 25,
    difficulty: "Hard",
    questions: [
      {
        id: "q10",
        text: "What was the immediate impact of Gutenberg's invention?",
        options: ["Rise in literacy rates", "Decrease in book prices", "Spread of religious ideas", "All of the above"],
        correct: 3,
        explanation: "The passage notes that the printing press revolutionized society by making books affordable, increasing literacy, and facilitating the spread of ideas."
      }
    ]
  },
  {
    id: "l4",
    type: "listening",
    title: "Section 2: Museum Tour Guide",
    mins: 12,
    difficulty: "Medium",
    questions: [
      {
        id: "q11",
        text: "In which room can the ancient pottery be found?",
        options: ["Room 101", "Room 204", "The East Gallery", "The Basement"],
        correct: 1,
        explanation: "The guide instructs the group to head to Room 204 for the pottery exhibition."
      }
    ]
  },
  {
    id: "r5",
    type: "reading",
    title: "Academic Reading: Artificial Intelligence in Healthcare",
    mins: 20,
    difficulty: "Medium",
    questions: [
      {
        id: "q12",
        text: "AI is primarily used for which healthcare task according to the text?",
        options: ["Surgery", "Diagnosis", "Patient billing", "Drug development"],
        correct: 1,
        explanation: "The text emphasizes AI's role in analyzing medical images and data to assist in early diagnosis."
      }
    ]
  },
  {
    id: "l5",
    type: "listening",
    title: "Section 4: Lecture on Marine Biology",
    mins: 15,
    difficulty: "Hard",
    questions: [
      {
        id: "q13",
        text: "What is the main threat to coral reefs discussed in the lecture?",
        options: ["Overfishing", "Pollution", "Rising ocean temperatures", "Coastal development"],
        correct: 2,
        explanation: "The lecturer focuses on coral bleaching caused by global warming and rising sea temperatures."
      }
    ]
  },
  {
    id: "r6",
    type: "reading",
    title: "Academic Reading: The Evolution of Language",
    mins: 20,
    difficulty: "Hard",
    questions: [
      {
        id: "q14",
        text: "What is the 'innateness hypothesis' mentioned in the text?",
        options: ["Language is learned through imitation", "Language is a biological instinct", "Language is culturally determined", "Language is a recent invention"],
        correct: 1,
        explanation: "The passage discusses Noam Chomsky's theory that humans are born with a universal grammar."
      }
    ]
  },
  {
    id: "l6",
    type: "listening",
    title: "Section 1: Job Interview Inquiry",
    mins: 10,
    difficulty: "Easy",
    questions: [
      {
        id: "q15",
        text: "What position is the candidate applying for?",
        options: ["Sales Assistant", "Receptionist", "Warehouse Worker", "Delivery Driver"],
        correct: 1,
        explanation: "The candidate mentions they are calling about the front-desk receptionist vacancy."
      }
    ]
  },
  {
    id: "r7",
    type: "reading",
    title: "Academic Reading: Sustainable Architecture",
    mins: 18,
    difficulty: "Medium",
    questions: [
      {
        id: "q16",
        text: "What is 'passive design' in architecture?",
        options: ["Using solar panels", "Designing for natural light and ventilation", "Using recycled materials", "Building underground"],
        correct: 1,
        explanation: "The text defines passive design as a strategy that uses the building's orientation and materials to minimize energy use."
      }
    ]
  },
  {
    id: "l7",
    type: "listening",
    title: "Section 3: Student Presentation Feedback",
    mins: 15,
    difficulty: "Medium",
    questions: [
      {
        id: "q17",
        text: "What was the tutor's main criticism of the presentation?",
        options: ["Too long", "Lack of visual aids", "Unclear structure", "Too much technical jargon"],
        correct: 2,
        explanation: "The tutor suggests that the transition between different points was not clear enough for the audience."
      }
    ]
  },
  {
    id: "r8",
    type: "reading",
    title: "Academic Reading: The Impact of Social Media on Youth",
    mins: 20,
    difficulty: "Medium",
    questions: [
      {
        id: "q18",
        text: "Social media can lead to increased feelings of isolation.",
        options: ["True", "False", "Not Given"],
        correct: 0,
        explanation: "The text discusses studies that link high social media usage with loneliness and social withdrawal."
      }
    ]
  },
  {
    id: "l8",
    type: "listening",
    title: "Section 2: Local Community Center Events",
    mins: 12,
    difficulty: "Easy",
    questions: [
      {
        id: "q19",
        text: "When is the next yoga class scheduled?",
        options: ["Monday evening", "Tuesday morning", "Wednesday afternoon", "Thursday night"],
        correct: 1,
        explanation: "The speaker announces that the yoga session will be held at 10 AM on Tuesday."
      }
    ]
  },
  {
    id: "r9",
    type: "reading",
    title: "Academic Reading: Space Exploration and Colonization",
    mins: 25,
    difficulty: "Hard",
    questions: [
      {
        id: "q20",
        text: "What is the primary obstacle to Mars colonization mentioned?",
        options: ["Lack of water", "Radiation exposure", "High cost", "Psychological stress"],
        correct: 1,
        explanation: "The passage identifies the thin atmosphere and lack of magnetic field as major risks for radiation."
      }
    ]
  },
  {
    id: "l9",
    type: "listening",
    title: "Section 1: Lost Property Report",
    mins: 8,
    difficulty: "Easy",
    questions: [
      {
        id: "q21",
        text: "What item did the person lose?",
        options: ["Wallet", "Smartphone", "Umbrella", "Backpack"],
        correct: 1,
        explanation: "The person is reporting a missing black smartphone left on the bus."
      }
    ]
  },
  {
    id: "r10",
    type: "reading",
    title: "Academic Reading: The Benefits of Mindfulness",
    mins: 15,
    difficulty: "Easy",
    questions: [
      {
        id: "q22",
        text: "Mindfulness can help reduce cortisol levels.",
        options: ["True", "False", "Not Given"],
        correct: 0,
        explanation: "The text mentions that regular practice lowers stress hormones like cortisol."
      }
    ]
  },
  {
    id: "l10",
    type: "listening",
    title: "Section 4: History of the Industrial Revolution",
    mins: 15,
    difficulty: "Hard",
    questions: [
      {
        id: "q23",
        text: "What was the key invention that triggered the Industrial Revolution?",
        options: ["Spinning Jenny", "Steam Engine", "Power Loom", "Locomotive"],
        correct: 1,
        explanation: "The lecturer identifies James Watt's improvements to the steam engine as the catalyst for industrial growth."
      }
    ]
  },
  {
    id: "r11",
    type: "reading",
    title: "Academic Reading: The Importance of Biodiversity",
    mins: 20,
    difficulty: "Medium",
    questions: [
      {
        id: "q24",
        text: "What is the primary reason for biodiversity loss mentioned in the text?",
        options: ["Climate change", "Habitat destruction", "Pollution", "Over-exploitation"],
        correct: 1,
        explanation: "The passage notes that the conversion of natural habitats into agricultural land is the leading cause."
      }
    ]
  },
  {
    id: "l11",
    type: "listening",
    title: "Section 1: Camping Trip Inquiry",
    mins: 10,
    difficulty: "Easy",
    questions: [
      {
        id: "q25",
        text: "What is the cost of a two-person tent for a weekend?",
        options: ["£20", "£35", "£45", "£50"],
        correct: 1,
        explanation: "The operator states that the weekend rate for a small tent is £35."
      }
    ]
  },
  {
    id: "r12",
    type: "reading",
    title: "Academic Reading: Nanotechnology in Medicine",
    mins: 25,
    difficulty: "Hard",
    questions: [
      {
        id: "q26",
        text: "What are 'nanobots' primarily used for in the text?",
        options: ["Surgery", "Targeted drug delivery", "Imaging", "Cell repair"],
        correct: 1,
        explanation: "The text highlights the potential for nanobots to deliver medication directly to cancer cells."
      }
    ]
  },
  {
    id: "l12",
    type: "listening",
    title: "Section 2: University Orientation Program",
    mins: 12,
    difficulty: "Medium",
    questions: [
      {
        id: "q27",
        text: "Where will the welcome lunch be held?",
        options: ["Main Hall", "Student Union", "University Gardens", "Library Cafe"],
        correct: 2,
        explanation: "The speaker mentions that the lunch will take place outdoors in the gardens if the weather is good."
      }
    ]
  },
  {
    id: "r13",
    type: "reading",
    title: "Academic Reading: Ancient Civilizations: The Maya",
    mins: 20,
    difficulty: "Medium",
    questions: [
      {
        id: "q28",
        text: "What was the primary reason for the Maya's agricultural success?",
        options: ["Irrigation systems", "Crop rotation", "Terraced farming", "Fertilizer use"],
        correct: 0,
        explanation: "The passage discusses the sophisticated irrigation and water management systems developed by the Maya."
      }
    ]
  },
  {
    id: "l13",
    type: "listening",
    title: "Section 3: Art Gallery Exhibition Discussion",
    mins: 15,
    difficulty: "Medium",
    questions: [
      {
        id: "q29",
        text: "What was the students' main criticism of the modern art exhibit?",
        options: ["Too abstract", "Poor lighting", "Lack of information", "Too expensive"],
        correct: 2,
        explanation: "The students agree that the labels and descriptions were not sufficient to understand the artist's intent."
      }
    ]
  },
  {
    id: "r14",
    type: "reading",
    title: "Academic Reading: Cognitive Psychology: Memory",
    mins: 20,
    difficulty: "Hard",
    questions: [
      {
        id: "q30",
        text: "What is 'chunking' in memory research?",
        options: ["Breaking down information", "Grouping information into units", "Repeating information", "Visualizing information"],
        correct: 1,
        explanation: "The text defines chunking as a strategy to increase short-term memory capacity by organizing data into meaningful groups."
      }
    ]
  },
  {
    id: "l14",
    type: "listening",
    title: "Section 1: Fitness Center Membership",
    mins: 10,
    difficulty: "Easy",
    questions: [
      {
        id: "q31",
        text: "What is the monthly fee for a student membership?",
        options: ["£15", "£25", "£30", "£40"],
        correct: 1,
        explanation: "The receptionist confirms the discounted rate for students is £25 per month."
      }
    ]
  },
  {
    id: "r15",
    type: "reading",
    title: "Academic Reading: Urban Transport Solutions",
    mins: 18,
    difficulty: "Medium",
    questions: [
      {
        id: "q32",
        text: "What is the main advantage of 'bus rapid transit' (BRT)?",
        options: ["Lower cost than light rail", "Faster than cars", "Environmentally friendly", "All of the above"],
        correct: 3,
        explanation: "The passage highlights that BRT is a cost-effective, fast, and sustainable alternative to traditional transport."
      }
    ]
  },
  {
    id: "l15",
    type: "listening",
    title: "Section 4: Lecture on Food Security",
    mins: 15,
    difficulty: "Hard",
    questions: [
      {
        id: "q33",
        text: "What is the 'green revolution' mentioned in the lecture?",
        options: ["Organic farming movement", "Increased agricultural productivity", "Reforestation efforts", "Sustainable fishing"],
        correct: 1,
        explanation: "The lecturer explains how new technologies and high-yield crops increased food production in the mid-20th century."
      }
    ]
  },
  {
    id: "r16",
    type: "reading",
    title: "Academic Reading: Cyber Security in the Digital Age",
    mins: 20,
    difficulty: "Medium",
    questions: [
      {
        id: "q34",
        text: "What is 'phishing' according to the text?",
        options: ["Hacking into servers", "Sending fraudulent emails", "Stealing physical hardware", "Installing malware"],
        correct: 1,
        explanation: "The text defines phishing as a social engineering attack used to steal user data."
      }
    ]
  },
  {
    id: "l16",
    type: "listening",
    title: "Section 1: Volunteer Abroad Inquiry",
    mins: 10,
    difficulty: "Easy",
    questions: [
      {
        id: "q35",
        text: "What is the minimum duration for the wildlife conservation project?",
        options: ["1 week", "2 weeks", "1 month", "3 months"],
        correct: 1,
        explanation: "The advisor states that volunteers must commit to at least two weeks for the project."
      }
    ]
  },
  {
    id: "r17",
    type: "reading",
    title: "Academic Reading: Artificial Intelligence: Ethics",
    mins: 25,
    difficulty: "Hard",
    questions: [
      {
        id: "q36",
        text: "What is the 'black box' problem in AI?",
        options: ["Lack of data", "High energy consumption", "Lack of transparency in decision-making", "Technical complexity"],
        correct: 2,
        explanation: "The passage discusses the difficulty in understanding how deep learning models arrive at specific conclusions."
      }
    ]
  },
  {
    id: "l17",
    type: "listening",
    title: "Section 2: Science Fair Information",
    mins: 12,
    difficulty: "Medium",
    questions: [
      {
        id: "q37",
        text: "When is the deadline for project registration?",
        options: ["October 1st", "October 15th", "November 1st", "November 15th"],
        correct: 1,
        explanation: "The speaker announces that all entries must be submitted by the 15th of October."
      }
    ]
  },
  {
    id: "r18",
    type: "reading",
    title: "Academic Reading: Climate Change and Ocean Acidification",
    mins: 20,
    difficulty: "Hard",
    questions: [
      {
        id: "q38",
        text: "How does CO2 absorption affect the ocean's pH?",
        options: ["Increases pH", "Decreases pH", "No effect", "Stabilizes pH"],
        correct: 1,
        explanation: "The text explains that higher CO2 levels lead to more carbonic acid, which lowers the pH (making it more acidic)."
      }
    ]
  },
  {
    id: "l18",
    type: "listening",
    title: "Section 3: Music Festival Planning",
    mins: 15,
    difficulty: "Medium",
    questions: [
      {
        id: "q39",
        text: "What is the main concern about the festival's location?",
        options: ["Too small", "Lack of public transport", "Noise complaints", "High rental cost"],
        correct: 1,
        explanation: "The organizers discuss the difficulty for attendees to reach the site without a car."
      }
    ]
  },
  {
    id: "r19",
    type: "reading",
    title: "Academic Reading: Space Tourism: The New Frontier",
    mins: 20,
    difficulty: "Medium",
    questions: [
      {
        id: "q40",
        text: "What is the primary target market for early space tourism?",
        options: ["Scientists", "Wealthy individuals", "Government officials", "Military personnel"],
        correct: 1,
        explanation: "The passage notes that the high cost currently limits space travel to the ultra-rich."
      }
    ]
  },
  {
    id: "l19",
    type: "listening",
    title: "Section 1: Career Counseling Appointment",
    mins: 10,
    difficulty: "Easy",
    questions: [
      {
        id: "q41",
        text: "What time is the appointment scheduled for?",
        options: ["9:00 AM", "10:30 AM", "2:00 PM", "4:15 PM"],
        correct: 1,
        explanation: "The counselor confirms the meeting for 10:30 on Thursday morning."
      }
    ]
  },
  {
    id: "r20",
    type: "reading",
    title: "Academic Reading: The Psychology of Motivation",
    mins: 15,
    difficulty: "Easy",
    questions: [
      {
        id: "q42",
        text: "What is 'intrinsic motivation'?",
        options: ["Motivation from external rewards", "Motivation from internal satisfaction", "Motivation from fear", "Motivation from social pressure"],
        correct: 1,
        explanation: "The text defines intrinsic motivation as doing something because it is inherently interesting or enjoyable."
      }
    ]
  },
  {
    id: "l20",
    type: "listening",
    title: "Section 4: Lecture on Ancient Rome",
    mins: 15,
    difficulty: "Hard",
    questions: [
      {
        id: "q43",
        text: "What was the primary function of the Roman aqueducts?",
        options: ["Defense", "Transport", "Water supply", "Religious ceremonies"],
        correct: 2,
        explanation: "The lecturer discusses the engineering feat of bringing fresh water into the cities."
      }
    ]
  },
  {
    id: "r21",
    type: "reading",
    title: "Academic Reading: The Future of Renewable Energy",
    mins: 20,
    difficulty: "Medium",
    questions: [
      {
        id: "q44",
        text: "Which energy source is predicted to dominate by 2050?",
        options: ["Coal", "Natural Gas", "Solar", "Nuclear"],
        correct: 2,
        explanation: "The text suggests that solar energy's falling costs will make it the primary global energy source."
      }
    ]
  },
  {
    id: "l21",
    type: "listening",
    title: "Section 1: Gym Membership Inquiry",
    mins: 10,
    difficulty: "Easy",
    questions: [
      {
        id: "q45",
        text: "What is included in the 'Gold' membership?",
        options: ["Pool access", "Personal training", "Free towels", "All of the above"],
        correct: 3,
        explanation: "The staff member lists pool, training, and towels as perks of the Gold tier."
      }
    ]
  },
  {
    id: "r22",
    type: "reading",
    title: "Academic Reading: The History of Vaccination",
    mins: 25,
    difficulty: "Hard",
    questions: [
      {
        id: "q46",
        text: "Who is credited with the first smallpox vaccine?",
        options: ["Louis Pasteur", "Edward Jenner", "Robert Koch", "Alexander Fleming"],
        correct: 1,
        explanation: "The passage details Edward Jenner's 1796 experiment with cowpox to prevent smallpox."
      }
    ]
  },
  {
    id: "l22",
    type: "listening",
    title: "Section 2: City Bike-Share Scheme",
    mins: 12,
    difficulty: "Medium",
    questions: [
      {
        id: "q47",
        text: "How much is the daily pass for the bike-share?",
        options: ["£2", "£5", "£10", "£15"],
        correct: 1,
        explanation: "The announcement states that a 24-hour pass costs £5."
      }
    ]
  },
  {
    id: "r23",
    type: "reading",
    title: "Academic Reading: The Psychology of Sleep",
    mins: 20,
    difficulty: "Medium",
    questions: [
      {
        id: "q48",
        text: "What happens during REM sleep?",
        options: ["Deep muscle repair", "Memory consolidation", "Lowest heart rate", "Growth hormone release"],
        correct: 1,
        explanation: "The text explains that REM sleep is crucial for processing information and memory."
      }
    ]
  },
  {
    id: "l23",
    type: "listening",
    title: "Section 3: Group Project on Urban Planning",
    mins: 15,
    difficulty: "Medium",
    questions: [
      {
        id: "q49",
        text: "What is the main focus of their project?",
        options: ["Traffic congestion", "Affordable housing", "Public parks", "Waste management"],
        correct: 0,
        explanation: "The students decide to analyze the impact of new bike lanes on traffic flow."
      }
    ]
  },
  {
    id: "r24",
    type: "reading",
    title: "Academic Reading: Marine Bioluminescence",
    mins: 20,
    difficulty: "Hard",
    questions: [
      {
        id: "q50",
        text: "Why do some deep-sea fish use light?",
        options: ["To attract prey", "To communicate", "To camouflage", "All of the above"],
        correct: 3,
        explanation: "The passage describes various survival strategies involving bioluminescence."
      }
    ]
  },
  {
    id: "l24",
    type: "listening",
    title: "Section 1: Apartment Rental Inquiry",
    mins: 10,
    difficulty: "Easy",
    questions: [
      {
        id: "q51",
        text: "When is the apartment available for move-in?",
        options: ["Immediately", "Next month", "In two weeks", "In three months"],
        correct: 2,
        explanation: "The landlord says the current tenant leaves on the 14th, so it's ready in two weeks."
      }
    ]
  },
  {
    id: "r25",
    type: "reading",
    title: "Academic Reading: The Rise of E-commerce",
    mins: 18,
    difficulty: "Medium",
    questions: [
      {
        id: "q52",
        text: "What is the 'last mile' problem in logistics?",
        options: ["Manufacturing delays", "Shipping across oceans", "Delivery to the final destination", "Warehouse storage"],
        correct: 2,
        explanation: "The text defines the last mile as the most expensive and complex part of the delivery process."
      }
    ]
  },
  {
    id: "l25",
    type: "listening",
    title: "Section 4: Lecture on Desert Ecology",
    mins: 15,
    difficulty: "Hard",
    questions: [
      {
        id: "q53",
        text: "How do succulents store water?",
        options: ["In their roots", "In their leaves and stems", "In the soil", "In underground tanks"],
        correct: 1,
        explanation: "The lecturer explains the specialized tissues succulents use for water storage."
      }
    ]
  },
  {
    id: "r26",
    type: "reading",
    title: "Academic Reading: The History of the Alphabet",
    mins: 20,
    difficulty: "Medium",
    questions: [
      {
        id: "q54",
        text: "Which civilization developed the first phonetic alphabet?",
        options: ["Egyptians", "Phoenicians", "Greeks", "Romans"],
        correct: 1,
        explanation: "The passage credits the Phoenicians with creating a system where symbols represent sounds."
      }
    ]
  },
  {
    id: "l26",
    type: "listening",
    title: "Section 1: Lost Luggage Claim",
    mins: 10,
    difficulty: "Easy",
    questions: [
      {
        id: "q55",
        text: "What color is the missing suitcase?",
        options: ["Black", "Blue", "Red", "Silver"],
        correct: 2,
        explanation: "The passenger describes their bag as a large, bright red hardshell suitcase."
      }
    ]
  },
  {
    id: "r27",
    type: "reading",
    title: "Academic Reading: The Impact of Microplastics",
    mins: 25,
    difficulty: "Hard",
    questions: [
      {
        id: "q56",
        text: "Where are microplastics most commonly found?",
        options: ["In the air", "In the soil", "In the ocean", "In all of the above"],
        correct: 3,
        explanation: "The text discusses the pervasive nature of plastic particles in the entire global ecosystem."
      }
    ]
  },
  {
    id: "l27",
    type: "listening",
    title: "Section 2: Local Library Summer Reading Challenge",
    mins: 12,
    difficulty: "Medium",
    questions: [
      {
        id: "q57",
        text: "How many books must children read to complete the challenge?",
        options: ["3", "6", "10", "12"],
        correct: 1,
        explanation: "The librarian states that the goal is for every child to finish 6 books over the summer."
      }
    ]
  },
  {
    id: "r28",
    type: "reading",
    title: "Academic Reading: The Benefits of Bilingualism",
    mins: 20,
    difficulty: "Hard",
    questions: [
      {
        id: "q58",
        text: "Bilingualism can delay the onset of dementia.",
        options: ["True", "False", "Not Given"],
        correct: 0,
        explanation: "The passage cites research showing that speaking two languages can build cognitive reserve."
      }
    ]
  },
  {
    id: "l28",
    type: "listening",
    title: "Section 3: Discussion on Sustainable Fashion",
    mins: 15,
    difficulty: "Medium",
    questions: [
      {
        id: "q59",
        text: "What is 'fast fashion'?",
        options: ["High-end designer clothes", "Cheap, rapidly produced clothing", "Handmade garments", "Vintage clothing"],
        correct: 1,
        explanation: "The students define fast fashion as the mass production of low-cost items to follow trends."
      }
    ]
  },
  {
    id: "r29",
    type: "reading",
    title: "Academic Reading: The Science of Happiness",
    mins: 20,
    difficulty: "Medium",
    questions: [
      {
        id: "q60",
        text: "What is the 'hedonic treadmill'?",
        options: ["A type of exercise equipment", "The tendency to return to a baseline level of happiness", "A psychological disorder", "A method for increasing joy"],
        correct: 1,
        explanation: "The text explains that people quickly adapt to positive changes, returning to their usual happiness level."
      }
    ]
  },
  {
    id: "l29",
    type: "listening",
    title: "Section 1: Booking a Cooking Class",
    mins: 10,
    difficulty: "Easy",
    questions: [
      {
        id: "q61",
        text: "Which cuisine is being taught this Saturday?",
        options: ["Italian", "Thai", "French", "Japanese"],
        correct: 1,
        explanation: "The receptionist says that Saturday's class is focused on traditional Thai curries."
      }
    ]
  },
  {
    id: "r30",
    type: "reading",
    title: "Academic Reading: The Importance of Bees",
    mins: 15,
    difficulty: "Easy",
    questions: [
      {
        id: "q62",
        text: "Bees are responsible for pollinating one-third of the food we eat.",
        options: ["True", "False", "Not Given"],
        correct: 0,
        explanation: "The passage emphasizes the critical role bees play in global agriculture and food security."
      }
    ]
  },
  {
    id: "l30",
    type: "listening",
    title: "Section 4: Lecture on the History of Jazz",
    mins: 15,
    difficulty: "Hard",
    questions: [
      {
        id: "q63",
        text: "Where did jazz music originate?",
        options: ["New York", "Chicago", "New Orleans", "Kansas City"],
        correct: 2,
        explanation: "The lecturer traces the roots of jazz to the diverse musical culture of New Orleans."
      }
    ]
  },
  {
    id: "r31",
    type: "reading",
    title: "Academic Reading: The History of Photography",
    mins: 20,
    difficulty: "Medium",
    questions: [
      {
        id: "q64",
        text: "What was the 'camera obscura'?",
        options: ["The first digital camera", "A darkened room with a small hole", "A type of lens", "A chemical process"],
        correct: 1,
        explanation: "The text describes the camera obscura as an early optical device used to project images."
      }
    ]
  },
  {
    id: "l31",
    type: "listening",
    title: "Section 1: Hotel Check-in",
    mins: 8,
    difficulty: "Easy",
    questions: [
      {
        id: "q65",
        text: "What time is breakfast served until?",
        options: ["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM"],
        correct: 3,
        explanation: "The receptionist informs the guest that breakfast is available from 7:00 to 10:30 AM."
      }
    ]
  },
  {
    id: "r32",
    type: "reading",
    title: "Academic Reading: Urban Heat Islands",
    mins: 25,
    difficulty: "Hard",
    questions: [
      {
        id: "q66",
        text: "Why are cities warmer than rural areas?",
        options: ["More people", "Heat-absorbing materials", "Lack of vegetation", "Both B and C"],
        correct: 3,
        explanation: "The passage explains that concrete and lack of plants contribute to higher urban temperatures."
      }
    ]
  },
  {
    id: "l32",
    type: "listening",
    title: "Section 2: University Library Tour",
    mins: 12,
    difficulty: "Medium",
    questions: [
      {
        id: "q67",
        text: "Where are the silent study zones located?",
        options: ["Ground floor", "First floor", "Third floor", "Basement"],
        correct: 2,
        explanation: "The librarian points out that the third floor is reserved for quiet, individual study."
      }
    ]
  },
  {
    id: "r33",
    type: "reading",
    title: "Academic Reading: Cognitive Dissonance",
    mins: 20,
    difficulty: "Hard",
    questions: [
      {
        id: "q68",
        text: "What is cognitive dissonance?",
        options: ["A type of memory loss", "Mental discomfort from conflicting beliefs", "A learning disability", "A social phobia"],
        correct: 1,
        explanation: "The text defines it as the stress experienced when holding two contradictory ideas at once."
      }
    ]
  },
  {
    id: "l33",
    type: "listening",
    title: "Section 3: Travel Insurance Inquiry",
    mins: 15,
    difficulty: "Medium",
    questions: [
      {
        id: "q69",
        text: "What does the 'Premium' plan cover that the 'Basic' doesn't?",
        options: ["Medical emergencies", "Flight cancellations", "Extreme sports", "Lost luggage"],
        correct: 2,
        explanation: "The agent explains that the Premium tier includes coverage for high-risk activities like skiing."
      }
    ]
  },
  {
    id: "r34",
    type: "reading",
    title: "Academic Reading: Sustainable Fishing Practices",
    mins: 20,
    difficulty: "Medium",
    questions: [
      {
        id: "q70",
        text: "What is 'bycatch' in fishing?",
        options: ["The total weight of fish caught", "Unwanted species caught accidentally", "A type of fishing net", "The process of cleaning fish"],
        correct: 1,
        explanation: "The passage defines bycatch as non-target animals like dolphins or turtles caught in nets."
      }
    ]
  },
  {
    id: "l34",
    type: "listening",
    title: "Section 1: Job Fair Information",
    mins: 10,
    difficulty: "Easy",
    questions: [
      {
        id: "q71",
        text: "Where is the job fair being held this year?",
        options: ["The Grand Hotel", "The Convention Center", "The University Sports Hall", "The City Library"],
        correct: 1,
        explanation: "The organizer confirms that the event has moved to the larger Convention Center."
      }
    ]
  },
  {
    id: "r35",
    type: "reading",
    title: "Academic Reading: The Silk Road: A History",
    mins: 18,
    difficulty: "Medium",
    questions: [
      {
        id: "q72",
        text: "The Silk Road was a single, continuous road.",
        options: ["True", "False", "Not Given"],
        correct: 1,
        explanation: "The text clarifies that it was a network of multiple trade routes connecting East and West."
      }
    ]
  },
  {
    id: "l35",
    type: "listening",
    title: "Section 4: Lecture on Quantum Computing",
    mins: 15,
    difficulty: "Hard",
    questions: [
      {
        id: "q73",
        text: "What is a 'qubit'?",
        options: ["A traditional computer bit", "A unit of quantum information", "A type of laser", "A cooling system"],
        correct: 1,
        explanation: "The lecturer explains that qubits can exist in multiple states simultaneously, unlike binary bits."
      }
    ]
  },
  {
    id: "r36",
    type: "reading",
    title: "Academic Reading: Architecture of Ancient Greece",
    mins: 20,
    difficulty: "Medium",
    questions: [
      {
        id: "q74",
        text: "Which of these is a type of Greek column?",
        options: ["Doric", "Ionic", "Corinthian", "All of the above"],
        correct: 3,
        explanation: "The passage describes the three main orders of classical Greek architecture."
      }
    ]
  },
  {
    id: "l36",
    type: "listening",
    title: "Section 1: Research on Local Wildlife",
    mins: 10,
    difficulty: "Easy",
    questions: [
      {
        id: "q75",
        text: "What animal is the student researching?",
        options: ["Red squirrels", "Badgers", "Hedgehogs", "Otters"],
        correct: 0,
        explanation: "The student mentions they are focusing on the declining population of red squirrels in the area."
      }
    ]
  },
  {
    id: "r37",
    type: "reading",
    title: "Academic Reading: The Impact of Remote Work",
    mins: 25,
    difficulty: "Hard",
    questions: [
      {
        id: "q76",
        text: "What is a major challenge for remote teams mentioned?",
        options: ["Lower productivity", "Lack of communication", "Difficulty in building trust", "High software costs"],
        correct: 2,
        explanation: "The text discusses how the lack of face-to-face interaction can hinder team cohesion and trust."
      }
    ]
  },
  {
    id: "l37",
    type: "listening",
    title: "Section 2: Museum Workshop for Kids",
    mins: 12,
    difficulty: "Medium",
    questions: [
      {
        id: "q77",
        text: "What will the children be making in the workshop?",
        options: ["Clay pots", "Paper masks", "Wooden toys", "Tie-dye shirts"],
        correct: 0,
        explanation: "The coordinator says the kids will learn traditional pottery techniques using local clay."
      }
    ]
  },
  {
    id: "r38",
    type: "reading",
    title: "Academic Reading: Biodiversity in Rainforests",
    mins: 20,
    difficulty: "Hard",
    questions: [
      {
        id: "q78",
        text: "Rainforests cover only 6% of Earth's surface but house 50% of species.",
        options: ["True", "False", "Not Given"],
        correct: 0,
        explanation: "The passage highlights the incredible density of life found in tropical rainforest ecosystems."
      }
    ]
  },
  {
    id: "l38",
    type: "listening",
    title: "Section 3: Sports Tournament Planning",
    mins: 15,
    difficulty: "Medium",
    questions: [
      {
        id: "q79",
        text: "What is the main problem with the current venue?",
        options: ["Too expensive", "No parking", "Poor drainage", "Inadequate seating"],
        correct: 2,
        explanation: "The organizers worry that heavy rain will make the fields unplayable due to poor drainage."
      }
    ]
  },
  {
    id: "r39",
    type: "reading",
    title: "Academic Reading: The History of the Olympics",
    mins: 20,
    difficulty: "Medium",
    questions: [
      {
        id: "q80",
        text: "When were the first modern Olympic Games held?",
        options: ["1896", "1900", "1924", "1936"],
        correct: 0,
        explanation: "The text notes that the first modern Games took place in Athens in 1896."
      }
    ]
  },
  {
    id: "l39",
    type: "listening",
    title: "Section 1: Volunteer Orientation",
    mins: 10,
    difficulty: "Easy",
    questions: [
      {
        id: "q81",
        text: "What should volunteers wear on their first day?",
        options: ["Formal attire", "Casual clothes", "The provided t-shirt", "A suit"],
        correct: 2,
        explanation: "The leader reminds everyone to wear the blue volunteer t-shirt they were given."
      }
    ]
  },
  {
    id: "r40",
    type: "reading",
    title: "Academic Reading: The Psychology of Habits",
    mins: 15,
    difficulty: "Easy",
    questions: [
      {
        id: "q82",
        text: "What is the 'habit loop'?",
        options: ["Cue, Routine, Reward", "Plan, Action, Result", "Trigger, Behavior, Consequence", "Start, Middle, End"],
        correct: 0,
        explanation: "The text describes the three-step process that governs how habits are formed and maintained."
      }
    ]
  },
  {
    id: "l40",
    type: "listening",
    title: "Section 4: Lecture on the History of Architecture",
    mins: 15,
    difficulty: "Hard",
    questions: [
      {
        id: "q83",
        text: "What was the main innovation of Gothic architecture?",
        options: ["Thick walls", "Pointed arches", "Flat roofs", "Small windows"],
        correct: 1,
        explanation: "The lecturer explains how pointed arches allowed for taller buildings and larger windows."
      }
    ]
  },
  {
    id: "r41",
    type: "reading",
    title: "Academic Reading: The History of the Internet",
    mins: 20,
    difficulty: "Medium",
    questions: [
      {
        id: "q84",
        text: "What was the precursor to the modern Internet?",
        options: ["ARPANET", "World Wide Web", "Ethernet", "Intranet"],
        correct: 0,
        explanation: "The text describes ARPANET as the first network to implement the TCP/IP protocol suite."
      }
    ]
  },
  {
    id: "l41",
    type: "listening",
    title: "Section 1: Car Rental Inquiry",
    mins: 10,
    difficulty: "Easy",
    questions: [
      {
        id: "q85",
        text: "What is the daily rate for an economy car?",
        options: ["$35", "$45", "$55", "$65"],
        correct: 1,
        explanation: "The agent quotes $45 per day for the economy class vehicle."
      }
    ]
  },
  {
    id: "r42",
    type: "reading",
    title: "Academic Reading: Impact of Social Media on Youth",
    mins: 25,
    difficulty: "Hard",
    questions: [
      {
        id: "q86",
        text: "What is a potential negative effect mentioned?",
        options: ["Increased social skills", "Better academic performance", "Sleep disruption", "Improved self-esteem"],
        correct: 2,
        explanation: "The passage discusses how late-night social media use can interfere with sleep patterns."
      }
    ]
  },
  {
    id: "l42",
    type: "listening",
    title: "Section 2: University Campus Tour",
    mins: 12,
    difficulty: "Medium",
    questions: [
      {
        id: "q87",
        text: "Where is the student union building?",
        options: ["Near the library", "Opposite the science block", "Next to the gym", "Behind the cafeteria"],
        correct: 1,
        explanation: "The guide points out the student union directly across from the main science building."
      }
    ]
  },
  {
    id: "r43",
    type: "reading",
    title: "Academic Reading: The Great Barrier Reef",
    mins: 20,
    difficulty: "Hard",
    questions: [
      {
        id: "q88",
        text: "What is the primary threat to the reef?",
        options: ["Overfishing", "Coral bleaching", "Tourism", "Oil spills"],
        correct: 1,
        explanation: "The text identifies rising sea temperatures leading to coral bleaching as the biggest threat."
      }
    ]
  },
  {
    id: "l43",
    type: "listening",
    title: "Section 3: Travel Agency Consultation",
    mins: 15,
    difficulty: "Medium",
    questions: [
      {
        id: "q89",
        text: "Which destination is recommended for a family holiday?",
        options: ["Paris", "Orlando", "Tokyo", "Reykjavik"],
        correct: 1,
        explanation: "The consultant suggests Orlando due to its numerous theme parks and family-friendly resorts."
      }
    ]
  },
  {
    id: "r44",
    type: "reading",
    title: "Academic Reading: Future of Space Tourism",
    mins: 20,
    difficulty: "Medium",
    questions: [
      {
        id: "q90",
        text: "Space tourism is currently affordable for most people.",
        options: ["True", "False", "Not Given"],
        correct: 1,
        explanation: "The passage notes that suborbital flights still cost hundreds of thousands of dollars."
      }
    ]
  },
  {
    id: "l44",
    type: "listening",
    title: "Section 1: Job Interview Tips",
    mins: 10,
    difficulty: "Easy",
    questions: [
      {
        id: "q91",
        text: "What is the most important thing to research before an interview?",
        options: ["The company's history", "The interviewer's background", "The salary range", "The dress code"],
        correct: 0,
        explanation: "The expert emphasizes understanding the company's mission and recent achievements."
      }
    ]
  },
  {
    id: "r45",
    type: "reading",
    title: "Academic Reading: Psychology of Color",
    mins: 18,
    difficulty: "Medium",
    questions: [
      {
        id: "q92",
        text: "What emotion is often associated with the color blue?",
        options: ["Anger", "Calmness", "Excitement", "Fear"],
        correct: 1,
        explanation: "The text explains that blue is frequently used in offices to promote a sense of tranquility."
      }
    ]
  },
  {
    id: "l45",
    type: "listening",
    title: "Section 4: Lecture on Renewable Energy",
    mins: 15,
    difficulty: "Hard",
    questions: [
      {
        id: "q93",
        text: "What is a major limitation of wind power?",
        options: ["High cost", "Intermittency", "Pollution", "Noise"],
        correct: 1,
        explanation: "The lecturer discusses the challenge of energy storage when the wind isn't blowing."
      }
    ]
  },
  {
    id: "r46",
    type: "reading",
    title: "Academic Reading: Sustainable Architecture",
    mins: 20,
    difficulty: "Medium",
    questions: [
      {
        id: "q94",
        text: "What is 'passive solar design'?",
        options: ["Using solar panels", "Orienting buildings to use sunlight for heating", "A type of battery", "A government subsidy"],
        correct: 1,
        explanation: "The passage defines it as using a building's structure to collect and distribute solar energy."
      }
    ]
  },
  {
    id: "l46",
    type: "listening",
    title: "Section 1: Museum Exhibition Information",
    mins: 10,
    difficulty: "Easy",
    questions: [
      {
        id: "q95",
        text: "When does the 'Ancient Egypt' exhibition end?",
        options: ["Next week", "End of the month", "In three months", "End of the year"],
        correct: 1,
        explanation: "The recording states that the exhibition will run until the final day of August."
      }
    ]
  },
  {
    id: "r47",
    type: "reading",
    title: "Academic Reading: History of the Printing Press",
    mins: 25,
    difficulty: "Hard",
    questions: [
      {
        id: "q96",
        text: "Who invented the movable type printing press in Europe?",
        options: ["Leonardo da Vinci", "Johannes Gutenberg", "Isaac Newton", "Galileo Galilei"],
        correct: 1,
        explanation: "The text credits Gutenberg with the invention that revolutionized information sharing."
      }
    ]
  },
  {
    id: "l47",
    type: "listening",
    title: "Section 2: Sports Club Membership",
    mins: 12,
    difficulty: "Medium",
    questions: [
      {
        id: "q97",
        text: "What is the joining fee for new members?",
        options: ["Free", "$20", "$50", "$100"],
        correct: 1,
        explanation: "The manager mentions a one-time registration fee of $20 for all new applicants."
      }
    ]
  },
  {
    id: "r48",
    type: "reading",
    title: "Academic Reading: Impact of AI on Jobs",
    mins: 20,
    difficulty: "Hard",
    questions: [
      {
        id: "q98",
        text: "AI is expected to replace all human jobs by 2040.",
        options: ["True", "False", "Not Given"],
        correct: 1,
        explanation: "The passage argues that while some roles will be automated, new types of jobs will emerge."
      }
    ]
  },
  {
    id: "l48",
    type: "listening",
    title: "Section 3: Volunteer Opportunity Discussion",
    mins: 15,
    difficulty: "Medium",
    questions: [
      {
        id: "q99",
        text: "What task will the volunteers be doing this weekend?",
        options: ["Planting trees", "Cleaning the beach", "Painting a school", "Sorting donations"],
        correct: 1,
        explanation: "The group decides to meet at the coast for the annual beach cleanup event."
      }
    ]
  },
  {
    id: "r49",
    type: "reading",
    title: "Academic Reading: Biodiversity in the Amazon",
    mins: 20,
    difficulty: "Medium",
    questions: [
      {
        id: "q100",
        text: "The Amazon is often called the 'lungs of the planet'.",
        options: ["True", "False", "Not Given"],
        correct: 0,
        explanation: "The text explains how the rainforest produces a significant portion of the world's oxygen."
      }
    ]
  },
  {
    id: "l49",
    type: "listening",
    title: "Section 1: Campus Facilities Update",
    mins: 10,
    difficulty: "Easy",
    questions: [
      {
        id: "q101",
        text: "Which facility is currently closed for renovation?",
        options: ["The library", "The swimming pool", "The main cafeteria", "The student union"],
        correct: 1,
        explanation: "The announcement states that the pool will be closed for the next three weeks for repairs."
      }
    ]
  },
  {
    id: "r50",
    type: "reading",
    title: "Academic Reading: History of the Nobel Prize",
    mins: 15,
    difficulty: "Easy",
    questions: [
      {
        id: "q102",
        text: "In which year were the first Nobel Prizes awarded?",
        options: ["1895", "1901", "1910", "1920"],
        correct: 1,
        explanation: "The passage notes that the first awards ceremony took place in 1901, five years after Nobel's death."
      }
    ]
  },
  {
    id: "l50",
    type: "listening",
    title: "Section 4: Lecture on Student Support Services",
    mins: 15,
    difficulty: "Hard",
    questions: [
      {
        id: "q103",
        text: "Where can students get help with academic writing?",
        options: ["The library", "The writing center", "The student union", "The career office"],
        correct: 1,
        explanation: "The lecturer highlights the writing center as a key resource for improving essay skills."
      }
    ]
  }
];
