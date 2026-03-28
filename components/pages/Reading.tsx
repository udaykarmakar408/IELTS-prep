"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BookOpen, 
  Search, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  ArrowLeft,
  FileText,
  PenTool,
  Trophy,
  AlertCircle,
  Sparkles,
  Loader2,
  MessageSquare,
  BookOpenCheck
} from "lucide-react";
import { getProgress, saveProgress, UserProgress } from "@/lib/store";
import { cn } from "@/lib/utils";
import { callGroq, callGroqJSON } from "@/lib/groq";
import ReactMarkdown from "react-markdown";

const READING_SAMPLES = [
  {
    id: "s1",
    title: "Sample: Multiple Choice Questions",
    type: "MCQ",
    passage: "The Great Barrier Reef is the world's largest coral reef system, composed of over 2,900 individual reefs and 900 islands stretching for over 2,300 kilometres over an area of approximately 344,400 square kilometres. The reef is located in the Coral Sea, off the coast of Queensland, Australia.",
    question: "Where is the Great Barrier Reef located?",
    options: ["Off the coast of Africa", "Off the coast of Australia", "In the Atlantic Ocean", "In the Mediterranean Sea"],
    answer: "Off the coast of Australia",
    explanation: "The passage explicitly states that the reef is located 'off the coast of Queensland, Australia'."
  },
  {
    id: "s2",
    title: "Sample: True/False/Not Given",
    type: "TFNG",
    passage: "Marie Curie was a Polish and naturalized-French physicist and chemist who conducted pioneering research on radioactivity. She was the first woman to win a Nobel Prize, the first person and the only woman to win the Nobel Prize twice, and the only person to win the Nobel Prize in two different scientific fields.",
    question: "Marie Curie won Nobel Prizes in three different scientific fields.",
    answer: "False",
    explanation: "The passage states she won the Nobel Prize in 'two different scientific fields', not three."
  },
  {
    id: "s3",
    title: "Sample: Matching Headings",
    type: "Matching",
    passage: "Paragraph A: The transition to renewable energy is essential for a sustainable future. Paragraph B: Solar power is a leading source of renewable energy. Paragraph C: Wind energy is also growing rapidly.",
    question: "Match the following headings to the paragraphs: i. Solar Power, ii. Wind Energy, iii. Sustainable Future",
    answer: "A-iii, B-i, C-ii",
    explanation: "Paragraph A discusses the sustainable future, B discusses solar power, and C discusses wind energy."
  }
];

