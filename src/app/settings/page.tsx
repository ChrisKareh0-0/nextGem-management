"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function SettingsPage() {
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleResetDatabase = async () => {
    if (!confirm("WARNING: This will delete ALL data in the database. This action cannot be undone. Are you sure you want to continue?")) {
      return;
    }

    try {
      setIsResetting(true);
      setError(null);
      setSuccess(false);

      const response = await fetch("/api/reset-database", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to reset database");
      }

      setSuccess(true);
      // Reload the page after successful reset
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset database");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Danger Zone</h2>
          </div>
          
          <p className="text-gray-600">
            Reset the database to its initial state. This will delete all data including clients, payments, and other records.
          </p>

          {error && (
            <div className="text-red-500">
              {error}
            </div>
          )}

          {success && (
            <div className="text-green-500">
              Database reset successfully!
            </div>
          )}

          <Button
            variant="destructive"
            onClick={handleResetDatabase}
            disabled={isResetting}
          >
            {isResetting ? "Resetting..." : "Reset Database"}
          </Button>
        </div>
      </Card>
    </div>
  );
} 