
import React, { useState } from "react";
import { useStudentInvoices } from "@/hooks/use-student-invoices";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangleIcon, CreditCardIcon } from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FeePlanDetails } from "../../fee-plans/FeePlanDetails";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SkeletonCard } from "@/components/ui/skeleton-card";

interface StudentInvoicesTabProps {
  studentId: string;
}

export const StudentInvoicesTab: React.FC<StudentInvoicesTabProps> = ({ studentId }) => {
  const [activeTab, setActiveTab] = useState("fee-plans");
  const { invoices, isLoading, error } = useStudentInvoices(studentId);

  if (error) {
    return (
      <div className="p-6 rounded-lg bg-destructive/10 flex flex-col items-center justify-center">
        <AlertTriangleIcon className="h-10 w-10 text-destructive mb-4" />
        <h3 className="text-lg font-medium mb-2">Error Loading Payment Data</h3>
        <p className="text-muted-foreground mb-4">
          {error instanceof Error ? error.message : "Failed to load payment data"}
        </p>
      </div>
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList>
        <TabsTrigger value="fee-plans">Fee Plans</TabsTrigger>
        <TabsTrigger value="invoices">Invoices</TabsTrigger>
      </TabsList>

      <TabsContent value="fee-plans" className="space-y-4">
        <ErrorBoundary>
          <FeePlanDetails studentId={studentId} />
        </ErrorBoundary>
      </TabsContent>

      <TabsContent value="invoices" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCardIcon className="h-5 w-5" />
              Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <SkeletonCard variant="table" rows={5} header={false} />
            ) : Array.isArray(invoices) && invoices.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.id.substring(0, 8)}</TableCell>
                        <TableCell>{invoice.createdAt && format(new Date(invoice.createdAt), "MMM d, yyyy")}</TableCell>
                        <TableCell>₹{invoice.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              invoice.status === "paid"
                                ? "success"
                                : invoice.status === "pending"
                                ? "outline"
                                : invoice.status === "overdue"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{invoice.dueDate && format(new Date(invoice.dueDate), "MMM d, yyyy")}</TableCell>
                        <TableCell>
                          {invoice.packId
                            ? "Session Pack"
                            : invoice.planId
                            ? "Course Plan"
                            : "Other"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="h-32 flex flex-col items-center justify-center">
                <p className="text-muted-foreground">No invoices found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
