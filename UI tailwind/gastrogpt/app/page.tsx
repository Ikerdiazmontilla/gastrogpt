import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ChatScreen from "@/components/chat-screen"
import PreferencesForm from "@/components/preferences-form"
import MenuScreen from "@/components/menu-screen"
import { RestaurantHeader } from "@/components/restaurant-header"

export default function Home() {
  return (
    <main className="min-h-screen bg-blue-50">
      <RestaurantHeader />
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="chat" className="w-full max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="chat" className="text-lg">
              🗨️ Chat
            </TabsTrigger>
            <TabsTrigger value="preferences" className="text-lg">
              📝 Preferencias
            </TabsTrigger>
            <TabsTrigger value="menu" className="text-lg">
              📖 Carta
            </TabsTrigger>
          </TabsList>
          <TabsContent value="chat">
            <ChatScreen />
          </TabsContent>
          <TabsContent value="preferences">
            <PreferencesForm />
          </TabsContent>
          <TabsContent value="menu">
            <MenuScreen />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
