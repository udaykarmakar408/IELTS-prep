export const GRAMMAR_TIPS = [
  {
    title: "The 'Although' Structure",
    tip: "Avoid using 'but' after 'although'.",
    bad: "Although it was raining, but we went out.",
    good: "Although it was raining, we went out."
  },
  {
    title: "Subject-Verb Agreement",
    tip: "Collective nouns like 'government' or 'team' can be singular or plural, but be consistent.",
    bad: "The government has decided and they are happy.",
    good: "The government has decided and it is happy."
  },
  {
    title: "Countable vs Uncountable",
    tip: "'Information', 'Advice', and 'Research' are uncountable. Never use 'an' or pluralize them.",
    bad: "He gave me some good advices.",
    good: "He gave me some good advice."
  },
  {
    title: "Conditional Type 2",
    tip: "Use 'If I were' instead of 'If I was' for hypothetical situations in formal writing.",
    bad: "If I was you, I would study harder.",
    good: "If I were you, I would study harder."
  },
  {
    title: "Parallel Structure",
    tip: "Keep verbs in the same form when listing activities.",
    bad: "I like swimming, to hike, and running.",
    good: "I like swimming, hiking, and running."
  },
  {
    title: "Articles with Countries",
    tip: "Most countries don't need 'the', but those with 'Kingdom', 'States', or 'Republic' do.",
    bad: "I visited the France and United Kingdom.",
    good: "I visited France and the United Kingdom."
  },
  {
    title: "Fewer vs Less",
    tip: "Use 'fewer' for countable items and 'less' for uncountable quantities.",
    bad: "There are less students in the class today.",
    good: "There are fewer students in the class today."
  },
  {
    title: "Present Perfect vs Past Simple",
    tip: "Use Present Perfect for unfinished time and Past Simple for finished time.",
    bad: "I have seen him yesterday.",
    good: "I saw him yesterday."
  },
  {
    title: "Passive Voice in IELTS",
    tip: "Use passive voice to sound more objective in Writing Task 1 (Process/Diagram).",
    bad: "The workers heat the clay in a kiln.",
    good: "The clay is heated in a kiln."
  },
  {
    title: "Relative Clauses",
    tip: "Use 'who' for people and 'which' or 'that' for things. Avoid using 'what' as a relative pronoun.",
    bad: "The book what I read was interesting.",
    good: "The book that I read was interesting."
  }
];

export const WORDS_OF_THE_DAY = [
  {
    word: "MITIGATE",
    type: "verb",
    band: "7+",
    def: "To make something less severe, serious, or painful.",
    example: "The new laws are designed to mitigate the effects of climate change."
  },
  {
    word: "EXACERBATE",
    type: "verb",
    band: "7+",
    def: "To make a problem, bad situation, or negative feeling worse.",
    example: "The high humidity exacerbated the heat, making it unbearable."
  },
  {
    word: "PRAGMATIC",
    type: "adj",
    band: "7+",
    def: "Dealing with things sensibly and realistically in a way that is based on practical rather than theoretical considerations.",
    example: "We need a pragmatic approach to solving the housing crisis."
  },
  {
    word: "UBIQUITOUS",
    type: "adj",
    band: "8+",
    def: "Present, appearing, or found everywhere.",
    example: "Mobile phones are now ubiquitous in modern society."
  },
  {
    word: "ADVOCATE",
    type: "verb/noun",
    band: "6.5+",
    def: "To publicly recommend or support a particular cause or policy.",
    example: "Many environmentalists advocate for a reduction in plastic use."
  },
  {
    word: "ADVERSITY",
    type: "noun",
    band: "7.5+",
    def: "Difficulties; misfortune.",
    example: "She showed great resilience in the face of adversity."
  },
  {
    word: "BENEVOLENT",
    type: "adj",
    band: "8+",
    def: "Well meaning and kindly.",
    example: "The company has a benevolent policy towards its employees."
  },
  {
    word: "CONUNDRUM",
    type: "noun",
    band: "8+",
    def: "A confusing and difficult problem or question.",
    example: "The lack of affordable housing is a major conundrum for the city council."
  },
  {
    word: "DILIGENT",
    type: "adj",
    band: "6.5+",
    def: "Having or showing care and conscientiousness in one's work or duties.",
    example: "He is a diligent student who always completes his assignments on time."
  },
  {
    word: "ELOQUENT",
    type: "adj",
    band: "7.5+",
    def: "Fluent or persuasive in speaking or writing.",
    example: "The politician gave an eloquent speech about the importance of education."
  }
];

