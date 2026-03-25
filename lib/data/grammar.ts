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
        heading: "Inversion with Negative Adverbials",
        content: "A high-level structure for Band 8+.\n\n'Not only did the policy fail, but it also exacerbated the situation.'\n'Rarely have we seen such a significant change in such a short period.'"
      },
      {
        heading: "Cleft Sentences",
        content: "Using 'IT' or 'WHAT' for emphasis.\n\n'It is the government that bears the primary responsibility.'\n'What is needed is a more comprehensive approach to the problem.'"
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
  }
];
