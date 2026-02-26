import { timer, TimeRecordAPI } from "@/API/endpoint";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useRef, useState } from "react";

export const RunnigTimeDialog = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
        
      <DialogTrigger>
        <Button variant="outline" className="text-xs">
          Rnning Time
        </Button>
      </DialogTrigger>

      <DialogContent>

        <DialogHeader>
          <DialogTitle>Breaks Monitoring</DialogTitle>
          <DialogDescription>
            View employees on break
            <span className="ml-2 text-xs text-green-600">Current Time:</span>
          </DialogDescription>
        </DialogHeader>


        <div className=""> 
<Button
variant="outline"
disabled={loading}
className="text-xs" 
>
    {loading ? "Refreshing..." : "Refresh Data"}
</Button>
        </div>

        <div>
            <div className="overflow-auto max-h-[60vh] relative">
                {error && (
                    <div>
                        No logins running time found.
                    </div>
                )}

                {!error && (
                    <>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Employee Name</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Running Time</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
return (
    <tr>
        <td>

        </td>
    </tr>
)
                        </tbody>
                    </table>
                    </>
                )}
            </div>

        </div>



      </DialogContent>


    </Dialog>
  );
};
