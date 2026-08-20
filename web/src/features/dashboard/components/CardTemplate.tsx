import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { ReactNode } from "react";

type CardTemplateProps = {
    title: string;
    amount: number;
    type?: string;
    icon: ReactNode;
}

export function CardTemplate({title,amount,type,icon}:CardTemplateProps) {
  return (
    <Card size="default" className="mx-auto w-full max-w-sm flex-col justify-between">
      <CardHeader className="flex justify-between">
        <CardTitle className="text-text-small text-lg">{title}</CardTitle>
        <div>{icon}</div>
      </CardHeader>
      <CardContent>
        <h3 className={`${type==='EXPENSE'?'text-destructive':(type==='INCOME'?'text-primary':'')} text-3xl font-bold overflow-hidden`}>
            ${amount}</h3>
      </CardContent>
      {/* <CardFooter>
        
      </CardFooter> */}
    </Card>
  )
}
