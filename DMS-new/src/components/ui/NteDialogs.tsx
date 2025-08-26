/* eslint-disable @typescript-eslint/no-unused-vars */
import { NteAPI } from "@/API/endpoint";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Pencil, Trash2 } from "lucide-react";
import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

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

interface NteDialogsProps {
  item: NteItem;
  onEdit: () => void;
  onDelete: (id: string) => void;
  onClose?: () => void;
}

interface FormValues {
  employeeId: string;
  name: string;
  position: string;
  dateIssued: string;
  issuedBy: string;
  offenseType: PolicyType;
  otherDescription: string;
  description: string;
  offenseDescription: string;
  employeeSignatureDate: string | null; // Add this property
  authorizedSignatureDate: string | null; // Add this property
}

type PolicyType = "attendance" | "cocd" | "other";

const determineInitialPolicyType = (backendOffenseType: string): PolicyType => {
  const lowerCaseType = backendOffenseType.toLowerCase();
  if (
    lowerCaseType.includes("tardiness") ||
    lowerCaseType.includes("absence") ||
    lowerCaseType.includes("ncns")
  ) {
    return "attendance";
  } else if (
    lowerCaseType.includes("behavior") ||
    lowerCaseType.includes("destruction") ||
    lowerCaseType.includes("insubordination") ||
    lowerCaseType.includes("record") ||
    lowerCaseType.includes("safety")
  ) {
    return "cocd";
  }
  return "other";
};

const determineInitialDescription = (backendOffenseType: string): string => {
  return backendOffenseType.toLowerCase();
};

const NteDialogs: React.FC<NteDialogsProps> = ({ item, onEdit, onDelete }) => {
  const [showDeleteDialog, setShowDeleteDialog] =
    React.useState<boolean>(false);
  const [showEditDialog, setShowEditDialog] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [showOtherInput, setShowOtherInput] = React.useState<boolean>(false);
  const [showDescription, setShowDescription] = React.useState<boolean>(true);
  const { toast } = useToast();

  const initialPolicyType = determineInitialPolicyType(item.nte.offenseType);

  const { control, handleSubmit, setValue, watch } = useForm<FormValues>({
    defaultValues: {
      employeeId: item?.nte.employeeId || "",
      name: item?.nte.name || "",
      position: item?.nte.position || "",
      dateIssued: item?.nte.dateIssued
        ? new Date(item.nte.dateIssued).toISOString().split("T")[0]
        : "",
      issuedBy: item?.nte.issuedBy || "",
      offenseType: initialPolicyType,
      otherDescription:
        initialPolicyType === "other" ? item?.nte.offenseType : "",
      description:
        initialPolicyType !== "other"
          ? determineInitialDescription(item?.nte.offenseType)
          : "",
      offenseDescription: item?.nte.offenseDescription || "",
      employeeSignatureDate: item?.nte.employeeSignatureDate || null,
      authorizedSignatureDate: item?.nte.authorizedSignatureDate || null,
    },
  });

  useEffect(() => {
    setShowOtherInput(initialPolicyType === "other");
    setShowDescription(initialPolicyType !== "other");
  }, [initialPolicyType]);

  const handleDelete = async (): Promise<void> => {
    try {
      setLoading(true);
      await NteAPI.deleteNte(item._id);
      toast({
        title: "Success",
        variant: "success",
        description: "NTE deleted successfully",
      });
      onDelete(item._id);
      setShowDeleteDialog(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete NTE",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (data: FormValues): Promise<void> => {
    try {
      setLoading(true);
      const finalOffenseType =
        data.offenseType === "other" ? data.otherDescription : data.description;

      const updateData = {
        nte: {
          employeeId: data.employeeId,
          name: data.name,
          position: data.position,
          dateIssued: data.dateIssued,
          issuedBy: data.issuedBy,
          offenseType: finalOffenseType,
          offenseDescription: data.offenseDescription,
          file: item.nte.file,
          employeeSignatureDate: data.employeeSignatureDate,
          authorizedSignatureDate: data.authorizedSignatureDate,
        },
        status: "PER" as const, // Changed from "DRAFT" to "PER"
      };

      const response = await NteAPI.updateNte(item._id, updateData);

      // Check response data for validation message
      if (
        response?.data?.message?.includes("Validation failed") ||
        response?.data?.stack?.includes("ValidationError")
      ) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Please input all required fields",
        });
        return;
      }

      toast({
        title: "Success",
        variant: "success",
        description: "NTE updated successfully",
      });
      onEdit();
      setShowEditDialog(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update NTE",
      });
    } finally {
      setLoading(false);
    }
  };

  const offenseType = watch("offenseType");

  return (
    <>
      <div className="flex justify-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowEditDialog(true)}
          className="h-8 w-8 p-0"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowDeleteDialog(true)}
          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              draft NTE record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Notice to Explain</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(handleEditSubmit)} className="space-y-4">
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
                    onValueChange={(value: PolicyType) => {
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
                    <Select value={field.value} onValueChange={field.onChange}>
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
                    className="w-full min-h-[100px] p-2 border rounded-md"
                  />
                </div>
              )}
            />

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowEditDialog(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {loading ? "Updating..." : "Create NTE"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

interface TableActionsProps {
  item: NteItem;
  onRefresh: () => void;
}

const TableActions: React.FC<TableActionsProps> = ({ item, onRefresh }) => {
  return <NteDialogs item={item} onEdit={onRefresh} onDelete={onRefresh} />;
};

export { NteDialogs, TableActions };
