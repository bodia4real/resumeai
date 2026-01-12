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
    system_prompt = """You are an expert interview coach. Generate a focused interview prep packet that ALWAYS includes:
1) Exactly 10 questions total, clearly tagged as [Technical] or [Behavioral] (aim ~6/4 split)
2) For each question: a concise sample answer (2-4 bullet points) grounded in the candidate's resume
3) Questions the candidate should ask the interviewer (3-5 bullets)
4) Key talking points and achievements to emphasize (bullets)
5) Company context: infer company/role themes from the job description only (no external browsing)

Rules:
- Keep it concise and scannable with headers and bullets.
- Do not hallucinate experience beyond the resume content.
- If resume is sparse, give best-effort but note assumptions.
- If company name is visible in the job description, incorporate it in context and answers."""

    user_message = f"""Generate the full interview prep packet for this position:

JOB DESCRIPTION:
{job_description}

CANDIDATE'S RESUME:
{resume_text}

Remember: exactly 10 questions with tags and sample answers, plus interviewer questions, talking points, and company context inferred from the JD."""

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


def match_score_streaming(resume_text, job_description):
    """
    Compute an AI-driven match score and skill mapping with streaming.
    Yields chunks of text as they're generated.
    
    Args:
        resume_text (str): Candidate resume content
        job_description (str): Job description
    
    Yields:
        str: Chunks of the match score report as generated
    """
    system_prompt = """You are an expert hiring evaluator. Compare a candidate's resume to the job description.
Return a clean, structured report with ONLY these 3 sections in order:

1) Match Score: XX% (single line at the top; 0-100, weight required skills higher)
2) Missing Skills: bullet list of gaps only (what they DON'T have)
3) Matching Skills: bullet list of matches only (what they DO have)

Rules:
- Be specific; no fluff or generic advice.
- Do not invent experience not present in the resume.
- Keep each bullet tight (one line max).
- NO other sections, headers, or explanations.
- Start with "Match Score: XX%"."""

    user_message = f"""Evaluate fit between this job and candidate. Output ONLY: Match Score %, Missing Skills bullets, Matching Skills bullets.

JOB DESCRIPTION:
{job_description}

CANDIDATE RESUME:
{resume_text}"""

    try:
        client = get_openai_client()
        stream = client.chat.completions.create(
            model="gpt-4.1-nano",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            temperature=0.3,
            stream=True
        )
        
        for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
                
    except Exception as e:
        raise Exception(f"OpenAI API error: {str(e)}")
