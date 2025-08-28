
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Employee } from "@/lib/types";

interface EditEmployeeDialogProps {
  employee: Employee;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onEmployeeUpdate: () => void;
}

export function EditEmployeeDialog({ 
  employee,
  isOpen,
  onOpenChange,
  onEmployeeUpdate 
}: EditEmployeeDialogProps) {
  const [editedEmployee, setEditedEmployee] = useState(employee);

  useEffect(() => {
    setEditedEmployee(employee);
  }, [employee]);

  const handleUpdateEmployee = async () => {
    try {
      const response = await fetch(`/api/employees/${employee.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedEmployee),
      });

      if (response.ok) {
        onEmployeeUpdate();
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Failed to update employee:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>
          <DialogDescription>Update the employee details below</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="employee_id">Employee ID</Label>
            <Input
              id="employee_id"
              value={editedEmployee.employee_id}
              onChange={(e) =>
                setEditedEmployee({ ...editedEmployee, employee_id: e.target.value })
              }
              placeholder="EMP001"
            />
          </div>
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={editedEmployee.name}
              onChange={(e) =>
                setEditedEmployee({ ...editedEmployee, name: e.target.value })
              }
              placeholder="John Doe"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={editedEmployee.email}
              onChange={(e) =>
                setEditedEmployee({ ...editedEmployee, email: e.target.value })
              }
              placeholder="john.doe@company.com"
            />
          </div>
          <div>
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              value={editedEmployee.department}
              onChange={(e) =>
                setEditedEmployee({ ...editedEmployee, department: e.target.value })
              }
              placeholder="Engineering"
            />
          </div>
          <div>
            <Label htmlFor="position">Position</Label>
            <Input
              id="position"
              value={editedEmployee.position}
              onChange={(e) =>
                setEditedEmployee({ ...editedEmployee, position: e.target.value })
              }
              placeholder="Software Developer"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateEmployee}>Save Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
