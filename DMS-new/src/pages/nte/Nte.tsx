/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NteAPI, UserAPI } from "@/API/endpoint";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";

interface User {
  _id: string;
  name: string;
  position: string;
}

interface Step {
  id: number;
  label: string;
  isActive: boolean;
}

const Nte: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [showDescription, setShowDescription] = useState(true);

  // Check authentication
  const user = localStorage.getItem("user");
  const isAuthenticated = !!user;

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const steps: Step[] = [
    { id: 1, label: "Superior Input", isActive: true },
    { id: 2, label: "Employee Response", isActive: false },
    { id: 3, label: "Superior Assessment", isActive: false },
    {
      id: 4,
      label: "Coaching Action Plan & Employee Signature",
      isActive: false,
    },
    { id: 5, label: "1st Level Sup Signature", isActive: false },
    { id: 6, label: "2nd Level Sup Signature", isActive: false },
  ];

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { control, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      employeeId: "",
      name: "",
      position: "",
      dateIssued: "",
      issuedBy: "",
      offenseType: "",
      otherDescription: "",
      description: "",
      offenseDescription: "",
    },
  });

  const offenseType = watch("offenseType");

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.length > 2) {
        try {
          const response = await UserAPI.searchUser(searchQuery);
          const filteredUsers = response.data.filter(
            (user: { status: string }) => user.status !== "inactive"
          );
          setUsers(filteredUsers);
        } catch (error) {
          console.error("Error searching users:", error);
        }
      } else {
        setUsers([]);
      }
    };

    const debounceTimeout = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);

  const handleNteSubmission = async (
    data: any,
    submitStatus: "PER" | "DRAFT"
  ) => {
    if (!selectedUser && submitStatus === "PER") {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select an employee",
      });
      return;
    }

    // Determine the final offense type based on selection
    const finalOffenseType =
      data.offenseType === "other" ? data.otherDescription : data.description;

    setLoading(true);
    try {
      const nteData = {
        nte: {
          employeeId: selectedUser?._id,
          name: data.name,
          position: data.position,
          dateIssued: data.dateIssued,
          issuedBy: data.issuedBy,
          offenseType: finalOffenseType,
          offenseDescription: data.offenseDescription,
        },
        status: submitStatus,
      };

      await NteAPI.createNte(nteData);
      toast({
        variant: "success",
        title: "Success",
        description:
          submitStatus === "PER"
            ? "NTE created successfully"
            : "Draft saved successfully",
      });

      navigate("/");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          submitStatus === "PER"
            ? "Failed to create NTE"
            : "Failed to save draft",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-1">
      <Card className="max-w-3xl mx-auto h-full flex flex-col">
        <CardHeader className="flex-none">
          <CardTitle className="text-xl font-semibold text-gray-700">
            NOTICE TO EXPLAIN
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col">
          <div className="flex-none relative mb-6">
            <div className="absolute top-[11px] left-0 right-0 h-[1px] bg-gray-200" />
            <div className="relative flex justify-between items-start px-2">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className="flex flex-col items-center"
                  style={{ minWidth: "100px" }}
                >
                  <div
                    className={`w-[22px] h-[22px] rounded-full border-2 ${
                      step.isActive
                        ? "bg-blue-500 border-blue-500"
                        : "bg-white border-gray-300"
                    } relative z-10`}
                  />
                  <span
                    className={`text-xs mt-2 text-center leading-tight ${
                      step.isActive ? "text-blue-500" : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1">
            <div className="space-y-4 max-w-xl mx-auto px-4">
              <div>
                <label className="block text-sm font-medium text-gray-800">
                  Search Employee:
                </label>
                <Input
                  placeholder="Search employee..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (selectedUser) setSelectedUser(null);
                  }}
                />
                {users.length > 0 && (
                  <div className="mt-2 border rounded-md">
                    {users.map((user) => (
                      <div
                        key={user._id}
                        className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setValue("employeeId", user._id);
                          setValue("name", user.name);
                          setSearchQuery("");
                        }}
                      >
                        {user.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Controller
                name="employeeId"
                control={control}
                render={({ field }) => (
                  <Input {...field} readOnly className="hidden" />
                )}
              />

              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-800">
                      Employee Name:
                    </label>
                    <Input {...field} readOnly />
                  </div>
                )}
              />

              <Controller
                name="position"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-800">
                      Position:
                    </label>
                    <Input {...field} />
                  </div>
                )}
              />

              <Controller
                name="issuedBy"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-800">
                      Issued by:
                    </label>
                    <Input {...field} />
                  </div>
                )}
              />

              <Controller
                name="offenseType"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-800">
                      Policy Type:
                    </label>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        setShowOtherInput(value === "other");
                        setShowDescription(value !== "other");
                        if (value !== "other") {
                          setValue("otherDescription", "");
                        }
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select policy type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="attendance">Attendance</SelectItem>
                        <SelectItem value="cocd">
                          Code of Conduct and Discipline
                        </SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />

              {showDescription && (
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium text-gray-800">
                        Description:
                      </label>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select description" />
                        </SelectTrigger>
                        <SelectContent>
                          {(offenseType === "attendance"
                            ? [
                                "Tardiness",
                                "Unauthorized/Unexcused Absence",
                                "No Call No Show (NCNS)",
                              ]
                            : [
                                "Behavior at Work",
                                "Destruction of Property",
                                "Insubordination",
                                "Record Keeping",
                                "Safety and Security",
                              ]
                          ).map((desc) => (
                            <SelectItem key={desc} value={desc.toLowerCase()}>
                              {desc}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                />
              )}

              {showOtherInput && (
                <Controller
                  name="otherDescription"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium text-gray-800">
                        Please Specify:
                      </label>
                      <Input
                        {...field}
                        placeholder="Enter policy type"
                        className="w-full placeholder:text-xs"
                      />
                    </div>
                  )}
                />
              )}

              <Controller
                name="dateIssued"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-800">
                      Date Issued:
                    </label>
                    <div className="relative">
                      <Input type="date" {...field} className="w-full" />
                      <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                )}
              />

              <Controller
                name="offenseDescription"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-800">
                      Details:
                    </label>
                    <textarea
                      {...field}
                      className="w-full min-h-[100px] p-2 border rounded-md placeholder:text-xs"
                      placeholder="Description of Offense/s (Cite Specific Offense/s or underperformance under the code of Conduct and Discipline, including dates, and other necessary details) and amount of loss/damage,if any."
                    />
                  </div>
                )}
              />

              <div>
                <Input type="file" className="w-full cursor-pointer" />
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleSubmit((data) =>
                    handleNteSubmission(data, "PER")
                  )}
                  className="bg-blue-500 text-white hover:bg-blue-600"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create NTE"}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleSubmit((data) =>
                    handleNteSubmission(data, "DRAFT")
                  )}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Draft"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Nte;
