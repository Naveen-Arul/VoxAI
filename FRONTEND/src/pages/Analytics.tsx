import { ArrowLeft, TrendingUp, MessageSquare, Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export default function Analytics() {
  const navigate = useNavigate();

  const stats = [
    {
      title: "Total Conversations",
      value: "1,234",
      change: "+12.5%",
      icon: MessageSquare,
      color: "text-primary",
    },
    {
      title: "Avg Response Time",
      value: "1.2s",
      change: "-8.3%",
      icon: Clock,
      color: "text-accent",
    },
    {
      title: "Tokens Used",
      value: "45.2K",
      change: "+23.1%",
      icon: Zap,
      color: "text-primary-glow",
    },
    {
      title: "User Engagement",
      value: "87%",
      change: "+5.2%",
      icon: TrendingUp,
      color: "text-accent-glow",
    },
  ];

  const recentActivity = [
    { type: "Smart Chat", time: "2 minutes ago", tokens: 234 },
    { type: "Voice Mode", time: "15 minutes ago", tokens: 567 },
    { type: "Web Search", time: "1 hour ago", tokens: 189 },
    { type: "PDF Analysis", time: "2 hours ago", tokens: 892 },
    { type: "Smart Chat", time: "3 hours ago", tokens: 345 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="rounded-full hover:bg-primary/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Track your usage and performance metrics</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card
              key={stat.title}
              className="gradient-card border-border/50 hover:border-primary/50 transition-smooth"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className={stat.change.startsWith("+") ? "text-green-500" : "text-red-500"}>
                    {stat.change}
                  </span>
                  {" from last month"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <Card className="gradient-card border-border/50">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest conversations and interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-smooth"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-primary glow-primary" />
                    <div>
                      <p className="font-medium">{activity.type}</p>
                      <p className="text-sm text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{activity.tokens}</p>
                    <p className="text-sm text-muted-foreground">tokens</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Usage Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="gradient-card border-border/50">
            <CardHeader>
              <CardTitle>Token Usage Trends</CardTitle>
              <CardDescription>Daily token consumption over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { day: "Mon", usage: 6200, percentage: 75 },
                  { day: "Tue", usage: 7800, percentage: 95 },
                  { day: "Wed", usage: 5400, percentage: 65 },
                  { day: "Thu", usage: 8200, percentage: 100 },
                  { day: "Fri", usage: 6800, percentage: 82 },
                  { day: "Sat", usage: 4200, percentage: 50 },
                  { day: "Sun", usage: 3800, percentage: 45 },
                ].map((data) => (
                  <div key={data.day} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{data.day}</span>
                      <span className="font-medium">{data.usage} tokens</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full gradient-primary transition-all duration-500"
                        style={{ width: `${data.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card border-border/50">
            <CardHeader>
              <CardTitle>Conversation Insights</CardTitle>
              <CardDescription>Breakdown by interaction mode</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { mode: "Smart Chat", count: 487, percentage: 45, color: "bg-primary" },
                  { mode: "Voice Mode", count: 342, percentage: 32, color: "bg-accent" },
                  { mode: "Web Search", count: 189, percentage: 17, color: "bg-primary-glow" },
                  { mode: "PDF Analysis", count: 67, percentage: 6, color: "bg-accent-glow" },
                ].map((mode) => (
                  <div key={mode.mode} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{mode.mode}</span>
                      <span className="text-sm text-muted-foreground">
                        {mode.count} ({mode.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full ${mode.color} transition-all duration-500`}
                        style={{ width: `${mode.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
