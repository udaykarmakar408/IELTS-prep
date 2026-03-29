export interface Question {
  id: string;
  type: "multiple-choice" | "tfng" | "completion" | "matching";
  q: string;
  options?: string[];
  answer: string;
  explanation: string;
}

export interface Passage {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  mins: number;
  text: string;
  questions: Question[];
}

export interface ListeningSection {
  id: string;
  title: string;
  type: string;
  difficulty: "Easy" | "Medium" | "Hard";
  script: string;
  questions: Question[];
}

export interface Topic {
  id: string;
  title: string;
  bullets: string[];
  hints: string;
}

export interface Sample {
  id: string;
  title: string;
  type: string;
  prompt: string;
  modelAnswer?: string;
  band: string;
  analysis: string;
  // For Listening/Reading samples
  script?: string;
  passage?: string;
  question?: string;
  options?: string[];
  answer?: string;
  explanation?: string;
}

export const LISTENING_SECTIONS: ListeningSection[] = [
  {
    id: "l1",
    title: "Part 1: Travel Agency Booking",
    type: "Conversation (Social)",
    difficulty: "Easy",
    script: `
      Agent: Good morning, World Travel Agency. How can I help you?
      Customer: Hello, I'm looking to book a holiday for my family this summer. We're thinking of going to the Mediterranean.
      Agent: That sounds lovely. Which country were you considering?
      Customer: We're not entirely sure yet, but we'd like somewhere with plenty of activities for children. We have two kids, aged 8 and 12.
      Agent: I see. Well, Spain and Greece are both excellent choices for families. We have a particularly good resort in Crete that's very popular.
      Customer: Crete sounds interesting. What kind of activities do they have?
      Agent: They have a dedicated kids' club, several swimming pools, and they're right on a private beach. They also offer water sports like kayaking and windsurfing for older children.
      Customer: That sounds perfect for my 12-year-old. What about the accommodation?
      Agent: They have family suites with two separate bedrooms and a small kitchenette.
      Customer: Excellent. And what are the dates for the summer season?
      Agent: The main season runs from June to September. When were you thinking of going?
      Customer: Probably the last two weeks of July.
      Agent: Let me check availability... Yes, we have a suite available from the 15th to the 29th of July.
      Customer: Great. And how much would that cost?
      Agent: For two adults and two children, the total price, including flights and transfers, would be £3,500.
      Customer: That's within our budget. What's the name of the resort?
      Agent: It's called the Blue Horizon Resort.
      Customer: Blue Horizon... okay. And is there a deposit required?
      Agent: Yes, a 20% deposit is needed to secure the booking. That would be £700.
      Customer: I see. Can I pay that over the phone?
      Agent: Certainly. I'll just need your credit card details.
    `,
    questions: [
      { id: "l1-q1", type: "completion", q: "The customer wants to go to the ______.", answer: "Mediterranean", explanation: "The customer explicitly mentions thinking of going to the Mediterranean." },
      { id: "l1-q2", type: "completion", q: "The children are aged 8 and ______.", answer: "12", explanation: "The customer states they have two kids, aged 8 and 12." },
      { id: "l1-q3", type: "completion", q: "The resort is located in ______.", answer: "Crete", explanation: "The agent mentions a resort in Crete." },
      { id: "l1-q4", type: "completion", q: "Activities include kayaking and ______.", answer: "windsurfing", explanation: "The agent lists kayaking and windsurfing as water sports." },
      { id: "l1-q5", type: "completion", q: "The family suite has a small ______.", answer: "kitchenette", explanation: "The agent mentions the suite has a small kitchenette." },
      { id: "l1-q6", type: "completion", q: "The customer wants to travel in the last two weeks of ______.", answer: "July", explanation: "The customer says 'Probably the last two weeks of July'." },
      { id: "l1-q7", type: "completion", q: "The total cost is £______.", answer: "3,500", explanation: "The agent states the total price is £3,500." },
      { id: "l1-q8", type: "completion", q: "The name of the resort is ______ Resort.", answer: "Blue Horizon", explanation: "The agent names it the Blue Horizon Resort." },
      { id: "l1-q9", type: "completion", q: "A ______% deposit is required.", answer: "20", explanation: "The agent says a 20% deposit is needed." },
      { id: "l1-q10", type: "completion", q: "The deposit amount is £______.", answer: "700", explanation: "The agent calculates 20% of £3,500 as £700." }
    ]
  },
  {
    id: "l2",
    title: "Part 2: Museum Orientation",
    type: "Monologue (Social)",
    difficulty: "Medium",
    script: `
      Welcome to the City Historical Museum. My name is Sarah, and I'll be your guide for this morning's orientation. Before we begin our tour, I'd like to give you some important information about the museum's layout and facilities.
      
      The museum is divided into three main galleries. On the ground floor, you'll find the Ancient History Gallery, which houses our collection of artifacts from the Roman and Greek periods. This gallery is particularly famous for its well-preserved mosaics.
      
      Moving up to the first floor, we have the Medieval Gallery. This section explores life in the city during the Middle Ages, with displays of armor, weaponry, and everyday household items. There's also a fascinating exhibit on the Great Fire that destroyed much of the city in 1666.
      
      Finally, on the second floor, you'll find the Modern History Gallery. This gallery covers the city's development from the Industrial Revolution to the present day. We have a large collection of photographs, documents, and interactive displays that bring the city's recent past to life.
      
      In addition to the galleries, we have several other facilities for our visitors. The museum shop is located near the main entrance on the ground floor. Here, you can purchase books, postcards, and souvenirs related to our collections.
      
      If you're looking for a place to relax and have a bite to eat, our cafe is situated on the first floor, overlooking the central courtyard. They serve a variety of hot and cold drinks, snacks, and light meals.
      
      For those of you with children, we have a dedicated play area on the ground floor, next to the Ancient History Gallery. This area is designed for children under the age of 10 and features a variety of educational games and activities.
      
      Please note that photography is permitted in most areas of the museum, but we ask that you do not use a flash, as it can damage some of our more delicate artifacts. Also, please refrain from touching any of the displays.
      
      We hope you enjoy your visit to the City Historical Museum. If you have any questions, please don't hesitate to ask me or any of our museum staff.
    `,
    questions: [
      { id: "l2-q1", type: "multiple-choice", q: "The Ancient History Gallery is located on the:", options: ["Ground floor", "First floor", "Second floor"], answer: "Ground floor", explanation: "The guide states the Ancient History Gallery is on the ground floor." },
      { id: "l2-q2", type: "multiple-choice", q: "The Medieval Gallery features an exhibit on:", options: ["The Roman Empire", "The Great Fire of 1666", "The Industrial Revolution"], answer: "The Great Fire of 1666", explanation: "The guide mentions an exhibit on the Great Fire in the Medieval Gallery." },
      { id: "l2-q3", type: "multiple-choice", q: "The Modern History Gallery covers the period from:", options: ["The Middle Ages", "The Industrial Revolution", "The present day"], answer: "The Industrial Revolution", explanation: "The guide says it covers development from the Industrial Revolution to the present day." },
      { id: "l2-q4", type: "completion", q: "The museum shop is near the ______.", answer: "main entrance", explanation: "The guide states the shop is near the main entrance." },
      { id: "l2-q5", type: "completion", q: "The cafe overlooks the ______.", answer: "central courtyard", explanation: "The guide mentions the cafe overlooks the central courtyard." },
      { id: "l2-q6", type: "completion", q: "The play area is for children under ______.", answer: "10", explanation: "The guide says it's for children under the age of 10." },
      { id: "l2-q7", type: "completion", q: "Flash photography is ______.", answer: "not permitted", explanation: "The guide asks visitors not to use a flash." },
      { id: "l2-q8", type: "completion", q: "Visitors should not ______ the displays.", answer: "touch", explanation: "The guide asks visitors to refrain from touching the displays." },
      { id: "l2-q9", type: "multiple-choice", q: "Where can you buy souvenirs?", options: ["Cafe", "Museum shop", "Play area"], answer: "Museum shop", explanation: "The guide says souvenirs can be purchased in the museum shop." },
      { id: "l2-q10", type: "multiple-choice", q: "Which gallery is famous for mosaics?", options: ["Ancient History", "Medieval", "Modern History"], answer: "Ancient History", explanation: "The guide mentions the Ancient History Gallery is famous for its mosaics." }
    ]
  },
  {
    id: "l3",
    title: "Part 3: Academic Discussion on Urban Planning",
    type: "Conversation (Academic)",
    difficulty: "Hard",
    script: `
      Tutor: Good afternoon, everyone. Today we're going to discuss your research proposals for the urban planning project. Let's start with you, Mark. What's your focus?
      Mark: Well, I'm interested in the concept of '15-minute cities'. The idea is that all essential services should be within a 15-minute walk or bike ride from home.
      Tutor: That's a very topical subject. What are the main challenges you've identified?
      Mark: The biggest hurdle is retrofitting existing infrastructure. Many cities were designed around car use, and changing that requires significant investment and political will.
      Tutor: And what about the social implications?
      Mark: That's another key area. There's a risk that 15-minute cities could lead to further gentrification if not implemented carefully. We need to ensure that these improvements benefit all residents, not just the wealthy.
      Tutor: Good point. And you, Chloe? What are you working on?
      Chloe: I'm looking at the role of green spaces in urban environments. My research focuses on how parks and gardens can mitigate the 'urban heat island' effect.
      Tutor: Fascinating. Have you found any specific examples of cities that are doing this well?
      Chloe: Yes, Singapore is a great example. They've integrated greenery into their architecture on a massive scale. It's not just about parks; it's about vertical gardens and rooftop forests.
      Tutor: And what are the benefits beyond temperature control?
      Chloe: There are numerous benefits, including improved air quality, increased biodiversity, and better mental health for residents.
      Tutor: Excellent. It sounds like you both have a solid foundation for your research.
    `,
    questions: [
      { id: "l3-q1", type: "multiple-choice", q: "What is the main idea of a '15-minute city'?", options: ["All services are 15 minutes away by car", "All essential services are within a 15-minute walk or bike ride", "The city center is 15 minutes away"], answer: "All essential services are within a 15-minute walk or bike ride", explanation: "Mark defines it as essential services being within a 15-minute walk or bike ride." },
      { id: "l3-q2", type: "multiple-choice", q: "What is the biggest challenge for 15-minute cities according to Mark?", options: ["Lack of public interest", "Retrofitting existing infrastructure", "High crime rates"], answer: "Retrofitting existing infrastructure", explanation: "Mark says the biggest hurdle is retrofitting existing infrastructure." },
      { id: "l3-q3", type: "multiple-choice", q: "What social risk does Mark mention?", options: ["Increased noise pollution", "Gentrification", "Overcrowding"], answer: "Gentrification", explanation: "Mark mentions a risk of further gentrification." },
      { id: "l3-q4", type: "completion", q: "Chloe's research focuses on how green spaces can mitigate the ______.", answer: "urban heat island effect", explanation: "Chloe says her research focuses on mitigating the urban heat island effect." },
      { id: "l3-q5", type: "completion", q: "Singapore has integrated greenery into its ______.", answer: "architecture", explanation: "Chloe mentions Singapore integrated greenery into their architecture." },
      { id: "l3-q6", type: "completion", q: "Benefits of green spaces include improved ______ quality.", answer: "air", explanation: "Chloe lists improved air quality as a benefit." },
      { id: "l3-q7", type: "completion", q: "Green spaces also contribute to better ______ health.", answer: "mental", explanation: "Chloe mentions better mental health for residents." },
      { id: "l3-q8", type: "multiple-choice", q: "Which city is cited as a good example of urban greenery?", options: ["London", "New York", "Singapore"], answer: "Singapore", explanation: "Chloe cites Singapore as a great example." },
      { id: "l3-q9", type: "multiple-choice", q: "What does Chloe mean by 'vertical gardens'?", options: ["Gardens on the ground", "Gardens on the sides of buildings", "Gardens in basements"], answer: "Gardens on the sides of buildings", explanation: "Vertical gardens refer to greenery integrated into the vertical structure of buildings." },
      { id: "l3-q10", type: "multiple-choice", q: "The tutor thinks the students have a ______.", options: ["Weak proposal", "Solid foundation", "Confusing topic"], answer: "Solid foundation", explanation: "The tutor says 'It sounds like you both have a solid foundation'." }
    ]
  }
];