export const STRUCTURE_TASKS = [
  {
    id: "sa-1",
    title: "Technology and Stress",
    type: "Structure Analysis",
    difficulty: "Medium",
    mins: 15,
    essay: `In the modern era, the rapid advancement of technology has fundamentally transformed how we live and work. While some argue that these developments have simplified our existence, others contend that they have introduced unprecedented levels of stress and complexity. This essay will argue that although technology offers significant benefits, its overall impact has indeed made life more demanding.

One primary reason for increased stress is the constant connectivity enabled by smartphones and the internet. In the past, the boundaries between professional and personal life were clearly defined. However, today, employees are often expected to respond to emails and messages outside of traditional working hours. This "always-on" culture prevents individuals from fully disconnecting and relaxing, leading to burnout and chronic anxiety.

Furthermore, the sheer volume of information available online can be overwhelming. The phenomenon of "information overload" means that people are constantly bombarded with news, social media updates, and advertisements. Trying to process this vast amount of data can lead to decision fatigue and a sense of inadequacy as individuals compare their lives to the curated versions of others seen online.

In conclusion, while technology has undoubtedly brought convenience, it has also created a more complicated and stressful environment. The blurring of work-life boundaries and the burden of information overload are significant drawbacks. Therefore, it is essential for individuals to set boundaries and practice digital detoxification to maintain their mental well-being.`,
    elements: [
      { id: "intro", label: "Introduction", description: "The first paragraph that introduces the topic and states the thesis." },
      { id: "thesis", label: "Thesis Statement", description: "The sentence that clearly states the main argument of the essay." },
      { id: "topic1", label: "Topic Sentence (Body 1)", description: "The first sentence of the first body paragraph that introduces the main point." },
      { id: "topic2", label: "Topic Sentence (Body 2)", description: "The first sentence of the second body paragraph that introduces the main point." },
      { id: "conclusion", label: "Conclusion", description: "The final paragraph that summarizes the main points and restates the thesis." }
    ]
  },
  {
    id: "sa-2",
    title: "Education and Employment",
    type: "Structure Analysis",
    difficulty: "Hard",
    mins: 15,
    essay: `The role of universities in society is a subject of ongoing debate. While some believe that higher education institutions should primarily focus on preparing students for the workforce, others argue that their true purpose is to provide access to knowledge for its own sake. This essay will discuss both perspectives and argue that a balanced approach is most beneficial for both individuals and society.

Proponents of vocational education argue that the primary goal of a university should be to equip graduates with practical skills. In today's competitive job market, employers seek candidates who can contribute immediately to their organizations. Therefore, courses that are tailored to specific industries, such as engineering or medicine, provide a clear path to employment and ensure that the economy has a skilled workforce.

On the other hand, many scholars believe that universities should be centers of intellectual exploration. They argue that focusing solely on job skills narrows the scope of education and discourages critical thinking. By studying subjects like philosophy or history, students develop a broader understanding of the world and learn how to analyze complex ideas, which are invaluable skills in any profession.

In conclusion, both the vocational and the intellectual functions of a university are essential. While it is important for graduates to be employable, it is equally vital for them to be well-rounded individuals capable of independent thought. A university curriculum that combines practical training with academic rigor is the best way to achieve this balance.`,
    elements: [
      { id: "intro", label: "Introduction", description: "The first paragraph that introduces the topic and states the thesis." },
      { id: "thesis", label: "Thesis Statement", description: "The sentence that clearly states the main argument of the essay." },
      { id: "topic1", label: "Topic Sentence (Body 1)", description: "The first sentence of the first body paragraph that introduces the main point." },
      { id: "topic2", label: "Topic Sentence (Body 2)", description: "The first sentence of the second body paragraph that introduces the main point." },
      { id: "conclusion", label: "Conclusion", description: "The final paragraph that summarizes the main points and restates the thesis." }
    ]
  }
];

