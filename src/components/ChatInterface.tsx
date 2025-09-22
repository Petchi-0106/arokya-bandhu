import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, AlertTriangle, Heart, Phone, MapPin } from "lucide-react";

// ✅ Import Gemini client
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY); 
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
      text: `Namaste ${userData.name}! I'm your personal health assistant powered by AI. I can help with health information, symptoms, vaccinations, and emergency guidance. How can I assist you today?`,
      sender: "bot",
      timestamp: new Date(),
      quickReplies: ["Check symptoms", "Vaccination info", "Health tips", "Emergency help"],
    },
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

  // 🔹 Gemini API Call
  const fetchGeminiResponse = async (query: string): Promise<string> => {
    try {
      const prompt = `
      You are "Arokyabandhu Health Assistant", a multilingual public health chatbot.
      Provide preventive healthcare info, symptom guidance, vaccination schedules, and emergency help.
      Answer in simple and clear language for rural and semi-urban users.

      User question: ${query}
      `;
      const result = await model.generateContent(prompt);
      return result.response.text() || "Sorry, I couldn’t understand that. Please try again.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "⚠️ Unable to fetch response. Please try again later.";
    }
  };

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    // Call Gemini for response
    const aiText = await fetchGeminiResponse(messageText);

    const botResponse: Message = {
      id: Date.now().toString(),
      text: aiText,
      sender: "bot",
      timestamp: new Date(),
      type: aiText.includes("⚠️") ? "warning" : "info",
    };

    setMessages((prev) => [...prev, botResponse]);
    setIsTyping(false);
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="space-y-2">
            <div className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-lg p-3 ${getMessageStyle(message)}`}>
                <div className="flex items-start space-x-2">
                  {getMessageIcon(message)}
                  <div className="flex-1">
                    <p className="text-sm whitespace-pre-line">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">{message.timestamp.toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>
            </div>
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

      {/* Input */}
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
