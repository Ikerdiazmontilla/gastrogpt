"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Mic } from "lucide-react"

type Message = {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hola 👋, soy Gastro GPT. ¿En qué puedo ayudarte hoy?",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    // Añadir mensaje del usuario
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")

    // Simular respuesta del bot (en una aplicación real, esto vendría de una API)
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "Gracias por tu mensaje. ¿Te gustaría conocer nuestras recomendaciones del día o tienes alguna pregunta específica sobre el menú?",
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botResponse])
    }, 1000)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg border-blue-200">
      <CardContent className="p-0">
        <div className="h-[500px] flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex gap-3 max-w-[80%] ${message.sender === "user" ? "flex-row-reverse" : ""}`}>
                  <Avatar className={message.sender === "bot" ? "bg-blue-700" : "bg-gray-500"}>
                    <AvatarFallback>{message.sender === "bot" ? "GP" : "TÚ"}</AvatarFallback>
                  </Avatar>
                  <div
                    className={`rounded-lg p-3 ${
                      message.sender === "user" ? "bg-blue-600 text-white" : "bg-blue-100 text-gray-800"
                    }`}
                  >
                    <p>{message.content}</p>
                    <div className={`text-xs mt-1 ${message.sender === "user" ? "text-blue-200" : "text-gray-500"}`}>
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-blue-200 bg-white">
            <div className="flex gap-2">
              <Input
                placeholder="Escribe tu mensaje..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSendMessage()
                  }
                }}
                className="border-blue-300 focus-visible:ring-blue-500"
              />
              <Button onClick={handleSendMessage} className="bg-blue-700 hover:bg-blue-800">
                <Send className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="border-blue-300">
                <Mic className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
              <Button variant="outline" size="sm" className="whitespace-nowrap border-blue-300 text-blue-800">
                Mostrar platos sin gluten
              </Button>
              <Button variant="outline" size="sm" className="whitespace-nowrap border-blue-300 text-blue-800">
                Traducir menú
              </Button>
              <Button variant="outline" size="sm" className="whitespace-nowrap border-blue-300 text-blue-800">
                Recomendaciones del chef
              </Button>
              <Button variant="outline" size="sm" className="whitespace-nowrap border-blue-300 text-blue-800">
                Platos veganos
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
