

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { createTeam, getStudentsBySchool } from "@/lib/firestore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const formSchema = (isCoach: boolean) => z.object({
  name: z.string().min(3, { message: "Team name must be at least 3 characters." }),
  schoolId: z.string({ required_error: "Please select a school." }),
  coachId: z.string({ required_error: "Please select a coach." }),
  memberIds: isCoach 
    ? z.array(z.string()).min(1, { message: "You must select at least one student." })
    : z.array(z.string()).optional(),
});

interface School {
  id: string;
  name: string;
}

interface Coach {
  id: string;
  name: string;
  school: string;
}

interface Student {
    id: string;
    name: string;
    email: string;
}

interface CreateTeamFormProps {
    onTeamCreated: () => void;
    onFinished: () => void;
    schools: School[];
    coaches: Coach[];
    userProfile: { schoolId?: string, school?: string, role?: string, uid?: string, name?: string };
}

export function CreateTeamForm({ onTeamCreated, onFinished, schools, coaches, userProfile }: CreateTeamFormProps) {
  const { toast } = useToast();
  const isCoach = userProfile.role === 'Coach';

  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const form = useForm<z.infer<ReturnType<typeof formSchema>>>({
    resolver: zodResolver(formSchema(isCoach)),
    defaultValues: {
      name: "",
      schoolId: isCoach ? userProfile.schoolId : undefined,
      coachId: isCoach ? userProfile.uid : undefined,
      memberIds: [],
    },
  });
  
  useEffect(() => {
    if (isCoach && userProfile.schoolId && userProfile.uid) {
        form.setValue("schoolId", userProfile.schoolId);
        form.setValue("coachId", userProfile.uid);
    }
  }, [isCoach, userProfile, form]);


  useEffect(() => {
    if (isCoach && userProfile.school) {
        const fetchStudents = async () => {
            setLoadingStudents(true);
            const studentData = await getStudentsBySchool(userProfile.school!);
            setStudents(studentData as Student[]);
            setLoadingStudents(false);
        }
        fetchStudents();
    }
  }, [isCoach, userProfile.school]);


  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<ReturnType<typeof formSchema>>) {
    try {
      const schoolName = isCoach ? userProfile.school : schools.find(s => s.id === values.schoolId)?.name;
      const coachName = isCoach ? userProfile.name : coaches.find(c => c.id === values.coachId)?.name;
      const schoolId = isCoach ? userProfile.schoolId : values.schoolId;
      const coachId = isCoach ? userProfile.uid : values.coachId;
      
      if (!schoolName || !coachName || !schoolId || !coachId) {
          toast({ variant: "destructive", title: "Invalid selection", description: "Please ensure school and coach are selected." });
          return;
      }
        
      await createTeam({
          name: values.name,
          schoolId: schoolId,
          schoolName: schoolName,
          coachId: coachId,
          coachName: coachName,
          members: values.memberIds || [],
      });

      toast({
        title: "Team Created!",
        description: `${values.name} has been registered.`,
      });
      form.reset();
      onTeamCreated(); 
      onFinished();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Creation Failed",
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
              <FormLabel>Team Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., The Tech Titans" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {isCoach ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>School</Label>
                    <Input value={userProfile.school || ''} disabled />
                </div>
                 <div className="space-y-2">
                    <Label>Coach</Label>
                    <Input value={userProfile.name || ''} disabled />
                </div>
            </div>
        ) : (
            <>
                <FormField
                control={form.control}
                name="schoolId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>School</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select the team's school" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {schools.map(school => (
                                <SelectItem key={school.id} value={school.id}>{school.name}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
                
                <FormField
                control={form.control}
                name="coachId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Assign Coach</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select the team's coach" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {coaches.map(coach => (
                                <SelectItem key={coach.id} value={coach.id}>{coach.name} ({coach.school})</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </>
        )}
        
        {isCoach && (
            <FormField
            control={form.control}
            name="memberIds"
            render={() => (
                <FormItem>
                    <Card className="max-h-64 overflow-y-auto">
                        <CardHeader className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 p-4">
                            <FormLabel>Add Initial Members</FormLabel>
                            <CardDescription>Select students from your school to add to the team.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4">
                             {loadingStudents ? (
                                <div className="flex items-center justify-center p-8">
                                    <Loader2 className="animate-spin" />
                                    <p className="ml-2">Loading students...</p>
                                </div>
                            ) : students.length > 0 ? (
                                students.map((student) => (
                                    <FormField
                                    key={student.id}
                                    control={form.control}
                                    name="memberIds"
                                    render={({ field }) => {
                                        return (
                                        <FormItem
                                            key={student.id}
                                            className="flex flex-row items-start space-x-3 space-y-0 p-2 rounded-md hover:bg-muted"
                                        >
                                            <FormControl>
                                            <Checkbox
                                                checked={field.value?.includes(student.id)}
                                                onCheckedChange={(checked) => {
                                                return checked
                                                    ? field.onChange([...(field.value || []), student.id])
                                                    : field.onChange(
                                                        field.value?.filter(
                                                        (value) => value !== student.id
                                                        )
                                                    )
                                                }}
                                            />
                                            </FormControl>
                                            <FormLabel className="font-normal w-full cursor-pointer">
                                                {student.name}
                                                <p className="text-xs text-muted-foreground">{student.email}</p>
                                            </FormLabel>
                                        </FormItem>
                                        )
                                    }}
                                    />
                                ))
                             ) : (
                                <p className="text-sm text-center text-muted-foreground py-4">No students found for your school.</p>
                             )}
                        </CardContent>
                    </Card>
                    <FormMessage />
                </FormItem>
            )}
            />
        )}


        <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onFinished}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="animate-spin"/> Registering...</> : "Register Team"}
            </Button>
        </div>
      </form>
    </Form>
  );
}
