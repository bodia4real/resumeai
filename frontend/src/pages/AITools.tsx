import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { api } from '@/lib/api';
import { 
  FileText, 
  MessageSquare, 
  Briefcase, 
  Target, 
  Copy, 
  CheckCircle2, 
  Loader2, 
  Upload,
  AlertCircle 
} from 'lucide-react';

const tools = [
  {
    id: 'tailor-resume',
    title: 'Tailor Resume',
    description: 'Customize your resume for each job posting with AI-powered suggestions.',
    icon: FileText,
    color: 'bg-blue-500/10 text-blue-600',
  },
  {
    id: 'cover-letter',
    title: 'Cover Letter Generator',
    description: 'Generate personalized cover letters that highlight your relevant experience.',
    icon: MessageSquare,
    color: 'bg-purple-500/10 text-purple-600',
  },
  {
    id: 'interview-prep',
    title: 'Interview Prep',
    description: 'Get AI-generated interview questions tailored to each position.',
    icon: Briefcase,
    color: 'bg-green-500/10 text-green-600',
  },
  {
    id: 'match-score',
    title: 'Match Score',
    description: 'See how well your profile matches each job description with detailed feedback.',
    icon: Target,
    color: 'bg-orange-500/10 text-orange-600',
  },
];

interface ToolState {
  output: string;
  isLoading: boolean;
  isCopied: boolean;
  error: string;
}

