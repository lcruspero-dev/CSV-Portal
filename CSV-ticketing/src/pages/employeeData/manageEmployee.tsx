/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserAPI, UserProfileAPI } from "@/API/endpoint";
import UserDetails from "@/components/kit/UserDetails";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { 
  Check, 
  Pencil, 
  Search, 
  X, 
  Filter,
  Users,
  UserX,
  Loader2
} from "lucide-react";
import React, { useEffect, useState, useCallback } from "react";
import BackButton from "../../components/kit/BackButton";

interface User {
  _id: string;
  name: string;
  email: string;
  status: string;
  isAdmin: boolean;
  role: string;
  loginLimit?: number;
}

interface UserProfile {
  userId: string;
  firstName: string;
  lastName: string;
  middleName: string;
  streetAddress: string;
  barangay: string;
  cityMunicipality: string;
  province: string;
  idNum: string;
  zipCode: string;
  personalEmail: string;
  contactNumber: string;
  dateOfBirth: string;
  emergencyContactPerson: string;
  emergencyContactNumber: string;
  relationship: string;
  civilStatus: string;
  gender: string;
  pagibigNo: string;
  philhealthNo: string;
  sssNo: string;
  tinNo: string;
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  
}

interface UserWithProfile extends User {
  hasProfile?: boolean;
  profileLoading?: boolean;
}

type FilterType = "all" | "active" | "inactive";

