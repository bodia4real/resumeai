"""
AI Prompts and Few-Shot Examples

Store all prompt templates and example pairs for AI generation.
Update these to improve AI output quality.
"""


# Few-shot examples for resume tailoring
RESUME_TAILORING_EXAMPLES = """
EXAMPLE 1:
Original Resume Snippet:
"Developed web applications using modern JavaScript frameworks. Built responsive user interfaces and integrated with RESTful APIs."

Job Description Snippet:
"Seeking a React Developer with experience in TypeScript, Redux, and modern frontend tooling."

Tailored Version:
"Architected and developed scalable web applications using React and TypeScript, implementing state management with Redux. Built responsive, accessible user interfaces following best practices and integrated seamlessly with RESTful APIs using Axios and React Query."

---

EXAMPLE 2:
Original Resume Snippet:
"Managed team projects and coordinated with stakeholders. Delivered projects on time and within budget."

Job Description Snippet:
"Looking for an Agile Project Manager with Scrum certification. Must have experience leading cross-functional teams and using Jira."

Tailored Version:
"Led cross-functional Agile teams as Scrum Master, facilitating daily standups, sprint planning, and retrospectives. Coordinated with stakeholders to define requirements and managed project workflows in Jira. Consistently delivered projects on time and within budget, maintaining 95% on-time delivery rate."

---

EXAMPLE 3:
Original Resume Snippet:
"Analyzed data and created reports for business decisions. Worked with databases and visualization tools."

Job Description Snippet:
"Data Analyst position requiring SQL expertise, Python (pandas, numpy), and experience with Tableau or Power BI. Must translate complex data into actionable insights."

Tailored Version:
"Performed comprehensive data analysis using SQL and Python (pandas, numpy, matplotlib) to extract insights from large datasets. Created interactive dashboards in Tableau to visualize key metrics, enabling data-driven business decisions. Translated complex analytical findings into clear, actionable recommendations for executive stakeholders, resulting in 20% improvement in operational efficiency."
"""


def get_resume_tailoring_prompt():
    """
    Get the complete prompt for resume tailoring with examples.
    
    Returns:
        str: Full prompt with examples
    """
    return f"""Here are examples of how to effectively tailor resume content:

{RESUME_TAILORING_EXAMPLES}

Now, apply these same principles to tailor the user's resume."""


# Cover letter examples (can be expanded)
COVER_LETTER_EXAMPLES = """
Cover letters should:
- Open with enthusiasm and mention how you found the role
- Highlight 2-3 most relevant experiences that match the job
- Show understanding of the company/role
- Close with a call to action
- Be 3-4 paragraphs maximum
- Avoid generic phrases like "I am writing to apply..."
"""


def get_cover_letter_prompt():
    """
    Get the prompt for cover letter generation.
    
    Returns:
        str: Cover letter generation guidelines
    """
    return COVER_LETTER_EXAMPLES


# Interview preparation prompts (for future use)
INTERVIEW_PREP_PROMPT = """
Generate interview preparation materials including:
1. Common questions for this role
2. STAR method answer examples based on candidate's experience
3. Questions to ask the interviewer
4. Key talking points to emphasize
"""


def get_interview_prep_prompt():
    """
    Get the prompt for interview preparation.
    
    Returns:
        str: Interview prep prompt
    """
    return INTERVIEW_PREP_PROMPT
