"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"

// 1. Schema de validação atualizado com o campo CNPJ
const formSchema = z
  .object({
    nome_empresa: z.string().min(2, { message: "O nome da empresa é obrigatório." }),
    cnpj: z.string().min(14, { message: "Por favor, insira um CNPJ válido com 14 ou 18 caracteres." }),
    nome_completo: z.string().min(3, { message: "O seu nome completo é obrigatório." }),
    email: z.string().email({ message: "O email fornecido é inválido." }),
    password: z.string().min(6, { message: "A palavra-passe deve ter no mínimo 6 caracteres." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As palavras-passe não coincidem.",
    path: ["confirmPassword"],
  })

export default function RegistroPage() {
  const { signUp } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    // 2. Valores padrão atualizados para incluir o CNPJ
    defaultValues: {
      nome_empresa: "",
      cnpj: "", 
      nome_completo: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // 3. Função de envio atualizada para passar o CNPJ
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    await signUp({
      email: values.email,
      password: values.password,
      nome_completo: values.nome_completo,
      nome_empresa: values.nome_empresa,
      cnpj: values.cnpj,
    });
    setIsSubmitting(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Crie a Conta da sua Empresa</CardTitle>
            <CardDescription>
              Você será o administrador principal e poderá convidar outros membros depois.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="nome_empresa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Empresa</FormLabel>
                      <FormControl><Input placeholder="A Minha Empresa, Lda" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* 4. Campo visual do CNPJ adicionado ao formulário */}
                <FormField
                  control={form.control}
                  name="cnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNPJ da Empresa</FormLabel>
                      <FormControl><Input placeholder="00.000.000/0000-00" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nome_completo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>O seu Nome Completo</FormLabel>
                      <FormControl><Input placeholder="O seu nome como administrador" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>O seu Email de Acesso</FormLabel>
                      <FormControl><Input type="email" placeholder="o.seu@email.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>A sua Palavra-passe</FormLabel>
                      <FormControl><Input type="password" placeholder="******" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Palavra-passe</FormLabel>
                      <FormControl><Input type="password" placeholder="******" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Criar Conta da Empresa
                </Button>
              </form>
            </Form>
          </CardContent>
            <CardFooter className="justify-center">
             <p className="text-sm text-gray-600">
               Já tem uma empresa registada?{" "}
               <Link href="/login" className="font-medium text-blue-600 hover:underline">
                 Faça login
               </Link>
             </p>
           </CardFooter>
        </Card>
      </div>
    </div>
  )
}