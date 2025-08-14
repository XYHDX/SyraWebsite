
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { createCompetition, updateCompetition } from "@/lib/firestore";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useEffect } from "react";

const formSchema = z.object({
  name: z.string().min(5, { message: "Competition name must be at least 5 characters." }),
  description: z.string().min(20, { message: "Description must be at least 20 characters." }).max(500, { message: "Description cannot exceed 500 characters."}),
  date: z.date({
    required_error: "A date is required.",
  }),
});

interface Competition {
  id: string;
  name: string;
  description: string;
  date: string | Date; // Can be string or Date object
}

interface CreateCompetitionFormProps {
    onCompetitionCreated: () => void;
    editingCompetition?: Competition | null;
    onFinished: () => void;
}

const defaultFormValues = {
    name: "",
    description: "",
    date: undefined,
};

export function CreateCompetitionForm({ onCompetitionCreated, editingCompetition, onFinished }: CreateCompetitionFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormValues,
  });

  useEffect(() => {
    if (editingCompetition) {
      form.reset({
        name: editingCompetition.name,
        description: editingCompetition.description,
        date: new Date(editingCompetition.date),
      });
    } else {
        form.reset(defaultFormValues)
    }
  }, [editingCompetition, form]);


  const { isSubmitting } = form.formState;
  const isEditing = !!editingCompetition;
  const descriptionLength = form.watch("description")?.length || 0;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (isEditing && editingCompetition) {
        await updateCompetition(editingCompetition.id, values);
        toast({
          title: "Competition Updated!",
          description: "The competition details have been saved.",
        });
      } else {
        await createCompetition(values);
        toast({
          title: "Competition Created!",
          description: "The new competition has been announced.",
        });
      }
      form.reset(defaultFormValues);
      onCompetitionCreated(); 
      onFinished();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: isEditing ? "Update Failed" : "Creation Failed",
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
              <FormLabel>Competition Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., National Robotics Olympiad 2024" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="A brief but exciting description of the competition..." {...field} />
              </FormControl>
              <FormDescription className="text-right">{descriptionLength} / 500</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Competition Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0,0,0,0))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onFinished}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (isEditing ? "Saving..." : "Announcing...") : (isEditing ? "Save Changes" : "Announce Competition")}
            </Button>
        </div>
      </form>
    </Form>
  );
}
