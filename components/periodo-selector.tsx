"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { DateRange } from "react-day-picker"
import { toast } from "sonner"

interface PeriodoSelectorProps {
  value?: DateRange
  onChange: (range: DateRange) => void
  defaultMonth?: Date
}

export function PeriodoSelector({ value, onChange, defaultMonth }: PeriodoSelectorProps) {

  const hoje = new Date()
  const [visibleMonth, setVisibleMonth] = useState<Date>(defaultMonth || hoje)
  const [date, setDate] = useState<DateRange | undefined>(
    value || {
      from: undefined,
      to: undefined,
    },
  )
  const [isOpen, setIsOpen] = useState(false)

  const selecionarMesAnterior = () => {
    const anterior = new Date(visibleMonth)
    anterior.setMonth(anterior.getMonth() - 1)
    setVisibleMonth(anterior)
    setDate({
      from: undefined,
      to: undefined,
    })
  }

  const confirmarSelecao = () => {
    if (date?.from && date?.to) {
      onChange(date)
      setIsOpen(false)
    } else {
      toast.warning("Seleção incompleta", {
        description: "Por favor, selecione um intervalo de datas (início e fim).",
      })
    }
  }

  return (
    <div className="grid gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date?.from && !date?.to && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                  {format(date.to, "dd/MM/yyyy", { locale: ptBR })}
                </>
              ) : (
                format(date.from, "dd/MM/yyyy", { locale: ptBR })
              )
            ) : (
              <span>Selecione um período</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            selected={date}
            onSelect={setDate}
            defaultMonth={visibleMonth}
            month={visibleMonth}
            onMonthChange={setVisibleMonth}
            numberOfMonths={1}
            locale={ptBR}
          />
          <div className="p-3 border-t border-border flex flex-col gap-2">
            <Button variant="outline" size="sm" className="w-full" onClick={selecionarMesAnterior}>
              Mostrar mês anterior
            </Button>
            <Button
              size="sm"
              className="w-full"
              onClick={confirmarSelecao}
              disabled={!date?.from || !date?.to}
            >
              Confirmar seleção
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
