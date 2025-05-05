"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"

export default function PreferencesForm() {
  const [dietPreference, setDietPreference] = useState("")
  const [allergies, setAllergies] = useState<string[]>([])

  const handleAllergyChange = (allergy: string) => {
    setAllergies((prev) => (prev.includes(allergy) ? prev.filter((a) => a !== allergy) : [...prev, allergy]))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // En una aplicación real, aquí guardaríamos las preferencias
    toast({
      title: "Preferencias guardadas",
      description: "Tus preferencias han sido guardadas correctamente.",
      action: <ToastAction altText="Cerrar">Cerrar</ToastAction>,
    })
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg border-blue-200">
      <CardHeader className="bg-blue-100">
        <CardTitle className="text-blue-800">Tus Preferencias Alimenticias</CardTitle>
        <CardDescription>
          Personaliza tu experiencia gastronómica indicándonos tus preferencias y restricciones alimenticias.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-blue-800">Tipo de Dieta</h3>
            <RadioGroup value={dietPreference} onValueChange={setDietPreference}>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="omnivoro" id="omnivoro" />
                  <Label htmlFor="omnivoro" className="flex items-center gap-2">
                    <span className="text-xl">🍖</span> Omnívoro
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="vegetariano" id="vegetariano" />
                  <Label htmlFor="vegetariano" className="flex items-center gap-2">
                    <span className="text-xl">🥗</span> Vegetariano
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="vegano" id="vegano" />
                  <Label htmlFor="vegano" className="flex items-center gap-2">
                    <span className="text-xl">🌱</span> Vegano
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="keto" id="keto" />
                  <Label htmlFor="keto" className="flex items-center gap-2">
                    <span className="text-xl">🥑</span> Keto
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-blue-800">Alergias e Intolerancias</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="gluten"
                  checked={allergies.includes("gluten")}
                  onCheckedChange={() => handleAllergyChange("gluten")}
                />
                <Label htmlFor="gluten" className="flex items-center gap-2">
                  <span className="text-xl">🌾</span> Gluten
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="lactosa"
                  checked={allergies.includes("lactosa")}
                  onCheckedChange={() => handleAllergyChange("lactosa")}
                />
                <Label htmlFor="lactosa" className="flex items-center gap-2">
                  <span className="text-xl">🥛</span> Lactosa
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="frutos_secos"
                  checked={allergies.includes("frutos_secos")}
                  onCheckedChange={() => handleAllergyChange("frutos_secos")}
                />
                <Label htmlFor="frutos_secos" className="flex items-center gap-2">
                  <span className="text-xl">🥜</span> Frutos Secos
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="mariscos"
                  checked={allergies.includes("mariscos")}
                  onCheckedChange={() => handleAllergyChange("mariscos")}
                />
                <Label htmlFor="mariscos" className="flex items-center gap-2">
                  <span className="text-xl">🦐</span> Mariscos
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="huevo"
                  checked={allergies.includes("huevo")}
                  onCheckedChange={() => handleAllergyChange("huevo")}
                />
                <Label htmlFor="huevo" className="flex items-center gap-2">
                  <span className="text-xl">🥚</span> Huevo
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="soja"
                  checked={allergies.includes("soja")}
                  onCheckedChange={() => handleAllergyChange("soja")}
                />
                <Label htmlFor="soja" className="flex items-center gap-2">
                  <span className="text-xl">🫘</span> Soja
                </Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium text-blue-800">Preferencias Adicionales</h3>
            <Textarea
              placeholder="Indícanos cualquier otra preferencia o restricción alimenticia..."
              className="border-blue-300 focus-visible:ring-blue-500"
            />
          </div>
        </CardContent>
        <CardFooter className="bg-blue-50 border-t border-blue-200">
          <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800">
            Guardar Preferencias
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
