"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table } from "@/types/database";

interface TableDialogProps {
  open: boolean;
  onClose: (refresh?: boolean) => void;
  editingTable?: Table | null;
}

export function TableDialog({ open, onClose, editingTable }: TableDialogProps) {
  const [formData, setFormData] = useState({
    tableNumber: "",
    location: "",
    notes: "",
    isActive: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingTable) {
      setFormData({
        tableNumber: editingTable.tableNumber,
        location: editingTable.location || "",
        notes: editingTable.notes || "",
        isActive: editingTable.isActive,
      });
    } else {
      setFormData({
        tableNumber: "",
        location: "",
        notes: "",
        isActive: true,
      });
    }
    setError("");
  }, [editingTable, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("adminAuth");
      const url = editingTable
        ? `/api/admin/tables/${editingTable.id}`
        : "/api/admin/tables";

      const response = await fetch(url, {
        method: editingTable ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onClose(true);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to save table");
      }
    } catch (_error) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingTable ? "Edit Table" : "Add New Table"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="tableNumber">Table Number *</Label>
            <Input
              id="tableNumber"
              value={formData.tableNumber}
              onChange={(e) => handleInputChange("tableNumber", e.target.value)}
              placeholder="1, 2, A1, VIP-1, etc."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              placeholder="Near window, Corner, Center, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Any special notes about this table..."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => handleInputChange("isActive", e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="isActive">
              Active (customers can order from this table)
            </Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onClose()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : editingTable ? "Update" : "Add"} Table
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
