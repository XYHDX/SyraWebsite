
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { createSchool, updateSchool } from "@/lib/firestore";
import { useEffect } from "react";

const formSchema = z.object({
  name: z.string().min(3, { message: "School name must be at least 3 characters." }),
  location: z.string().min(3, { message: "Location must be at least 3 characters." }),
  about: z.string().max(1000, { message: "About section cannot exceed 1000 characters."}).optional(),
});

interface School {
    id: string;
    name: string;
    location: string;
    about?: string;
}

interface CreateSchoolFormProps {
    onSchoolCreated: () => void;
    editingSchool?: School | null;
    onFinished: () => void;
}

const defaultFormValues = {
    name: "",
    location: "",
    about: "",
};

export function CreateSchoolForm({ onSchoolCreated, editingSchool, onFinished }: CreateSchoolFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormValues,
  });

  useEffect(() => {
    if (editingSchool) {
      form.reset({
        name: editingSchool.name,
        location: editingSchool.location,
        about: editingSchool.about || "",
      });
    } else {
        form.reset(defaultFormValues);
    }
  }, [editingSchool, form]);

  const { isSubmitting } = form.formState;
  const isEditing = !!editingSchool;
  const aboutLength = form.watch("about")?.length || 0;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
       if (isEditing && editingSchool) {
        await updateSchool(editingSchool.id, values);
        toast({
          title: "School Updated!",
          description: "The school details have been saved.",
        });
      } else {
        await createSchool(values);
        toast({
          title: "School Registered!",
          description: `${values.name} has been added to the academy.`,
        });
      }
      form.reset(defaultFormValues);
      onSchoolCreated(); 
      onFinished();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: isEditing ? "Update Failed" : "Registration Failed",
        description: error.message,
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>School Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Damascus High School for Innovators" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Damascus, Syria" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="about"
          render={({ field }) => (
            <FormItem>
              <FormLabel>About Section</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe the school's robotics program, history, and achievements..." {...field} rows={6}/>
              </FormControl>
               <FormDescription className="text-right">{aboutLength} / 1000</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onFinished}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (isEditing ? "Saving..." : "Registering...") : (isEditing ? "Save Changes" : "Register School")}
            </Button>
        </div>
      </form>
    </Form>
  );
}
