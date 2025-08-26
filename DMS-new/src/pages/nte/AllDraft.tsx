import { NteAPI } from "@/API/endpoint";
import BackButton from "@/components/ui/backButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableActions } from "@/components/ui/NteDialogs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AxiosResponse } from "axios";
import { Search } from "lucide-react";
import React, { useEffect, useState } from "react";

interface NteDetails {
  employeeId: string;
  name: string;
  position: string;
  dateIssued: string;
  issuedBy: string;
  offenseType: string;
  offenseDescription: string;
  file: string | null;
  employeeSignatureDate: string | null;
  authorizedSignatureDate: string | null;
}

interface NteItem {
  nte: NteDetails;
  _id: string;
  status: "DRAFT";
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface NteTableProps {
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const NteTable: React.FC<NteTableProps> = () => {
  const [data, setData] = useState<NteItem[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response: AxiosResponse<NteItem[]> = await NteAPI.getNteByStatus(
        "DRAFT"
      );

      if (response?.data) {
        setData(response.data);
      } else {
        setData([]);
        setError("No data received from server");
      }
    } catch (error) {
      setData([]);
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred while fetching data"
      );
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // const handleEdit = (id: string) => {
  //   if (onEdit) {
  //     onEdit(id);
  //   }
  // };

  // const handleDelete = (id: string) => {
  //   if (onDelete) {
  //     onDelete(id);
  //   }
  // };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const truncateText = (text: string, limit: number) => {
    if (text.length <= limit) return text;
    return `${text.slice(0, limit)}...`;
  };

  // Filter data based on search term
  const filteredData = data.filter((item) =>
    item.nte.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const getStatusColor = (status: NteItem["status"]): string => {
    const statusColors = {
      DRAFT: "bg-green-100 text-green-900",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusDisplay = (status: NteItem["status"]): string => {
    const statusDisplays = {
      DRAFT: "Draft",
    };
    return statusDisplays[status] || status;
  };

  const formatDate = (dateString: string) => {
    // Split YYYY-MM-DD into parts
    const [year, month, day] = dateString.split("-").map(Number);

    // Custom month names mapping
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    // Format as "Month DD, YYYY"
    return `${months[month - 1]} ${day}, ${year}`;
  };

  return (
    <div className="w-full overflow-x-auto px-6">
      <div className="text-2xl text-gray-700 text-center">DRAFTS</div>

      <div className="mb-4 flex items-center justify-between gap-2">
        <BackButton />
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by employee name..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold bg-gray-800 text-white border-r text-center">
                Employee Name
              </TableHead>
              <TableHead className="font-bold bg-gray-800 text-white border-r text-center">
                Position
              </TableHead>
              <TableHead className="font-bold bg-gray-800 text-white border-r text-center">
                Date Issued
              </TableHead>
              <TableHead className="font-bold bg-gray-800 text-white border-r text-center">
                Policy
              </TableHead>
              <TableHead className="font-bold bg-gray-800 text-white border-r text-center">
                Description
              </TableHead>
              <TableHead className="font-bold bg-gray-800 text-white border-r text-center">
                Created By
              </TableHead>
              <TableHead className="font-bold bg-gray-800 text-white border-r text-center">
                Status
              </TableHead>
              <TableHead className="font-bold bg-gray-800 text-white border-r text-center">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-red-600">
                  {error}
                </TableCell>
              </TableRow>
            ) : currentData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  {searchTerm
                    ? "No matching records found"
                    : "No records found"}
                </TableCell>
              </TableRow>
            ) : (
              currentData.map((item) => (
                <TableRow key={item._id}>
                  <TableCell>{item.nte.name}</TableCell>
                  <TableCell>{item.nte.position}</TableCell>
                  <TableCell>{formatDate(item.nte.dateIssued)}</TableCell>
                  <TableCell className="capitalize">
                    {item.nte.offenseType}
                  </TableCell>
                  <TableCell
                    title={item.nte.offenseDescription}
                    className="max-w-xs truncate"
                  >
                    {truncateText(item.nte.offenseDescription, 50)}
                  </TableCell>
                  <TableCell>{item.createdBy}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {getStatusDisplay(item.status)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <TableActions item={item} onRefresh={fetchData} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!loading && !error && filteredData.length > 0 && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="text-sm text-gray-500">
            Showing {startIndex + 1} to{" "}
            {Math.min(endIndex, filteredData.length)} of {filteredData.length}{" "}
            results
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NteTable;