export const READING_PASSAGES: Passage[] = [
  {
    id: "r1",
    title: "The Impact of Artificial Intelligence on Modern Healthcare",
    difficulty: "Hard",
    mins: 20,
    text: `
      The integration of Artificial Intelligence (AI) into healthcare systems has been heralded as one of the most significant technological advancements of the 21st century. AI, which refers to the simulation of human intelligence processes by machines, especially computer systems, is being utilized in various medical fields to improve diagnostic accuracy, personalize treatment plans, and streamline administrative tasks.
      
      One of the primary areas where AI is making a substantial impact is in medical imaging. Traditional methods of interpreting X-rays, MRIs, and CT scans rely heavily on the expertise of radiologists. However, AI algorithms, trained on vast datasets of medical images, can now identify patterns and anomalies with a degree of precision that often surpasses human capabilities. For instance, AI-powered systems have shown remarkable success in detecting early-stage cancers, such as breast and lung cancer, which are often difficult for the human eye to spot.
      
      Furthermore, AI is playing a crucial role in the development of personalized medicine. By analyzing a patient's genetic makeup, lifestyle factors, and medical history, AI algorithms can predict how an individual will respond to specific treatments. This allows healthcare providers to tailor therapies to the unique needs of each patient, thereby increasing the likelihood of successful outcomes and reducing the risk of adverse reactions. This approach is particularly promising in the field of oncology, where targeted therapies are becoming increasingly common.
      
      In addition to its clinical applications, AI is also being used to improve the efficiency of healthcare administration. AI-powered chatbots and virtual assistants can handle routine tasks such as scheduling appointments, answering patient queries, and managing medical records. This frees up healthcare professionals to focus on more complex and critical aspects of patient care. Moreover, AI can analyze large-scale healthcare data to identify trends and predict disease outbreaks, enabling public health officials to take proactive measures.
      
      Despite its numerous benefits, the implementation of AI in healthcare is not without its challenges. One of the primary concerns is the ethical implications of using AI to make life-and-death decisions. There are also concerns about data privacy and security, as AI systems require access to sensitive patient information. Furthermore, the potential for bias in AI algorithms, which can occur if the datasets used to train them are not representative of the diverse patient population, is a significant issue that needs to be addressed.
      
      In conclusion, AI has the potential to revolutionize healthcare by improving diagnostic accuracy, personalizing treatment, and increasing administrative efficiency. However, it is essential to address the ethical, privacy, and bias concerns associated with its implementation to ensure that its benefits are realized in a fair and responsible manner.
    `,
    questions: [
      { id: "r1-q1", type: "multiple-choice", q: "What is the primary focus of the first paragraph?", options: ["The history of AI", "The definition and general applications of AI in healthcare", "The challenges of implementing AI"], answer: "The definition and general applications of AI in healthcare", explanation: "The first paragraph defines AI and mentions its use in diagnostic accuracy, personalized treatment, and administrative tasks." },
      { id: "r1-q2", type: "tfng", q: "AI algorithms can interpret medical images more accurately than human radiologists in some cases.", answer: "True", explanation: "The text states that AI algorithms can identify patterns and anomalies with a precision that often surpasses human capabilities." },
      { id: "r1-q3", type: "tfng", q: "Personalized medicine is only used in the field of oncology.", answer: "False", explanation: "The text says it is 'particularly promising' in oncology, but doesn't say it's only used there." },
      { id: "r1-q4", type: "tfng", q: "AI-powered chatbots are used to perform complex surgical procedures.", answer: "False", explanation: "The text states that chatbots handle 'routine tasks' like scheduling and answering queries." },
      { id: "r1-q5", type: "completion", q: "AI can analyze large-scale data to predict ______.", answer: "disease outbreaks", explanation: "The text mentions AI can identify trends and predict disease outbreaks." },
      { id: "r1-q6", type: "completion", q: "One major concern regarding AI in healthcare is ______.", answer: "ethical implications", explanation: "The text lists ethical implications as one of the primary concerns." },
      { id: "r1-q7", type: "completion", q: "Bias in AI algorithms can occur if the ______ are not representative.", answer: "datasets", explanation: "The text states bias can occur if the datasets used to train them are not representative." },
      { id: "r1-q8", type: "multiple-choice", q: "According to the text, how does AI help healthcare professionals?", options: ["By replacing them entirely", "By handling routine administrative tasks", "By making all clinical decisions"], answer: "By handling routine administrative tasks", explanation: "The text says AI frees up professionals by handling routine tasks like scheduling." },
      { id: "r1-q9", type: "multiple-choice", q: "What is a potential risk of using AI in healthcare?", options: ["Increased diagnostic accuracy", "Data privacy and security concerns", "Improved patient outcomes"], answer: "Data privacy and security concerns", explanation: "The text explicitly mentions concerns about data privacy and security." },
      { id: "r1-q10", type: "multiple-choice", q: "What is the author's overall conclusion about AI in healthcare?", options: ["It is too dangerous to be used.", "It has great potential but requires careful implementation.", "It has already solved all healthcare problems."], answer: "It has great potential but requires careful implementation.", explanation: "The conclusion states AI has potential to revolutionize healthcare but essential concerns must be addressed." }
    ]
  },
  {
    id: "r2",
    title: "Sustainable Urban Development in the 21st Century",
    difficulty: "Medium",
    mins: 20,
    text: `
      As the global population continues to urbanize at an unprecedented rate, the concept of sustainable urban development has moved to the forefront of international policy discussions. Sustainable development, defined as meeting the needs of the present without compromising the ability of future generations to meet their own needs, is particularly critical in the context of cities, which consume the majority of the world's resources and generate a significant portion of global greenhouse gas emissions.
      
      One of the key pillars of sustainable urban development is the promotion of efficient and accessible public transportation systems. By reducing reliance on private vehicles, cities can significantly decrease traffic congestion, air pollution, and carbon emissions. Successful examples include the 'Bus Rapid Transit' (BRT) system in Curitiba, Brazil, and the extensive cycling infrastructure in Copenhagen, Denmark. These systems not only improve environmental outcomes but also enhance social equity by providing affordable mobility options for all residents.
      
      Another essential aspect of sustainable cities is the integration of green spaces and urban biodiversity. Parks, gardens, and green roofs provide numerous ecosystem services, such as temperature regulation, stormwater management, and air purification. Furthermore, access to nature in urban environments has been linked to improved mental health and well-being for residents. Cities like Singapore have pioneered the 'City in a Garden' concept, integrating greenery into the very fabric of their urban architecture.
      
      Energy efficiency and the transition to renewable energy sources are also vital components of sustainable urbanism. This involves retrofitting existing buildings to improve insulation, implementing smart grid technologies, and encouraging the use of solar and wind energy. The city of Freiburg in Germany is often cited as a model for sustainable energy use, with its extensive use of solar power and energy-efficient building designs.
      
      However, achieving sustainable urban development requires more than just technological and infrastructural changes; it also necessitates strong political leadership, community engagement, and innovative financing mechanisms. Urban planners must work closely with residents to ensure that development projects are inclusive and responsive to local needs. Moreover, the transition to sustainability must be managed in a way that does not exacerbate social inequalities or displace vulnerable populations.
    `,
    questions: [
      { id: "r2-q1", type: "multiple-choice", q: "What is the primary goal of sustainable urban development?", options: ["To increase the speed of urbanization", "To meet present needs without compromising future generations", "To eliminate all private vehicles"], answer: "To meet present needs without compromising future generations", explanation: "The text defines sustainable development as meeting present needs without compromising the ability of future generations." },
      { id: "r2-q2", type: "tfng", q: "Cities are responsible for most of the world's resource consumption.", answer: "True", explanation: "The text states that cities consume the majority of the world's resources." },
      { id: "r2-q3", type: "tfng", q: "The BRT system in Curitiba is an example of cycling infrastructure.", answer: "False", explanation: "The text says BRT is in Curitiba and cycling infrastructure is in Copenhagen." },
      { id: "r2-q4", type: "tfng", q: "Green spaces in cities can help manage stormwater.", answer: "True", explanation: "The text lists stormwater management as one of the ecosystem services provided by green spaces." },
      { id: "r2-q5", type: "completion", q: "Copenhagen is known for its extensive ______ infrastructure.", answer: "cycling", explanation: "The text mentions the extensive cycling infrastructure in Copenhagen." },
      { id: "r2-q6", type: "completion", q: "Singapore's concept for integrating greenery is called ______.", answer: "City in a Garden", explanation: "The text mentions Singapore pioneered the 'City in a Garden' concept." },
      { id: "r2-q7", type: "completion", q: "Freiburg is a model for sustainable ______ use.", answer: "energy", explanation: "The text cites Freiburg as a model for sustainable energy use." },
      { id: "r2-q8", type: "multiple-choice", q: "What is mentioned as a benefit of public transport besides environmental ones?", options: ["Increased noise", "Social equity", "Higher taxes"], answer: "Social equity", explanation: "The text says these systems enhance social equity by providing affordable mobility." },
      { id: "r2-q9", type: "multiple-choice", q: "What is required for sustainable development besides technology?", options: ["More cars", "Political leadership and community engagement", "Less green space"], answer: "Political leadership and community engagement", explanation: "The text states it requires strong political leadership and community engagement." },
      { id: "r2-q10", type: "multiple-choice", q: "What risk must be managed during the transition to sustainability?", options: ["Increased biodiversity", "Displacement of vulnerable populations", "Improved air quality"], answer: "Displacement of vulnerable populations", explanation: "The text mentions the transition must not displace vulnerable populations." }
    ]
  }
];

