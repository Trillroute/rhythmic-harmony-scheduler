
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { useUsers } from "@/hooks/use-users";
import { UserRole } from "@/lib/types";
import { format } from "date-fns";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  role: z.enum(["admin", "teacher", "student"]),
  notes: z.string().optional(),
});

const UserManagement = () => {
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [filters, setFilters] = useState<{ role?: UserRole; email?: string }>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | undefined>(undefined);
  
  const { users, isLoading, updateUser, deleteUser, isPendingUpdate, isPendingDelete } = useUsers(filters);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "student",
      notes: "",
    },
  });
  
  // Update form when editing user changes
  useEffect(() => {
    if (editingUser) {
      form.reset({
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role,
        notes: editingUser.studentData?.notes || "",
      });
    } else {
      form.reset({
        name: "",
        email: "",
        role: "student",
        notes: "",
      });
    }
  }, [editingUser, form]);
  
  // Handle search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters({
        ...filters,
        email: searchQuery.length >= 3 ? searchQuery : undefined
      });
    }, 300);
    
    return () => clearTimeout(handler);
  }, [searchQuery]);
  
  // Handle role filter
  useEffect(() => {
    setFilters({
      ...filters,
      role: roleFilter
    });
  }, [roleFilter]);
  
  function onSubmit(values: z.infer<typeof formSchema>) {
    if (editingUser) {
      updateUser({
        id: editingUser.id,
        ...values,
        studentData: values.role === "student" ? {
          preferredSubjects: editingUser.studentData?.preferredSubjects || [],
          packs: [],
          notes: values.notes
        } : undefined
      });
    } else {
      // In a real implementation, we would call an API to create the user
      toast.info("User creation would create the user. This is just a demo.");
    }
    setOpen(false);
    setEditingUser(null);
  }
  
  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setOpen(true);
  };
  
  const handleDeleteUser = (user: any) => {
    if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      deleteUser(user.id);
    }
  };
  
  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingUser(null)}>Add User</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
              <DialogDescription>
                {editingUser ? "Update user details." : "Enter the details for the new user."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="john@example.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="teacher">Teacher</SelectItem>
                          <SelectItem value="student">Student</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {form.watch("role") === "student" && (
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>Additional notes about this student.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <DialogFooter className="mt-6">
                  <Button type="submit" disabled={isPendingUpdate}>
                    {isPendingUpdate ? "Saving..." : "Save"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="sm:w-2/3">
          <Input
            placeholder="Search by email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="sm:w-1/3">
          <Select
            value={roleFilter}
            onValueChange={(value) => setRoleFilter(value as UserRole)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All roles</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
              <SelectItem value="teacher">Teachers</SelectItem>
              <SelectItem value="student">Students</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Manage users and their roles</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-4">Loading users...</p>
          ) : users?.length === 0 ? (
            <p className="text-center py-4">No users found</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === "admin" ? "default" :
                            user.role === "teacher" ? "secondary" : "outline"
                          }
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(user.createdAt, "MMM d, yyyy")}</TableCell>
                      <TableCell className="space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>Edit</Button>
                        <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteUser(user)}>Delete</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
