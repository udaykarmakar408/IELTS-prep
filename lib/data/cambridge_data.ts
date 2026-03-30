export interface CambridgeQuestion {
  id: number;
  type: "true-false" | "gap-fill" | "multiple-choice";
  question: string;
  answer: string;
  options?: string[];
}

export interface CambridgeSection {
  title: string;
  passage?: string; // For Reading
  transcript?: string; // For Listening
  prompt?: string; // For Writing
  questions: CambridgeQuestion[];
}

export interface CambridgeTestData {
  reading: CambridgeSection;
  listening: CambridgeSection;
  writing: {
    task1: string;
    task2: string;
  };
  speaking?: {
    topic: string;
    prompts: string[];
  };
}

export const CAMBRIDGE_TEST_DATA: Record<string, CambridgeTestData> = {
  "c19-t1": {
    reading: {
      title: "The Impact of Urban Green Spaces",
      passage: `Urban green spaces, such as parks, gardens, and urban forests, play a crucial role in enhancing the quality of life in cities. Research has shown that access to green spaces can significantly reduce stress levels and improve mental health. Furthermore, these areas help to mitigate the urban heat island effect, where cities become significantly warmer than their surrounding rural areas due to human activities and the concentration of heat-absorbing materials like concrete and asphalt.

In addition to environmental benefits, urban green spaces provide social advantages. They serve as communal areas where people can interact, fostering a sense of community. For children, parks offer essential spaces for physical activity and play, which are vital for healthy development. However, as cities continue to grow and densify, the preservation and creation of green spaces face significant challenges, including high land values and competing development interests.`,
      questions: [
        { id: 1, type: "true-false", question: "Urban green spaces can help reduce stress levels.", answer: "TRUE" },
        { id: 2, type: "true-false", question: "Cities are usually cooler than rural areas.", answer: "FALSE" },
        { id: 3, type: "true-false", question: "Green spaces have no social benefits for children.", answer: "FALSE" }
      ]
    },
    listening: {
      title: "Library Membership Inquiry",
      transcript: `Librarian: Good morning! How can I help you today?
Student: Hi, I'd like to inquire about joining the library. I'm a new student here.
Librarian: Welcome! To join, you'll need your student ID card and a proof of address, like a utility bill or a rental agreement.
Student: I have my ID card, but I don't have a utility bill yet. Will a letter from the university work?
Librarian: Yes, a formal letter from the university confirming your address is perfectly fine.
Student: Great. And how many books can I borrow at once?
Librarian: Undergraduate students can borrow up to 10 books for a period of two weeks.`,
      questions: [
        { id: 1, type: "gap-fill", question: "To join the library, the student needs an ID card and proof of _______.", answer: "address" },
        { id: 2, type: "gap-fill", question: "Undergraduates can borrow a maximum of _______ books.", answer: "10" }
      ]
    },
    writing: {
      task1: "The chart below shows the percentage of people who used different modes of transport in a city in 2010 and 2020. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.",
      task2: "Some people believe that the best way to reduce crime is to give longer prison sentences. Others, however, believe there are better alternative ways of reducing crime. Discuss both views and give your opinion."
    },
    speaking: {
      topic: "Describe a place you visited that had a significant impact on you.",
      prompts: [
        "where it was",
        "when you went there",
        "what you did there",
        "and explain why it had a significant impact on you."
      ]
    }
  },
  "c19-t2": {
    reading: {
      title: "The History of the Bicycle",
      passage: `The bicycle is one of the most efficient and widely used modes of transport in the world. Its history dates back to the early 19th century, with the invention of the 'Laufmaschine' or 'running machine' by Baron Karl von Drais in 1817. This early version had no pedals and was propelled by the rider pushing their feet against the ground.

Over the decades, the design evolved significantly. The 'Penny Farthing', with its enormous front wheel and tiny rear wheel, became popular in the 1870s but was notoriously difficult and dangerous to ride. The 'Safety Bicycle', introduced in the 1880s, featured two wheels of equal size and a chain drive, making it much more accessible to the general public. Today, bicycles are used for everything from commuting and exercise to professional racing and mountain biking.`,
      questions: [
        { id: 1, type: "true-false", question: "The first bicycle had pedals.", answer: "FALSE" },
        { id: 2, type: "true-false", question: "The Penny Farthing was easy to ride.", answer: "FALSE" },
        { id: 3, type: "true-false", question: "The Safety Bicycle had wheels of the same size.", answer: "TRUE" }
      ]
    },
    listening: {
      title: "Travel Agency Booking",
      transcript: `Agent: Good afternoon, World Travel. How can I help you?
Customer: Hello, I'm looking to book a trip to Iceland for next summer.
Agent: Excellent choice! Iceland is beautiful in the summer. When are you planning to go?
Customer: We're thinking of the first two weeks of July.
Agent: July is the peak season, so I recommend booking early. We have a 10-day tour that covers the Golden Circle and the South Coast.
Customer: That sounds perfect. Does it include flights?
Agent: No, the tour price is for the land portion only. Flights from London are approximately £300 return.`,
      questions: [
        { id: 1, type: "gap-fill", question: "The customer wants to visit Iceland in the _______.", answer: "summer" },
        { id: 2, type: "gap-fill", question: "The recommended tour lasts for _______ days.", answer: "10" }
      ]
    },
    writing: {
      task1: "The diagram below shows the process of recycling plastic bottles. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.",
      task2: "In many countries, more and more people are choosing to live alone. What are the reasons for this? Is it a positive or negative development?"
    },
    speaking: {
      topic: "Describe a person you admire who has a positive influence on others.",
      prompts: [
        "who this person is",
        "how you know them",
        "what they do",
        "and explain why you admire them."
      ]
    }
  },
  "c19-t3": {
    reading: {
      title: "The Psychology of Sleep",
      passage: `Sleep is a vital biological process that is essential for physical and mental health. It is characterized by a state of reduced consciousness and responsiveness to the environment. Research has shown that sleep plays a crucial role in memory consolidation, emotional regulation, and physical repair.

There are two main types of sleep: REM (Rapid Eye Movement) sleep and non-REM sleep. Non-REM sleep is further divided into three stages, with stage 3 being the deepest and most restorative. REM sleep is associated with dreaming and is thought to be important for cognitive function. Lack of sleep can have serious consequences, including impaired cognitive performance, increased risk of accidents, and long-term health problems.`,
      questions: [
        { id: 1, type: "true-false", question: "Sleep is important for memory consolidation.", answer: "TRUE" },
        { id: 2, type: "true-false", question: "There are three main types of sleep.", answer: "FALSE" },
        { id: 3, type: "true-false", question: "REM sleep is associated with dreaming.", answer: "TRUE" }
      ]
    },
    listening: {
      title: "Library Facilities Update",
      transcript: `Librarian: Attention all students! We have some exciting updates to our library facilities.
Student: Oh, what's changing?
Librarian: We've added 20 new computer stations in the silent study area on the third floor.
Student: That's great. Are there any changes to the opening hours?
Librarian: Yes, starting next week, the library will be open until midnight on weekdays.
Student: Excellent. And what about the group study rooms?
Librarian: We've implemented a new online booking system for the group study rooms to make it easier for students to reserve them.`,
      questions: [
        { id: 1, type: "gap-fill", question: "The library has added 20 new _______ stations.", answer: "computer" },
        { id: 2, type: "gap-fill", question: "The library will be open until _______ on weekdays.", answer: "midnight" }
      ]
    },
    writing: {
      task1: "The chart below shows the percentage of waste recycled in four different countries between 2005 and 2015. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.",
      task2: "Some people believe that the best way to reduce global environmental problems is to increase the price of fuel. Others, however, believe that there are better ways to solve these problems. Discuss both views and give your opinion."
    }
  },
  "c19-t4": {
    reading: {
      title: "The Future of Renewable Energy",
      passage: `Renewable energy sources, such as solar, wind, and hydroelectric power, are becoming increasingly important as the world seeks to reduce its reliance on fossil fuels. These sources are sustainable and produce little to no greenhouse gas emissions, making them essential for combating climate change.

The cost of renewable energy technologies has fallen significantly in recent years, making them more competitive with traditional energy sources. However, there are still challenges to overcome, such as the intermittency of solar and wind power and the need for better energy storage systems. Despite these challenges, the transition to a renewable energy future is already underway, and it is expected to accelerate in the coming decades.`,
      questions: [
        { id: 1, type: "true-false", question: "Renewable energy sources produce high greenhouse gas emissions.", answer: "FALSE" },
        { id: 2, type: "true-false", question: "The cost of renewable energy has increased recently.", answer: "FALSE" },
        { id: 3, type: "true-false", question: "Energy storage is a challenge for renewable energy.", answer: "TRUE" }
      ]
    },
    listening: {
      title: "Campus Cafeteria Feedback",
      transcript: `Manager: Good afternoon! Do you have a moment to provide some feedback on our cafeteria services?
Student: Sure. I eat here almost every day.
Manager: That's great. What do you think of the variety of food options?
Student: I think the variety is good, but I'd like to see more vegetarian and vegan choices.
Manager: We're actually planning to introduce a new plant-based menu next month.
Student: That's excellent news. And what about the prices?
Manager: We try to keep our prices affordable for students. A standard meal deal is currently £5.50.`,
      questions: [
        { id: 1, type: "gap-fill", question: "The student would like to see more _______ and vegan choices.", answer: "vegetarian" },
        { id: 2, type: "gap-fill", question: "A standard meal deal costs _______ pounds.", answer: "5.50" }
      ]
    },
    writing: {
      task1: "The table below shows the number of people who participated in different sports in a country in 2010 and 2020. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.",
      task2: "Some people think that it is better to educate boys and girls in separate schools. Others, however, believe that mixed schools are better for their development. Discuss both views and give your opinion."
    }
  },
  "c18-t3": {
    reading: {
      title: "The Impact of Artificial Intelligence",
      passage: `Artificial Intelligence (AI) is the simulation of human intelligence by machines, especially computer systems. It has the potential to revolutionize many aspects of our lives, from healthcare and transportation to education and entertainment. AI systems can analyze vast amounts of data, identify patterns, and make predictions with a high degree of accuracy.

However, the development of AI also raises ethical concerns, such as the potential for bias in algorithms and the impact on employment. There are also concerns about the security and privacy of data used to train AI systems. Despite these concerns, AI is expected to continue to play an increasingly important role in our society, and it is important to develop ethical guidelines for its use.`,
      questions: [
        { id: 1, type: "true-false", question: "AI can analyze large amounts of data.", answer: "TRUE" },
        { id: 2, type: "true-false", question: "The development of AI raises no ethical concerns.", answer: "FALSE" },
        { id: 3, type: "true-false", question: "AI is expected to become less important in the future.", answer: "FALSE" }
      ]
    },
    listening: {
      title: "Student Accommodation Inquiry",
      transcript: `Officer: Good afternoon, Student Housing Office. How can I help you?
Student: Hi, I'm looking for accommodation for the next academic year.
Officer: We have several options, including university-owned halls of residence and private rentals.
Student: I'd prefer a hall of residence. What's the weekly rent?
Officer: The weekly rent for a standard room is £150, which includes all utilities and internet.
Student: That sounds reasonable. Is there a meal plan included?
Officer: No, the halls are self-catering, but there's a large shared kitchen on each floor.`,
      questions: [
        { id: 1, type: "gap-fill", question: "The weekly rent for a standard room is _______ pounds.", answer: "150" },
        { id: 2, type: "gap-fill", question: "The halls of residence are _______, meaning students cook their own meals.", answer: "self-catering" }
      ]
    },
    writing: {
      task1: "The table below shows the number of international students enrolled in universities in five different countries in 2010 and 2020. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.",
      task2: "In many cities, there is a lack of affordable housing. What are the causes of this problem? What measures can be taken to solve it?"
    }
  },
  "c17-t2": {
    reading: {
      title: "The History of the Olympic Games",
      passage: `The Olympic Games have a long and storied history, dating back to ancient Greece. The first recorded Olympic Games were held in 776 BC in Olympia, and they were held every four years for over a millennium. The ancient Games featured a variety of athletic competitions, including running, jumping, and wrestling.

The modern Olympic Games were revived in the late 19th century by Pierre de Coubertin. The first modern Games were held in Athens in 1896, and they have since grown into the world's premier sporting event. Today, the Olympic Games feature thousands of athletes from hundreds of countries, competing in a wide range of summer and winter sports.`,
      questions: [
        { id: 1, type: "true-false", question: "The first Olympic Games were held in ancient Rome.", answer: "FALSE" },
        { id: 2, type: "true-false", question: "The modern Olympic Games were revived in the 19th century.", answer: "TRUE" },
        { id: 3, type: "true-false", question: "The first modern Games were held in Paris.", answer: "FALSE" }
      ]
    },
    listening: {
      title: "Travel Insurance Claim",
      transcript: `Agent: Hello, Travel Guard Insurance. How can I help you?
Customer: Hi, I'd like to make a claim for a cancelled flight.
Agent: I'm sorry to hear that. What was the reason for the cancellation?
Customer: The flight was cancelled due to a technical problem with the aircraft.
Agent: I see. Did the airline provide you with any compensation or alternative flights?
Customer: They offered me a flight for the next day, but I had to book a hotel for the night.
Agent: Okay, we'll need a copy of your original booking and a letter from the airline confirming the cancellation.`,
      questions: [
        { id: 1, type: "gap-fill", question: "The flight was cancelled because of a _______ problem.", answer: "technical" },
        { id: 2, type: "gap-fill", question: "The customer had to book a _______ for the night.", answer: "hotel" }
      ]
    },
    writing: {
      task1: "The chart below shows the percentage of people who visited a cinema at least once a month in a country between 2000 and 2015. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.",
      task2: "Some people believe that it is better to work for the same organization for one's whole life. Others think that it is better to change jobs frequently. Discuss both views and give your opinion."
    }
  },
  "c16-t2": {
    reading: {
      title: "The Importance of Sustainable Agriculture",
      passage: `Sustainable agriculture is a method of farming that aims to meet the needs of the present without compromising the ability of future generations to meet their own needs. It involves using practices that protect the environment, preserve natural resources, and promote social equity.

Key practices in sustainable agriculture include crop rotation, integrated pest management, and the use of organic fertilizers. These practices help to maintain soil health, reduce the use of harmful chemicals, and protect biodiversity. Sustainable agriculture also focuses on the well-being of farmers and farm workers, ensuring fair wages and safe working conditions.`,
      questions: [
        { id: 1, type: "true-false", question: "Sustainable agriculture aims to protect the environment.", answer: "TRUE" },
        { id: 2, type: "true-false", question: "Crop rotation is a practice used in sustainable agriculture.", answer: "TRUE" },
        { id: 3, type: "true-false", question: "Sustainable agriculture does not care about the well-being of farmers.", answer: "FALSE" }
      ]
    },
    listening: {
      title: "University Library Workshop",
      transcript: `Librarian: Good morning! Welcome to our workshop on effective research skills.
Student: Hi, I'm looking for help with finding academic sources for my essay.
Librarian: You've come to the right place. We'll be showing you how to use our online databases and search engines.
Student: That's great. Will you also be covering how to cite sources correctly?
Librarian: Yes, we'll be discussing different citation styles, such as APA and MLA.
Student: Excellent. And how long is the workshop?
Librarian: The workshop will last for two hours, with a short break in the middle.`,
      questions: [
        { id: 1, type: "gap-fill", question: "The workshop will show students how to use online _______.", answer: "databases" },
        { id: 2, type: "gap-fill", question: "The workshop will last for _______ hours.", answer: "two" }
      ]
    },
    writing: {
      task1: "The diagram below shows the process of producing electricity from wind energy. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.",
      task2: "In many countries, the amount of rubbish produced is increasing. What are the reasons for this? What can be done to reduce the amount of rubbish?"
    }
  },
  "c15-t2": {
    reading: {
      title: "The Impact of Tourism on Local Communities",
      passage: `Tourism can have both positive and negative impacts on local communities. On the positive side, it can provide economic benefits, such as jobs and income, and can help to preserve cultural heritage. Tourism can also lead to improvements in infrastructure, such as roads and public transport.

However, tourism can also have negative impacts, such as overcrowding, pollution, and the loss of traditional ways of life. In some cases, tourism can lead to the displacement of local people and the destruction of natural habitats. It is important to manage tourism sustainably to ensure that it benefits both visitors and local communities.`,
      questions: [
        { id: 1, type: "true-false", question: "Tourism can provide economic benefits to local communities.", answer: "TRUE" },
        { id: 2, type: "true-false", question: "Tourism always has a positive impact on the environment.", answer: "FALSE" },
        { id: 3, type: "true-false", question: "Sustainable management of tourism is important.", answer: "TRUE" }
      ]
    },
    listening: {
      title: "Job Fair Registration",
      transcript: `Organizer: Hello, welcome to the City Job Fair! Have you registered yet?
Student: No, I haven't. How do I register?
Organizer: You can register online or at the registration desk over there.
Student: I'll register at the desk. What information do I need to provide?
Organizer: You'll need to provide your name, contact details, and a copy of your CV.
Student: I have my CV on a USB drive. Is that okay?
Organizer: Yes, we can print it for you at the registration desk.`,
      questions: [
        { id: 1, type: "gap-fill", question: "Students can register for the job fair online or at the _______ desk.", answer: "registration" },
        { id: 2, type: "gap-fill", question: "Students need to provide a copy of their _______.", answer: "CV" }
      ]
    },
    writing: {
      task1: "The chart below shows the percentage of people who used different types of social media in a country in 2012 and 2022. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.",
      task2: "Some people believe that it is the responsibility of the government to ensure that people lead a healthy lifestyle. Others believe that it is a matter of personal choice. Discuss both views and give your opinion."
    }
  },
  "c14-t1": {
    reading: {
      title: "The History of the Steam Engine",
      passage: `The steam engine was a key invention of the Industrial Revolution, providing a reliable source of power for factories, mines, and transportation. The first practical steam engine was developed by Thomas Newcomen in the early 18th century, but it was James Watt's improvements in the late 18th century that made it much more efficient and widely used.

The steam engine allowed for the mass production of goods and the development of steamships and locomotives, which revolutionized transportation. It also had a significant impact on society, leading to urbanization and the growth of the middle class. Today, the steam engine has been largely replaced by internal combustion engines and electric motors, but its legacy continues to shape the modern world.`,
      questions: [
        { id: 1, type: "true-false", question: "The steam engine was invented during the Industrial Revolution.", answer: "TRUE" },
        { id: 2, type: "true-false", question: "James Watt made the steam engine more efficient.", answer: "TRUE" },
        { id: 3, type: "true-false", question: "The steam engine had no impact on transportation.", answer: "FALSE" }
      ]
    },
    listening: {
      title: "University Club Fair",
      transcript: `Student: Hi, I'm looking for the photography club.
Organizer: The photography club is in the main hall, near the entrance.
Student: Great. What kind of activities do they do?
Organizer: They have weekly meetings, workshops on photo editing, and regular field trips to take photos.
Student: That sounds interesting. Is there a membership fee?
Organizer: Yes, it's £10 for the whole year.`,
      questions: [
        { id: 1, type: "gap-fill", question: "The photography club holds workshops on photo _______.", answer: "editing" },
        { id: 2, type: "gap-fill", question: "The annual membership fee is _______ pounds.", answer: "10" }
      ]
    },
    writing: {
      task1: "The diagram below shows the process of making glass. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.",
      task2: "In many countries, the number of elderly people is increasing. What are the problems associated with this? What can be done to address these problems?"
    }
  },
  "c13-t1": {
    reading: {
      title: "The Importance of Soil Health",
      passage: `Soil health is essential for sustainable agriculture and the health of our planet. Healthy soil provides the nutrients and water that plants need to grow, and it also plays a crucial role in carbon sequestration and water purification. However, soil health is currently under threat from human activities, such as intensive farming, deforestation, and pollution.

Degraded soil can lead to reduced crop yields, increased erosion, and the loss of biodiversity. Conservation practices, such as no-till farming, cover cropping, and the use of organic fertilizers, are crucial to protect and restore soil health. Protecting soil health is essential for ensuring food security and mitigating the impacts of climate change.`,
      questions: [
        { id: 1, type: "true-false", question: "Healthy soil is important for carbon sequestration.", answer: "TRUE" },
        { id: 2, type: "true-false", question: "Intensive farming can threaten soil health.", answer: "TRUE" },
        { id: 3, type: "true-false", question: "No-till farming is a conservation practice.", answer: "TRUE" }
      ]
    },
    listening: {
      title: "Library Book Request",
      transcript: `Student: Hi, I'm looking for a book called 'The Great Gatsby'.
Librarian: Let me check our system. Yes, we have two copies, but they're both currently checked out.
Student: Oh, when are they due back?
Librarian: One is due back on Friday, and the other is due back next Monday.
Student: Can I place a hold on it?
Librarian: Yes, of course. I'll notify you as soon as it's available.`,
      questions: [
        { id: 1, type: "gap-fill", question: "The library has _______ copies of 'The Great Gatsby'.", answer: "two" },
        { id: 2, type: "gap-fill", question: "The librarian will _______ the student when the book is available.", answer: "notify" }
      ]
    },
    writing: {
      task1: "The chart below shows the percentage of people who used different types of public transport in a city in 2010 and 2020. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.",
      task2: "Some people believe that the best way to reduce traffic congestion is to improve public transport. Others, however, believe that there are better ways to solve this problem. Discuss both views and give your opinion."
    }
  },
  "c12-t1": {
    reading: {
      title: "The History of the Telescope",
      passage: `The invention of the telescope in the early 17th century revolutionized our understanding of the universe. The first telescope was developed by Hans Lippershey in 1068, but it was Galileo Galilei who first used it for astronomical observations. Galileo's discoveries, such as the moons of Jupiter and the phases of Venus, provided strong evidence for the heliocentric model of the solar system.

Over the centuries, telescope design has evolved significantly, from the early refracting telescopes to the large reflecting telescopes used today. Modern telescopes, such as the Hubble Space Telescope, allow us to see deep into space and observe distant galaxies and nebulae. The telescope continues to be an essential tool for astronomers as they seek to unlock the mysteries of the cosmos.`,
      questions: [
        { id: 1, type: "true-false", question: "Hans Lippershey developed the first telescope.", answer: "TRUE" },
        { id: 2, type: "true-false", question: "Galileo used the telescope to observe the moons of Jupiter.", answer: "TRUE" },
        { id: 3, type: "true-false", question: "Modern telescopes are only used on Earth.", answer: "FALSE" }
      ]
    },
    listening: {
      title: "Gym Membership Inquiry",
      transcript: `Receptionist: Good morning, Peak Fitness. How can I help you?
Student: Hi, I'm interested in joining the gym. What are your opening hours?
Receptionist: We're open from 6:00 AM to 10:00 PM on weekdays, and from 8:00 AM to 8:00 PM on weekends.
Student: That's great. Do you have any student discounts?
Receptionist: Yes, students get a 20% discount on the monthly membership fee.
Student: Excellent. And do you have personal trainers available?
Receptionist: Yes, we have several personal trainers who can help you with your fitness goals.`,
      questions: [
        { id: 1, type: "gap-fill", question: "The gym is open until _______ PM on weekdays.", answer: "10" },
        { id: 2, type: "gap-fill", question: "Students receive a _______ percent discount on membership.", answer: "20" }
      ]
    },
    writing: {
      task1: "The diagram below shows the process of making paper from wood. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.",
      task2: "In many countries, more and more people are choosing to work from home. What are the advantages and disadvantages of this trend?"
    }
  },
  "c11-t1": {
    reading: {
      title: "The Importance of Early Childhood Education",
      passage: `Early childhood education is essential for the healthy development of children. It provides a foundation for learning and helps children to develop social, emotional, and cognitive skills. Research has shown that children who attend high-quality early childhood programs are more likely to succeed in school and in life.

Early childhood education can also help to reduce the achievement gap between children from different socioeconomic backgrounds. It provides children with a safe and stimulating environment where they can learn and grow. Investing in early childhood education is one of the best ways to ensure that all children have the opportunity to reach their full potential.`,
      questions: [
        { id: 1, type: "true-false", question: "Early childhood education is important for cognitive development.", answer: "TRUE" },
        { id: 2, type: "true-false", question: "Early childhood education can help reduce the achievement gap.", answer: "TRUE" },
        { id: 3, type: "true-false", question: "Early childhood education has no long-term benefits.", answer: "FALSE" }
      ]
    },
    listening: {
      title: "University Health Center Inquiry",
      transcript: `Nurse: Hello, how can I help you today?
Student: Hi, I'd like to book an appointment with a doctor.
Nurse: We have an opening at 2:00 PM today, or we have several slots available tomorrow morning.
Student: 2:00 PM today works for me. What information do I need to provide?
Nurse: You'll need to provide your student ID number and your contact details.
Student: Okay, I have my ID card here. And do I need to pay for the appointment?
Nurse: No, basic health services are free for all registered students.`,
      questions: [
        { id: 1, type: "gap-fill", question: "The student has booked an appointment for _______ PM today.", answer: "2" },
        { id: 2, type: "gap-fill", question: "Basic health services are _______ for registered students.", answer: "free" }
      ]
    },
    writing: {
      task1: "The chart below shows the percentage of people who used different types of energy in a country in 2000 and 2020. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.",
      task2: "Some people believe that the best way to improve public health is to increase the number of sports facilities. Others, however, believe that there are better ways to solve this problem. Discuss both views and give your opinion."
    }
  },
  "c18-t1": {
    reading: {
      title: "The Importance of Biodiversity",
      passage: `Biodiversity refers to the variety of life on Earth, including the millions of species of plants, animals, and microorganisms. It is essential for the health of our planet and provides numerous benefits to humans, such as food, medicine, and ecosystem services like pollination and water purification.

However, biodiversity is currently under threat from human activities, including habitat destruction, pollution, and climate change. The loss of species can have far-reaching consequences, disrupting ecosystems and reducing their resilience to environmental changes. Conservation efforts are crucial to protect endangered species and preserve the natural world for future generations.`,
      questions: [
        { id: 1, type: "true-false", question: "Biodiversity includes only plants and animals.", answer: "FALSE" },
        { id: 2, type: "true-false", question: "Pollination is an example of an ecosystem service.", answer: "TRUE" },
        { id: 3, type: "true-false", question: "Climate change is a threat to biodiversity.", answer: "TRUE" }
      ]
    },
    listening: {
      title: "University Course Inquiry",
      transcript: `Advisor: Hello, how can I assist you today?
Student: I'm interested in the Master's program in Environmental Science.
Advisor: That's a great program. It's a one-year full-time course, or you can do it part-time over two years.
Student: I'd prefer full-time. What are the entry requirements?
Advisor: You'll need a bachelor's degree in a related field with a minimum GPA of 3.5.
Student: I have a degree in Biology. Does that count?
Advisor: Yes, Biology is a perfect background for this course.`,
      questions: [
        { id: 1, type: "gap-fill", question: "The Master's program can be completed in _______ year if studied full-time.", answer: "one" },
        { id: 2, type: "gap-fill", question: "The minimum GPA required for entry is _______.", answer: "3.5" }
      ]
    },
    writing: {
      task1: "The table below shows the number of visitors to a museum in three different years. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.",
      task2: "Some people think that it is important to use leisure time for activities that improve the mind, such as reading and learning a new skill. Others feel that leisure time should be used to relax the mind. Discuss both views and give your opinion."
    }
  },
  "c18-t2": {
    reading: {
      title: "The Psychology of Decision Making",
      passage: `Decision making is a complex cognitive process that involves selecting a course of action from multiple alternatives. Research has shown that humans are not always rational in their choices, often being influenced by cognitive biases and emotions. For example, the 'anchoring bias' occurs when individuals rely too heavily on the first piece of information they receive when making a decision.

In addition to individual factors, social influences also play a role in decision making. People often conform to the opinions of others, especially in group settings. This can lead to 'groupthink', where the desire for harmony and consensus overrides critical thinking. Understanding the psychological factors that influence decision making can help individuals make better choices in their personal and professional lives.`,
      questions: [
        { id: 1, type: "true-false", question: "Humans are always rational in their choices.", answer: "FALSE" },
        { id: 2, type: "true-false", question: "Anchoring bias involves relying on the first piece of information.", answer: "TRUE" },
        { id: 3, type: "true-false", question: "Groupthink can occur in social settings.", answer: "TRUE" }
      ]
    },
    listening: {
      title: "Job Interview Preparation",
      transcript: `Coach: Good morning! Are you ready for your mock interview?
Student: Yes, I've been practicing my answers to common questions.
Coach: That's good. Remember to dress professionally and arrive on time.
Student: I have a suit ready. And I've researched the company's background.
Coach: Excellent. During the interview, focus on your strengths and provide specific examples of your achievements.
Student: I'll do that. And I'll make sure to ask some questions at the end.`,
      questions: [
        { id: 1, type: "gap-fill", question: "The student has researched the company's _______.", answer: "background" },
        { id: 2, type: "gap-fill", question: "The coach advises the student to provide _______ examples of achievements.", answer: "specific" }
      ]
    },
    writing: {
      task1: "The chart below shows the percentage of households with different types of appliances in a country between 2000 and 2020. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.",
      task2: "In some countries, young people are encouraged to work or travel for a year between finishing high school and starting university studies. Discuss the advantages and disadvantages for young people who decide to do this."
    }
  },
  "c17-t1": {
    reading: {
      title: "The History of the Printing Press",
      passage: `The invention of the printing press by Johannes Gutenberg in the 15th century was a pivotal moment in human history. Before the printing press, books were copied by hand, which was a slow and expensive process. The printing press allowed for the mass production of books, making information much more accessible to the general public.

The impact of the printing press was far-reaching. It played a crucial role in the spread of ideas and the development of the Renaissance and the Reformation. It also contributed to the standardization of languages and the rise of literacy. Today, the printing press has been largely replaced by digital printing and the internet, but its legacy continues to shape the way we communicate and share information.`,
      questions: [
        { id: 1, type: "true-false", question: "Johannes Gutenberg invented the printing press in the 15th century.", answer: "TRUE" },
        { id: 2, type: "true-false", question: "Before the printing press, books were copied by hand.", answer: "TRUE" },
        { id: 3, type: "true-false", question: "The printing press had no impact on literacy.", answer: "FALSE" }
      ]
    },
    listening: {
      title: "Museum Tour Information",
      transcript: `Guide: Welcome to the National Museum of Art! Our tour will begin in 10 minutes.
Visitor: Hi, I'd like to know if there's an audio guide available.
Guide: Yes, we have audio guides in several languages, including English, French, and Spanish.
Visitor: That's great. How much does it cost?
Guide: The audio guide is included in the price of your admission ticket.
Visitor: Excellent. And where can I find the temporary exhibition?
Guide: The temporary exhibition is on the second floor, in Gallery 4.`,
      questions: [
        { id: 1, type: "gap-fill", question: "Audio guides are available in _______ languages.", answer: "several" },
        { id: 2, type: "gap-fill", question: "The temporary exhibition is located on the _______ floor.", answer: "second" }
      ]
    },
    writing: {
      task1: "The diagram below shows the life cycle of a honeybee. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.",
      task2: "Some people believe that it is best to accept a bad situation, such as an unsatisfactory job or shortage of money. Others argue that it is better to try and improve such situations. Discuss both views and give your opinion."
    }
  },
  "c16-t1": {
    reading: {
      title: "The Benefits of Regular Exercise",
      passage: `Regular exercise is essential for maintaining good physical and mental health. It can help to reduce the risk of chronic diseases such as heart disease, diabetes, and obesity. In addition to physical benefits, exercise can also improve mental health by reducing stress and anxiety and improving mood.

There are many different types of exercise, including aerobic exercise, strength training, and flexibility exercises. It is recommended that adults engage in at least 150 minutes of moderate-intensity aerobic activity per week. Finding an activity that you enjoy can help to make exercise a regular part of your routine.`,
      questions: [
        { id: 1, type: "true-false", question: "Exercise can help reduce the risk of heart disease.", answer: "TRUE" },
        { id: 2, type: "true-false", question: "Adults should do at least 150 minutes of exercise per week.", answer: "TRUE" },
        { id: 3, type: "true-false", question: "Exercise has no impact on mental health.", answer: "FALSE" }
      ]
    },
    listening: {
      title: "Sports Club Inquiry",
      transcript: `Receptionist: Good morning, City Sports Club. How can I help you?
Student: Hi, I'm interested in joining the swimming club.
Receptionist: That's great. We have sessions for all levels, from beginners to advanced.
Student: I'm a beginner. When are the sessions for beginners?
Receptionist: Beginner sessions are on Tuesdays and Thursdays at 6:00 PM.
Student: And how much is the monthly membership?
Receptionist: The monthly membership for students is £25.`,
      questions: [
        { id: 1, type: "gap-fill", question: "Beginner swimming sessions are held on Tuesdays and _______.", answer: "Thursdays" },
        { id: 2, type: "gap-fill", question: "The student membership fee is _______ pounds per month.", answer: "25" }
      ]
    },
    writing: {
      task1: "The chart below shows the number of hours spent on different activities by people in a country in 2015. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.",
      task2: "In many countries, the tradition of having family meals is disappearing. Why is this happening? What are the effects on the family and society?"
    }
  },
  "c15-t1": {
    reading: {
      title: "The Rise of E-commerce",
      passage: `E-commerce, or electronic commerce, has revolutionized the way we shop. It allows consumers to purchase goods and services online, providing convenience and a wider range of choices. The growth of e-commerce has been driven by the increasing availability of the internet and the development of secure online payment systems.

However, e-commerce also faces challenges, such as concerns about security and privacy. In addition, the growth of online shopping has had an impact on traditional brick-and-mortar stores, with many facing increased competition. Despite these challenges, e-commerce is expected to continue to grow in the future, as more and more people choose to shop online.`,
      questions: [
        { id: 1, type: "true-false", question: "E-commerce allows consumers to shop online.", answer: "TRUE" },
        { id: 2, type: "true-false", question: "Security is a concern for e-commerce.", answer: "TRUE" },
        { id: 3, type: "true-false", question: "Traditional stores have not been affected by e-commerce.", answer: "FALSE" }
      ]
    },
    listening: {
      title: "Volunteer Program Information",
      transcript: `Coordinator: Hello, thank you for your interest in our volunteer program.
Student: Hi, I'd like to know more about the opportunities available.
Coordinator: We have several projects, including working in a local school and helping at a community garden.
Student: I'm interested in working with children. What does that involve?
Coordinator: You'll be helping students with their reading and homework after school.
Student: That sounds great. How many hours a week do I need to commit?
Coordinator: We ask for a minimum of 4 hours per week.`,
      questions: [
        { id: 1, type: "gap-fill", question: "Volunteers can help students with their _______ and homework.", answer: "reading" },
        { id: 2, type: "gap-fill", question: "The minimum commitment is _______ hours per week.", answer: "4" }
      ]
    },
    writing: {
      task1: "The diagram below shows the process of making cheese. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.",
      task2: "Some people think that the best way to improve road safety is to increase the minimum legal age for driving a car or motorbike. To what extent do you agree or disagree?"
    }
  }
};
