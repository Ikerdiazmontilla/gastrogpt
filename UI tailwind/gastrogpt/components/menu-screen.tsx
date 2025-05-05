"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search } from "lucide-react"

// Datos de ejemplo para el menú
const menuData = {
  entrantes: [
    {
      id: 1,
      nombre: "Croquetas de Jamón",
      descripcion: "Deliciosas croquetas caseras de jamón ibérico con bechamel cremosa",
      precio: 8.5,
      imagen: "/placeholder.svg?height=200&width=300",
      alergenos: ["gluten", "lactosa"],
      etiquetas: ["popular"],
    },
    {
      id: 2,
      nombre: "Ensalada César",
      descripcion: "Lechuga romana, pollo a la parrilla, crutones, queso parmesano y aderezo César",
      precio: 9.75,
      imagen: "/placeholder.svg?height=200&width=300",
      alergenos: ["gluten", "lactosa", "huevo"],
      etiquetas: [],
    },
    {
      id: 3,
      nombre: "Gazpacho Andaluz",
      descripcion: "Sopa fría tradicional de tomate, pepino, pimiento y ajo",
      precio: 6.5,
      imagen: "/placeholder.svg?height=200&width=300",
      alergenos: [],
      etiquetas: ["vegano", "sin_gluten"],
    },
  ],
  principales: [
    {
      id: 4,
      nombre: "Paella de Mariscos",
      descripcion: "Arroz con azafrán, calamares, gambas, mejillones y almejas",
      precio: 18.5,
      imagen: "/placeholder.svg?height=200&width=300",
      alergenos: ["mariscos"],
      etiquetas: ["popular", "recomendado"],
    },
    {
      id: 5,
      nombre: "Solomillo al Whisky",
      descripcion: "Solomillo de ternera con salsa de whisky, acompañado de patatas asadas",
      precio: 22.0,
      imagen: "/placeholder.svg?height=200&width=300",
      alergenos: [],
      etiquetas: ["recomendado"],
    },
    {
      id: 6,
      nombre: "Risotto de Setas",
      descripcion: "Arroz cremoso con variedad de setas silvestres y queso parmesano",
      precio: 14.5,
      imagen: "/placeholder.svg?height=200&width=300",
      alergenos: ["lactosa"],
      etiquetas: ["vegetariano"],
    },
  ],
  postres: [
    {
      id: 7,
      nombre: "Tarta de Queso",
      descripcion: "Tarta cremosa de queso con base de galleta y coulis de frutos rojos",
      precio: 6.5,
      imagen: "/placeholder.svg?height=200&width=300",
      alergenos: ["gluten", "lactosa", "huevo"],
      etiquetas: ["popular"],
    },
    {
      id: 8,
      nombre: "Crema Catalana",
      descripcion: "Postre tradicional catalán con crema suave y cobertura de azúcar caramelizado",
      precio: 5.75,
      imagen: "/placeholder.svg?height=200&width=300",
      alergenos: ["lactosa", "huevo"],
      etiquetas: [],
    },
    {
      id: 9,
      nombre: "Sorbete de Limón",
      descripcion: "Refrescante sorbete de limón, perfecto para limpiar el paladar",
      precio: 4.5,
      imagen: "/placeholder.svg?height=200&width=300",
      alergenos: [],
      etiquetas: ["vegano", "sin_gluten"],
    },
  ],
  bebidas: [
    {
      id: 10,
      nombre: "Vino Tinto Rioja Reserva",
      descripcion: "Vino tinto con 24 meses de crianza en barrica de roble",
      precio: 18.0,
      imagen: "/placeholder.svg?height=200&width=300",
      alergenos: [],
      etiquetas: ["recomendado"],
    },
    {
      id: 11,
      nombre: "Sangría Casera",
      descripcion: "Refrescante sangría con vino tinto, frutas y un toque de canela",
      precio: 12.5,
      imagen: "/placeholder.svg?height=200&width=300",
      alergenos: [],
      etiquetas: ["popular"],
    },
    {
      id: 12,
      nombre: "Agua Mineral",
      descripcion: "Agua mineral natural de manantial",
      precio: 2.0,
      imagen: "/placeholder.svg?height=200&width=300",
      alergenos: [],
      etiquetas: [],
    },
  ],
}

type Plato = {
  id: number
  nombre: string
  descripcion: string
  precio: number
  imagen: string
  alergenos: string[]
  etiquetas: string[]
}

