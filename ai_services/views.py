from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.http import StreamingHttpResponse
from documents.models import Document
from .models import AIGeneration
from .serializers import AIGenerationSerializer
from .services.resume_parser import extract_text_from_document
from .services.openai_service import (
    tailor_resume_streaming,
    generate_cover_letter,
    generate_interview_prep,
    match_score_streaming,
)
from .services.prompts import get_resume_tailoring_prompt, get_interview_prep_prompt
import tempfile
import os
import json


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def tailor_resume_direct_view(request):
    """
    Tailor a resume using direct file upload + job description.
    Streams the response in real-time as AI generates it.
    
    POST /api/ai/tailor-resume/
    Headers: Authorization: Bearer TOKEN
    Body: form-data
        file: resume.pdf (required)
        job_description: "..." (required)
        application_id: 10 (optional)
    
    Returns: Streaming response with tailored resume
    """
    # 1. Validate file upload
    if 'file' not in request.FILES:
        return Response(
            {'error': 'file is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    uploaded_file = request.FILES['file']
    
    # Validate file extension
    allowed_extensions = ['.pdf', '.docx', '.doc', '.txt']
    file_ext = os.path.splitext(uploaded_file.name)[1].lower()
    if file_ext not in allowed_extensions:
        return Response(
            {'error': f'Unsupported file type. Allowed: {", ".join(allowed_extensions)}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # 2. Get job description
    job_description = request.data.get('job_description', '').strip()
    application_id = request.data.get('application_id')
    
    if not job_description:
        return Response(
            {'error': 'job_description is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if len(job_description) < 50:
        return Response(
            {'error': 'Job description is too short (minimum 50 characters)'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # 3. Extract text from uploaded file
    temp_file = None
    try:
        # Create temporary file with proper extension
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=file_ext)
        for chunk in uploaded_file.chunks():
            temp_file.write(chunk)
        temp_file.close()
        
        # Extract text from temporary file
        resume_text = extract_text_from_document(temp_file.name)
        if not resume_text or len(resume_text.strip()) < 50:
            return Response(
                {'error': 'Could not extract sufficient text from document'},
                status=status.HTTP_400_BAD_REQUEST
            )
    except Exception as e:
        return Response(
            {'error': f'Error reading document: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    finally:
        # Clean up temporary file
        if temp_file and os.path.exists(temp_file.name):
            os.unlink(temp_file.name)
    
    # 4. Stream the AI response
    def generate_stream():
        """Generator function that yields AI-generated chunks"""
        full_response = []
        
        try:
            examples_prompt = get_resume_tailoring_prompt()
            
            for chunk in tailor_resume_streaming(resume_text, job_description, examples_prompt):
                full_response.append(chunk)
                # Send chunk to client
                yield chunk
            
            # After streaming completes, save to database in background
            final_text = ''.join(full_response)
            try:
                AIGeneration.objects.create(
                    user=request.user,
                    application_id=application_id,
                    generation_type='tailored_resume',
                    input_resume=resume_text[:5000],
                    job_description=job_description[:5000],
                    output_text=final_text,
                    model_used='gpt-4.1-nano',
                    tokens_used=None  # Can't track with streaming
                )
            except:
                pass  # Don't fail the response if saving fails
                
        except Exception as e:
            yield f"\n\n[ERROR: {str(e)}]"
    
    # Return streaming response
    response = StreamingHttpResponse(
        generate_stream(),
        content_type='text/plain; charset=utf-8'
    )
    response['Cache-Control'] = 'no-cache'
    response['X-Accel-Buffering'] = 'no'
    
    return response


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_cover_letter_view(request):
    """
    Generate a cover letter using direct file upload + job description.
    Streams the response in real-time as AI generates it.
    
    POST /api/ai/generate-cover-letter/
    Headers: Authorization: Bearer TOKEN
    Body: form-data
        file: resume.pdf (required)
        job_description: "..." (required)
        application_id: 10 (optional)
    
    Returns: Streaming response with cover letter
    """
    # 1. Validate file upload
    if 'file' not in request.FILES:
        return Response(
            {'error': 'file is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    uploaded_file = request.FILES['file']
    
    # Validate file extension
    allowed_extensions = ['.pdf', '.docx', '.doc', '.txt']
    file_ext = os.path.splitext(uploaded_file.name)[1].lower()
    if file_ext not in allowed_extensions:
        return Response(
            {'error': f'Unsupported file type. Allowed: {", ".join(allowed_extensions)}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # 2. Get job description
    job_description = request.data.get('job_description', '').strip()
    application_id = request.data.get('application_id')
    
    if not job_description:
        return Response(
            {'error': 'job_description is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if len(job_description) < 50:
        return Response(
            {'error': 'Job description is too short (minimum 50 characters)'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # 3. Extract text from uploaded file
    temp_file = None
    try:
        # Create temporary file with proper extension
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=file_ext)
        for chunk in uploaded_file.chunks():
            temp_file.write(chunk)
        temp_file.close()
        
        # Extract text from temporary file
        resume_text = extract_text_from_document(temp_file.name)
        if not resume_text or len(resume_text.strip()) < 50:
            return Response(
                {'error': 'Could not extract sufficient text from document'},
                status=status.HTTP_400_BAD_REQUEST
            )
    except Exception as e:
        return Response(
            {'error': f'Error reading document: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    finally:
        # Clean up temporary file
        if temp_file and os.path.exists(temp_file.name):
            os.unlink(temp_file.name)
    
    # 4. Stream the AI response
    def generate_stream():
        """Generator function that yields AI-generated chunks"""
        full_response = []
        
        try:
            for chunk in generate_cover_letter(resume_text, job_description):
                full_response.append(chunk)
                # Send chunk to client
                yield chunk
            
            # After streaming completes, save to database in background
            final_text = ''.join(full_response)
            try:
                AIGeneration.objects.create(
                    user=request.user,
                    application_id=application_id,
                    generation_type='cover_letter',
                    input_resume=resume_text[:5000],
                    job_description=job_description[:5000],
                    output_text=final_text,
                    model_used='gpt-4.1-nano',
                    tokens_used=None  # Can't track with streaming
                )
            except:
                pass  # Don't fail the response if saving fails
                
        except Exception as e:
            yield f"\n\n[ERROR: {str(e)}]"
    
    # Return streaming response
    response = StreamingHttpResponse(
        generate_stream(),
        content_type='text/plain; charset=utf-8'
    )
    response['Cache-Control'] = 'no-cache'
    response['X-Accel-Buffering'] = 'no'
    
    return response


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_interview_prep_view(request):
    """
    Generate interview preparation materials using direct file upload.
    Streams the response in real-time as AI generates it.
    
    POST /api/ai/generate-interview-prep/
    Headers: Authorization: Bearer TOKEN
    Body: form-data
        file: resume.pdf (required)
        job_description: "..." (required)
        application_id: 10 (optional)
    
    Returns: Streaming response with interview prep materials
    """
    # 1. Validate file upload
    if 'file' not in request.FILES:
        return Response(
            {'error': 'file is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    uploaded_file = request.FILES['file']
    
    # Validate file extension
    allowed_extensions = ['.pdf', '.docx', '.doc', '.txt']
    file_ext = os.path.splitext(uploaded_file.name)[1].lower()
    if file_ext not in allowed_extensions:
        return Response(
            {'error': f'Unsupported file type. Allowed: {", ".join(allowed_extensions)}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # 2. Get job description
    job_description = request.data.get('job_description', '').strip()
    application_id = request.data.get('application_id')
    
    if not job_description:
        return Response(
            {'error': 'job_description is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if len(job_description) < 50:
        return Response(
            {'error': 'Job description is too short (minimum 50 characters)'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # 3. Extract text from uploaded file
    temp_file = None
    try:
        # Create temporary file with proper extension
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=file_ext)
        for chunk in uploaded_file.chunks():
            temp_file.write(chunk)
        temp_file.close()
        
        # Extract text from temporary file
        resume_text = extract_text_from_document(temp_file.name)
        if not resume_text or len(resume_text.strip()) < 50:
            return Response(
                {'error': 'Could not extract sufficient text from document'},
                status=status.HTTP_400_BAD_REQUEST
            )
    except Exception as e:
        return Response(
            {'error': f'Error reading document: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    finally:
        # Clean up temporary file
        if temp_file and os.path.exists(temp_file.name):
            os.unlink(temp_file.name)
    
    # 4. Stream the AI response
    def generate_stream():
        """Generator function that yields AI-generated chunks"""
        full_response = []
        
        try:
            for chunk in generate_interview_prep(resume_text, job_description):
                full_response.append(chunk)
                # Send chunk to client
                yield chunk
            
            # After streaming completes, save to database in background
            final_text = ''.join(full_response)
            try:
                AIGeneration.objects.create(
                    user=request.user,
                    application_id=application_id,
                    generation_type='interview_prep',
                    input_resume=resume_text[:5000],
                    job_description=job_description[:5000],
                    output_text=final_text,
                    model_used='gpt-4.1-nano',
                    tokens_used=None  # Can't track with streaming
                )
            except:
                pass  # Don't fail the response if saving fails
                
        except Exception as e:
            yield f"\n\n[ERROR: {str(e)}]"
    
    # Return streaming response
    response = StreamingHttpResponse(
        generate_stream(),
        content_type='text/plain; charset=utf-8'
    )
    response['Cache-Control'] = 'no-cache'
    response['X-Accel-Buffering'] = 'no'
    
    return response


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def match_score_view(request):
    """
    Compute match score (0-100%) and skill mapping between resume and job description.
    Streams the response in real-time as AI generates it.
    
    POST /api/ai/match-score/
    Headers: Authorization: Bearer TOKEN
    Body: form-data
        file: resume.pdf (required)
        job_description: "..." (required)
        application_id: 10 (optional)
    
    Returns: Streaming response with score, matched/missing skills
    """
    # 1. Validate file upload
    if 'file' not in request.FILES:
        return Response(
            {'error': 'file is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    uploaded_file = request.FILES['file']

    # Validate file extension
    allowed_extensions = ['.pdf', '.docx', '.doc', '.txt']
    file_ext = os.path.splitext(uploaded_file.name)[1].lower()
    if file_ext not in allowed_extensions:
        return Response(
            {'error': f'Unsupported file type. Allowed: {", ".join(allowed_extensions)}'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # 2. Get job description
    job_description = request.data.get('job_description', '').strip()
    application_id = request.data.get('application_id')

    if not job_description:
        return Response(
            {'error': 'job_description is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if len(job_description) < 50:
        return Response(
            {'error': 'Job description is too short (minimum 50 characters)'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # 3. Extract text from uploaded file
    temp_file = None
    try:
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=file_ext)
        for chunk in uploaded_file.chunks():
            temp_file.write(chunk)
        temp_file.close()

        resume_text = extract_text_from_document(temp_file.name)
        if not resume_text or len(resume_text.strip()) < 50:
            return Response(
                {'error': 'Could not extract sufficient text from document'},
                status=status.HTTP_400_BAD_REQUEST
            )
    except Exception as e:
        return Response(
            {'error': f'Error reading document: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    finally:
        if temp_file and os.path.exists(temp_file.name):
            os.unlink(temp_file.name)

    # 4. Stream the AI response
    def generate_stream():
        full_response = []

        try:
            for chunk in match_score_streaming(resume_text, job_description):
                full_response.append(chunk)
                yield chunk

            final_text = ''.join(full_response)
            try:
                AIGeneration.objects.create(
                    user=request.user,
                    application_id=application_id,
                    generation_type='match_score',
                    input_resume=resume_text[:5000],
                    job_description=job_description[:5000],
                    output_text=final_text,
                    model_used='gpt-4.1-nano',
                    tokens_used=None
                )
            except:
                pass

        except Exception as e:
            yield f"\n\n[ERROR: {str(e)}]"

    response = StreamingHttpResponse(
        generate_stream(),
        content_type='text/plain; charset=utf-8'
    )
    response['Cache-Control'] = 'no-cache'
    response['X-Accel-Buffering'] = 'no'

    return response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_generations_view(request):
    """
    List all AI generations for the authenticated user.
    
    GET /api/ai/generations/?type=tailored_resume
    
    Query params:
    - type: Filter by generation_type (optional)
    - application_id: Filter by application (optional)
    """
    generations = AIGeneration.objects.filter(user=request.user)
    
    # Filter by type if provided
    generation_type = request.query_params.get('type')
    if generation_type:
        generations = generations.filter(generation_type=generation_type)
    
    # Filter by application if provided
    application_id = request.query_params.get('application_id')
    if application_id:
        generations = generations.filter(application_id=application_id)
    
    serializer = AIGenerationSerializer(generations, many=True)
    return Response(serializer.data)


@api_view(['GET', 'DELETE'])
@permission_classes([IsAuthenticated])
def generation_detail_view(request, pk):
    """
    Get or delete a specific AI generation.
    
    GET /api/ai/generations/{id}/
    DELETE /api/ai/generations/{id}/
    """
    try:
        generation = AIGeneration.objects.get(id=pk, user=request.user)
    except AIGeneration.DoesNotExist:
        return Response(
            {'error': 'Generation not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == 'GET':
        serializer = AIGenerationSerializer(generation)
        return Response(serializer.data)
    
    elif request.method == 'DELETE':
        generation.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
