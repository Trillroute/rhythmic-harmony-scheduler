
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DueDate, FeePlan, LateFeePolicy, NewFeePlan } from "@/hooks/use-fee-plans";
import { toast } from "@/hooks/use-toast";

interface FeePlanFormProps {
  studentId: string;
  initialData?: FeePlan;
  onSubmit: (data: NewFeePlan) => void;
  onCancel: () => void;
  isPending: boolean;
}

export const FeePlanForm: React.FC<FeePlanFormProps> = ({
  studentId,
  initialData,
  onSubmit,
  onCancel,
  isPending
}) => {
  const [title, setTitle] = useState(initialData?.plan_title || "");
  const [totalAmount, setTotalAmount] = useState(initialData?.total_amount.toString() || "0");
  const [dueDates, setDueDates] = useState<DueDate[]>(initialData?.due_dates || []);
  const [enableLateFees, setEnableLateFees] = useState(!!initialData?.late_fee_policy);
  const [lateFeeRate, setLateFeeRate] = useState(initialData?.late_fee_policy?.rate_per_day.toString() || "0.01");
  const [lateFeeMax, setLateFeeMax] = useState(initialData?.late_fee_policy?.maximum.toString() || "0");

  // Add a new due date entry
  const addDueDate = () => {
    setDueDates([
      ...dueDates,
      {
        date: new Date().toISOString(),
        amount: 0,
        description: ""
      }
    ]);
  };

  // Remove a due date
  const removeDueDate = (index: number) => {
    const newDueDates = [...dueDates];
    newDueDates.splice(index, 1);
    setDueDates(newDueDates);
  };

  // Update a due date
  const updateDueDate = (index: number, field: keyof DueDate, value: any) => {
    const newDueDates = [...dueDates];
    newDueDates[index] = { ...newDueDates[index], [field]: value };
    setDueDates(newDueDates);
  };

  // Form submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!title) {
      toast({ title: "Error", description: "Please enter a plan title", variant: "destructive" });
      return;
    }

    if (isNaN(parseFloat(totalAmount)) || parseFloat(totalAmount) <= 0) {
      toast({ title: "Error", description: "Please enter a valid total amount", variant: "destructive" });
      return;
    }

    if (dueDates.length === 0) {
      toast({ title: "Error", description: "Please add at least one due date", variant: "destructive" });
      return;
    }

    // Check if due dates add up to total amount
    const dueDateSum = dueDates.reduce((sum, date) => sum + date.amount, 0);
    if (Math.abs(dueDateSum - parseFloat(totalAmount)) > 0.01) {
      toast({ 
        title: "Error", 
        description: `Due date amounts (${dueDateSum}) don't match total amount (${totalAmount})`, 
        variant: "destructive" 
      });
      return;
    }

    // Prepare late fee policy if enabled
    let lateFeePolicy: LateFeePolicy | undefined = undefined;
    if (enableLateFees) {
      const rate = parseFloat(lateFeeRate);
      const max = parseFloat(lateFeeMax);
      
      if (isNaN(rate) || rate <= 0) {
        toast({ title: "Error", description: "Please enter a valid late fee rate", variant: "destructive" });
        return;
      }
      
      if (isNaN(max) || max <= 0) {
        toast({ title: "Error", description: "Please enter a valid maximum late fee", variant: "destructive" });
        return;
      }
      
      lateFeePolicy = {
        rate_per_day: rate,
        maximum: max
      };
    }

    // Prepare form data
    const formData: NewFeePlan = {
      student_id: studentId,
      plan_title: title,
      total_amount: parseFloat(totalAmount),
      due_dates: dueDates,
      late_fee_policy: lateFeePolicy
    };

    onSubmit(formData);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{initialData ? "Edit Fee Plan" : "Create Fee Plan"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Plan Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Term 1 2023-24"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalAmount">Total Amount</Label>
            <Input
              id="totalAmount"
              type="number"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="10000"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Due Dates</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={addDueDate}
              >
                <PlusIcon className="h-4 w-4 mr-1" /> Add Date
              </Button>
            </div>

            <div className="space-y-4">
              {dueDates.map((dueDate, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-4">
                    <Label htmlFor={`due-date-${index}`} className="text-xs">Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dueDate.date ? format(new Date(dueDate.date), "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dueDate.date ? new Date(dueDate.date) : undefined}
                          onSelect={(date) => updateDueDate(index, "date", date?.toISOString())}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="col-span-3">
                    <Label htmlFor={`due-amount-${index}`} className="text-xs">Amount</Label>
                    <Input
                      id={`due-amount-${index}`}
                      type="number"
                      value={dueDate.amount}
                      onChange={(e) => updateDueDate(index, "amount", parseFloat(e.target.value))}
                      placeholder="Amount"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div className="col-span-4">
                    <Label htmlFor={`due-desc-${index}`} className="text-xs">Description</Label>
                    <Input
                      id={`due-desc-${index}`}
                      value={dueDate.description || ""}
                      onChange={(e) => updateDueDate(index, "description", e.target.value)}
                      placeholder="Description (optional)"
                    />
                  </div>
                  
                  <div className="col-span-1">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeDueDate(index)}
                      className="h-10 w-10"
                    >
                      <Trash2Icon className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}

              {dueDates.length === 0 && (
                <div className="text-center p-4 border border-dashed rounded-md">
                  <p className="text-sm text-muted-foreground">No due dates added</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t">
            <div className="flex items-center space-x-2">
              <input
                id="enableLateFees"
                type="checkbox"
                checked={enableLateFees}
                onChange={(e) => setEnableLateFees(e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="enableLateFees">Enable Late Fee</Label>
            </div>

            {enableLateFees && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="lateFeeRate">Daily Rate (%)</Label>
                  <Input
                    id="lateFeeRate"
                    type="number"
                    value={lateFeeRate}
                    onChange={(e) => setLateFeeRate(e.target.value)}
                    placeholder="0.01"
                    min="0"
                    step="0.01"
                    required={enableLateFees}
                  />
                  <p className="text-xs text-muted-foreground">
                    % of due amount charged per day late
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lateFeeMax">Maximum Late Fee</Label>
                  <Input
                    id="lateFeeMax"
                    type="number"
                    value={lateFeeMax}
                    onChange={(e) => setLateFeeMax(e.target.value)}
                    placeholder="1000"
                    min="0"
                    step="0.01"
                    required={enableLateFees}
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum late fee that can be charged
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : initialData ? "Update" : "Create"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
