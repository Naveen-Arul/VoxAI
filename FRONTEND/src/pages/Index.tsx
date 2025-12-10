import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Mic, MessageSquare, Globe, FileText, Sparkles, Brain, Zap, Shield, Users } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-16">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center">
              <Mic className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              VoxAI
            </h1>
          </div>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Your intelligent voice assistant powered by advanced AI. Natural conversations, web search, and document analysis - all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="gradient-primary hover:opacity-90 transition-smooth text-lg px-8 py-6"
            >
              Get Started
              <Sparkles className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/auth")}
              className="text-lg px-8 py-6 border-primary/50 hover:bg-primary/10"
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Powerful Features
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: MessageSquare,
                title: "Smart Chat",
                description: "Natural AI conversations with context awareness",
              },
              {
                icon: Mic,
                title: "Voice Assistant",
                description: "Continuous listening with automatic silence detection",
              },
              {
                icon: Globe,
                title: "Web Search",
                description: "Real-time internet-grounded answers",
              },
              {
                icon: FileText,
                title: "PDF Analysis",
                description: "Extract insights from documents instantly",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="gradient-card p-6 rounded-2xl border border-border/50 space-y-3 hover:scale-105 transition-smooth"
              >
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Project Section */}
      <section className="container mx-auto px-4 py-16 bg-card/30 rounded-3xl my-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Revolutionizing Human-Computer Interaction
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              VoxAI represents the next evolution in AI-powered communication, combining cutting-edge technologies to create seamless, intuitive interactions.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl gradient-primary flex-shrink-0">
                  <Brain className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Advanced AI Core</h3>
                  <p className="text-muted-foreground">
                    Powered by state-of-the-art language models that understand context, nuance, and intent to provide human-like responses across all interaction modes.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl gradient-primary flex-shrink-0">
                  <Zap className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Real-time Processing</h3>
                  <p className="text-muted-foreground">
                    Experience lightning-fast response times with our optimized infrastructure that processes voice, text, and document queries in milliseconds.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl gradient-primary flex-shrink-0">
                  <Shield className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Privacy First</h3>
                  <p className="text-muted-foreground">
                    Your conversations are encrypted and never stored. We believe in empowering users without compromising their privacy or data security.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl gradient-primary flex-shrink-0">
                  <Users className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Universal Accessibility</h3>
                  <p className="text-muted-foreground">
                    Designed for everyone with voice control, text alternatives, and intuitive interfaces that adapt to different user needs and preferences.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="gradient-card rounded-2xl p-8 border border-border/50">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                    <p className="text-sm">System Online</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                        <Mic className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="h-4 bg-primary/20 rounded mb-2 w-full"></div>
                        <div className="h-4 bg-primary/10 rounded w-3/4"></div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-sidebar-accent flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="h-4 bg-card/50 rounded mb-2 w-4/5"></div>
                        <div className="h-4 bg-card/30 rounded w-2/3"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-border/50">
                    <p className="text-sm text-muted-foreground">
                      "VoxAI transforms how we interact with technology, making AI accessible through natural conversation."
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full gradient-primary opacity-20 blur-2xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 rounded-full bg-accent opacity-20 blur-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Digital Experience?
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            Join thousands of users who have already revolutionized how they interact with technology.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="gradient-primary hover:opacity-90 transition-smooth px-8 py-6 text-lg"
            >
              Start Free Trial
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/auth")}
              className="px-8 py-6 text-lg border-primary/50 hover:bg-primary/10"
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;