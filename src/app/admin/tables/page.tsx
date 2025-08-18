"use client";

import { useState, useEffect } from "react";
import { AuthGuard } from "@/components/admin/auth-guard";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QRCodeDialog } from "@/components/admin/qr-code-dialog";
import { TableDialog } from "@/components/admin/table-dialog";
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog";
import { 
  Plus, 
  QrCode, 
  Edit, 
  Trash2,
  Users,
  MapPin
} from "lucide-react";
import { Table } from "@/types/database";

export default function AdminTablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [tableDialogOpen, setTableDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [deletingTable, setDeletingTable] = useState<Table | null>(null);

  const fetchTables = async () => {
    try {
      const token = localStorage.getItem("adminAuth");
      const response = await fetch("/api/admin/tables", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setTables(data);
      }
    } catch (error) {
      console.error("Failed to fetch tables:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleShowQR = (table: Table) => {
    setSelectedTable(table);
    setQrDialogOpen(true);
  };

  const handleEdit = (table: Table) => {
    setEditingTable(table);
    setTableDialogOpen(true);
  };

  const handleDelete = (table: Table) => {
    setDeletingTable(table);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTable) return;

    try {
      const token = localStorage.getItem("adminAuth");
      const response = await fetch(`/api/admin/tables/${deletingTable.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        await fetchTables();
        setDeleteDialogOpen(false);
        setDeletingTable(null);
      }
    } catch (error) {
      console.error("Failed to delete table:", error);
    }
  };

  const handleTableDialogClose = (refresh?: boolean) => {
    setTableDialogOpen(false);
    setEditingTable(null);
    if (refresh) {
      fetchTables();
    }
  };

  if (isLoading) {
    return (
      <AuthGuard>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading tables...</p>
            </div>
          </div>
        </AdminLayout>
      </AuthGuard>
    );
  }

  const activeTables = tables.filter(table => table.isActive);
  const inactiveTables = tables.filter(table => !table.isActive);

  return (
    <AuthGuard>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Table Management</h1>
              <p className="text-muted-foreground">
                Manage restaurant tables and QR codes
              </p>
            </div>
            <Button onClick={() => setTableDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Table
            </Button>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <MapPin className="mr-2 h-4 w-4" />
                  Total Tables
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tables.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center text-green-600">
                  <Users className="mr-2 h-4 w-4" />
                  Active Tables
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{activeTables.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center text-gray-600">
                  <Users className="mr-2 h-4 w-4" />
                  Inactive Tables
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-600">{inactiveTables.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Active Tables */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Active Tables</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {activeTables.map((table) => (
                <Card key={table.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      Table {table.tableNumber}
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Active
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {table.location && (
                      <p className="text-sm text-muted-foreground">
                        📍 {table.location}
                      </p>
                    )}
                    
                    <div className="flex flex-col space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShowQR(table)}
                        className="w-full"
                      >
                        <QrCode className="mr-2 h-4 w-4" />
                        View QR Code
                      </Button>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(table)}
                          className="flex-1"
                        >
                          <Edit className="mr-1 h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(table)}
                          className="flex-1"
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {activeTables.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No active tables</p>
                  <p className="text-sm text-muted-foreground">
                    Add your first table to get started
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Inactive Tables */}
          {inactiveTables.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Inactive Tables</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {inactiveTables.map((table) => (
                  <Card key={table.id} className="opacity-60">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center justify-between">
                        Table {table.tableNumber}
                        <Badge variant="secondary">
                          Inactive
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {table.location && (
                        <p className="text-sm text-muted-foreground">
                          📍 {table.location}
                        </p>
                      )}
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(table)}
                          className="flex-1"
                        >
                          <Edit className="mr-1 h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(table)}
                          className="flex-1"
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dialogs */}
        <QRCodeDialog
          table={selectedTable}
          open={qrDialogOpen}
          onClose={() => {
            setQrDialogOpen(false);
            setSelectedTable(null);
          }}
        />

        <TableDialog
          open={tableDialogOpen}
          onClose={handleTableDialogClose}
          editingTable={editingTable}
        />

        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Table"
          description={`Are you sure you want to delete Table ${deletingTable?.tableNumber}? This action cannot be undone.`}
        />
      </AdminLayout>
    </AuthGuard>
  );
}