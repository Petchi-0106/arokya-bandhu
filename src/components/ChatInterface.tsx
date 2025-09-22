import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, AlertTriangle, Heart, Phone, MapPin } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  type?: "emergency" | "warning" | "info";
  quickReplies?: string[];
}

interface ChatInterfaceProps {
  userData: any;
}

const ChatInterface = ({ userData }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: `Namaste ${userData.name}! I'm your personal health assistant. I can help you with health information, symptom checking, vaccination schedules, and emergency guidance. How can I assist you today?`,
      sender: "bot",
      timestamp: new Date(),
      quickReplies: ["Check symptoms", "Vaccination info", "Health tips", "Emergency help"]
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const healthFAQs = {
    "fever": {
      response: "For fever management:\n• Take paracetamol as directed\n• Drink plenty of fluids\n• Rest well\n• Use cold compress\n\n⚠️ Consult a doctor if fever exceeds 102°F or persists for more than 3 days.",
      type: "warning" as const
    },
    "cough": {
      response: "For cough relief:\n• Drink warm water with honey\n• Steam inhalation\n• Avoid cold drinks\n• Gargle with salt water\n\n⚠️ See a doctor if cough persists for more than 2 weeks or has blood.",
      type: "warning" as const
    },
    "vaccination": {
      response: "💉 Vaccination Schedule:\n• COVID-19: Booster every 6 months\n• Flu: Annual\n• HPV: Ages 11-26\n• Hepatitis B: 3-dose series\n\nFind nearest vaccination center at your PHC or visit cowin.gov.in",
      type: "info" as const
    },
    "emergency": {
      response: "🚨 EMERGENCY CONTACTS:\n• National Emergency: 108\n• Women Helpline: 181\n• Child Helpline: 1098\n• Mental Health: 9152987821\n\n📍 Nearest Hospital: Based on your location - {location}",
      type: "emergency" as const
    }
  };

  const getHealthResponse = (input: string): Message => {
    const lowerInput = input.toLowerCase();
    
    // Check for keywords
    for (const [keyword, data] of Object.entries(healthFAQs)) {
      if (lowerInput.includes(keyword)) {
        return {
          id: Date.now().toString(),
          text: data.response.replace("{location}", userData.location || "your area"),
          sender: "bot",
          timestamp: new Date(),
          type: data.type,
          quickReplies: keyword === "emergency" ? ["Find hospital", "Call ambulance"] : ["More info", "Prevention tips"]
        };
      }
    }

    // Default responses based on domains
    if (userData.domains.includes("cardio") && (lowerInput.includes("heart") || lowerInput.includes("chest"))) {
      return {
        id: Date.now().toString(),
        text: "❤️ Heart Health Tips:\n• Regular exercise (30 min daily)\n• Limit salt intake\n• Avoid smoking\n• Monitor blood pressure\n• Eat fruits and vegetables\n\n⚠️ Chest pain or shortness of breath? Seek immediate medical attention!",
        sender: "bot",
        timestamp: new Date(),
        type: "warning",
        quickReplies: ["Emergency help", "Diet tips", "Exercise plan"]
      };
    }

    if (userData.domains.includes("diabetes") && lowerInput.includes("sugar")) {
      return {
        id: Date.now().toString(),
        text: "🩸 Blood Sugar Management:\n• Monitor levels regularly\n• Follow prescribed diet\n• Take medications on time\n• Exercise regularly\n• Stay hydrated\n\nTarget levels: Fasting 80-130 mg/dL, Post-meal <180 mg/dL",
        sender: "bot",
        timestamp: new Date(),
        type: "info",
        quickReplies: ["Diet plan", "Exercise tips", "Monitor schedule"]
      };
    }

    // Default response
    return {
      id: Date.now().toString(),
      text: "I understand your concern. Here are some general health tips:\n\n• Maintain good hygiene\n• Eat balanced meals\n• Exercise regularly\n• Get adequate sleep\n• Stay hydrated\n\nFor specific medical advice, please consult a healthcare professional. Would you like me to help you find a nearby health center?",
      sender: "bot",
      timestamp: new Date(),
      quickReplies: ["Find doctor", "Health centers", "More tips"]
    };
  };

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    // Simulate bot response delay
    setTimeout(() => {
      const botResponse = getHealthResponse(messageText);
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleQuickReply = (reply: string) => {
    handleSendMessage(reply);
  };

  const getMessageIcon = (message: Message) => {
    if (message.sender === "user") return <User className="w-4 h-4" />;
    
    switch (message.type) {
      case "emergency":
        return <AlertTriangle className="w-4 h-4 text-emergency" />;
      case "warning":
        return <Heart className="w-4 h-4 text-warning" />;
      default:
        return <Bot className="w-4 h-4 text-primary" />;
    }
  };

  const getMessageStyle = (message: Message) => {
    if (message.sender === "user") {
      return "bg-primary text-primary-foreground ml-auto";
    }
    
    switch (message.type) {
      case "emergency":
        return "bg-emergency/10 border-emergency/20 border";
      case "warning":
        return "bg-warning/10 border-warning/20 border";
      default:
        return "bg-card border";
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-card border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">HealthChat Assistant</h3>
              <p className="text-sm text-muted-foreground">
                {userData.mode === "personal" ? "Personal Mode" : "Public Mode"} | 
                {userData.medicineType === "scientific" ? " Scientific Medicine" : " Traditional Medicine"}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Badge variant="outline" className="text-xs">
              {userData.domains.length} domains
            </Badge>
            <Badge variant="outline" className="text-xs">
              {userData.language}
            </Badge>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="space-y-2">
            <div className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-lg p-3 ${getMessageStyle(message)}`}>
                <div className="flex items-start space-x-2">
                  {getMessageIcon(message)}
                  <div className="flex-1">
                    <p className="text-sm whitespace-pre-line">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Replies */}
            {message.quickReplies && message.sender === "bot" && (
              <div className="flex flex-wrap gap-2 ml-8">
                {message.quickReplies.map((reply, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickReply(reply)}
                    className="text-xs"
                  >
                    {reply}
                  </Button>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-card border rounded-lg p-3 max-w-[80%]">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4 text-primary" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Emergency Buttons */}
      <div className="border-t bg-card p-3">
        <div className="flex space-x-2 mb-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleQuickReply("emergency")}
            className="flex-1 text-xs bg-emergency/10 border-emergency/20 hover:bg-emergency/20"
          >
            <Phone className="w-3 h-3 mr-1" />
            Emergency
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleQuickReply("Find doctor")}
            className="flex-1 text-xs"
          >
            <MapPin className="w-3 h-3 mr-1" />
            Find Doctor
          </Button>
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t bg-card p-4">
        <div className="flex space-x-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask about symptoms, health tips, vaccination..."
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1"
          />
          <Button onClick={() => handleSendMessage()} disabled={!inputText.trim() || isTyping}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          ⚠️ This is not a substitute for professional medical advice
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
