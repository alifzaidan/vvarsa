import * as React from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
    value?: Date | string;
    onChange?: (dateStr: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

export function DatePicker({ value, onChange, placeholder = "Pilih tanggal", disabled = false, className }: DatePickerProps) {
  const dateValue = React.useMemo(() => {
    if (!value) return undefined;
    if (value instanceof Date) return value;
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  }, [value]);

  const handleSelect = (date: Date | undefined) => {
    if (!onChange) return;
    if (!date) {
      onChange("");
      return;
    }
    // Format as YYYY-MM-DD locally to avoid timezone shifts
    const offset = date.getTimezoneOffset()
    const localDate = new Date(date.getTime() - (offset * 60 * 1000))
    const dateStr = localDate.toISOString().split('T')[0]
    onChange(dateStr);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal rounded-xl h-9 border-input bg-transparent px-3 py-1 text-sm shadow-sm hover:bg-accent/50",
            !dateValue && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          {dateValue ? format(dateValue, "dd MMMM yyyy", { locale: id }) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={handleSelect}
          captionLayout="dropdown-buttons"
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