export const SPEAKING_TOPICS: Topic[] = [
  {
    id: "s1",
    title: "Part 1: Your Hometown",
    bullets: [
      "Where is your hometown?",
      "What do you like most about it?",
      "Is there anything you would like to change about it?",
      "Do you think you will continue to live there in the future?"
    ],
    hints: "Focus on using descriptive adjectives and varied sentence structures. For example, instead of 'It is a nice place', say 'It is a vibrant city with a rich cultural heritage'."
  },
  {
    id: "s2",
    title: "Part 2: A Memorable Journey",
    bullets: [
      "Where you went",
      "Who you went with",
      "What you did there",
      "And explain why it was memorable for you"
    ],
    hints: "Use narrative tenses (Past Simple, Past Continuous, Past Perfect) to tell your story. Include sensory details to make your description more vivid."
  },
  {
    id: "s3",
    title: "Part 3: Technology and Society",
    bullets: [
      "How has technology changed the way people communicate?",
      "Do you think people rely too much on technology these days?",
      "What are the potential risks of AI in the future?",
      "How can we ensure technology benefits everyone?"
    ],
    hints: "In Part 3, you should provide more abstract and analytical answers. Use phrases like 'From my perspective', 'It could be argued that', or 'One significant implication is'."
  }
];

export const WRITING_SAMPLES: Sample[] = [
  {
    id: "w1",
    title: "Task 2: Technology and Stress",
    type: "Essay",
    prompt: "Some people believe that the rapid development of technology has made our lives more complicated and stressful. To what extent do you agree or disagree?",
    modelAnswer: `
      In the contemporary era, the breakneck pace of technological advancement has undeniably reshaped the fabric of human existence. While a segment of society maintains that these innovations have simplified our daily routines, I am of the firm conviction that the overarching impact of technology has been to introduce unprecedented levels of complexity and psychological strain.

      One of the most salient arguments for the increase in stress is the erosion of the boundaries between professional and personal life. The ubiquity of smartphones and high-speed internet means that individuals are perpetually tethered to their workplaces. The "always-on" culture, characterized by the expectation of immediate responses to emails and messages regardless of the hour, has made it increasingly difficult for people to truly disconnect. Consequently, this constant state of digital alertness often leads to burnout and a persistent sense of anxiety, as the sanctuary of the home is no longer insulated from the demands of the office.

      Furthermore, the phenomenon of information overload has contributed significantly to modern-day stress. We are currently living in an age where we are incessantly bombarded with a deluge of data from social media, news outlets, and advertisements. This cognitive saturation can lead to what is known as "decision fatigue," where the sheer volume of choices and information becomes paralyzing. Moreover, the curated and often idealized versions of reality presented on social media platforms can foster a sense of inadequacy and social pressure, as individuals subconsciously compare their own lives to the seemingly perfect existences of others.

      In conclusion, while technology has undoubtedly brought about remarkable conveniences, its role in complicating our lives and elevating stress levels cannot be overlooked. The blurring of work-life boundaries and the psychological burden of information overload are significant detriments to our well-being. Therefore, it is imperative that we cultivate a more mindful relationship with technology, setting clear boundaries to preserve our mental health in an increasingly digital world.
    `,
    band: "9.0",
    analysis: "This essay demonstrates a high level of lexical resource and grammatical range. The use of advanced vocabulary (e.g., 'breakneck pace', 'ubiquity', 'perpetually tethered', 'cognitive saturation') and complex sentence structures is consistent throughout. The argument is logically organized and well-supported with relevant examples."
  },
  {
    id: "w2",
    title: "Task 1: Academic Success Factors",
    type: "Report",
    prompt: "The table below shows the results of a survey of students regarding the factors they believe contribute most to academic success. Summarize the information by selecting and reporting the main features.",
    modelAnswer: "The provided table illustrates student perceptions of various contributors to academic achievement. A striking majority (85%) identified 'consistent study habits' as the paramount factor, followed closely by 'access to quality resources' at 72%. Interestingly, 'natural ability' was ranked lowest, with only 15% of respondents considering it a primary driver of success. This suggests a strong student belief in the efficacy of effort and environmental support over innate talent.",
    band: "9.0",
    analysis: "This report accurately summarizes the key data points and identifies the most significant trends. The language is formal and objective, with appropriate use of comparative structures."
  }
];