const ManageEmployees: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const { toast } = useToast();
  const [editingLoginLimit, setEditingLoginLimit] = useState<{
    userId: string;
    value: number;
  } | null>(null);
  const [filter, setFilter] = useState<FilterType>("active");
  const [confirmDeactivateOpen, setConfirmDeactivateOpen] = useState(false);
  const [userToDeactivate, setUserToDeactivate] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Memoized function to check user profiles
  const checkUserProfiles = useCallback(async (userList: User[]): Promise<UserWithProfile[]> => {
    return await Promise.all(
      userList.map(async (user: User) => {
        try {
          const profileResponse = await UserProfileAPI.getProfileById(user._id);
          return { ...user, hasProfile: !!profileResponse.data, profileLoading: false };
        } catch (error) {
          return { ...user, hasProfile: false, profileLoading: false };
        }
      })
    );
  }, []);

  // Load data when filter changes
  const loadUsers = useCallback(async (searchTerm?: string) => {
    setLoading(true);
    try {
      const response = await UserAPI.searchUser(searchTerm || "csv-all");
      let filteredUsers = response.data;

      // Apply status filter
      if (filter !== "all") {
        filteredUsers = filteredUsers.filter(
          (user: User) => user.status === filter
        );
      }

      const usersWithProfileInfo = await checkUserProfiles(filteredUsers);
      setUsers(usersWithProfileInfo);

      if (filteredUsers.length === 0) {
        toast({
          title: "No Employees Found",
          description: searchTerm 
            ? "No employees match your search criteria" 
            : `No ${filter} employees found`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Failed to load employees",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [filter, toast, checkUserProfiles]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadUsers();
      return;
    }
    await loadUsers(searchQuery);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const performStatusChange = async (userId: string, newStatus: string) => {
    try {
      if (newStatus === "inactive") {
        await UserAPI.setUserToInactive(userId);
      } else {
        await UserAPI.setUserToActive(userId);
      }

      setUsers((prevUsers) => {
        const updatedUsers = prevUsers.map((user) =>
          user._id === userId ? { ...user, status: newStatus } : user
        );

        // Remove user from list if they don't match current filter
        if (
          (filter === "active" && newStatus === "inactive") ||
          (filter === "inactive" && newStatus === "active")
        ) {
          return updatedUsers.filter((user) => user._id !== userId);
        }
        return updatedUsers;
      });

      toast({
        title: "Success",
        description: `Employee ${newStatus === "active" ? "activated" : "deactivated"} successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to update status",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setConfirmDeactivateOpen(false);
      setUserToDeactivate(null);
    }
  };

  const handleStatusToggle = async (
    userId: string,
    currentStatus: string,
    userName: string
  ) => {
    if (!userId) {
      toast({
        title: "Error",
        description: "Invalid employee ID",
        variant: "destructive",
      });
      return;
    }

    // If activating, proceed directly
    if (currentStatus === "inactive") {
      await performStatusChange(userId, "active");
      return;
    }

    // If deactivating, show confirmation
    setUserToDeactivate({ id: userId, name: userName });
    setConfirmDeactivateOpen(true);
  };

  const viewUserDetails = async (userId: string) => {
    setLoadingProfile(true);
    try {
      const response = await UserProfileAPI.getProfileById(userId);
      setSelectedUserProfile(response.data);
      setModalOpen(true);
    } catch (error: any) {
      if (error.message === "User profile not found") {
        // Create an empty profile object with just the userId
        setSelectedUserProfile({
          userId,
          firstName: "",
          lastName: "",
          middleName: "",
          streetAddress: "",
          barangay: "",
          cityMunicipality: "",
          province: "",
          idNum: "",
          zipCode: "",
          personalEmail: "",
          contactNumber: "",
          dateOfBirth: "",
          emergencyContactPerson: "",
          emergencyContactNumber: "",
          relationship: "",
          civilStatus: "",
          gender: "",
          pagibigNo: "",
          philhealthNo: "",
          sssNo: "",
          tinNo: "",
          _id: "",
          createdAt: "",
          updatedAt: "",
          __v: 0,
        } as UserProfile);
        setModalOpen(true);
      } else {
        toast({
          title: "Failed to Load Profile",
          description: error.message || "Please try again later",
          variant: "destructive",
        });
      }
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleEditLoginLimit = (userId: string, currentLimit: number = 1) => {
    setEditingLoginLimit({ userId, value: currentLimit });
  };

  const handleSaveLoginLimit = async () => {
    if (!editingLoginLimit) return;

    try {
      await UserAPI.updateLoginLimit(editingLoginLimit.userId, {
        loginLimit: editingLoginLimit.value,
      });

      setUsers(
        users.map((user) =>
          user._id === editingLoginLimit.userId
            ? { ...user, loginLimit: editingLoginLimit.value }
            : user
        )
      );

      setEditingLoginLimit(null);
      toast({
        title: "Success",
        description: "Login limit updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Failed to update login limit",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingLoginLimit(null);
  };

  const getEmployeeCountText = () => {
    const count = users.length;
    if (filter === "all") return `${count} employee${count !== 1 ? 's' : ''}`;
    return `${count} ${filter} employee${count !== 1 ? 's' : ''}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 pt-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Employee Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage employee accounts, profiles, and access
              </p>
            </div>
          </div>
        </div>

        <Card className="mx-auto">
          <CardHeader className="pb-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Employees
                </CardTitle>
                <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                  <Filter className="h-4 w-4 text-gray-600" />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as FilterType)}
                    className="bg-transparent border-none text-sm focus:outline-none focus:ring-0"
                    disabled={loading}
                  >
                    <option value="all">All Employees</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                  </select>
                </div>
                {users.length > 0 && (
                  <span className="text-sm text-gray-500">
                    {getEmployeeCountText()}
                  </span>
                )}
              </div>

              {/* Search */}
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={loading}
                    className="pl-10 w-80"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  Search
                </Button>
              </form>
            </div>
          </CardHeader>

          <CardContent>
            {/* Employee List */}
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-white hover:shadow-md transition-all duration-200"
                >
                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-gray-900 truncate">
                        {user.name}
                      </p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          user.status === "active"
                            ? "bg-green-100 text-green-800 border border-green-200"
                            : "bg-red-100 text-red-800 border border-red-200"
                        }`}
                      >
                        {user.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate mt-1">
                      {user.email}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <Button
                        size="sm"
                        variant="link"
                        onClick={() => viewUserDetails(user._id)}
                        disabled={loadingProfile}
                        className="h-6 px-0 text-blue-600 hover:text-blue-800 text-xs font-medium"
                      >
                        {loadingProfile ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : (
                          <>
                            View Details
                            {user.hasProfile && (
                              <Check className="h-3 w-3 text-green-500 ml-1" />
                            )}
                          </>
                        )}
                      </Button>
                      {user.isAdmin && (
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                          Admin
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-6 ml-6">
                    {/* Login Limit */}
                    <div className="flex flex-col items-center space-y-2">
                      <Label className="text-xs text-gray-500 font-medium">
                        Daily Login Limit
                      </Label>
                      {editingLoginLimit?.userId === user._id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={editingLoginLimit.value}
                            onChange={(e) =>
                              setEditingLoginLimit({
                                ...editingLoginLimit,
                                value: parseInt(e.target.value),
                              })
                            }
                            className="h-8 rounded border border-gray-300 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {[1, 2, 3, 4, 5].map((num) => (
                              <option key={num} value={num}>
                                {num}
                              </option>
                            ))}
                          </select>
                          <Button
                            size="sm"
                            onClick={handleSaveLoginLimit}
                            className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEdit}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium px-3 py-1 bg-gray-100 rounded border min-w-12 text-center">
                            {user.loginLimit || 1}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              handleEditLoginLimit(user._id, user.loginLimit)
                            }
                            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Status Toggle */}
                    <div className="flex flex-col items-center space-y-2">
                      <Label className="text-xs text-gray-500 font-medium">
                        Account Status
                      </Label>
                      <Switch
                        checked={user.status === "active"}
                        onCheckedChange={() =>
                          handleStatusToggle(user._id, user.status, user.name)
                        }
                        className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty States */}
            {users.length === 0 && !loading && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">
                  No employees found
                </p>
                <p className="text-gray-400 mt-2">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : `No ${filter} employees in the system`}
                </p>
              </div>
            )}

            {loading && (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Loading employees...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Employee Profile Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedUserProfile && (
            <UserDetails
              userData={selectedUserProfile}
              isNewProfile={!selectedUserProfile._id}
              userId={selectedUserProfile.userId}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Deactivation Confirmation Dialog */}
      <AlertDialog
        open={confirmDeactivateOpen}
        onOpenChange={setConfirmDeactivateOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <UserX className="h-5 w-5 text-red-600" />
              Confirm Deactivation
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate <strong>{userToDeactivate?.name}</strong>? 
              They will no longer be able to access the system until their account is reactivated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (userToDeactivate) {
                  performStatusChange(userToDeactivate.id, "inactive");
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Deactivate Employee
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageEmployees;