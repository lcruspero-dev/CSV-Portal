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
import { Check, Pencil, Search, X } from "lucide-react";
import React, { useEffect, useState } from "react";
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
}

const ManageEmployees: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] =
    useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const { toast } = useToast();
  const [editingLoginLimit, setEditingLoginLimit] = useState<{
    userId: string;
    value: number;
  } | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("active");
  const [confirmDeactivateOpen, setConfirmDeactivateOpen] = useState(false);
  const [userToDeactivate, setUserToDeactivate] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Load data when filter changes
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await UserAPI.searchUser("csv-all");
        let filteredUsers = response.data;

        // Check which users have profiles
        const usersWithProfileInfo = await Promise.all(
          filteredUsers.map(async (user: User) => {
            try {
              const profileResponse = await UserProfileAPI.getProfileById(
                user._id
              );
              return { ...user, hasProfile: !!profileResponse.data };
            } catch (error) {
              return { ...user, hasProfile: false };
            }
          })
        );

        if (filter === "active") {
          filteredUsers = usersWithProfileInfo.filter(
            (user) => user.status === "active"
          );
        } else if (filter === "inactive") {
          filteredUsers = usersWithProfileInfo.filter(
            (user) => user.status === "inactive"
          );
        }

        setUsers(filteredUsers);

        if (filteredUsers.length === 0) {
          toast({
            title: "No Employees Found",
            description: `No ${filter} employees found`,
            variant: "destructive",
          });
        }
      } catch (error: any) {
        toast({
          title: "Failed to load employees",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filter, toast]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const response = await UserAPI.searchUser(searchQuery);
      let filteredUsers = response.data;

      // Apply current filter to search results
      if (filter === "active") {
        filteredUsers = response.data.filter(
          (user: { status: string }) => user.status === "active"
        );
      } else if (filter === "inactive") {
        filteredUsers = response.data.filter(
          (user: { status: string }) => user.status === "inactive"
        );
      }

      // Check profile status for search results
      const usersWithProfileInfo = await Promise.all(
        filteredUsers.map(async (user: User) => {
          try {
            const profileResponse = await UserProfileAPI.getProfileById(
              user._id
            );
            return { ...user, hasProfile: !!profileResponse.data };
          } catch (error) {
            return { ...user, hasProfile: false };
          }
        })
      );

      setUsers(usersWithProfileInfo);

      if (filteredUsers.length === 0) {
        toast({
          title: "No Employees Found",
          description: "No employees match your search criteria",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Search Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const performStatusChange = async (userId: string, newStatus: string) => {
    try {
      if (newStatus === "inactive") {
        await UserAPI.setUserToInactive(userId);
      } else {
        await UserAPI.setUserToActive(userId);
      }

      // Update the users list based on current filter
      setUsers((prevUsers) => {
        const updatedUsers = prevUsers.map((user) =>
          user._id === userId ? { ...user, status: newStatus } : user
        );

        // If the current filter doesn't match the new status, remove the user
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
        description: `Employee ${
          newStatus === "active" ? "activated" : "deactivated"
        } successfully`,
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Failed",
        description: error.message,
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
          description: error.message,
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
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingLoginLimit(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 pt-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <BackButton />
          <h1 className="text-2xl font-bold text-gray-800">
            Employee Management
          </h1>
          <div></div> {/* Spacer for alignment */}
        </div>

        <Card style={{ width: "70%" }} className="mx-auto">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <CardTitle className="text-xl">Filter by status</CardTitle>
              <select
                value={filter}
                onChange={(e) =>
                  setFilter(e.target.value as "all" | "active" | "inactive")
                }
                className="border p-2 rounded text-sm"
                disabled={loading}
              >
                {/* <option value="all">All Employees</option> */}
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex justify-end">
                <div className="flex w-1/2">
                  <Input
                    type="text"
                    placeholder="Search employee by name ..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    disabled={loading}
                    className="rounded-r-none"
                  />
                  <Button
                    onClick={handleSearch}
                    disabled={loading}
                    className="rounded-l-none"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>

              {users.length > 0 && (
                <div className="space-y-4">
                  {users.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {user.name}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {user.email}
                        </p>
                        <div className="flex items-center mt-1 space-x-3">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              user.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {user.status === "active" ? "Active" : "Inactive"}
                          </span>
                          <Button
                            size="sm"
                            variant="link"
                            onClick={() => viewUserDetails(user._id)}
                            disabled={loadingProfile}
                            className="text-xs text-blue-600 p-0 h-auto flex items-center gap-1"
                          >
                            View Details
                            {user.hasProfile && (
                              <Check className="h-3 w-3 text-green-500" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6 ml-4">
                        <div className="flex flex-col items-center space-y-1">
                          <Label className="text-xs text-gray-500">
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
                                className="h-8 rounded border border-gray-300 px-2 text-sm"
                              >
                                <option value={1}>1</option>
                                <option value={2}>2</option>
                              </select>
                              <Button
                                size="sm"
                                onClick={handleSaveLoginLimit}
                                className="h-8 px-2"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelEdit}
                                className="h-8 px-2"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium px-2 py-1 bg-gray-100 rounded">
                                {user.loginLimit || 1}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  handleEditLoginLimit(
                                    user._id,
                                    user.loginLimit
                                  )
                                }
                                className="h-8 px-2 text-gray-500 hover:text-gray-700"
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-center">
                          <Label
                            htmlFor={`user-status-${user._id}`}
                            className="text-xs text-gray-500 mb-1"
                          >
                            Account Status
                          </Label>
                          <Switch
                            id={`user-status-${user._id}`}
                            checked={user.status === "active"}
                            onCheckedChange={() =>
                              handleStatusToggle(
                                user._id,
                                user.status,
                                user.name
                              )
                            }
                            className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {users.length === 0 && !loading && (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    {filter === "all"
                      ? "No employees found. Try searching for an employee."
                      : `No ${filter} employees found.`}
                  </p>
                </div>
              )}

              {loading && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading employees...</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee Profile Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
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
            <AlertDialogTitle>Confirm Deactivation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate {userToDeactivate?.name}? They
              will no longer be able to access the system.
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
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageEmployees;