export const LISTENING_SAMPLES: Sample[] = [
  {
    id: "ls1",
    title: "Part 1: Travel Booking Details",
    type: "Band 9.0 Sample",
    prompt: "Listen to a conversation about a complex travel booking.",
    script: "Agent: Hello, how can I help? Customer: I'd like to book a flight to Sydney. Agent: Certainly, when are you planning to travel? Customer: On the 15th of next month. Agent: And will that be business or economy? Customer: Economy, please.",
    question: "The customer wants to travel to ______.",
    answer: "Sydney",
    explanation: "The customer explicitly states they want to book a flight to Sydney.",
    band: "9.0",
    analysis: "This sample shows how to handle 'distractors' where the speaker changes their mind or corrects themselves."
  },
  {
    id: "ls2",
    title: "Part 4: Academic Lecture on Marine Biology",
    type: "Band 9.0 Sample",
    prompt: "Listen to a lecture about the impact of climate change on coral reefs.",
    script: "Lecturer: Today we will discuss the phenomenon of coral bleaching. This occurs when corals are stressed by changes in conditions such as temperature, light, or nutrients. They expel the symbiotic algae living in their tissues, causing them to turn completely white.",
    question: "Coral bleaching occurs when corals are ______ by environmental changes.",
    answer: "stressed",
    explanation: "The lecturer states that bleaching occurs when corals are stressed by changes in conditions.",
    band: "9.0",
    analysis: "This sample demonstrates high-level academic vocabulary and complex sentence structures."
  }
];

export const READING_SAMPLES: Sample[] = [
  {
    id: "rs1",
    title: "The Future of Urban Planning",
    type: "Band 9.0 Sample",
    prompt: "Read a complex academic text about sustainable cities.",
    passage: "The concept of the '15-minute city' has gained significant traction in recent years. This urban planning model aims to ensure that all residents have access to essential services within a short walk or bike ride from their homes. Proponents argue that this approach can reduce carbon emissions and improve quality of life.",
    question: "What is the main goal of the '15-minute city' model?",
    options: ["To increase car use", "To ensure essential services are within a short walk or bike ride", "To build more skyscrapers"],
    answer: "To ensure essential services are within a short walk or bike ride",
    explanation: "The text states the model aims to ensure residents have access to services within a short walk or bike ride.",
    band: "9.0",
    analysis: "This sample highlights the importance of identifying 'writer's purpose' and 'implicit meaning' in Part 3 passages."
  },
  {
    id: "rs2",
    title: "The Psychology of Learning",
    type: "Band 9.0 Sample",
    prompt: "Read an analytical text about cognitive processes in education.",
    passage: "Metacognition, or 'thinking about thinking', is a critical component of effective learning. It involves being aware of one's own cognitive processes and actively managing them. Students who employ metacognitive strategies are often better able to monitor their progress and adjust their study habits accordingly.",
    question: "Metacognition involves being ______ of one's own cognitive processes.",
    answer: "aware",
    explanation: "The text defines metacognition as being aware of one's own cognitive processes.",
    band: "9.0",
    analysis: "This sample tests for understanding of complex psychological concepts and terminology."
  }
];

export const SPEAKING_SAMPLES: Sample[] = [
  {
    id: "ss1",
    title: "Part 2: A Memorable Journey",
    type: "Band 9.0 Sample",
    prompt: "Describe a journey that you remember well.",
    modelAnswer: "The speaker used a wide range of narrative tenses and sophisticated vocabulary like 'scenic detour' and 'unforgettable vista'.",
    band: "9.0",
    analysis: "Fluency and coherence were maintained throughout the 2-minute talk with natural transitions."
  },
  {
    id: "ss2",
    title: "Part 1: Hometown Description",
    type: "Band 9.0 Sample",
    prompt: "Where is your hometown?",
    modelAnswer: "My hometown is a vibrant coastal city with a rich cultural heritage and a bustling port. It's known for its stunning architecture and diverse culinary scene.",
    band: "9.0",
    analysis: "The speaker uses descriptive adjectives and complex sentence structures to provide a detailed and engaging response."
  }
];