export const WRITING_TASKS = [
  {
    id: "t1-1",
    type: "Task 1",
    title: "Academic Writing: Consumer Durables",
    difficulty: "Medium",
    mins: 20,
    prompt: "The chart below shows the percentage of households in a particular country that owned various consumer durables between 1972 and 1983. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.",
    chartType: "line",
    chartData: [
      { year: '1972', 'Washing Machine': 65, 'Refrigerator': 70, 'TV': 90, 'Vacuum Cleaner': 85 },
      { year: '1975', 'Washing Machine': 70, 'Refrigerator': 80, 'TV': 95, 'Vacuum Cleaner': 88 },
      { year: '1978', 'Washing Machine': 75, 'Refrigerator': 90, 'TV': 98, 'Vacuum Cleaner': 92 },
      { year: '1981', 'Washing Machine': 80, 'Refrigerator': 95, 'TV': 99, 'Vacuum Cleaner': 95 },
      { year: '1983', 'Washing Machine': 82, 'Refrigerator': 98, 'TV': 100, 'Vacuum Cleaner': 98 },
    ],
    wordCount: 150
  },
  {
    id: "t2-1",
    type: "Task 2",
    title: "Academic Writing: Essay on Technology",
    difficulty: "Hard",
    mins: 40,
    prompt: "Some people believe that the rapid development of technology has made our lives more complicated and stressful. To what extent do you agree or disagree with this statement? Give reasons for your answer and include any relevant examples from your own knowledge or experience.",
    wordCount: 250
  },
  {
    id: "t1-2",
    type: "Task 1",
    title: "Academic Writing: Global Water Consumption",
    difficulty: "Medium",
    mins: 20,
    prompt: "The bar chart shows the amount of water used for different purposes in six areas of the world. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.",
    chartType: "bar",
    chartData: [
      { area: 'Africa', Industrial: 7, Agricultural: 84, Domestic: 9 },
      { area: 'Central Asia', Industrial: 5, Agricultural: 88, Domestic: 7 },
      { area: 'South East Asia', Industrial: 12, Agricultural: 81, Domestic: 7 },
      { area: 'Europe', Industrial: 53, Agricultural: 32, Domestic: 15 },
      { area: 'North America', Industrial: 48, Agricultural: 39, Domestic: 13 },
      { area: 'South America', Industrial: 10, Agricultural: 71, Domestic: 19 },
    ],
    wordCount: 150
  },
  {
    id: "t2-2",
    type: "Task 2",
    title: "Academic Writing: Education and Employment",
    difficulty: "Hard",
    mins: 40,
    prompt: "Some people think that universities should provide graduates with the knowledge and skills needed in the workplace. Others think that the true function of a university should be to give access to knowledge for its own sake, regardless of whether the course is useful to an employer. Discuss both these views and give your own opinion.",
    wordCount: 250
  },
  {
    id: "t1-3",
    type: "Task 1",
    title: "Academic Writing: Energy Production",
    difficulty: "Medium",
    mins: 20,
    prompt: "The pie charts show the sources of energy production in a particular country in 1995 and 2005. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.",
    chartType: "pie",
    chartData: [
      { name: 'Coal', value: 29.8 },
      { name: 'Gas', value: 29.6 },
      { name: 'Petro', value: 29.2 },
      { name: 'Nuclear', value: 6.4 },
      { name: 'Other', value: 5.0 },
    ],
    wordCount: 150
  },
  {
    id: "t2-3",
    type: "Task 2",
    title: "Academic Writing: Environmental Protection",
    difficulty: "Hard",
    mins: 40,
    prompt: "The best way to solve environmental problems is to increase the price of fuel. To what extent do you agree or disagree?",
    wordCount: 250
  },
  {
    id: "t1-4",
    type: "Task 1",
    title: "Academic Writing: Population Growth",
    difficulty: "Medium",
    mins: 20,
    prompt: "The line graph shows the population of three different countries from 1950 to 2050 (projected).",
    chartType: "line",
    chartData: [
      { year: '1950', CountryA: 50, CountryB: 30, CountryC: 10 },
      { year: '1975', CountryA: 70, CountryB: 45, CountryC: 25 },
      { year: '2000', CountryA: 90, CountryB: 65, CountryC: 50 },
      { year: '2025', CountryA: 110, CountryB: 80, CountryC: 80 },
      { year: '2050', CountryA: 130, CountryB: 90, CountryC: 120 },
    ],
    wordCount: 150
  },
  {
    id: "t2-4",
    type: "Task 2",
    title: "Academic Writing: Health and Lifestyle",
    difficulty: "Hard",
    mins: 40,
    prompt: "In many countries, people are moving away from traditional foods and towards fast food. This has a negative impact on families, individuals and society. To what extent do you agree or disagree?",
    wordCount: 250
  },
  {
    id: "t1-5",
    type: "Task 1",
    title: "Academic Writing: Leisure Activities",
    difficulty: "Medium",
    mins: 20,
    prompt: "The bar chart shows the percentage of boys and girls who participated in different sports in a UK school in 2010.",
    chartType: "bar",
    chartData: [
      { sport: 'Football', Boys: 80, Girls: 20 },
      { sport: 'Swimming', Boys: 45, Girls: 55 },
      { sport: 'Tennis', Boys: 30, Girls: 40 },
      { sport: 'Basketball', Boys: 60, Girls: 30 },
      { sport: 'Cycling', Boys: 50, Girls: 45 },
    ],
    wordCount: 150
  },
  {
    id: "t2-5",
    type: "Task 2",
    title: "Academic Writing: Work-Life Balance",
    difficulty: "Hard",
    mins: 40,
    prompt: "In some countries, a few people earn extremely high salaries. Some people think that this is good for a country, while others believe that the government should control salaries and limit the amount people can earn. Discuss both views and give your opinion.",
    wordCount: 250
  },
  {
    id: "t1-6",
    type: "Task 1",
    title: "Academic Writing: Internet Users",
    difficulty: "Medium",
    mins: 20,
    prompt: "The line graph shows the percentage of the population using the Internet in three countries from 1999 to 2009.",
    chartType: "line",
    chartData: [
      { year: '1999', USA: 40, Canada: 35, Mexico: 5 },
      { year: '2002', USA: 55, Canada: 50, Mexico: 12 },
      { year: '2005', USA: 75, Canada: 70, Mexico: 25 },
      { year: '2008', USA: 85, Canada: 82, Mexico: 35 },
      { year: '2009', USA: 88, Canada: 85, Mexico: 40 },
    ],
    wordCount: 150
  },
  {
    id: "t2-6",
    type: "Task 2",
    title: "Academic Writing: Travel and Culture",
    difficulty: "Hard",
    mins: 40,
    prompt: "Some people think that it is necessary to travel to other countries to learn about different cultures. Others say that we can learn about other cultures through books, films and the Internet. Discuss both views and give your opinion.",
    wordCount: 250
  },
  {
    id: "t1-7",
    type: "Task 1",
    title: "Academic Writing: Export Earnings",
    difficulty: "Medium",
    mins: 20,
    prompt: "The bar chart shows the export earnings of a country across five categories in 2015 and 2016.",
    chartType: "bar",
    chartData: [
      { category: 'Petroleum', '2015': 60, '2016': 63 },
      { category: 'Engineered Goods', '2015': 55, '2016': 58 },
      { category: 'Gems & Jewelry', '2015': 42, '2016': 40 },
      { category: 'Agricultural Products', '2015': 30, '2016': 32 },
      { category: 'Textiles', '2015': 25, '2016': 31 },
    ],
    wordCount: 150
  },
  {
    id: "t2-7",
    type: "Task 2",
    title: "Academic Writing: Crime and Punishment",
    difficulty: "Hard",
    mins: 40,
    prompt: "Some people believe that the best way to reduce crime is to give longer prison sentences. Others, however, believe there are better ways to help reduce crime. Discuss both views and give your opinion.",
    wordCount: 250
  },
  {
    id: "t1-8",
    type: "Task 1",
    title: "Academic Writing: Library Visitors",
    difficulty: "Medium",
    mins: 20,
    prompt: "The line graph shows the number of visitors to a local library over a period of 6 months.",
    chartType: "line",
    chartData: [
      { month: 'Jan', Visitors: 1200 },
      { month: 'Feb', Visitors: 1500 },
      { month: 'Mar', Visitors: 1100 },
      { month: 'Apr', Visitors: 1800 },
      { month: 'May', Visitors: 2100 },
      { month: 'Jun', Visitors: 1900 },
    ],
    wordCount: 150
  },
  {
    id: "t2-8",
    type: "Task 2",
    title: "Academic Writing: Urbanization",
    difficulty: "Hard",
    mins: 40,
    prompt: "In many cities, there is a shortage of housing and a lack of space for new buildings. Some people think that the government should build new towns in the countryside. To what extent do you agree or disagree?",
    wordCount: 250
  },
  {
    id: "t1-9",
    type: "Task 1",
    title: "Academic Writing: Student Enrollment",
    difficulty: "Medium",
    mins: 20,
    prompt: "The pie chart shows the distribution of international students in a university by continent of origin.",
    chartType: "pie",
    chartData: [
      { name: 'Asia', value: 45 },
      { name: 'Europe', value: 25 },
      { name: 'Africa', value: 15 },
      { name: 'Americas', value: 10 },
      { name: 'Oceania', value: 5 },
    ],
    wordCount: 150
  },
  {
    id: "t2-9",
    type: "Task 2",
    title: "Academic Writing: Social Media",
    difficulty: "Hard",
    mins: 40,
    prompt: "Social media has a significant impact on the way people communicate and build relationships. Is this a positive or negative development?",
    wordCount: 250
  },
  {
    id: "t1-10",
    type: "Task 1",
    title: "Academic Writing: Average Monthly Temperatures",
    difficulty: "Medium",
    mins: 20,
    prompt: "The line graph shows the average monthly temperatures in two cities, London and Dubai, over a year.",
    chartType: "line",
    chartData: [
      { month: 'Jan', London: 5, Dubai: 18 },
      { month: 'Mar', London: 8, Dubai: 23 },
      { month: 'May', London: 14, Dubai: 30 },
      { month: 'Jul', London: 19, Dubai: 35 },
      { month: 'Sep', London: 15, Dubai: 32 },
      { month: 'Nov', London: 9, Dubai: 24 },
    ],
    wordCount: 150
  },
  {
    id: "t2-10",
    type: "Task 2",
    title: "Academic Writing: Global Warming",
    difficulty: "Hard",
    mins: 40,
    prompt: "Global warming is one of the most serious issues the world is facing today. What are the causes of global warming and what measures can governments and individuals take to address it?",
    wordCount: 250
  },
  {
    id: "t1-11",
    type: "Task 1",
    title: "Academic Writing: Coffee Consumption",
    difficulty: "Medium",
    mins: 20,
    prompt: "The bar chart shows the average amount of coffee consumed per person in five different countries in 2020.",
    chartType: "bar",
    chartData: [
      { country: 'Finland', kg: 12 },
      { country: 'Norway', kg: 9.9 },
      { country: 'Iceland', kg: 9 },
      { country: 'Denmark', kg: 8.7 },
      { country: 'Netherlands', kg: 8.4 },
    ],
    wordCount: 150
  },
  {
    id: "t2-11",
    type: "Task 2",
    title: "Academic Writing: Remote Work",
    difficulty: "Hard",
    mins: 40,
    prompt: "More and more people are working from home. What are the advantages and disadvantages of this trend?",
    wordCount: 250
  },
  {
    id: "t1-12",
    type: "Task 1",
    title: "Academic Writing: Rail Travel Statistics",
    difficulty: "Medium",
    mins: 20,
    prompt: "The table below shows the number of rail passengers in four countries in 2014 and 2015.",
    chartType: "table",
    chartData: [
      { Country: 'UK', '2014 (Millions)': 1650, '2015 (Millions)': 1710 },
      { Country: 'France', '2014 (Millions)': 1200, '2015 (Millions)': 1250 },
      { Country: 'Germany', '2014 (Millions)': 2100, '2015 (Millions)': 2180 },
      { Country: 'Italy', '2014 (Millions)': 850, '2015 (Millions)': 890 },
    ],
    wordCount: 150
  },
  {
    id: "t1-13",
    type: "Task 1",
    title: "Academic Writing: Brick Manufacturing Process",
    difficulty: "Medium",
    mins: 20,
    prompt: "The diagram shows the process of brick manufacturing for the building industry.",
    chartType: "diagram",
    chartData: [
      { label: "1. Digging Clay" },
      { label: "2. Crushing & Mixing" },
      { label: "3. Shaping Bricks" },
      { label: "4. Drying in Kiln" },
      { label: "5. Cooling" },
      { label: "6. Packaging & Delivery" },
    ],
    wordCount: 150
  },
  {
    id: "t1-14",
    type: "Task 1",
    title: "Academic Writing: World Population Distribution",
    difficulty: "Medium",
    mins: 20,
    prompt: "The table shows the distribution of the world population by region in 1900 and 2000.",
    chartType: "table",
    chartData: [
      { Region: 'Asia', '1900 (%)': 57, '2000 (%)': 60 },
      { Region: 'Europe', '1900 (%)': 25, '2000 (%)': 12 },
      { Region: 'Africa', '1900 (%)': 8, '2000 (%)': 13 },
      { Region: 'Americas', '1900 (%)': 9, '2000 (%)': 14 },
      { Region: 'Oceania', '1900 (%)': 1, '2000 (%)': 1 },
    ],
    wordCount: 150
  },
  {
    id: "t1-15",
    type: "Task 1",
    title: "Academic Writing: Water Cycle",
    difficulty: "Medium",
    mins: 20,
    prompt: "The diagram shows the natural water cycle.",
    chartType: "diagram",
    chartData: [
      { label: "1. Evaporation" },
      { label: "2. Condensation" },
      { label: "3. Precipitation" },
      { label: "4. Collection" },
      { label: "5. Infiltration" },
    ],
    wordCount: 150
  },
  {
    id: "t1-16",
    type: "Task 1",
    title: "Academic Writing: Average House Prices",
    difficulty: "Medium",
    mins: 20,
    prompt: "The table shows the average house prices in five cities in 2010 and 2015.",
    chartType: "table",
    chartData: [
      { City: 'London', '2010 ($)': 450000, '2015 ($)': 580000 },
      { City: 'New York', '2010 ($)': 520000, '2015 ($)': 610000 },
      { City: 'Tokyo', '2010 ($)': 480000, '2015 ($)': 490000 },
      { City: 'Sydney', '2010 ($)': 410000, '2015 ($)': 550000 },
      { City: 'Paris', '2010 ($)': 390000, '2015 ($)': 420000 },
    ],
    wordCount: 150
  },
  {
    id: "t1-17",
    type: "Task 1",
    title: "Academic Writing: Recycling Process",
    difficulty: "Medium",
    mins: 20,
    prompt: "The diagram shows the process of recycling glass bottles.",
    chartType: "diagram",
    chartData: [
      { label: "1. Collection" },
      { label: "2. Sorting" },
      { label: "3. Cleaning" },
      { label: "4. Crushing" },
      { label: "5. Melting" },
      { label: "6. Molding" },
    ],
    wordCount: 150
  },
  {
    id: "t1-18",
    type: "Task 1",
    title: "Academic Writing: Mobile Phone Sales",
    difficulty: "Medium",
    mins: 20,
    prompt: "The table shows the number of mobile phones sold by four major brands in 2018 and 2019.",
    chartType: "table",
    chartData: [
      { Brand: 'Samsung', '2018 (M)': 290, '2019 (M)': 300 },
      { Brand: 'Apple', '2018 (M)': 210, '2019 (M)': 195 },
      { Brand: 'Huawei', '2018 (M)': 200, '2019 (M)': 240 },
      { Brand: 'Xiaomi', '2018 (M)': 120, '2019 (M)': 125 },
    ],
    wordCount: 150
  },
  {
    id: "t1-19",
    type: "Task 1",
    title: "Academic Writing: Paper Production",
    difficulty: "Medium",
    mins: 20,
    prompt: "The diagram shows how paper is produced from wood.",
    chartType: "diagram",
    chartData: [
      { label: "1. Logging" },
      { label: "2. Debarking" },
      { label: "3. Chipping" },
      { label: "4. Pulping" },
      { label: "5. Bleaching" },
      { label: "6. Pressing" },
      { label: "7. Rolling" },
    ],
    wordCount: 150
  },
  {
    id: "t1-20",
    type: "Task 1",
    title: "Academic Writing: Global Literacy Rates",
    difficulty: "Medium",
    mins: 20,
    prompt: "The table shows the literacy rates in different regions of the world in 2000 and 2015.",
    chartType: "table",
    chartData: [
      { Region: 'World', '2000 (%)': 81, '2015 (%)': 86 },
      { Region: 'Sub-Saharan Africa', '2000 (%)': 57, '2015 (%)': 64 },
      { Region: 'South Asia', '2000 (%)': 59, '2015 (%)': 70 },
      { Region: 'Latin America', '2000 (%)': 90, '2015 (%)': 93 },
      { Region: 'East Asia', '2000 (%)': 92, '2015 (%)': 96 },
    ],
    wordCount: 150
  },
  {
    id: "t1-21",
    type: "Task 1",
    title: "Academic Writing: Solar Power Installation",
    difficulty: "Medium",
    mins: 20,
    prompt: "The diagram shows the steps involved in installing solar panels on a house roof.",
    chartType: "diagram",
    chartData: [
      { label: "1. Site Assessment" },
      { label: "2. Mounting Brackets" },
      { label: "3. Installing Panels" },
      { label: "4. Wiring" },
      { label: "5. Connecting to Inverter" },
      { label: "6. Grid Connection" },
    ],
    wordCount: 150
  }
];