const READING_PASSAGES = [
  {
    id: "p1",
    title: "The Evolution of Language",
    difficulty: "Medium",
    mins: 20,
    text: `Language is one of the most complex and fascinating aspects of human behavior. It is not merely a tool for communication but a fundamental part of our identity and culture. Linguists have long debated the origins of language, with some suggesting it evolved from primitive gestures, while others believe it emerged as a result of cognitive shifts in the human brain.\n\nOne prominent theory, proposed by Noam Chomsky, is that humans are born with an innate "universal grammar" that allows them to acquire language rapidly during childhood. This theory suggests that the underlying structure of all human languages is remarkably similar, despite the vast diversity of vocabulary and syntax found across the globe.\n\nIn contrast, other researchers emphasize the role of social interaction and cultural transmission in language development. They argue that language is a learned behavior, passed down from generation to generation through imitation and reinforcement. According to this view, the specific features of a language are shaped by the environment and the needs of the community that speaks it.`,
    questions: [
      { id: "q1", type: "mcq", q: "What is the main topic of the passage?", options: ["The history of linguistics", "The origins and development of language", "Noam Chomsky's biography", "The importance of vocabulary"], answer: 1 },
      { id: "q2", type: "tf", q: "Noam Chomsky believes language is entirely learned through social interaction.", options: ["True", "False", "Not Given"], answer: 1 },
      { id: "q3", type: "mcq", q: "According to the passage, what is 'universal grammar'?", options: ["A set of rules for all animals", "An innate human capacity for language", "A dictionary of all words", "A social construct"], answer: 1 }
    ]
  },
  {
    id: "p2",
    title: "Renewable Energy in the 21st Century",
    difficulty: "Hard",
    mins: 25,
    text: `As the world grapples with the challenges of climate change and dwindling fossil fuel reserves, the transition to renewable energy sources has become a global priority. Solar, wind, and hydroelectric power are leading the way, offering cleaner and more sustainable alternatives to coal and oil.\n\nSolar energy, in particular, has seen significant advancements in recent years. The cost of photovoltaic cells has plummeted, making solar power increasingly competitive with traditional energy sources. Large-scale solar farms are being constructed in sun-drenched regions, while rooftop panels are becoming a common sight in urban areas.\n\nWind energy is another rapidly growing sector. Modern wind turbines are more efficient and quieter than their predecessors, and offshore wind farms are tapping into the vast energy potential of the oceans. However, the intermittent nature of wind and solar power remains a challenge, requiring the development of advanced energy storage systems, such as large-scale batteries and pumped-storage hydropower.`,
    questions: [
      { id: "q1", type: "mcq", q: "Which energy source has seen a significant drop in cost?", options: ["Coal", "Solar", "Wind", "Hydroelectric"], answer: 1 },
      { id: "q2", type: "tf", q: "Offshore wind farms are less efficient than onshore ones.", options: ["True", "False", "Not Given"], answer: 2 },
      { id: "q3", type: "mcq", q: "What is a major challenge for wind and solar power?", options: ["High maintenance costs", "Intermittency", "Lack of public support", "Noise pollution"], answer: 1 }
    ]
  },
  {
    id: "p3",
    title: "The History of the Olympic Games",
    difficulty: "Medium",
    mins: 20,
    text: "The Olympic Games have a long and storied history, dating back to ancient Greece. The first recorded games took place in 776 BC in Olympia, held in honor of Zeus. These ancient games were a series of athletic competitions among representatives of various city-states. They featured events such as running, wrestling, and chariot racing. The games were held every four years, a period known as an Olympiad.\n\nThe modern Olympic Games were revived in the late 19th century by Baron Pierre de Coubertin. The first modern games were held in Athens in 1896, featuring athletes from 14 nations. Since then, the Olympics have grown into the world's premier sporting event, with thousands of athletes competing in a wide range of summer and winter sports. The games are now a symbol of international cooperation and athletic excellence.",
    questions: [
      { id: "q1", type: "mcq", q: "Where were the first recorded Olympic Games held?", options: ["Athens", "Olympia", "Sparta", "Rome"], answer: 1 },
      { id: "q2", type: "tf", q: "The ancient games were held every two years.", options: ["True", "False", "Not Given"], answer: 1 },
      { id: "q3", type: "mcq", q: "Who revived the modern Olympic Games?", options: ["Zeus", "Baron Pierre de Coubertin", "Hercules", "Alexander the Great"], answer: 1 }
    ]
  },
  {
    id: "p4",
    title: "The Impact of Artificial Intelligence",
    difficulty: "Hard",
    mins: 30,
    text: "Artificial Intelligence (AI) is rapidly transforming various sectors of society, from healthcare and finance to transportation and entertainment. AI refers to the development of computer systems that can perform tasks that typically require human intelligence, such as visual perception, speech recognition, and decision-making.\n\nIn healthcare, AI is being used to analyze medical images, predict patient outcomes, and even assist in surgery. In finance, AI algorithms are used for fraud detection, algorithmic trading, and personalized financial advice. However, the rise of AI also raises important ethical questions, such as the potential for job displacement and the need for transparency and accountability in AI systems.",
    questions: [
      { id: "q1", type: "mcq", q: "What does AI stand for?", options: ["Automated Intelligence", "Artificial Intelligence", "Advanced Integration", "Analytical Insight"], answer: 1 },
      { id: "q2", type: "tf", q: "AI is only used in the entertainment industry.", options: ["True", "False", "Not Given"], answer: 1 },
      { id: "q3", type: "mcq", q: "What is one ethical concern mentioned regarding AI?", options: ["Increased productivity", "Job displacement", "Better healthcare", "Faster transportation"], answer: 1 }
    ]
  },
  {
    id: "p5",
    title: "The Great Barrier Reef",
    difficulty: "Medium",
    mins: 20,
    text: "The Great Barrier Reef is the world's largest coral reef system, stretching over 2,300 kilometers along the coast of Queensland, Australia. It is home to a vast array of marine life, including thousands of species of fish, colorful corals, and various marine mammals.\n\nHowever, the reef is facing significant threats from climate change, particularly rising ocean temperatures and ocean acidification. These factors lead to coral bleaching, a process where corals lose their vibrant colors and become more susceptible to disease. Efforts are being made to protect and restore the reef, but the long-term outlook remains uncertain.",
    questions: [
      { id: "q1", type: "mcq", q: "Where is the Great Barrier Reef located?", options: ["Off the coast of Africa", "Off the coast of Australia", "In the Caribbean Sea", "In the Mediterranean Sea"], answer: 1 },
      { id: "q2", type: "tf", q: "Coral bleaching is caused by falling ocean temperatures.", options: ["True", "False", "Not Given"], answer: 1 },
      { id: "q3", type: "mcq", q: "What is one threat to the Great Barrier Reef mentioned?", options: ["Overfishing", "Ocean acidification", "Oil spills", "Plastic pollution"], answer: 1 }
    ]
  },
  {
    id: "p6",
    title: "The Industrial Revolution",
    difficulty: "Hard",
    mins: 25,
    text: "The Industrial Revolution was a period of major social and economic change that began in Great Britain in the late 18th century. It marked the transition from manual labor and animal-based production to machine-based manufacturing. Key inventions, such as the steam engine and the power loom, revolutionized industries like textiles and transportation.\n\nThe Industrial Revolution led to rapid urbanization, as people moved from rural areas to cities in search of work in factories. While it brought about significant technological advancements and increased productivity, it also resulted in poor working conditions and environmental pollution. The legacy of the Industrial Revolution continues to shape the modern world.",
    questions: [
      { id: "q1", type: "mcq", q: "Where did the Industrial Revolution begin?", options: ["France", "Great Britain", "USA", "Germany"], answer: 1 },
      { id: "q2", type: "tf", q: "The Industrial Revolution led to a decrease in urbanization.", options: ["True", "False", "Not Given"], answer: 1 },
      { id: "q3", type: "mcq", q: "What was one key invention of the Industrial Revolution?", options: ["The printing press", "The steam engine", "The telephone", "The light bulb"], answer: 1 }
    ]
  },
  {
    id: "p7",
    title: "The Psychology of Happiness",
    difficulty: "Medium",
    mins: 20,
    text: "What makes people happy? This question has long intrigued philosophers and psychologists alike. Research suggests that happiness is not solely determined by external factors like wealth or status, but also by internal factors such as mindset and relationships.\n\nStudies have shown that people who practice gratitude and mindfulness tend to be happier and more resilient. Additionally, strong social connections and a sense of purpose are key contributors to overall well-being. While genetics may play a role in our baseline level of happiness, we have the power to cultivate happiness through our choices and actions.",
    questions: [
      { id: "q1", type: "mcq", q: "What is one internal factor that influences happiness?", options: ["Wealth", "Status", "Mindset", "Genetics"], answer: 2 },
      { id: "q2", type: "tf", q: "Happiness is solely determined by external factors.", options: ["True", "False", "Not Given"], answer: 1 },
      { id: "q3", type: "mcq", q: "What practice is mentioned as a way to increase happiness?", options: ["Working longer hours", "Practicing gratitude", "Buying more things", "Moving to a new city"], answer: 1 }
    ]
  },
  {
    id: "p8",
    title: "The Importance of Biodiversity",
    difficulty: "Hard",
    mins: 30,
    text: "Biodiversity refers to the variety of life on Earth, from the smallest microorganisms to the largest mammals. It is essential for the health and stability of ecosystems, providing vital services such as pollination, nutrient cycling, and climate regulation.\n\nHowever, biodiversity is currently under threat from human activities, including habitat destruction, overexploitation of resources, and pollution. The loss of species can have far-reaching consequences, disrupting food webs and reducing the resilience of ecosystems to environmental changes. Protecting biodiversity is crucial for the future of our planet.",
    questions: [
      { id: "q1", type: "mcq", q: "What does biodiversity refer to?", options: ["The number of humans on Earth", "The variety of life on Earth", "The amount of water on Earth", "The types of rocks on Earth"], answer: 1 },
      { id: "q2", type: "tf", q: "Biodiversity is only important for large animals.", options: ["True", "False", "Not Given"], answer: 1 },
      { id: "q3", type: "mcq", q: "What is one threat to biodiversity mentioned?", options: ["Volcanic eruptions", "Habitat destruction", "Natural selection", "Solar flares"], answer: 1 }
    ]
  },
  {
    id: "p9",
    title: "The History of Space Exploration",
    difficulty: "Medium",
    mins: 20,
    text: "Space exploration has captivated the human imagination for centuries. The modern era of space exploration began in the mid-20th century, with the launch of the first artificial satellite, Sputnik 1, by the Soviet Union in 1957. This event marked the beginning of the Space Race between the USA and the Soviet Union.\n\nIn 1969, the USA achieved a major milestone with the Apollo 11 mission, which saw the first humans land on the moon. Since then, space exploration has expanded to include the launch of space stations, the deployment of telescopes like Hubble, and the exploration of other planets in our solar system using robotic probes.",
    questions: [
      { id: "q1", type: "mcq", q: "What was the first artificial satellite launched into space?", options: ["Apollo 11", "Sputnik 1", "Hubble", "Voyager 1"], answer: 1 },
      { id: "q2", type: "tf", q: "The first humans landed on the moon in 1957.", options: ["True", "False", "Not Given"], answer: 1 },
      { id: "q3", type: "mcq", q: "What was the 'Space Race'?", options: ["A marathon in space", "A competition between the USA and the Soviet Union", "A type of rocket engine", "A movie about space"], answer: 1 }
    ]
  },
  {
    id: "p10",
    title: "The Science of Sleep",
    difficulty: "Hard",
    mins: 25,
    text: "Sleep is a vital biological process that is essential for our physical and mental health. During sleep, our bodies repair tissues, consolidate memories, and regulate various physiological functions. Lack of sleep can have a wide range of negative effects, including impaired cognitive function, weakened immune system, and increased risk of chronic diseases.\n\nScientists have identified different stages of sleep, including REM (Rapid Eye Movement) and non-REM sleep. Each stage plays a unique role in our overall well-being. While the exact amount of sleep needed varies from person to person, most adults require 7-9 hours of quality sleep per night to function at their best.",
    questions: [
      { id: "q1", type: "mcq", q: "What is one function of sleep mentioned?", options: ["Digesting food", "Consolidating memories", "Growing hair", "Building muscles"], answer: 1 },
      { id: "q2", type: "tf", q: "Most adults only need 4 hours of sleep per night.", options: ["True", "False", "Not Given"], answer: 1 },
      { id: "q3", type: "mcq", q: "What does REM stand for?", options: ["Restful Energy Movement", "Rapid Eye Movement", "Random Electronic Motion", "Real Emotional Memory"], answer: 1 }
    ]
  },
  {
    id: "p11",
    title: "The Rise of E-commerce",
    difficulty: "Medium",
    mins: 20,
    text: "E-commerce, or electronic commerce, has revolutionized the way we shop and do business. It refers to the buying and selling of goods and services over the internet. The rise of e-commerce has been driven by advancements in technology, the widespread availability of high-speed internet, and the convenience of online shopping.\n\nE-commerce offers numerous benefits for both consumers and businesses, including a wider range of products, competitive pricing, and the ability to shop from anywhere at any time. However, it also presents challenges, such as concerns about online security and the impact on traditional brick-and-mortar stores.",
    questions: [
      { id: "q1", type: "mcq", q: "What does e-commerce refer to?", options: ["Trading stocks", "Buying and selling over the internet", "Electronic mail", "Computer programming"], answer: 1 },
      { id: "q2", type: "tf", q: "E-commerce has had no impact on traditional stores.", options: ["True", "False", "Not Given"], answer: 1 },
      { id: "q3", type: "mcq", q: "What is one benefit of e-commerce mentioned?", options: ["Higher prices", "Limited product range", "Convenience", "Slower delivery"], answer: 2 }
    ]
  },
  {
    id: "p12",
    title: "The Impact of Globalization",
    difficulty: "Hard",
    mins: 30,
    text: "Globalization refers to the increasing interconnectedness of the world's economies, cultures, and populations. It is driven by international trade, investment, and the spread of technology and information. Globalization has led to increased economic growth and the exchange of ideas and cultures across borders.\n\nHowever, globalization also has its critics, who argue that it can lead to job losses in certain sectors, increased inequality, and the erosion of local cultures. The impact of globalization is complex and multifaceted, with both positive and negative consequences for different regions and groups of people.",
    questions: [
      { id: "q1", type: "mcq", q: "What drives globalization?", options: ["Isolationism", "International trade and technology", "Local farming", "Manual labor"], answer: 1 },
      { id: "q2", type: "tf", q: "Globalization only has positive consequences.", options: ["True", "False", "Not Given"], answer: 1 },
      { id: "q3", type: "mcq", q: "What is one criticism of globalization mentioned?", options: ["Increased economic growth", "Erosion of local cultures", "Better communication", "More travel opportunities"], answer: 1 }
    ]
  },
  {
    id: "p13",
    title: "The Future of Work",
    difficulty: "Medium",
    mins: 20,
    text: "The world of work is undergoing a major transformation, driven by advancements in technology and changes in societal values. The rise of remote work, the gig economy, and the increasing use of automation and AI are all shaping the future of work.\n\nThese changes offer new opportunities for flexibility and innovation, but they also present challenges, such as the need for lifelong learning and the potential for job displacement. As the nature of work continues to evolve, individuals and organizations will need to adapt to stay competitive and thrive in the modern economy.",
    questions: [
      { id: "q1", type: "mcq", q: "What is one factor shaping the future of work?", options: ["Manual labor", "Remote work", "Traditional office hours", "Fixed job roles"], answer: 1 },
      { id: "q2", type: "tf", q: "The future of work will require less learning.", options: ["True", "False", "Not Given"], answer: 1 },
      { id: "q3", type: "mcq", q: "What is one challenge mentioned regarding the future of work?", options: ["Increased stability", "Job displacement", "Less technology", "Fewer opportunities"], answer: 1 }
    ]
  },
  {
    id: "p14",
    title: "The Importance of Mental Health",
    difficulty: "Hard",
    mins: 25,
    text: "Mental health is an essential component of overall well-being, yet it is often overlooked or stigmatized. Mental health refers to our emotional, psychological, and social well-being, affecting how we think, feel, and act. It also helps determine how we handle stress, relate to others, and make choices.\n\nMental health conditions, such as anxiety and depression, are common and can have a significant impact on an individual's life. Promoting mental health awareness and providing access to support and treatment are crucial for building a healthier and more resilient society. Taking care of our mental health is just as important as taking care of our physical health.",
    questions: [
      { id: "q1", type: "mcq", q: "What does mental health refer to?", options: ["Physical fitness", "Emotional and psychological well-being", "Financial stability", "Academic achievement"], answer: 1 },
      { id: "q2", type: "tf", q: "Mental health is less important than physical health.", options: ["True", "False", "Not Given"], answer: 1 },
      { id: "q3", type: "mcq", q: "What is one common mental health condition mentioned?", options: ["Diabetes", "Anxiety", "Asthma", "Heart disease"], answer: 1 }
    ]
  },
  {
    id: "p15",
    title: "The History of the Internet",
    difficulty: "Medium",
    mins: 20,
    text: "The internet has transformed almost every aspect of our lives, from communication and entertainment to education and commerce. The origins of the internet can be traced back to the 1960s, with the development of ARPANET, a research project funded by the US Department of Defense.\n\nIn the 1990s, the invention of the World Wide Web by Tim Berners-Lee made the internet accessible to the general public. Since then, the internet has grown exponentially, with billions of people around the world now connected. The internet continues to evolve, with the rise of social media, mobile technology, and the Internet of Things.",
    questions: [
      { id: "q1", type: "mcq", q: "What was the precursor to the internet?", options: ["The World Wide Web", "ARPANET", "Google", "Facebook"], answer: 1 },
      { id: "q2", type: "tf", q: "Tim Berners-Lee invented the internet in the 1960s.", options: ["True", "False", "Not Given"], answer: 1 },
      { id: "q3", type: "mcq", q: "What made the internet accessible to the public in the 1990s?", options: ["The smartphone", "The World Wide Web", "Social media", "Fiber optics"], answer: 1 }
    ]
  },
  {
    id: "p16",
    title: "The Science of Climate Change",
    difficulty: "Hard",
    mins: 30,
    text: "Climate change refers to long-term shifts in temperatures and weather patterns, primarily caused by human activities such as the burning of fossil fuels and deforestation. These activities release greenhouse gases, like carbon dioxide and methane, into the atmosphere, trapping heat and leading to global warming.\n\nThe effects of climate change are already being felt around the world, including more frequent and intense heatwaves, rising sea levels, and changes in precipitation patterns. Addressing climate change requires a global effort to reduce greenhouse gas emissions and transition to sustainable energy sources.",
    questions: [
      { id: "q1", type: "mcq", q: "What is the primary cause of modern climate change?", options: ["Volcanic activity", "Human activities", "Solar cycles", "Natural variations"], answer: 1 },
      { id: "q2", type: "tf", q: "Methane is a type of greenhouse gas.", options: ["True", "False", "Not Given"], answer: 0 },
      { id: "q3", type: "mcq", q: "What is one effect of climate change mentioned?", options: ["Falling sea levels", "Rising sea levels", "More predictable weather", "Less heatwaves"], answer: 1 }
    ]
  },
  {
    id: "p17",
    title: "The Psychology of Motivation",
    difficulty: "Hard",
    mins: 25,
    text: "Motivation is a complex psychological phenomenon that drives human behavior and determines the direction and intensity of our actions. Psychologists distinguish between intrinsic motivation, which comes from within, and extrinsic motivation, which is driven by external rewards. Intrinsic motivation is often associated with higher levels of creativity and persistence, while extrinsic motivation can be effective in the short term but may sometimes undermine internal interest.\n\nAnother key concept is self-efficacy, which refers to an individual's belief in their capacity to execute behaviors necessary to produce specific performance attainments. People with high self-efficacy are more likely to take on challenging tasks and persist in the face of obstacles. Goal setting also plays a crucial role, as specific and challenging goals can significantly enhance performance by providing direction and a benchmark for progress.",
    questions: [
      { id: "q1", type: "mcq", q: "What is intrinsic motivation?", options: ["Driven by external rewards", "Comes from within", "A type of goal setting", "A form of self-efficacy"], answer: 1 },
      { id: "q2", type: "tf", q: "Extrinsic motivation always improves long-term interest.", options: ["True", "False", "Not Given"], answer: 1 },
      { id: "q3", type: "mcq", q: "What does self-efficacy refer to?", options: ["External rewards", "Belief in one's own abilities", "Setting easy goals", "Social recognition"], answer: 1 }
    ]
  },
  {
    id: "p18",
    title: "The History of Architecture",
    difficulty: "Medium",
    mins: 20,
    text: "Architecture is the art and science of designing and constructing buildings, reflecting the values and aspirations of societies. In ancient Greece, architecture focused on harmony and proportion, using classical orders like Doric and Ionic. The Romans introduced the arch, vault, and dome, allowing for massive structures like the Colosseum.\n\nDuring the Middle Ages, Gothic architecture emerged with pointed arches and flying buttresses, leading to taller, light-filled cathedrals. The Industrial Revolution introduced materials like iron and steel, paving the way for modern architecture that emphasized functionality and simplicity. Today, architecture continues to evolve with a focus on sustainability and technology.",
    questions: [
      { id: "q1", type: "mcq", q: "What was a key focus of ancient Greek architecture?", options: ["Functionality", "Harmony and proportion", "Industrial materials", "Sustainability"], answer: 1 },
      { id: "q2", type: "tf", q: "The Romans invented the flying buttress.", options: ["True", "False", "Not Given"], answer: 1 },
      { id: "q3", type: "mcq", q: "What did the Industrial Revolution introduce to architecture?", options: ["Pointed arches", "Classical orders", "Iron and steel", "The dome"], answer: 2 }
    ]
  },
  {
    id: "p19",
    title: "The Benefits of Reading",
    difficulty: "Medium",
    mins: 20,
    text: "Reading is a wonderful way to expand your knowledge, improve your vocabulary, and enhance your imagination. It can also be a great way to relax and reduce stress. Whether you enjoy fiction, non-fiction, or poetry, there is a world of books waiting to be explored.\n\nStudies have shown that regular reading can improve cognitive function and empathy. It can also help you develop a better understanding of different cultures and perspectives. Making reading a part of your daily routine can have numerous benefits for your personal and intellectual growth.",
    questions: [
      { id: "q1", type: "mcq", q: "What is one benefit of reading mentioned?", options: ["Improved vocabulary", "Better physical fitness", "Higher income", "More friends"], answer: 0 },
      { id: "q2", type: "tf", q: "Reading can help reduce stress.", options: ["True", "False", "Not Given"], answer: 0 },
      { id: "q3", type: "mcq", q: "What can regular reading improve besides vocabulary?", options: ["Running speed", "Cognitive function", "Cooking skills", "Driving ability"], answer: 1 }
    ]
  },
  {
    id: "p20",
    title: "The History of the Printing Press",
    difficulty: "Hard",
    mins: 25,
    text: "The invention of the printing press by Johannes Gutenberg in the 15th century was a turning point in human history. Before the printing press, books were copied by hand, which was a slow and expensive process. Gutenberg's invention made it possible to produce books quickly and affordably, leading to a massive increase in literacy and the spread of knowledge.\n\nThe printing press played a crucial role in the Renaissance, the Reformation, and the Scientific Revolution. It allowed ideas to be shared more widely and challenged the authority of traditional institutions. The legacy of the printing press continues to shape the way we share and consume information today.",
    questions: [
      { id: "q1", type: "mcq", q: "Who invented the printing press?", options: ["Leonardo da Vinci", "Johannes Gutenberg", "Isaac Newton", "Galileo Galilei"], answer: 1 },
      { id: "q2", type: "tf", q: "Before the printing press, books were very cheap.", options: ["True", "False", "Not Given"], answer: 1 },
      { id: "q3", type: "mcq", q: "What was a major result of the printing press?", options: ["Decrease in literacy", "Spread of knowledge", "Fewer books", "More manual labor"], answer: 1 }
    ]
  },
  {
    id: "p21",
    title: "The Importance of Water Conservation",
    difficulty: "Medium",
    mins: 20,
    text: "Water is essential for all life on Earth, yet it is a finite resource that is under increasing pressure from population growth and climate change. Conserving water is crucial for ensuring a sustainable future for our planet.\n\nThere are many simple ways we can conserve water in our daily lives, such as fixing leaks, taking shorter showers, and using water-efficient appliances. Additionally, protecting our water sources from pollution and managing water resources more effectively are vital for maintaining the health of our ecosystems and communities.",
    questions: [
      { id: "q1", type: "mcq", q: "Why is water conservation important?", options: ["Water is infinite", "Water is a finite resource", "Water is not essential", "Water is too cheap"], answer: 1 },
      { id: "q2", type: "tf", q: "Taking shorter showers is a way to conserve water.", options: ["True", "False", "Not Given"], answer: 0 },
      { id: "q3", type: "mcq", q: "What is one factor putting pressure on water resources?", options: ["Population growth", "Less farming", "More rain", "Fewer people"], answer: 0 }
    ]
  },
  {
    id: "p22",
    title: "The Future of Space Travel",
    difficulty: "Hard",
    mins: 30,
    text: "The future of space travel is filled with exciting possibilities, from the exploration of Mars to the development of space tourism. Advancements in rocket technology and the increasing involvement of private companies are driving this new era of space exploration.\n\nHowever, space travel also presents significant challenges, such as the high cost of missions, the risks of radiation exposure, and the long-term effects of microgravity on the human body. Overcoming these challenges will require continued innovation and international cooperation. The future of space travel holds the potential to expand our understanding of the universe and our place within it.",
    questions: [
      { id: "q1", type: "mcq", q: "What is one exciting possibility for the future of space travel?", options: ["Exploring the moon only", "Exploring Mars", "Stopping space travel", "Fewer rockets"], answer: 1 },
      { id: "q2", type: "tf", q: "Private companies are becoming more involved in space exploration.", options: ["True", "False", "Not Given"], answer: 0 },
      { id: "q3", type: "mcq", q: "What is one challenge of space travel mentioned?", options: ["Low cost", "Radiation exposure", "Too much gravity", "Fewer risks"], answer: 1 }
    ]
  },
  {
    id: "p23",
    title: "The Importance of Biodiversity",
    difficulty: "Hard",
    mins: 30,
    text: "Biodiversity refers to the variety of life on Earth, including the different species of plants, animals, and microorganisms, as well as the ecosystems they form. Biodiversity is essential for maintaining the health and stability of our planet, providing us with vital resources such as food, medicine, and clean water.\n\nHowever, biodiversity is currently under threat from human activities such as habitat destruction, pollution, and climate change. The loss of biodiversity can have far-reaching consequences, including the collapse of ecosystems and the loss of essential services that support human life. Protecting and restoring biodiversity is crucial for ensuring a sustainable future for all.",
    questions: [
      { id: "q1", type: "mcq", q: "What does biodiversity refer to?", options: ["Only animals", "The variety of life on Earth", "Only plants", "A single ecosystem"], answer: 1 },
      { id: "q2", type: "tf", q: "Biodiversity is not important for human health.", options: ["True", "False", "Not Given"], answer: 1 },
      { id: "q3", type: "mcq", q: "What is one threat to biodiversity mentioned?", options: ["Increased conservation", "Habitat destruction", "More clean water", "Stable ecosystems"], answer: 1 }
    ]
  },
  {
    id: "p24",
    title: "The Psychology of Learning",
    difficulty: "Medium",
    mins: 20,
    text: "Learning is a complex process that involves acquiring new knowledge, skills, behaviors, or values. Psychologists have developed various theories to explain how people learn, including behaviorism, cognitivism, and constructivism. Behaviorism focuses on observable behaviors and the role of reinforcement, while cognitivism emphasizes the mental processes involved in learning, such as memory and problem-solving.\n\nConstructivism, on the other hand, suggests that learners actively construct their own understanding of the world based on their experiences and interactions. Effective learning often involves a combination of these different approaches, as well as factors such as motivation, attention, and the use of effective study strategies. Understanding the psychology of learning can help individuals and educators develop more effective ways to acquire and share knowledge.",
    questions: [
      { id: "q1", type: "mcq", q: "What does behaviorism focus on?", options: ["Mental processes", "Observable behaviors", "Social interactions", "Emotional states"], answer: 1 },
      { id: "q2", type: "tf", q: "Cognitivism emphasizes the role of memory in learning.", options: ["True", "False", "Not Given"], answer: 0 },
      { id: "q3", type: "mcq", q: "What does constructivism suggest about learners?", options: ["They are passive recipients of information", "They actively construct their own understanding", "They only learn through imitation", "They are born with all knowledge"], answer: 1 }
    ]
  },
  {
    id: "p25",
    title: "The Impact of Social Media",
    difficulty: "Medium",
    mins: 20,
    text: "Social media has revolutionized the way we communicate, share information, and interact with others. Platforms like Facebook, Twitter, and Instagram have billions of users around the world, allowing people to connect with friends and family, share their thoughts and experiences, and stay informed about current events.\n\nHowever, social media also has its downsides, including concerns about privacy, the spread of misinformation, and the impact on mental health. The constant pressure to present a perfect image of oneself and the fear of missing out (FOMO) can lead to anxiety and low self-esteem. As social media continues to evolve, it is important for individuals to be mindful of their usage and for platforms to take steps to address these challenges.",
    questions: [
      { id: "q1", type: "mcq", q: "What is one benefit of social media mentioned?", options: ["Increased privacy", "Connecting with friends and family", "Less misinformation", "Better self-esteem"], answer: 1 },
      { id: "q2", type: "tf", q: "Social media has no impact on mental health.", options: ["True", "False", "Not Given"], answer: 1 },
      { id: "q3", type: "mcq", q: "What is one downside of social media mentioned?", options: ["More communication", "Spread of misinformation", "Better information sharing", "Increased connectivity"], answer: 1 }
    ]
  },
  {
    id: "p26",
    title: "The Impact of Urbanization",
    difficulty: "Medium",
    mins: 20,
    text: "Urbanization refers to the increasing proportion of people living in cities and towns. It is driven by economic opportunities, better access to services, and changes in agricultural practices. Urbanization has led to the growth of megacities and the concentration of economic activity in urban areas.\n\nWhile urbanization offers many benefits, it also presents challenges, such as housing shortages, traffic congestion, and environmental pollution. Managing urban growth effectively is crucial for building sustainable and livable cities for the future.",
    questions: [
      { id: "q1", type: "mcq", q: "What does urbanization refer to?", options: ["People moving to rural areas", "People moving to cities", "Fewer people in the world", "More farms"], answer: 1 },
      { id: "q2", type: "tf", q: "Urbanization is only driven by agricultural practices.", options: ["True", "False", "Not Given"], answer: 1 },
      { id: "q3", type: "mcq", q: "What is one challenge of urbanization mentioned?", options: ["More space", "Housing shortages", "Less traffic", "Cleaner air"], answer: 1 }
    ]
  }
];

