"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Badge } from "@/components/ui/badge";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";

import {
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  TrendingUp,
  Trash2,
  X,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Company {
  companyName: string;
  city?: string;
  state?: string;
}

interface Client {
  id: string;
  name: string;
  clientId: string;
  profilePictureUrl?: string | null;
  email: string;
  mobile?: string | null;
  country?: string | null;
  category?: string | null;
  subCategory?: string | null;
  company?: Company | null;
  companyLogoUrl?: string | null;
  status: "ACTIVE" | "INACTIVE" | string;
  addedBy: string;
  createdAt?: string | null;
}

const BASE = process.env.NEXT_PUBLIC_MAIN; // MUST end with /api/v1

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);
  const [clientNameFilter, setClientNameFilter] = useState("All");
  const [headerCategoryFilter, setHeaderCategoryFilter] = useState("All");

  const placeholderImg = "/placeholder.png";

  async function fetchClients() {
    setLoading(true);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("Token missing — please login again.");
        return;
      }

      const response = await fetch(`${BASE}/clients`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed: ${response.status}`);
      }

      const data = await response.json();
      setClients(data);
      setFilteredClients(data);
    } catch (err: any) {
      setError(err.message || "Error fetching clients");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchClients();
  }, []);

  // Filtering
  useEffect(() => {
    let result = [...clients];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.clientId.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((c) => c.status === statusFilter);
    }

    if (categoryFilter !== "all") {
      result = result.filter((c) => c.category === categoryFilter);
    }

    if (clientNameFilter !== "All") {
      result = result.filter((c) => c.name === clientNameFilter);
    }

    if (headerCategoryFilter !== "All") {
      result = result.filter((c) => c.category === headerCategoryFilter);
    }

    setFilteredClients(result);
    setCurrentPage(1);
  }, [
    searchQuery,
    statusFilter,
    categoryFilter,
    clientNameFilter,
    headerCategoryFilter,
    clients,
  ]);

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const paginated = filteredClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Actions
  const handleView = (id: string) => router.push(`/clients/${id}`);
  const handleEdit = (id: string) => router.push(`/clients/${id}/edit`);
  const handleMove = (id: string) => router.push(`/deals/new?clientId=${id}`);

  const handleDelete = async (client: Client) => {
    if (!confirm(`Delete ${client.name}?`)) return;

    try {
      const response = await fetch(`${BASE}/clients/${client.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      if (!response.ok) throw new Error("Delete failed");

      fetchClients();
    } catch {
      alert("Failed to delete");
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex justify-center items-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      {/* ADD CLIENT */}
      <div className="mb-4 flex justify-end">
        <Button onClick={() => router.push("/clients/new")}>
          + Add Client
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Clients ({filteredClients.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginated.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>{client.clientId}</TableCell>

                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src={client.profilePictureUrl || placeholderImg}
                        />
                        <AvatarFallback>
                          {client.name[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <div className="font-semibold">{client.name}</div>
                        {client.company?.companyName && (
                          <div className="text-xs text-muted-foreground">
                            {client.company.companyName}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.mobile ?? "—"}</TableCell>

                  <TableCell>
                    {client.category ? <Badge>{client.category}</Badge> : "—"}
                  </TableCell>

                  <TableCell>
                    {client.createdAt
                      ? new Date(client.createdAt).toLocaleDateString()
                      : "—"}
                  </TableCell>

                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(client.id)}>
                          <Eye className="mr-2 h-4 w-4" /> View
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => handleEdit(client.id)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => handleMove(client.id)}>
                          <TrendingUp className="mr-2 h-4 w-4" /> Move to Deal
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(client)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
