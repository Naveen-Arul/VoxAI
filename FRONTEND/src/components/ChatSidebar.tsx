import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SearchConversations } from "./SearchConversations";
import { ChatHistorySkeleton } from "./ChatHistorySkeleton";
import {
  Plus,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  Pin,
  Mic,
  Globe,
  FileText,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { authAPI } from "@/lib/api";

interface Chat {
  _id: string;
  title: string;
  mode: 'smart' | 'voice' | 'web' | 'pdf';
  created_at: string;
  updated_at: string;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  chats: Chat[];
  currentChatId: string | null;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
}

const getModeIcon = (mode: string) => {
  switch (mode) {
    case 'voice':
      return <Mic className="w-3 h-3" />;
    case 'web':
      return <Globe className="w-3 h-3" />;
    case 'pdf':
      return <FileText className="w-3 h-3" />;
    default:
      return <Sparkles className="w-3 h-3" />;
  }
};

const getModeLabel = (mode: string) => {
  switch (mode) {
    case 'voice':
      return 'Voice';
    case 'web':
      return 'Web';
    case 'pdf':
      return 'PDF';
    default:
      return 'Smart';
  }
};

const getModeColor = (mode: string) => {
  switch (mode) {
    case 'voice':
      return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    case 'web':
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'pdf':
      return 'bg-green-500/10 text-green-500 border-green-500/20';
    default:
      return 'bg-primary/10 text-primary border-primary/20';
  }
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
};

export function ChatSidebar({ 
  isOpen, 
  onToggle, 
  chats, 
  currentChatId, 
  onChatSelect, 
  onNewChat 
}: ChatSidebarProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await authAPI.getProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error("Failed to load profile:", error);
    }
  };

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categorizedChats = {
    voice: filteredChats.filter(chat => chat.mode === 'voice'),
    smart: filteredChats.filter(chat => chat.mode === 'smart'),
    pdf: filteredChats.filter(chat => chat.mode === 'pdf'),
    web: filteredChats.filter(chat => chat.mode === 'web'),
  };

  const handleLogout = async () => {
    localStorage.removeItem('voxai_token');
    localStorage.removeItem('voxai_user');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
    navigate("/auth");
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen bg-sidebar-background border-r border-sidebar-border transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 w-72`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                VoxAI
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className="md:hidden"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <Button 
              className="w-full gradient-primary hover:opacity-90 glow-button transition-smooth"
              onClick={onNewChat}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Conversation
            </Button>
          </div>

          {/* Search */}
          <SearchConversations value={searchQuery} onChange={setSearchQuery} />

          {/* Conversations */}
          <ScrollArea className="flex-1 px-2">
            <div className="space-y-1 py-2">
              {filteredChats.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">No chats yet</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Start a new conversation</p>
                </div>
              ) : (
                <>
                  {/* Categorized Sections */}
                  {Object.entries(categorizedChats).map(([category, categoryChats]) => {
                    if (categoryChats.length === 0) return null;
                    
                    const categoryLabels: Record<string, string> = {
                      voice: 'VOICE CHATS',
                      smart: 'SMART CHATS',
                      pdf: 'PDF CHATS',
                      web: 'WEB SEARCH',
                    };
                    
                    return (
                      <div key={category}>
                        <p className="text-xs text-muted-foreground px-3 py-2 font-semibold mt-2">
                          {categoryLabels[category]}
                        </p>
                        {categoryChats.map((chat, index) => (
                          <button
                            key={chat._id}
                            onClick={() => onChatSelect(chat._id)}
                            className={`w-full text-left px-3 py-2 rounded-lg hover:bg-sidebar-accent transition-smooth group animate-fade-in ${
                              currentChatId === chat._id ? 'bg-sidebar-accent' : ''
                            }`}
                            style={{ animationDelay: `${index * 0.05}s` }}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`flex items-center justify-center w-6 h-6 rounded-md ${getModeColor(chat.mode)}`}>
                                {getModeIcon(chat.mode)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate group-hover:text-foreground transition-smooth">
                                  {chat.title}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs px-1.5 py-0 h-4 ${getModeColor(chat.mode)}`}
                                  >
                                    {getModeLabel(chat.mode)}
                                  </Badge>
                                  <p className="text-xs text-muted-foreground">
                                    {formatDate(chat.updated_at)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </ScrollArea>

          <Separator />

          {/* Footer */}
          <div className="p-4 space-y-2">
            {/* User Profile Section */}
            {userProfile && (
              <div className="mb-4 p-3 rounded-lg bg-sidebar-accent/50 border border-sidebar-border">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={userProfile.profile_photo} alt={userProfile.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {userProfile.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{userProfile.name || "User"}</p>
                    <p className="text-xs text-muted-foreground truncate">{userProfile.email}</p>
                  </div>
                </div>
              </div>
            )}
            
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-sidebar-accent"
              onClick={() => navigate("/profile")}
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-sidebar-accent"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-sidebar-accent text-destructive hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