export default function Reading() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [activeTab, setActiveTab] = useState<"practice" | "samples" | "ai-test">("practice");
  const [activePassage, setActivePassage] = useState<any>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const load = async () => {
      const p = await getProgress();
      setProgress(p);
    };
    load();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activePassage && timeLeft > 0 && !showResults) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activePassage, timeLeft, showResults]);

  const generateAIPractice = async () => {
    setIsGenerating(true);
    const schema = {
      type: "object",
      properties: {
        title: { type: "string" },
        difficulty: { type: "string" },
        mins: { type: "number" },
        text: { type: "string" },
        questions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              type: { type: "string" },
              q: { type: "string" },
              options: { type: "array", items: { type: "string" } },
              answer: { type: "number" }
            },
            required: ["id", "type", "q", "options", "answer"]
          }
        }
      },
      required: ["title", "difficulty", "mins", "text", "questions"]
    };

    const prompt = "Generate a high-quality IELTS Academic Reading passage (approx 400 words) with 5 multiple-choice questions. The topic should be related to science, history, or environment. Ensure the questions are challenging (Band 9.0 level) and follow IELTS standards.";

    try {
      const result = await callGroqJSON(prompt, schema, "You are an IELTS Reading content creator.");
      setActivePassage(result);
      setUserAnswers({});
      setShowResults(false);
      setAiFeedback(null);
      setTimeLeft(result.mins * 60);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const startPassage = (passage: any) => {
    setActivePassage(passage);
    setUserAnswers({});
    setShowResults(false);
    setAiFeedback(null);
    setTimeLeft(passage.mins * 60);
  };

  const handleCheck = async () => {
    setShowResults(true);
    setIsAnalyzing(true);
    
    const correctCount = activePassage.questions.filter((q: any, i: number) => userAnswers[i] === q.answer).length;
    const score = (correctCount / activePassage.questions.length) * 9;

    if (progress) {
      const updated = { 
        ...progress, 
        studyMinutes: (progress.studyMinutes || 0) + activePassage.mins,
        bands: { ...progress.bands, reading: Math.max(progress.bands?.reading || 0, score) }
      };
      saveProgress(updated);
      setProgress(updated);
    }

    // AI Assessment
    const prompt = `You are an IELTS Reading tutor. A student has completed a reading task.
    Passage Title: ${activePassage.title}
    Passage Text: ${activePassage.text}
    Questions and Correct Answers: ${JSON.stringify(activePassage.questions)}
    Student's Answers: ${JSON.stringify(userAnswers)}
    
    Provide a detailed assessment. Explain why the correct answers are correct and where the student might have gone wrong. Give tips for improving their reading score.
    Use markdown for formatting.`;

    try {
      const feedback = await callGroq(prompt, "You are an IELTS Reading tutor.");
      setAiFeedback(feedback);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!progress) return null;

  if (activePassage) {
    const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => setActivePassage(null)} className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors">
            <ArrowLeft size={16} /> Back
          </button>
          <div className={cn(
            "flex items-center gap-2 font-mono text-sm",
            timeLeft < 300 ? "text-red-accent animate-pulse" : "text-blue-secondary"
          )}>
            <Clock size={16} /> {formatTime(timeLeft)}
          </div>
        </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-hidden">
            <div className="space-y-4 flex flex-col h-[40vh] lg:h-full">
              <div className="card bg-bg-2 border-border-2 flex-1 overflow-y-auto custom-scrollbar p-6">
                <h3 className="font-serif font-bold text-xl mb-4 sticky top-0 bg-bg-2 py-2 border-b border-border-2">{activePassage.title}</h3>
                <div className="prose prose-invert prose-sm max-w-none text-text-secondary leading-relaxed whitespace-pre-wrap">
                  {activePassage.text}
                </div>
              </div>
            </div>

            <div className="space-y-4 flex flex-col h-[50vh] lg:h-full">
              <div className="font-bold text-sm flex items-center gap-2 px-1 shrink-0">
                <PenTool size={16} className="text-blue-secondary" /> Reading Questions
              </div>
              <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {activePassage.questions.map((q: any, i: number) => (
                <div key={i} className="card border-border">
                  <div className="text-xs font-bold text-text-primary mb-3">{i + 1}. {q.q}</div>
                  <div className="space-y-2">
                    {q.options.map((opt: string, optIdx: number) => (
                      <button
                        key={optIdx}
                        onClick={() => !showResults && setUserAnswers({ ...userAnswers, [i]: optIdx })}
                        className={cn(
                          "w-full text-left p-3 rounded-xl border text-xs transition-all",
                          userAnswers[i] === optIdx 
                            ? "bg-blue-primary border-blue-primary text-white" 
                            : "bg-bg border-border-2 text-text-secondary hover:border-blue-primary",
                          showResults && optIdx === q.answer && "border-green-accent bg-green-accent/10 text-green-accent",
                          showResults && userAnswers[i] === optIdx && optIdx !== q.answer && "border-red-accent bg-red-accent/10 text-red-accent"
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {!showResults ? (
              <button onClick={handleCheck} className="btn btn-primary w-full py-4">Submit Answers</button>
            ) : (
              <div className="space-y-6">
                <div className="card bg-blue-dim/10 border-blue-primary/20 text-center py-6">
                  <Trophy size={32} className="mx-auto text-yellow-500 mb-2" />
                  <div className="text-xl font-black text-blue-primary">
                    Band {((activePassage.questions.filter((q: any, i: number) => userAnswers[i] === q.answer).length / activePassage.questions.length) * 9).toFixed(1)}
                  </div>
                </div>

                <div className="card bg-bg-2 border-border-2 p-6">
                  <div className="flex items-center gap-2 text-blue-secondary font-bold text-xs uppercase tracking-widest mb-4">
                    <Sparkles size={16} /> AI Assessment & Explanations
                  </div>
                  <div className="prose prose-invert prose-sm max-w-none text-text-secondary leading-relaxed">
                    {isAnalyzing ? (
                      <div className="flex flex-col items-center justify-center py-8 gap-3">
                        <Loader2 size={24} className="animate-spin text-blue-primary" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Aria is analyzing your performance...</span>
                      </div>
                    ) : (
                      <ReactMarkdown>{aiFeedback}</ReactMarkdown>
                    )}
                  </div>
                </div>

                <button onClick={() => setActivePassage(null)} className="btn btn-ghost w-full">Try Another Passage</button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

    return (
    <div className="space-y-8">
      {/* Reading Hero Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 p-8 md:p-12 text-white shadow-2xl shadow-emerald-500/20">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
          <BookOpen size={200} />
        </div>
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] opacity-80">
            <Sparkles size={14} className="animate-pulse" /> Reading Mastery
          </div>
          <div className="space-y-2">
            <h3 className="font-serif text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
              ACADEMIC READING
            </h3>
            <p className="text-lg md:text-xl font-medium max-w-2xl leading-relaxed opacity-90">
              Master skimming, scanning, and detailed reading with our curated collection of IELTS-style passages.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4 pt-4">
            <div className="flex items-center gap-6 px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Avg. Speed</span>
                <span className="text-xl font-black">240 wpm</span>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Accuracy</span>
                <span className="text-xl font-black">84%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold mb-1">📖 Reading Academy</h2>
          <p className="text-sm text-text-muted">Master IELTS reading with academic passages and practice</p>
        </div>
        <div className="flex bg-bg-2 p-1 rounded-xl border border-border">
          <button 
            onClick={() => setActiveTab("practice")}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold transition-all",
              activeTab === "practice" ? "bg-blue-primary text-white shadow-lg" : "text-text-muted hover:text-text-primary"
            )}
          >
            Practice
          </button>
          <button 
            onClick={() => setActiveTab("samples")}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold transition-all",
              activeTab === "samples" ? "bg-blue-primary text-white shadow-lg" : "text-text-muted hover:text-text-primary"
            )}
          >
            Sample Q&A
          </button>
          <button 
            onClick={() => setActiveTab("ai-test")}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold transition-all",
              activeTab === "ai-test" ? "bg-blue-primary text-white shadow-lg" : "text-text-muted hover:text-text-primary"
            )}
          >
            AI Practice Test
          </button>
        </div>
      </div>

      {activeTab === "practice" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {READING_PASSAGES.map((passage) => (
            <button
              key={passage.id}
              onClick={() => startPassage(passage)}
              className="group relative flex flex-col text-left bg-bg-2 border border-border rounded-[2rem] overflow-hidden transition-all hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/5 active:scale-[0.98]"
            >
              <div className="p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                    passage.difficulty === "Medium" ? "bg-amber-dim text-amber-600" : "bg-red-dim text-red-accent"
                  )}>{passage.difficulty}</span>
                  <span className="text-[10px] font-bold text-text-muted flex items-center gap-1">
                    <Clock size={12} /> {passage.mins} Mins
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-black text-text-primary group-hover:text-emerald-600 transition-colors">{passage.title}</h3>
                <p className="text-sm text-text-muted line-clamp-2 mb-4 leading-relaxed">
                  {passage.text.substring(0, 150)}...
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{passage.questions.length} Questions</span>
                  <div className="w-10 h-10 rounded-full bg-bg-1 border border-border flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <ChevronRight size={20} />
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {activeTab === "samples" && (
        <div className="space-y-6">
          {READING_SAMPLES.map((sample) => (
            <div key={sample.id} className="card bg-bg-2 border-border-2 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-text-primary">{sample.title}</h3>
                <span className="tag tag-blue">{sample.type}</span>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-bg-1 rounded-xl border border-border-2 text-sm text-text-secondary italic">
                  {sample.passage}
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-bold text-text-primary">Question: {sample.question}</div>
                  {sample.options && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {sample.options.map((opt, i) => (
                        <div key={i} className="p-2 bg-bg-3 rounded-lg text-[10px] text-text-muted border border-border">
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="p-4 bg-green-accent/5 border border-green-accent/20 rounded-xl">
                  <div className="text-[10px] font-bold text-green-accent uppercase tracking-widest mb-1">Correct Answer</div>
                  <div className="text-sm font-bold text-text-primary mb-2">{sample.answer}</div>
                  <div className="text-[10px] text-text-muted leading-relaxed">
                    <span className="font-bold">Explanation:</span> {sample.explanation}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "ai-test" && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-blue-primary/10 text-blue-primary flex items-center justify-center">
            <Sparkles size={40} />
          </div>
          <div className="max-w-md">
            <h3 className="text-xl font-bold mb-2">AI-Generated Practice Test</h3>
            <p className="text-sm text-text-muted">
              Aria will generate a unique IELTS Academic Reading passage and set of questions tailored to your level.
            </p>
          </div>
          <button 
            onClick={generateAIPractice}
            disabled={isGenerating}
            className="btn btn-primary px-8 py-4 flex items-center gap-2"
          >
            {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
            {isGenerating ? "Generating Test..." : "Generate New Test"}
          </button>
        </div>
      )}
    </div>
  );
}
