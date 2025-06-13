"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, CheckCircle2, Trash2, Edit, Plus } from "lucide-react"

interface TestEntity {
  id: string
  name: string
  description: string
  status: "active" | "inactive"
  created_at: string
}

export default function TestCRUDPage() {
  const [entities, setEntities] = useState<TestEntity[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [editingEntity, setEditingEntity] = useState<TestEntity | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "active" as "active" | "inactive"
  })

  // Simulation d'une API avec localStorage
  const saveToStorage = (data: TestEntity[]) => {
    localStorage.setItem('test-entities', JSON.stringify(data))
  }

  const loadFromStorage = (): TestEntity[] => {
    const stored = localStorage.getItem('test-entities')
    return stored ? JSON.parse(stored) : []
  }

  useEffect(() => {
    fetchEntities()
  }, [])

  const fetchEntities = async () => {
    setLoading(true)
    setError(null)

    try {
      // Simulation d'un délai d'API
      await new Promise(resolve => setTimeout(resolve, 500))
      const data = loadFromStorage()
      setEntities(data)
    } catch (err) {
      setError("Erreur lors du chargement des données")
    } finally {
      setLoading(false)
    }
  }

  const createEntity = async () => {
    if (!formData.name.trim()) {
      setError("Le nom est requis")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const newEntity: TestEntity = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        status: formData.status,
        created_at: new Date().toISOString()
      }

      const updatedEntities = [...entities, newEntity]
      setEntities(updatedEntities)
      saveToStorage(updatedEntities)

      setFormData({ name: "", description: "", status: "active" })
      setSuccess("Entité créée avec succès")
    } catch (err) {
      setError("Erreur lors de la création")
    } finally {
      setLoading(false)
    }
  }

  const updateEntity = async () => {
    if (!editingEntity || !formData.name.trim()) {
      setError("Le nom est requis")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const updatedEntities = entities.map(entity =>
        entity.id === editingEntity.id
          ? { ...entity, name: formData.name, description: formData.description, status: formData.status }
          : entity
      )

      setEntities(updatedEntities)
      saveToStorage(updatedEntities)

      setEditingEntity(null)
      setFormData({ name: "", description: "", status: "active" })
      setSuccess("Entité mise à jour avec succès")
    } catch (err) {
      setError("Erreur lors de la mise à jour")
    } finally {
      setLoading(false)
    }
  }

  const deleteEntity = async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const updatedEntities = entities.filter(entity => entity.id !== id)
      setEntities(updatedEntities)
      saveToStorage(updatedEntities)
      setSuccess("Entité supprimée avec succès")
    } catch (err) {
      setError("Erreur lors de la suppression")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (entity: TestEntity) => {
    setEditingEntity(entity)
    setFormData({
      name: entity.name,
      description: entity.description,
      status: entity.status
    })
  }

  const cancelEdit = () => {
    setEditingEntity(null)
    setFormData({ name: "", description: "", status: "active" })
    setError(null)
  }

  const clearMessages = () => {
    setError(null)
    setSuccess(null)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Test CRUD Operations</h1>
        <Badge variant="outline">Test Environment</Badge>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
          <Button variant="ghost" size="sm" onClick={clearMessages} className="ml-auto">
            ×
          </Button>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription className="text-green-600">{success}</AlertDescription>
          <Button variant="ghost" size="sm" onClick={clearMessages} className="ml-auto">
            ×
          </Button>
        </Alert>
      )}

      <Tabs defaultValue="create" className="space-y-4">
        <TabsList>
          <TabsTrigger value="create">
            <Plus className="w-4 h-4 mr-2" />
            Créer/Modifier
          </TabsTrigger>
          <TabsTrigger value="list">Liste des entités</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {editingEntity ? "Modifier l'entité" : "Créer une nouvelle entité"}
              </CardTitle>
              <CardDescription>
                {editingEntity ? "Modifiez les informations de l'entité" : "Remplissez le formulaire pour créer une nouvelle entité"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nom de l'entité"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description de l'entité"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Statut</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: "active" | "inactive") => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={editingEntity ? updateEntity : createEntity}
                  disabled={loading}
                >
                  {loading ? "En cours..." : editingEntity ? "Mettre à jour" : "Créer"}
                </Button>
                {editingEntity && (
                  <Button variant="outline" onClick={cancelEdit}>
                    Annuler
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Liste des entités ({entities.length})</CardTitle>
              <CardDescription>
                Gérez vos entités de test
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading && entities.length === 0 ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : entities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune entité trouvée. Créez-en une pour commencer.
                </div>
              ) : (
                <div className="space-y-2">
                  {entities.map((entity) => (
                    <div
                      key={entity.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{entity.name}</h3>
                          <Badge variant={entity.status === "active" ? "default" : "secondary"}>
                            {entity.status === "active" ? "Actif" : "Inactif"}
                          </Badge>
                        </div>
                        {entity.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {entity.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Créé le {new Date(entity.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(entity)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteEntity(entity.id)}
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}