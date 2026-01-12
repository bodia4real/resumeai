"""
OpenAI API Service

Handles all communication with OpenAI API.
Provides reusable functions for AI generation tasks.
"""
import os
from openai import OpenAI
from django.conf import settings
from decouple import config


def get_openai_client():
    """Get or create OpenAI client with API key from environment"""
    return OpenAI(api_key=config('OPENAI_API_KEY'))


def call_openai(system_prompt, user_message, model="gpt-4.1-nano", temperature=0.7):
    """
    Make a call to OpenAI Chat Completions API.
    
    Args:
        system_prompt (str): Instructions for the AI's behavior
        user_message (str): The actual user request/content
        model (str): OpenAI model to use (default: gpt-4.1-nano)
        temperature (float): Creativity level 0.0-1.0 (default: 0.7)
    
    Returns:
        dict: {
            'content': str - The AI's response text,
            'tokens_used': int - Total tokens consumed,
            'model': str - Model used
        }
    """
    try:
        client = get_openai_client()
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            temperature=temperature
        )
        
        return {
            'content': response.choices[0].message.content,
            'tokens_used': response.usage.total_tokens,
            'model': model
        }
    except Exception as e:
        raise Exception(f"OpenAI API error: {str(e)}")


def analyze_skills_streaming(job_description, resume_text=None):
    """
    Analyze skills from job description with AI streaming.
    Optionally compare against candidate's resume.
    Yields chunks of text as they're generated.
    
    Args:
        job_description (str): Target job description
        resume_text (str): Optional candidate's resume for gap analysis
    
    Yields:
        str: Chunks of skills analysis as they're generated
    """
    system_prompt = """You are an expert skills analyst and career coach. Analyze job descriptions to identify:
1. **Required Skills** (must-have, deal-breakers)
2. **Nice-to-Have Skills** (preferred, bonus skills)
3. **Technical Skills** (programming languages, tools, frameworks)
4. **Soft Skills** (communication, leadership, teamwork)
5. **Experience Level** (junior, mid, senior indicators)

If a resume is provided, also include:
- **Skills Gap Analysis**: What skills the candidate is missing
- **Matching Skills**: What skills the candidate already has
- **Recommendations**: Specific areas to highlight or improve

Format your response clearly with headers and bullet points. Be specific and actionable."""

    if resume_text:
        user_message = f"""Analyze the skills required for this job and compare against the candidate's resume:

JOB DESCRIPTION:
{job_description}

CANDIDATE'S RESUME:
{resume_text}

Provide a comprehensive skills analysis including required vs nice-to-have skills, and a gap analysis showing what the candidate has vs what's missing."""
    else:
        user_message = f"""Analyze the skills required for this job:

JOB DESCRIPTION:
{job_description}

Provide a comprehensive breakdown of required vs nice-to-have skills, technical vs soft skills, and the experience level expected."""

    try:
        client = get_openai_client()
        stream = client.chat.completions.create(
            model="gpt-4.1-nano",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            temperature=0.5,
            stream=True
        )
        
        for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
                
    except Exception as e:
        raise Exception(f"OpenAI API error: {str(e)}")


def tailor_resume_streaming(resume_text, job_description, examples_prompt):
    """
    Tailor a resume to match a specific job description with streaming.
    Yields chunks of text as they're generated.
    
    Args:
        resume_text (str): Original resume content
        job_description (str): Target job description
        examples_prompt (str): Few-shot examples for the AI
    
    Yields:
        str: Chunks of the tailored resume as they're generated
    """
    system_prompt = f"""You are an expert resume writer and career coach. Your task is to tailor resumes to specific job descriptions.

{examples_prompt}

Guidelines:
- Keep the same overall structure and length
- Emphasize relevant experience and skills from the original resume
- Use keywords from the job description naturally
- Maintain truthfulness - don't add experience that isn't there
- Make it ATS-friendly (Applicant Tracking System)
- Use strong action verbs
- Quantify achievements when possible"""

    user_message = f"""Please tailor this resume for the following job:

JOB DESCRIPTION:
{job_description}

ORIGINAL RESUME:
{resume_text}

Return the tailored resume in a clean, professional format."""

    try:
        client = get_openai_client()
        stream = client.chat.completions.create(
            model="gpt-4.1-nano",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            temperature=0.7,
            stream=True
        )
        
        for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
                
    except Exception as e:
        raise Exception(f"OpenAI API error: {str(e)}")


def generate_cover_letter(resume_text, job_description):
    """
    Generate a cover letter using AI with streaming.
    Yields chunks of text as they're generated.
    
    Args:
        resume_text (str): User's resume content
        job_description (str): Target job description (should include company name)
    
    Yields:
        str: Chunks of the cover letter as they're generated
    """
    system_prompt = """You are an expert cover letter writer. Create compelling, personalized cover letters that:
- Are concise (3-4 paragraphs)
- Show enthusiasm for the role
- Highlight relevant experience from the resume
- Explain why the candidate is a great fit
- Are professional but personable
- Avoid clichés and generic statements
- Extract the company name from the job description if provided"""

    user_message = f"""Write a cover letter for this job application:

JOB DESCRIPTION:
{job_description}

CANDIDATE'S RESUME:
{resume_text}

Write a compelling cover letter that makes this candidate stand out. If you can identify the company name from the job description, address it appropriately."""

    try:
        client = get_openai_client()
        stream = client.chat.completions.create(
            model="gpt-4.1-nano",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            temperature=0.8,
            stream=True
        )
        
        for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
                
    except Exception as e:
        raise Exception(f"OpenAI API error: {str(e)}")


def generate_interview_prep(resume_text, job_description):
    """
    Generate interview preparation materials with streaming.
    Yields chunks of text as they're generated.
    
    Args:
        resume_text (str): User's resume content
        job_description (str): Target job description (should include company info)
    
    Yields:
        str: Chunks of interview prep content as they're generated
    """
    system_prompt = """You are an expert interview coach. Generate comprehensive interview preparation materials that include:
1. Common questions for this role (8-10 questions)
2. STAR method answer examples based on the candidate's experience
3. Questions the candidate should ask the interviewer
4. Key talking points and achievements to emphasize
5. Company-specific insights if the job description includes company information

Be specific, actionable, and tailored to the candidate's experience. Extract any company name or details from the job description."""

    user_message = f"""Generate comprehensive interview preparation materials for this position:

JOB DESCRIPTION:
{job_description}

CANDIDATE'S RESUME:
{resume_text}

Create detailed interview prep that will help this candidate succeed in interviews for this role. If you can identify the company from the job description, include company-specific insights."""

    try:
        client = get_openai_client()
        stream = client.chat.completions.create(
            model="gpt-4.1-nano",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            temperature=0.7,
            stream=True
        )
        
        for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
                
    except Exception as e:
        raise Exception(f"OpenAI API error: {str(e)}")
