import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function RestaurantHeader() {
  return (
    <header className="bg-blue-800 text-white py-4 px-6 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🍽️</span>
        <h1 className="text-xl font-bold">Restaurante El Gourmet</h1>
      </div>
      <Select defaultValue="es">
        <SelectTrigger className="w-[100px] bg-blue-700 border-blue-600 text-white">
          <SelectValue placeholder="Idioma" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="es">Español</SelectItem>
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="fr">Français</SelectItem>
          <SelectItem value="de">Deutsch</SelectItem>
          <SelectItem value="it">Italiano</SelectItem>
        </SelectContent>
      </Select>
    </header>
  )
}
