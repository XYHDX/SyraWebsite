

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreateSchoolForm } from "@/app/(app)/admin/CreateSchoolForm";
import { Edit } from "lucide-react";

interface School {
    id: string;
    name: string;
    location: string;
    about?: string;
}

interface EditSchoolButtonProps {
    school: School;
    onSchoolUpdated: () => void;
}

export function EditSchoolButton({ school, onSchoolUpdated }: EditSchoolButtonProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleFinished = () => {
        onSchoolUpdated();
        setIsOpen(false);
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="secondary"><Edit className="mr-2 h-4 w-4" />Edit School</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit School Information</DialogTitle>
                    <DialogDescription>Update the details for {school.name}.</DialogDescription>
                </DialogHeader>
                <CreateSchoolForm
                    editingSchool={school}
                    onSchoolCreated={onSchoolUpdated}
                    onFinished={handleFinished}
                />
            </DialogContent>
        </Dialog>
    )
}
