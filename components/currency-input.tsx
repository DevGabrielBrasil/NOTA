"use client"

import * as React from "react"
import { Input, type InputProps } from "@/components/ui/input"

interface CurrencyInputProps extends Omit<InputProps, 'onChange' | 'value'> {
  value: number | undefined | null;
  onChange: (value: number | undefined) => void;
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, onBlur, ...props }, ref) => {
    
    // Formata um número para o padrão de moeda brasileiro.
    const format = (num: number) => {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2,
      }).format(num)
    }

    // Lida com a mudança de valor no input
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Pega o valor digitado e remove tudo que não for número
      const digits = e.target.value.replace(/\D/g, "")
      
      // Se estiver vazio, envia 'undefined' para o formulário
      if (digits === "") {
        onChange(undefined)
        return
      }
      
      // Converte a string de dígitos em um valor numérico (ex: "500000" -> 5000.00)
      const realValue = Number(digits) / 100
      
      // Envia o NÚMERO PURO para o estado do formulário
      onChange(realValue)
    }

    // Formata o valor numérico que vem do formulário para ser exibido na tela
    const displayValue = typeof value === 'number' ? format(value) : ""

    return (
      <Input
        ref={ref}
        value={displayValue}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder="R$ 0,00"
        {...props}
      />
    )
  }
)
CurrencyInput.displayName = "CurrencyInput"

export { CurrencyInput }