export default function AITools() {
  const [toolStates, setToolStates] = useState<Record<string, ToolState>>({
    'tailor-resume': { output: '', isLoading: false, isCopied: false, error: '' },
    'cover-letter': { output: '', isLoading: false, isCopied: false, error: '' },
    'interview-prep': { output: '', isLoading: false, isCopied: false, error: '' },
    'match-score': { output: '', isLoading: false, isCopied: false, error: '' },
  });

  const [formData, setFormData] = useState<Record<string, any>>({
    'tailor-resume': { file: null, jobDescription: '' },
    'cover-letter': { file: null, jobDescription: '' },
    'interview-prep': { file: null, jobDescription: '' },
    'match-score': { file: null, jobDescription: '' },
  });

  const handleFileChange = (toolId: string, file: File | null) => {
    setFormData((prev) => ({
      ...prev,
      [toolId]: { ...prev[toolId], file },
    }));
  };

  const handleToolSubmit = async (toolId: string) => {
    const data = formData[toolId];
    
    // Validation
    if (!data.file) {
      setToolStates((prev) => ({
        ...prev,
        [toolId]: { ...prev[toolId], error: 'Please select a resume file' },
      }));
      return;
    }

    if (!data.jobDescription || data.jobDescription.trim().length < 50) {
      setToolStates((prev) => ({
        ...prev,
        [toolId]: { ...prev[toolId], error: 'Job description must be at least 50 characters' },
      }));
      return;
    }

    setToolStates((prev) => ({
      ...prev,
      [toolId]: { ...prev[toolId], isLoading: true, output: '', error: '' },
    }));

    try {
      let result = '';
      
      // Update output in real-time as chunks arrive
      const onChunk = (chunk: string) => {
        setToolStates((prev) => ({
          ...prev,
          [toolId]: { ...prev[toolId], output: prev[toolId].output + chunk },
        }));
      };

      if (toolId === 'tailor-resume') {
        result = await api.aiServicesAPI.tailorResume(
          data.file,
          data.jobDescription,
          onChunk
        );
      } else if (toolId === 'cover-letter') {
        result = await api.aiServicesAPI.generateCoverLetter(
          data.file,
          data.jobDescription,
          onChunk
        );
      } else if (toolId === 'interview-prep') {
        result = await api.aiServicesAPI.interviewPrep(
          data.file,
          data.jobDescription,
          onChunk
        );
      } else if (toolId === 'match-score') {
        result = await api.aiServicesAPI.matchScore(
          data.file,
          data.jobDescription,
          onChunk
        );
      }

      setToolStates((prev) => ({
        ...prev,
        [toolId]: { ...prev[toolId], output: result },
      }));
    } catch (error: any) {
      setToolStates((prev) => ({
        ...prev,
        [toolId]: { 
          ...prev[toolId], 
          error: error.message || 'Error generating content. Please try again.',
          output: '' 
        },
      }));
    } finally {
      setToolStates((prev) => ({
        ...prev,
        [toolId]: { ...prev[toolId], isLoading: false },
      }));
    }
  };

  const copyToClipboard = async (toolId: string) => {
    const text = toolStates[toolId].output;
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setToolStates((prev) => ({
        ...prev,
        [toolId]: { ...prev[toolId], isCopied: true },
      }));

      setTimeout(() => {
        setToolStates((prev) => ({
          ...prev,
          [toolId]: { ...prev[toolId], isCopied: false },
        }));
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">AI Tools</h1>
        <p className="text-muted-foreground">
          Leverage AI to enhance your job search and stand out from the competition.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const state = toolStates[tool.id];

          return (
            <Dialog key={tool.id}>
              <DialogTrigger asChild>
                <div className="group rounded-xl border bg-card p-6 shadow-card transition-all hover:shadow-elevated hover:-translate-y-1 cursor-pointer">
                  <div className={`inline-flex rounded-lg p-3 mb-4 ${tool.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{tool.title}</h3>
                  <p className="text-muted-foreground text-sm">{tool.description}</p>
                </div>
              </DialogTrigger>

              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{tool.title}</DialogTitle>
                  <DialogDescription>{tool.description}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Input Form */}
                  {!state.output && (
                    <div className="space-y-4 py-4">
                      {state.error && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{state.error}</AlertDescription>
                        </Alert>
                      )}

                      {/* File Upload - Same for all tools */}
                      <div className="space-y-2">
                        <Label htmlFor={`file-${tool.id}`}>Resume File</Label>
                        <Input
                          id={`file-${tool.id}`}
                          type="file"
                          accept=".pdf,.docx,.doc,.txt"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            handleFileChange(tool.id, file);
                          }}
                          disabled={state.isLoading}
                        />
                        <p className="text-xs text-muted-foreground">
                          Supported formats: PDF, DOCX, DOC, TXT
                        </p>
                      </div>

                      {/* Job Description - Same for all tools */}
                      <div className="space-y-2">
                        <Label htmlFor={`jobDesc-${tool.id}`}>Job Description</Label>
                        <Textarea
                          id={`jobDesc-${tool.id}`}
                          placeholder="Paste the job description here... (minimum 50 characters)"
                          value={formData[tool.id].jobDescription}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              [tool.id]: {
                                ...prev[tool.id],
                                jobDescription: e.target.value,
                              },
                            }))
                          }
                          rows={8}
                          disabled={state.isLoading}
                        />
                      </div>

                      <Button
                        onClick={() => handleToolSubmit(tool.id)}
                        disabled={state.isLoading}
                        className="w-full"
                      >
                        {state.isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Generate
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Output */}
                  {state.output && (
                    <div className="space-y-4 py-4">
                      <div className="rounded-lg bg-muted p-4 min-h-[200px] max-h-[400px] overflow-y-auto">
                        <p className="text-sm whitespace-pre-wrap">{state.output}</p>
                        {state.isLoading && (
                          <Loader2 className="h-4 w-4 animate-spin inline-block ml-1" />
                        )}
                      </div>
                      <div className="flex gap-3">
                        <Button
                          onClick={() => copyToClipboard(tool.id)}
                          variant="outline"
                          className="flex-1 gap-2"
                          disabled={state.isLoading}
                        >
                          {state.isCopied ? (
                            <>
                              <CheckCircle2 className="h-4 w-4" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4" />
                              Copy
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => {
                            setToolStates((prev) => ({
                              ...prev,
                              [tool.id]: { ...prev[tool.id], output: '', error: '' },
                            }));
                          }}
                          variant="outline"
                          className="flex-1"
                          disabled={state.isLoading}
                        >
                          Reset
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          );
        })}
      </div>
    </div>
  );
}
