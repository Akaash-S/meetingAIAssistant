import { useState } from 'react';
import { Upload, Play, FileAudio, Sparkles, Clock, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import heroImage from '@/assets/hero-meeting.jpg';

export default function Landing() {
  const [dragActive, setDragActive] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = (file: File) => {
    console.log('File uploaded:', file.name);
    // Handle file upload logic here
  };

  const handleDemo = async () => {
    await login('demo@example.com', 'demo');
    navigate('/dashboard');
  };

  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Analysis',
      description: 'Extract key decisions, action items, and insights automatically'
    },
    {
      icon: Clock,
      title: 'Timeline View',
      description: 'Navigate through meetings with minute-by-minute breakdowns'
    },
    {
      icon: CheckSquare,
      title: 'Task Management',
      description: 'Track action items with deadlines and assignees'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10" />
        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Transform Your Meetings with{' '}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  AI Intelligence
                </span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Upload recordings, get instant transcripts with AI-extracted decisions, 
                action items, and follow-ups. Never miss important meeting details again.
              </p>
              
              {/* File Upload Area */}
              <Card className="p-8 border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors">
                <CardContent 
                  className={`text-center space-y-4 ${dragActive ? 'bg-primary/5' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <FileAudio className="w-12 h-12 text-primary mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Drop your meeting recording here</h3>
                    <p className="text-muted-foreground mb-4">Support for MP3, MP4, WAV, and more</p>
                    <div className="flex gap-3 justify-center">
                      <Button className="gradient-primary">
                        <Upload className="w-4 h-4 mr-2" />
                        Select File
                      </Button>
                      <Button variant="outline" onClick={handleDemo}>
                        <Play className="w-4 h-4 mr-2" />
                        Try Demo
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="relative">
              <img 
                src={heroImage} 
                alt="AI Meeting Assistant" 
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-primary/20 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground">Three simple steps to smarter meetings</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center p-8 hover:shadow-lg transition-shadow">
                  <CardContent className="space-y-4">
                    <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-muted-foreground">
            Built for the AI Hackathon • Made with ❤️ by Team MeetingAI
          </p>
        </div>
      </footer>
    </div>
  );
}