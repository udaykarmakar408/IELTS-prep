export interface GrammarSection {
  heading: string;
  content: string;
}

export interface GrammarTopic {
  title: string;
  sections: GrammarSection[];
}

export const GRAMMAR_DATA: GrammarTopic[] = [
  {
    title: "Complex Sentences — Band 7+ Structures",
    sections: [
      {
        heading: "Subordinating Conjunctions",
        content: "These connect a dependent clause to a main clause, adding sophistication to your writing.\n\nCONCESSION:\n• Although the economy grew, income inequality widened.\n• Even though technology has advanced, many problems persist.\n\nCAUSE & REASON:\n• Because fossil fuels are finite, alternatives must be developed.\n• Since governments control education policy, they bear responsibility."
      },
      {
        heading: "Relative Clauses",
        content: "DEFINING (no commas):\n'The policy that was introduced in 2015 has been effective.'\n\nNON-DEFINING (with commas):\n'The government, which has faced mounting pressure, finally reversed the policy.'\n\nRELATIVE PRONOUNS:\n• Who (people)\n• Which (things)\n• That (people/things)\n• Whose (possession)\n• Where (places)"
      },
      {
        heading: "Conditional Sentences",
        content: "FIRST CONDITIONAL (Real possibilities):\n'If the government invests in education, the economy will improve.'\n\nSECOND CONDITIONAL (Hypothetical/Unlikely):\n'If everyone used public transport, pollution would decrease significantly.'\n\nTHIRD CONDITIONAL (Past regrets/hypotheticals):\n'If the policy had been implemented earlier, the crisis could have been avoided.'"
      }
    ]
  },
  {
    title: "Advanced Academic Structures",
    sections: [
      {
        heading: "Nominalization",
        content: "Nominalization is the process of turning verbs or adjectives into nouns. It is a hallmark of academic writing (IELTS Writing Task 2) as it makes the tone more objective and formal.\n\n**Example:**\n*   *Verbal:* The government **decided** to **increase** taxes, which **angered** the public.\n*   *Nominalized:* The government's **decision** to implement a tax **increase** resulted in public **anger**.\n\n**Why use it?**\nIt allows you to pack more information into a single sentence and focuses on the action/concept rather than the person doing it.",
      },
      {
        heading: "Hedges and Boosters",
        content: "In academic writing, it is important to show the degree of certainty. This is called 'hedging' (being cautious) or 'boosting' (being certain).\n\n**Hedges (Cautious):**\n*   *It is possible that...*\n*   *This suggests that...*\n*   *It could be argued that...*\n*   *Evidence tends to show...*\n\n**Boosters (Certain):**\n*   *It is clear that...*\n*   *There is no doubt that...*\n*   *Undoubtedly...*\n*   *This proves that...*",
      },
      {
        heading: "Complex Punctuation (Semicolons & Colons)",
        content: "Using advanced punctuation correctly can boost your 'Grammatical Range and Accuracy' score.\n\n**Semicolons (;):**\nUsed to connect two closely related independent clauses.\n*   *Example:* The city has seen a rise in population; consequently, housing prices have soared.\n\n**Colons (:):**\nUsed to introduce a list, an explanation, or a quote.\n*   *Example:* There are three main causes of pollution: industrial waste, vehicle emissions, and deforestation.",
      },
    ],
  },
  {
    title: "Cohesion & Coherence",
    sections: [
      {
        heading: "Advanced Linking Devices",
        content: "Move beyond 'Firstly', 'Secondly', and 'In conclusion'. Use more sophisticated connectors.\n\n**Contrast:**\n*   *Be that as it may...*\n*   *Notwithstanding the fact that...*\n*   *Conversely...*\n\n**Addition:**\n*   *Furthermore...*\n*   *Moreover...*\n*   *In addition to the aforementioned...*\n\n**Result:**\n*   *Accordingly...*\n*   *Hence...*\n*   *Thus...*",
      },
    ],
  },
  {
    title: "Advanced Tenses & Aspect",
    sections: [
      {
        heading: "Present Perfect vs Past Simple",
        content: "Use PRESENT PERFECT for ongoing trends or actions with present relevance: 'Urbanization has accelerated over the past decade.'\n\nUse PAST SIMPLE for finished actions at a specific time: 'The population grew by 10% in 2010.'"
      },
      {
        heading: "Future Forms in Academic Writing",
        content: "Use 'WILL' for predictions: 'The population will likely reach 10 billion by 2100.'\n\nUse 'BE GOING TO' for intentions: 'The government is going to introduce new laws.'\n\nUse 'FUTURE PERFECT' for actions finished by a certain time: 'By 2050, many coastal cities will have been flooded.'"
      },
      {
        heading: "Passive Voice in Processes",
        content: "The passive is essential for Writing Task 1 process diagrams where the person doing the action is unknown or unimportant.\n\nSTRUCTURE: [Object] + [to be] + [Past Participle]\n\nEXAMPLES:\n• The tea leaves are picked by hand.\n• The mixture is heated to 100 degrees.\n• The finished product is then packaged."
      }
    ]
  },
  {
    title: "Cohesion & Coherence",
    sections: [
      {
        heading: "Linking Words & Phrases",
        content: "ADDITION:\n• Furthermore, ...\n• Moreover, ...\n• In addition, ...\n\nCONTRAST:\n• However, ...\n• On the other hand, ...\n• Conversely, ...\n\nRESULT:\n• Consequently, ...\n• Therefore, ...\n• As a result, ..."
      },
      {
        heading: "Referencing",
        content: "Using pronouns to avoid repetition.\n\n'The government introduced a new policy. IT was designed to reduce poverty.'\n\n'Many people believe that technology is harmful. THIS view is shared by many experts.'"
      }
    ]
  },
  {
    title: "Modality & Hedging",
    sections: [
      {
        heading: "Modal Verbs for Possibility",
        content: "Use 'MAY', 'MIGHT', and 'COULD' to show caution (hedging).\n\n'This policy may lead to an increase in unemployment.'\n'The results could be interpreted in several ways.'"
      },
      {
        heading: "Adverbs of Frequency & Probability",
        content: "Use 'LIKELY', 'PROBABLY', and 'OFTEN' to avoid overgeneralization.\n\n'It is likely that the trend will continue.'\n'Technology often improves efficiency.'"
      }
    ]
  },
  {
    title: "Noun Phrases & Nominalization",
    sections: [
      {
        heading: "Nominalization",
        content: "Turning verbs into nouns to make writing more academic.\n\nVERB: 'The population grew rapidly.'\nNOUN: 'The rapid growth of the population led to several issues.'\n\nVERB: 'The government failed to act.'\nNOUN: 'The government's failure to act was criticized.'"
      },
      {
        heading: "Complex Noun Phrases",
        content: "Adding detail to nouns.\n\n'The increasing demand for renewable energy sources is a global trend.'\n'The impact of social media on the mental health of young people is a major concern.'"
      }
    ]
  },
  {
    title: "Inversion & Emphasis",
    sections: [
      {
        heading: "Negative Adverbials",
        content: "Starting a sentence with a negative adverbial (never, rarely, seldom) requires inverting the subject and auxiliary verb.\n\n'Never have I seen such a significant change in such a short period.'\n'Seldom do we encounter such complex problems in daily life.'\n'Rarely has the government acted so decisively to address the crisis.'"
      },
      {
        heading: "Inversion with 'Only' & 'Not Only'",
        content: "Inversion after 'only after', 'only when', and 'not only... but also'.\n\n'Only after the research was complete did they realize the error.'\n'Not only did he pass the exam, but he also received a scholarship.'\n'Not only is education important, but it is also a fundamental right.'"
      },
      {
        heading: "Inversion with 'So' and 'Such'",
        content: "Used for emphasis in formal writing.\n\n'So significant was the change that it affected everyone.'\n'Such was the impact of the policy that poverty rates dropped by 20%.'\n'So complex is the issue that no single solution exists.'"
      },
      {
        heading: "Cleft Sentences",
        content: "Using 'IT' or 'WHAT' for emphasis.\n\n'It is the government that bears the primary responsibility.'\n'What is needed is a more comprehensive approach to the problem.'\n'It was the introduction of the internet that revolutionized communication.'"
      }
    ]
  },
  {
    title: "Causative Structures",
    sections: [
      {
        heading: "Have/Get Something Done",
        content: "Used when someone else performs an action for us.\n\n'The government had the new bridge built in record time.'\n'Many people get their taxes done by professionals.'\n'The company is having its headquarters renovated.'"
      },
      {
        heading: "Make/Let/Help",
        content: "Structures for influence and permission.\n\n'The law makes people pay more attention to the environment.'\n'The policy lets citizens participate in the decision-making process.'\n'Technology helps students access a wealth of information.'"
      }
    ]
  },
  {
    title: "Advanced Comparison",
    sections: [
      {
        heading: "Double Comparatives",
        content: "Used to show cause and effect.\n\n'The more people use public transport, the less pollution there will be.'\n'The higher the level of education, the better the job prospects.'\n'The more complex the task, the more focus it requires.'"
      },
      {
        heading: "Modified Comparatives",
        content: "Using adverbs to qualify comparisons.\n\n'The new policy is significantly more effective than the old one.'\n'The cost of living is marginally higher in the city.'\n'The results were considerably better than expected.'"
      }
    ]
  },
  {
    title: "Articles & Quantifiers",
    sections: [
      {
        heading: "Definite vs Indefinite Articles",
        content: "DEFINITE (the):\n• Use for specific things: 'The environment is at risk.'\n• Use for things already mentioned: 'The policy was effective.'\n\nINDEFINITE (a/an):\n• Use for non-specific singular countable nouns: 'A significant increase was observed.'"
      },
      {
        heading: "Quantifiers with Countable & Uncountable Nouns",
        content: "COUNTABLE:\n• Many, few, a few, several.\n\nUNCOUNTABLE:\n• Much, little, a little, a great deal of.\n\nBOTH:\n• Some, any, a lot of, plenty of."
      }
    ]
  },
  {
    title: "Punctuation for Clarity",
    sections: [
      {
        heading: "Commas in Complex Sentences",
        content: "Use commas after introductory phrases and to separate clauses.\n\n'In conclusion, the policy was a success.'\n'Although the results were positive, further research is needed.'"
      },
      {
        heading: "Semicolons & Colons",
        content: "SEMICOLONS: To connect two closely related independent clauses.\n'The economy is growing; however, unemployment remains high.'\n\nCOLONS: To introduce a list or an explanation.\n'There are three main causes: poverty, lack of education, and unemployment.'"
      }
    ]
  },
  {
    title: "Advanced Sentence Structures",
    sections: [
      {
        heading: "Participle Clauses",
        content: "A concise way to provide extra information.\n\nPRESENT PARTICIPLE (-ing) for active meanings:\n'Having finished the research, the scientists published their findings.'\n'Working from home, many people find it difficult to separate work and life.'\n\nPAST PARTICIPLE (-ed) for passive meanings:\n'Built in the 19th century, the bridge is now a historical monument.'\n'Faced with rising costs, the company decided to cut its workforce.'"
      },
      {
        heading: "The Subjunctive Mood",
        content: "Used for suggestions, requirements, or hypothetical situations. Highly academic.\n\n'It is essential that the government take action immediately.' (Note: 'take' not 'takes')\n'I suggest that he be informed of the decision.'\n'If I were you, I would invest in renewable energy.'"
      },
      {
        heading: "Parallel Structure",
        content: "Ensuring that parts of a sentence are grammatically consistent.\n\nINCORRECT: 'The study involved collecting data, analyzing results, and to write a report.'\nCORRECT: 'The study involved collecting data, analyzing results, and writing a report.'\n\nParallelism makes your writing clearer and more professional."
      }
    ]
  },
  {
    title: "Common IELTS Grammar Pitfalls",
    sections: [
      {
        heading: "Subject-Verb Agreement with Complex Subjects",
        content: "The verb must agree with the true subject, not the nearest noun.\n\n'The number of people who smoke IS increasing.' (Subject is 'The number')\n'A range of factors HAS contributed to the crisis.' (Subject is 'A range')\n'The impact of these policies ON THE POOR IS significant.'"
      },
      {
        heading: "Countable vs Uncountable Nouns",
        content: "Common mistakes in IELTS:\n• Advice (uncountable) - 'He gave me some advice.' (NOT 'an advice')\n• Information (uncountable) - 'The information IS useful.' (NOT 'are')\n• Research (uncountable) - 'Much research HAS been done.'\n• Knowledge (uncountable) - 'His knowledge OF the subject IS vast.'"
      }
    ]
  },
  {
    title: "Academic Style & Tone",
    sections: [
      {
        heading: "Avoiding Contractions & Informal Language",
        content: "In IELTS Writing, you must use formal language. Avoid contractions like 'don't', 'can't', or 'won't'.\n\nINFORMAL: 'The government shouldn't ignore the problem.'\nFORMAL: 'The government should not ignore the problem.'\n\nAlso, avoid informal words like 'kids', 'stuff', or 'things'. Use 'children', 'materials', or 'issues' instead."
      },
      {
        heading: "Objective Language & Impersonal Structures",
        content: "Academic writing is objective. Avoid using 'I' or 'you' too often. Use impersonal structures instead.\n\nPERSONAL: 'I think that the government should act.'\nIMPERSONAL: 'It is widely argued that the government should act.'\nIMPERSONAL: 'There is a growing consensus that action is needed.'"
      }
    ]
  },
  {
    title: "Cohesive Devices for Different Essay Types",
    sections: [
      {
        heading: "Opinion (Agree/Disagree) Essays",
        content: "INTRODUCING YOUR OPINION:\n• In my view, ...\n• From my perspective, ...\n• I firmly believe that ...\n\nPRESENTING THE OPPOSING VIEW:\n• Critics argue that ...\n• Opponents of this view suggest that ...\n• It is often claimed that ..."
      },
      {
        heading: "Discussion (Both Views) Essays",
        content: "INTRODUCING THE FIRST VIEW:\n• On the one hand, some people argue that ...\n• Proponents of this idea suggest that ...\n\nINTRODUCING THE SECOND VIEW:\n• On the other hand, others believe that ...\n• Conversely, there are those who argue that ..."
      },
      {
        heading: "Problem & Solution Essays",
        content: "INTRODUCING CAUSES:\n• One of the primary causes of this issue is ...\n• This problem can be attributed to ...\n\nINTRODUCING SOLUTIONS:\n• To address this problem, ...\n• One potential solution would be to ...\n• It is essential that measures are taken to ..."
      }
    ]
  },
  {
    title: "Prepositional Phrases & Collocations",
    sections: [
      {
        heading: "Prepositions of Time & Place",
        content: "AT (Specific times/places):\n• At 5 PM, at the station, at the weekend.\n\nIN (Months/years/large areas):\n• In 2020, in December, in the city, in the world.\n\nON (Days/dates/surfaces):\n• On Monday, on July 1st, on the table, on the internet."
      },
      {
        heading: "Dependent Prepositions",
        content: "Many verbs and adjectives are followed by specific prepositions.\n\nVERBS:\n• Depend ON, contribute TO, focus ON, result IN.\n\nADJECTIVES:\n• Responsible FOR, interested IN, aware OF, similar TO."
      }
    ]
  },
  {
    title: "Advanced Punctuation for Band 8+",
    sections: [
      {
        heading: "The Em Dash (—)",
        content: "Use for emphasis or to add extra information in a dramatic way.\n\n'The solution is simple—education.'\n'Many people—especially the younger generation—are concerned about the environment.'"
      },
      {
        heading: "Parentheses ( )",
        content: "Use to add non-essential information or citations.\n\n'The population grew by 10% (from 1 million to 1.1 million) in just one year.'\n'According to Smith (2020), the trend is likely to continue.'"
      }
    ]
  },
  {
    title: "Subject-Verb Agreement with Collective Nouns",
    sections: [
      {
        heading: "Collective Nouns (Singular vs Plural)",
        content: "In British English, collective nouns can be singular or plural depending on the context.\n\nSINGULAR (as a unit):\n'The government IS planning to introduce new laws.'\n\nPLURAL (as individuals):\n'The team ARE arguing among themselves.'\n\nCommon collective nouns: Government, team, family, committee, audience."
      }
    ]
  },
  {
    title: "Conditional Sentences (Advanced)",
    sections: [
      {
        heading: "Mixed Conditionals",
        content: "Used when the time in the 'if' clause is different from the time in the 'result' clause.\n\nPAST IF -> PRESENT RESULT:\n'If I had worked harder at school (past), I would have a better job now (present).'\n\nPRESENT STATE IF -> PAST ACTION RESULT:\n'If she weren't so lazy (present state), she would have finished the project yesterday (past action).'"
      },
      {
        heading: "Alternatives to 'If'",
        content: "Using 'provided that', 'as long as', 'unless', and 'supposing' to add variety to your writing.\n\n'Provided that you practice daily, you will achieve a Band 7.'\n'Unless the government intervenes, the situation will worsen.'"
      }
    ]
  },
  {
    title: "Inversion for Emphasis",
    sections: [
      {
        heading: "Negative Adverbials",
        content: "Starting a sentence with a negative adverbial (never, rarely, seldom) requires inverting the subject and auxiliary verb.\n\n'Never have I seen such a beautiful sunset.'\n'Seldom do we encounter such complex problems in daily life.'"
      },
      {
        heading: "Only & Not Only",
        content: "Inversion after 'only after', 'only when', and 'not only... but also'.\n\n'Only after the research was complete did they realize the error.'\n'Not only did he pass the exam, but he also received a scholarship.'"
      }
    ]
  },
  {
    title: "Advanced Relative Clauses",
    sections: [
      {
        heading: "Prepositions + Which/Whom",
        content: "A formal structure common in academic writing.\n\n'The theory ON WHICH the research is based was developed in 2010.'\n'The people WITH WHOM I worked were highly professional.'\n'The situation IN WHICH we find ourselves is unprecedented.'"
      },
      {
        heading: "Quantifiers + Of Which/Whom",
        content: "Used to provide extra information about a group.\n\n'The study involved 100 participants, MANY OF WHOM were students.'\n'The company has several branches, SOME OF WHICH are located abroad.'\n'The report highlights several issues, NONE OF WHICH have been addressed.'"
      }
    ]
  },
  {
    title: "Substitution & Ellipsis",
    sections: [
      {
        heading: "Substitution (So, Do, One)",
        content: "Using words to replace entire phrases to avoid repetition.\n\n'Many people believe that technology is harmful. If SO, we must act.'\n'The government should invest in education. If they DO, the economy will grow.'\n'The first policy was effective, but the second ONE was not.'"
      },
      {
        heading: "Ellipsis (Omitting Words)",
        content: "Leaving out words that are understood from the context.\n\n'The first group was given a placebo, and the second [group was given] the actual drug.'\n'He wanted to go to the university, but he couldn't [go to the university].'\n'Some people prefer working in an office, others [prefer working] from home.'"
      }
    ]
  },
  {
    title: "Fronting for Emphasis",
    sections: [
      {
        heading: "Adverbial Fronting",
        content: "Moving an adverbial phrase to the beginning of the sentence for emphasis.\n\n'IN THE MIDDLE OF THE CRISIS, the government decided to act.'\n'THROUGHOUT HISTORY, technology has been a driving force for change.'\n'BEYOND THE IMMEDIATE IMPACT, there are long-term consequences to consider.'"
      },
      {
        heading: "Complement Fronting",
        content: "Moving the complement to the front (often with inversion).\n\n'SO SIGNIFICANT WAS THE CHANGE that it affected everyone.'\n'HIDDEN IN THE DATA were several interesting trends.'\n'GREAT WAS THE DISAPPOINTMENT when the results were announced.'"
      }
    ]
  },
  {
    title: "The Subjunctive Mood",
    sections: [
      {
        heading: "Formal Recommendations & Requirements",
        content: "Using the base form of the verb after certain verbs and adjectives.\n\n'It is essential that he BE informed of the decision.'\n'The board recommended that the policy BE reviewed.'\n'It is vital that every student HAVE access to the resources.'\n'The examiner suggested that the candidate BE more concise.'"
      }
    ]
  },
  {
    title: "Reduced Relative Clauses",
    sections: [
      {
        heading: "Reducing Active Clauses",
        content: "You can reduce a relative clause by removing the relative pronoun and the verb 'to be', and using the -ing form of the main verb.\n\nFULL: 'The student who is studying in the library is my friend.'\nREDUCED: 'The student studying in the library is my friend.'\n\nFULL: 'People who live in cities often face high costs.'\nREDUCED: 'People living in cities often face high costs.'"
      },
      {
        heading: "Reducing Passive Clauses",
        content: "Remove the relative pronoun and the verb 'to be', leaving only the past participle.\n\nFULL: 'The report that was published last year is still relevant.'\nREDUCED: 'The report published last year is still relevant.'\n\nFULL: 'The bridge, which was built in 1920, needs repair.'\nREDUCED: 'The bridge, built in 1920, needs repair.'"
      }
    ]
  },
  {
    title: "Advanced Inversion (Had, Should, Were)",
    sections: [
      {
        heading: "Inversion in Conditionals",
        content: "In formal writing, you can replace 'if' with inversion for a more sophisticated tone.\n\nFIRST CONDITIONAL (Should):\n'Should you require further assistance, please contact us.'\n(Instead of 'If you should require...')\n\nSECOND CONDITIONAL (Were):\n'Were the government to act now, the crisis could be averted.'\n(Instead of 'If the government acted...')\n\nTHIRD CONDITIONAL (Had):\n'Had they known about the risks, they would have acted differently.'\n(Instead of 'If they had known...')"
      }
    ]
  }
];
