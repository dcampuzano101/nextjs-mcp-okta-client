"use client";

import { useState, useEffect } from "react";
import { MCPTool, MCPToolProperty } from "@/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Plus, X } from "lucide-react";

interface ToolFormProps {
  tool: MCPTool;
  onSubmit: (toolName: string, params: Record<string, any>) => void;
  isLoading?: boolean;
}

export function ToolForm({ tool, onSubmit, isLoading }: ToolFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});

  // Reset form when tool changes
  useEffect(() => {
    const initialData: Record<string, any> = {};
    Object.keys(tool.inputSchema.properties).forEach((key) => {
      const prop = tool.inputSchema.properties[key];
      if (prop.type === "array") {
        initialData[key] = [];
      } else if (prop.type === "object") {
        initialData[key] = {};
      } else {
        initialData[key] = "";
      }
    });
    setFormData(initialData);
  }, [tool]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Clean up empty values
    const cleanedData: Record<string, any> = {};
    Object.keys(formData).forEach((key) => {
      const value = formData[key];
      if (Array.isArray(value) && value.length > 0) {
        cleanedData[key] = value.filter((v: any) => v !== "");
      } else if (value !== "" && value !== null && value !== undefined) {
        cleanedData[key] = value;
      }
    });

    onSubmit(tool.name, cleanedData);
  };

  const handleArrayAdd = (key: string) => {
    setFormData({
      ...formData,
      [key]: [...(formData[key] || []), ""],
    });
  };

  const handleArrayRemove = (key: string, index: number) => {
    const newArray = [...(formData[key] || [])];
    newArray.splice(index, 1);
    setFormData({
      ...formData,
      [key]: newArray,
    });
  };

  const handleArrayChange = (key: string, index: number, value: string) => {
    const newArray = [...(formData[key] || [])];
    newArray[index] = value;
    setFormData({
      ...formData,
      [key]: newArray,
    });
  };

  const renderField = (key: string, property: MCPToolProperty) => {
    const isRequired = tool.inputSchema.required?.includes(key);

    if (property.type === "array") {
      const items = formData[key] || [];
      return (
        <div key={key} className="space-y-2">
          <Label>
            {key} {isRequired && <span className="text-destructive">*</span>}
            <span className="text-xs text-muted-foreground ml-2">
              (array{property.items?.type && `<${property.items.type}>`})
            </span>
          </Label>
          {property.description && (
            <p className="text-xs text-muted-foreground">
              {property.description}
            </p>
          )}

          <div className="space-y-2">
            {items.map((item: string, index: number) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={item}
                  onChange={(e) =>
                    handleArrayChange(key, index, e.target.value)
                  }
                  placeholder={`Item ${index + 1}`}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleArrayRemove(key, index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleArrayAdd(key)}
              className="w-full gap-2"
            >
              <Plus className="h-4 w-4" />
              Add {key}
            </Button>
          </div>
        </div>
      );
    }

    if (property.type === "string") {
      return (
        <div key={key} className="space-y-2">
          <Label htmlFor={key}>
            {key} {isRequired && <span className="text-destructive">*</span>}
            <span className="text-xs text-muted-foreground ml-2">(string)</span>
          </Label>
          {property.description && (
            <p className="text-xs text-muted-foreground">
              {property.description}
            </p>
          )}
          <Input
            id={key}
            value={formData[key] || ""}
            onChange={(e) =>
              setFormData({ ...formData, [key]: e.target.value })
            }
            placeholder={`Enter ${key}`}
            required={isRequired}
          />
        </div>
      );
    }

    if (property.type === "number" || property.type === "integer") {
      return (
        <div key={key} className="space-y-2">
          <Label htmlFor={key}>
            {key} {isRequired && <span className="text-destructive">*</span>}
            <span className="text-xs text-muted-foreground ml-2">
              ({property.type})
            </span>
          </Label>
          {property.description && (
            <p className="text-xs text-muted-foreground">
              {property.description}
            </p>
          )}
          <Input
            id={key}
            type="number"
            value={formData[key] || ""}
            onChange={(e) =>
              setFormData({ ...formData, [key]: parseFloat(e.target.value) })
            }
            placeholder={`Enter ${key}`}
            required={isRequired}
          />
        </div>
      );
    }

    if (property.type === "boolean") {
      return (
        <div key={key} className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              id={key}
              type="checkbox"
              checked={formData[key] || false}
              onChange={(e) =>
                setFormData({ ...formData, [key]: e.target.checked })
              }
              className="h-4 w-4"
            />
            <Label htmlFor={key} className="cursor-pointer">
              {key} {isRequired && <span className="text-destructive">*</span>}
              <span className="text-xs text-muted-foreground ml-2">
                (boolean)
              </span>
            </Label>
          </div>
          {property.description && (
            <p className="text-xs text-muted-foreground ml-6">
              {property.description}
            </p>
          )}
        </div>
      );
    }

    // Default fallback
    return (
      <div key={key} className="space-y-2">
        <Label htmlFor={key}>
          {key} {isRequired && <span className="text-destructive">*</span>}
        </Label>
        {property.description && (
          <p className="text-xs text-muted-foreground">
            {property.description}
          </p>
        )}
        <Textarea
          id={key}
          value={formData[key] || ""}
          onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
          placeholder={`Enter ${key}`}
          required={isRequired}
        />
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Tool: {tool.name}</CardTitle>
        {tool.description && (
          <p className="text-sm text-muted-foreground">{tool.description}</p>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {Object.keys(tool.inputSchema.properties).map((key) =>
            renderField(key, tool.inputSchema.properties[key])
          )}

          <div className="pt-4">
            <Button type="submit" disabled={isLoading} className="w-full gap-2">
              {isLoading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-background border-t-transparent rounded-full" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Run
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