export default function MenuScreen() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPlato, setSelectedPlato] = useState<Plato | null>(null)

  const getAlergenoIcon = (alergeno: string) => {
    switch (alergeno) {
      case "gluten":
        return "🌾"
      case "lactosa":
        return "🥛"
      case "huevo":
        return "🥚"
      case "mariscos":
        return "🦐"
      case "frutos_secos":
        return "🥜"
      case "soja":
        return "🫘"
      default:
        return "⚠️"
    }
  }

  const getEtiquetaLabel = (etiqueta: string) => {
    switch (etiqueta) {
      case "popular":
        return "Popular"
      case "recomendado":
        return "Recomendado por el chef"
      case "vegano":
        return "Vegano"
      case "vegetariano":
        return "Vegetariano"
      case "sin_gluten":
        return "Sin gluten"
      default:
        return etiqueta
    }
  }

  const getEtiquetaColor = (etiqueta: string) => {
    switch (etiqueta) {
      case "popular":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "recomendado":
        return "bg-indigo-100 text-indigo-800 border-indigo-300"
      case "vegano":
        return "bg-green-100 text-green-800 border-green-300"
      case "vegetariano":
        return "bg-emerald-100 text-emerald-800 border-emerald-300"
      case "sin_gluten":
        return "bg-cyan-100 text-cyan-800 border-cyan-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const renderPlatoCard = (plato: Plato) => (
    <Card key={plato.id} className="overflow-hidden border-blue-200 hover:shadow-md transition-shadow">
      <div className="relative h-40 overflow-hidden">
        <img src={plato.imagen || "/placeholder.svg"} alt={plato.nombre} className="w-full h-full object-cover" />
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {plato.etiquetas.includes("popular") && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full border border-blue-300">
              ⭐ Popular
            </span>
          )}
          {plato.etiquetas.includes("recomendado") && (
            <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full border border-indigo-300">
              👨‍🍳 Recomendado
            </span>
          )}
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-blue-900">{plato.nombre}</h3>
          <span className="font-bold text-blue-700">{plato.precio.toFixed(2)}€</span>
        </div>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{plato.descripcion}</p>
        <div className="flex flex-wrap gap-1 mb-3">
          {plato.alergenos.map((alergeno) => (
            <span
              key={alergeno}
              className="text-xs bg-gray-100 px-2 py-1 rounded-full border border-gray-200"
              title={alergeno}
            >
              {getAlergenoIcon(alergeno)}
            </span>
          ))}
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full border-blue-300 text-blue-800 hover:bg-blue-100"
              onClick={() => setSelectedPlato(plato)}
            >
              Ver más
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl text-blue-900">{plato.nombre}</DialogTitle>
              <DialogDescription className="text-blue-700 font-bold">{plato.precio.toFixed(2)}€</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <img
                src={plato.imagen || "/placeholder.svg"}
                alt={plato.nombre}
                className="w-full h-48 object-cover rounded-md"
              />
              <p className="text-gray-700">{plato.descripcion}</p>

              {plato.alergenos.length > 0 && (
                <div>
                  <h4 className="font-medium text-blue-800 mb-1">Alérgenos:</h4>
                  <div className="flex flex-wrap gap-2">
                    {plato.alergenos.map((alergeno) => (
                      <span
                        key={alergeno}
                        className="text-sm bg-gray-100 px-2 py-1 rounded-full border border-gray-200"
                      >
                        {getAlergenoIcon(alergeno)} {alergeno}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {plato.etiquetas.length > 0 && (
                <div>
                  <h4 className="font-medium text-blue-800 mb-1">Etiquetas:</h4>
                  <div className="flex flex-wrap gap-2">
                    {plato.etiquetas.map((etiqueta) => (
                      <span
                        key={etiqueta}
                        className={`text-sm px-2 py-1 rounded-full border ${getEtiquetaColor(etiqueta)}`}
                      >
                        {getEtiquetaLabel(etiqueta)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg border-blue-200">
      <CardHeader className="bg-blue-100">
        <CardTitle className="text-blue-800">Nuestra Carta</CardTitle>
        <CardDescription>Descubre nuestra selección de platos preparados con los mejores ingredientes</CardDescription>
        <div className="relative mt-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar platos, ingredientes..."
            className="pl-8 border-blue-300 focus-visible:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <Tabs defaultValue="entrantes" className="w-full">
          <TabsList className="w-full justify-start mb-4 overflow-x-auto flex-nowrap whitespace-nowrap">
            <TabsTrigger value="destacados" className="text-sm">
              ⭐ Destacados
            </TabsTrigger>
            <TabsTrigger value="entrantes" className="text-sm">
              🥗 Entrantes
            </TabsTrigger>
            <TabsTrigger value="principales" className="text-sm">
              🍲 Platos Principales
            </TabsTrigger>
            <TabsTrigger value="postres" className="text-sm">
              🍰 Postres
            </TabsTrigger>
            <TabsTrigger value="bebidas" className="text-sm">
              🍷 Bebidas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="destacados" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...menuData.entrantes, ...menuData.principales, ...menuData.postres, ...menuData.bebidas]
                .filter((plato) => plato.etiquetas.includes("popular") || plato.etiquetas.includes("recomendado"))
                .filter(
                  (plato) =>
                    searchTerm === "" ||
                    plato.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    plato.descripcion.toLowerCase().includes(searchTerm.toLowerCase()),
                )
                .map(renderPlatoCard)}
            </div>
          </TabsContent>

          <TabsContent value="entrantes" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuData.entrantes
                .filter(
                  (plato) =>
                    searchTerm === "" ||
                    plato.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    plato.descripcion.toLowerCase().includes(searchTerm.toLowerCase()),
                )
                .map(renderPlatoCard)}
            </div>
          </TabsContent>

          <TabsContent value="principales" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuData.principales
                .filter(
                  (plato) =>
                    searchTerm === "" ||
                    plato.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    plato.descripcion.toLowerCase().includes(searchTerm.toLowerCase()),
                )
                .map(renderPlatoCard)}
            </div>
          </TabsContent>

          <TabsContent value="postres" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuData.postres
                .filter(
                  (plato) =>
                    searchTerm === "" ||
                    plato.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    plato.descripcion.toLowerCase().includes(searchTerm.toLowerCase()),
                )
                .map(renderPlatoCard)}
            </div>
          </TabsContent>

          <TabsContent value="bebidas" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuData.bebidas
                .filter(
                  (plato) =>
                    searchTerm === "" ||
                    plato.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    plato.descripcion.toLowerCase().includes(searchTerm.toLowerCase()),
                )
                .map(renderPlatoCard)}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
