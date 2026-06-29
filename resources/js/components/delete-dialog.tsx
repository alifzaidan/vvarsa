import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DeleteConfirmDialogProps {
    trigger: React.ReactNode;
    title: string;
    description?: string;
    itemName: string;
    onConfirm: () => void;
}

export default function DeleteConfirmDialog({
    trigger,
    title,
    description = 'Tindakan ini tidak dapat dibatalkan. Ini akan menghapus data secara permanen dari server kami.',
    itemName,
    onConfirm,
}: DeleteConfirmDialogProps) {
    const [open, setOpen] = React.useState(false);

    const handleConfirm = () => {
        onConfirm();
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        {description}
                        <br />
                        <span className="font-semibold text-foreground mt-2 block">
                            Data yang dihapus: {itemName}
                        </span>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        className="hover:cursor-pointer"
                    >
                        Batal
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        className="hover:cursor-pointer"
                    >
                        Hapus
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
