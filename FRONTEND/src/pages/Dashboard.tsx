import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Menu, Settings, BarChart3, FileText, Globe, Sparkles } from "lucide-react";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatModeSelector, type ChatMode } from "@/components/ChatModeSelector";
import { ChatInput } from "@/components/ChatInput";
import { VoiceControl } from "@/components/VoiceControl";
import { EmptyState } from "@/components/EmptyState";
import { TypingIndicator } from "@/components/TypingIndicator";
import { QuickActionsBar } from "@/components/QuickActionsBar";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";
import { PdfUploader } from "@/components/PdfUploader";
import { WebSearchResults } from "@/components/WebSearchResults";
import { OnboardingModal } from "@/components/OnboardingModal";

import { chatAPI, searchAPI, pdfAPI, createVoiceWebSocket } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useAutoScroll } from "@/hooks/useAutoScroll";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface Chat {
  _id: string;
  title: string;
  mode: ChatMode;
  created_at: string;
  updated_at: string;
}

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mode, setMode] = useState<ChatMode>("smart");
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfDocumentId, setPdfDocumentId] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [voiceWebSocket, setVoiceWebSocket] = useState<WebSocket | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [webSearchResults, setWebSearchResults] = useState<any>(null);
  const [streamingMessage, setStreamingMessage] = useState<string>("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Auto-scroll effect - manually handle ScrollArea's viewport
  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
      if (viewport) {
        // Scroll to bottom smoothly
        requestAnimationFrame(() => {
          viewport.scrollTo({
            top: viewport.scrollHeight,
            behavior: 'smooth'
          });
        });
      }
    }
  }, [messages, streamingMessage, isTyping]);


  // Initialize text-to-speech hook
  const {
    isSpeaking,
    isSupported: isTtsSupported,
    speak,
    stop: stopSpeaking,
  } = useTextToSpeech({
    onEnd: () => {
      // Continue listening after speaking in voice mode
      if (mode === "voice" && isVoiceActive) {
        // Auto-resume handled by WebSocket
      }
    },
    onError: (error) => {
      toast({
        title: "Text-to-Speech Error",
        description: error,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('voxai_token');
    const userStr = localStorage.getItem('voxai_user');
    
    if (!token || !userStr) {
      navigate("/auth");
      return;
    }
    
    const user = JSON.parse(userStr);
    setCurrentUser(user);
    
    // Load all chats from DB
    loadChats();
    
    // Check if there's a chat_id in URL params
    const chatIdParam = searchParams.get('chat_id');
    if (chatIdParam) {
      loadChat(chatIdParam);
    }
  }, [navigate]);

  const loadChats = async () => {
    try {
      const chatsData = await chatAPI.getChats();
      setChats(chatsData);
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  };

  const loadChat = async (chatId: string) => {
    try {
      setIsTyping(true);
      const messagesData = await chatAPI.getChatMessages(chatId);
      
      // Convert DB messages to UI format
      const formattedMessages: Message[] = messagesData.map((msg: any) => ({
        id: msg._id,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp).toLocaleTimeString(),
      }));
      
      setMessages(formattedMessages);
      setCurrentChatId(chatId);
      
      // Get chat details to set mode
      const chat = chats.find(c => c._id === chatId);
      if (chat) {
        setMode(chat.mode);
      }
      
      // Update URL
      setSearchParams({ chat_id: chatId });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load chat history",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!currentUser) return;

    try {
      // If no current chat, create a new one with streaming
      if (!currentChatId) {
        setIsTyping(true);
        
        const response = await chatAPI.createChat(currentUser.id, mode, content);
        
        // Add user message to UI
        const userMsg: Message = {
          id: response.user_message.id,
          role: "user",
          content: response.user_message.content,
          timestamp: new Date(response.user_message.timestamp).toLocaleTimeString(),
        };
        
        const assistantMsg: Message = {
          id: response.assistant_message.id,
          role: "assistant",
          content: response.assistant_message.content,
          timestamp: new Date(response.assistant_message.timestamp).toLocaleTimeString(),
        };
        
        setMessages([userMsg, assistantMsg]);
        setCurrentChatId(response.chat_id);
        setSearchParams({ chat_id: response.chat_id });
        
        // Reload chats to show new chat in sidebar
        await loadChats();
        
        // Speak response in voice mode
        if (mode === "voice" && isVoiceActive && isTtsSupported) {
          speak(assistantMsg.content);
        }
        
        setIsTyping(false);
      } else {
        // Send message to existing chat with streaming
        setIsTyping(true);
        
        // Generate unique IDs for optimistic messages
        const tempUserId = `temp-user-${Date.now()}`;
        const tempAssistantId = `temp-assistant-${Date.now()}`;
        
        // Optimistically add user message
        const tempUserMsg: Message = {
          id: tempUserId,
          role: "user",
          content,
          timestamp: new Date().toLocaleTimeString(),
        };
        setMessages((prev) => [...prev, tempUserMsg]);
        
        // Start streaming response
        let fullResponse = "";
        setStreamingMessage(""); // Reset streaming message
        
        await chatAPI.streamMessage(
          currentChatId,
          content,
          mode,
          // onChunk - called for each chunk received
          (chunk: string) => {
            fullResponse += chunk;
            setStreamingMessage(fullResponse);
          },
          // onComplete - called when stream finishes
          async () => {
            // Create final assistant message
            const assistantMsg: Message = {
              id: tempAssistantId,
              role: "assistant",
              content: fullResponse,
              timestamp: new Date().toLocaleTimeString(),
            };
            
            // Update messages - keep temp user message and add assistant message
            setMessages((prev) => [...prev, assistantMsg]);
            
            // Clear streaming message
            setStreamingMessage("");
            setIsTyping(false);
            
            // Reload chats to update timestamps
            await loadChats();
            
            // Speak response in voice mode
            if (mode === "voice" && isVoiceActive && isTtsSupported) {
              speak(fullResponse);
            }
          },
          // onError - called on error
          (error: Error) => {
            toast({
              title: "Error",
              description: error.message || "Failed to send message",
              variant: "destructive",
            });
            
            // Remove optimistic message on error
            setMessages((prev) => prev.filter(m => m.id !== tempUserId));
            setStreamingMessage("");
            setIsTyping(false);
          }
        );
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || error.message || "Failed to send message",
        variant: "destructive",
      });
      
      setStreamingMessage("");
      setIsTyping(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
    setMode("smart");
    setPdfFile(null);
    setPdfDocumentId(null);
    setWebSearchResults(null);
    setSearchParams({});
    toast({ title: "New Chat Started" });
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.children[0] as HTMLElement;
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [messages]);

  // Show onboarding on first visit
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("voxai_onboarding_complete");
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "new-chat":
        handleNewChat();
        break;
      case "voice":
        setMode("voice");
        break;
      case "web":
        setMode("web");
        break;
      case "pdf":
        setMode("pdf");
        break;
      case "smart":
        setMode("smart");
        break;
    }
  };

  const handleVoiceToggle = () => {
    if (!currentUser) return;
    
    const newVoiceActive = !isVoiceActive;
    setIsVoiceActive(newVoiceActive);
    
    if (newVoiceActive) {
      // Start voice WebSocket connection
      const ws = createVoiceWebSocket(currentUser.id, mode);
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.error) {
            toast({
              title: "Voice Error",
              description: data.text || data.error,
              variant: "destructive",
            });
            return;
          }
          
          // Add transcribed user message
          if (data.user_text) {
            const userMessage: Message = {
              id: Date.now().toString(),
              role: "user",
              content: data.user_text,
              timestamp: new Date().toLocaleTimeString(),
            };
            setMessages((prev) => [...prev, userMessage]);
          }
          
          // Add AI response
          if (data.text) {
            const aiMessage: Message = {
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content: data.text,
              timestamp: new Date().toLocaleTimeString(),
            };
            setMessages((prev) => [...prev, aiMessage]);
            
            // Play audio if available
            if (data.audio_base64 && isTtsSupported) {
              const audioData = atob(data.audio_base64);
              const audioArray = new Uint8Array(audioData.length);
              for (let i = 0; i < audioData.length; i++) {
                audioArray[i] = audioData.charCodeAt(i);
              }
              const audioBlob = new Blob([audioArray], { type: 'audio/mpeg' });
              const audioUrl = URL.createObjectURL(audioBlob);
              const audio = new Audio(audioUrl);
              audio.play();
            }
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to voice service",
          variant: "destructive",
        });
        setIsVoiceActive(false);
      };
      
      ws.onclose = () => {
        setIsListening(false);
        setIsVoiceActive(false);
      };
      
      setVoiceWebSocket(ws);
      setIsListening(true);
      
      toast({
        title: "Voice Mode Activated",
        description: "Speak naturally, I'll detect when you're done.",
      });
      
      // Start capturing audio
      startAudioCapture(ws);
    } else {
      // Stop voice mode
      if (voiceWebSocket) {
        voiceWebSocket.close();
        setVoiceWebSocket(null);
      }
      setIsListening(false);
      stopAudioCapture();
    }
  };
  
  const startAudioCapture = async (ws: WebSocket) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
          // Send audio chunks to WebSocket
          event.data.arrayBuffer().then((buffer) => {
            ws.send(buffer);
          });
        }
      };
      
      mediaRecorder.start(100); // Send chunks every 100ms
      
      // Store reference to stop later
      (window as any).voxaiMediaRecorder = mediaRecorder;
      (window as any).voxaiMediaStream = stream;
    } catch (error) {
      console.error('Audio capture error:', error);
      toast({
        title: "Microphone Error",
        description: "Could not access microphone",
        variant: "destructive",
      });
      setIsVoiceActive(false);
    }
  };
  
  const stopAudioCapture = () => {
    const mediaRecorder = (window as any).voxaiMediaRecorder;
    const mediaStream = (window as any).voxaiMediaStream;
    
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    
    if (mediaStream) {
      mediaStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    }
    
    (window as any).voxaiMediaRecorder = null;
    (window as any).voxaiMediaStream = null;
  };

  const handleFileUpload = () => {
    // This will be handled by the PDF uploader component
    toast({
      title: "PDF Upload",
      description: "Use the PDF upload area to select a document.",
    });
  };

  const handlePdfUpload = async (file: File) => {
    if (!currentUser) return;
    
    setPdfFile(file);
    setIsTyping(true);
    
    try {
      const uploadData = await pdfAPI.upload(currentUser.id, file);
      setPdfDocumentId(uploadData.document_id);
      
      toast({
        title: "PDF Uploaded",
        description: `${file.name} is ready for questions`,
      });
    } catch (error: any) {
      toast({
        title: "Upload Error",
        description: error.response?.data?.detail || "Failed to upload PDF",
        variant: "destructive",
      });
      setPdfFile(null);
    } finally {
      setIsTyping(false);
    }
  };

  const handlePdfRemove = () => {
    setPdfFile(null);
    setPdfDocumentId(null);
    toast({
      title: "PDF Removed",
      description: "You can upload a new document anytime.",
    });
  };

  return (
    <div className="flex h-screen w-full bg-background">
      <KeyboardShortcuts onNewChat={handleNewChat} />
      <ChatSidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        chats={chats}
        currentChatId={currentChatId}
        onChatSelect={loadChat}
        onNewChat={handleNewChat}
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="border-b border-border/50 p-4">
          <div className="flex items-center justify-between gap-4 max-w-5xl mx-auto">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>
              
              <h2 className="text-lg font-semibold">
                {mode === "smart" && "Smart Chat"}
                {mode === "voice" && "Voice Chat"}
                {mode === "web" && "Web Search"}
                {mode === "pdf" && "PDF Chat"}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-primary/10"
                onClick={() => setShowOnboarding(true)}
              >
                <Sparkles className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-primary/10"
                onClick={() => navigate("/analytics")}
              >
                <BarChart3 className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Messages */}
        <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
          <div className="max-w-4xl mx-auto py-8 space-y-6">
            {messages.length === 0 && !streamingMessage ? (
              <>
                {mode === "pdf" && (
                  <div className="mb-8">
                    <PdfUploader 
                      onPdfUpload={handlePdfUpload} 
                      onPdfRemove={handlePdfRemove} 
                    />
                  </div>
                )}
                <EmptyState mode={mode} />
              </>
            ) : (
              <>
                {mode === "pdf" && !pdfFile && (
                  <div className="mb-8">
                    <PdfUploader 
                      onPdfUpload={handlePdfUpload} 
                      onPdfRemove={handlePdfRemove} 
                    />
                  </div>
                )}
                
                {mode === "pdf" && pdfFile && (
                  <div className="mb-6 p-4 bg-card border border-border/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      <span className="font-medium text-sm">{pdfFile.name}</span>
                      <span className="text-xs text-muted-foreground">(PDF loaded)</span>
                    </div>
                  </div>
                )}
                
                {messages.map((message) => (
                  <ChatMessage key={`${message.id}-${message.content.length}`} {...message} />
                ))}
                
                {/* Streaming message indicator */}
                {streamingMessage && (
                  <ChatMessage 
                    key={`streaming-${streamingMessage.length}`}
                    id="streaming"
                    role="assistant" 
                    content={streamingMessage}
                    timestamp={new Date().toLocaleTimeString()}
                  />
                )}
                
                {isTyping && !streamingMessage && <TypingIndicator />}
                
                {mode === "web" && webSearchResults && (
                  <WebSearchResults 
                    results={webSearchResults} 
                    query="" 
                    isSearching={isTyping} 
                  />
                )}
              </>
            )}

            {mode === "voice" && isVoiceActive && (
              <div className="flex justify-center py-8">
                <VoiceControl
                  isListening={isListening}
                  onToggle={handleVoiceToggle}
                />
                {transcript && (
                  <div className="mt-4 p-3 bg-card border border-border/50 rounded-lg max-w-md">
                    <p className="text-sm text-muted-foreground">Listening...</p>
                    <p className="text-primary">{transcript}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <ChatInput
          mode={mode}
          onSendMessage={handleSendMessage}
          onVoiceToggle={handleVoiceToggle}
          onFileUpload={handleFileUpload}
          isVoiceActive={isVoiceActive}
          onModeChange={setMode}
          isModeLocked={messages.length > 0}
        />
      </main>
      
      {showOnboarding && (
        <OnboardingModal
          onComplete={() => {
            setShowOnboarding(false);
            localStorage.setItem("voxai_onboarding_complete", "true");
            toast({
              title: "Onboarding Complete",
              description: "You're ready to use all VoxAI features!",
            });
          }}
          onClose={() => setShowOnboarding(false)}
        />
      )}
    </div>
  );
}
