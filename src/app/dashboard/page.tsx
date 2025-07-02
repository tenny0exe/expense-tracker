
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';
import { MOCK_BUDGETS, CATEGORIES_INFO, getCategoryInfo } from "@/lib/mockData"; 
import type { Budget } from "@/lib/types"; 
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2 } from "lucide-react"; 
import { useMemo, useState, useCallback } from "react";
import { useCurrency } from "@/context/CurrencyContext"; 
import type { PieSectorDataItem } from "recharts/types/polar/Pie";
import { useTransactions } from '@/context/TransactionsContext'; 

const RADIAN = Math.PI / 180;

interface CustomizedLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  index: number;
  name: string;
}


const renderActiveShape = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value, formatCurrency } = props; // Added formatCurrency
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="text-lg font-bold">
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="hsl(var(--foreground))" className="text-sm">{formatCurrency ? formatCurrency(value) : `$${value.toFixed(2)}`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="hsl(var(--muted-foreground))" className="text-xs">
        {`(Rate ${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};


export default function DashboardPage() {
  const { transactions } = useTransactions(); 
  const [budgetsData] = useState<Budget[]>(MOCK_BUDGETS); 
  const { formatCurrency } = useCurrency();
  const [activeIndex, setActiveIndex] = useState(0);

  const onPieEnter = useCallback((_: PieSectorDataItem, index: number) => {
    setActiveIndex(index);
  }, [setActiveIndex]);

  const totalExpenses = useMemo(() => {
    return transactions 
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }, [transactions]);

  const totalIncome = useMemo(() => {
    return transactions 
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);
  
  const netBalance = totalIncome - totalExpenses;

  const overallBudgetStatus = useMemo(() => {
    const totalSpentFromTransactions = transactions
        .filter(t => t.type === 'expense' && budgetsData.some(b => b.category === t.category))
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const totalBudgetLimit = budgetsData.reduce((sum, b) => sum + b.limit, 0);
    
    if (totalBudgetLimit === 0) return { status: "No budgets set", icon: AlertTriangle, color: "text-yellow-500" }; 
    return totalSpentFromTransactions <= totalBudgetLimit
      ? { status: "On Track", icon: CheckCircle2, color: "text-green-500" } 
      : { status: "Over Budget", icon: AlertTriangle, color: "text-red-500" }; 
  }, [transactions, budgetsData]);

  const expensesByCategory = useMemo(() => {
    const categoryMap = new Map<string, number>();
    transactions 
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + Math.abs(t.amount));
      });
    return Array.from(categoryMap.entries()).map(([name, total]) => ({ name, total }));
  }, [transactions]);

  const pieChartData = useMemo(() => {
    return expensesByCategory.map(item => ({
      name: item.name,
      value: item.total,
    }));
  }, [expensesByCategory]);
  
  const PIE_COLORS = useMemo(() => CATEGORIES_INFO.filter(c => c.name !== "Income").map(c => {
    if (c.color.startsWith('text-red')) return 'hsl(var(--chart-1))'; 
    if (c.color.startsWith('text-blue')) return 'hsl(var(--chart-2))';
    if (c.color.startsWith('text-yellow')) return 'hsl(var(--chart-3))';
    if (c.color.startsWith('text-green')) return 'hsl(var(--chart-4))';
    if (c.color.startsWith('text-purple')) return 'hsl(var(--chart-5))';
    const categoryIndex = CATEGORIES_INFO.findIndex(ci => ci.name === c.name);
    return `hsl(var(--chart-${(categoryIndex % 5) + 1}))`; 
  }), []);


  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
            {netBalance >= 0 ? <TrendingUp className="h-5 w-5 text-green-500" /> : <TrendingDown className="h-5 w-5 text-red-500" />}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netBalance >=0 ? 'text-green-500' : 'text-red-500'}`}>{formatCurrency(netBalance)}</div>
            <p className="text-xs text-muted-foreground">Income - Expenses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Status</CardTitle>
            <overallBudgetStatus.icon className={`h-5 w-5 ${overallBudgetStatus.color}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${overallBudgetStatus.color}`}>{overallBudgetStatus.status}</div>
            <p className="text-xs text-muted-foreground">Overall monthly budget</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
            <CardDescription>Monthly spending breakdown.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expensesByCategory} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <YAxis tickFormatter={(value) => formatCurrency(value).replace(/\.00$/, '').replace(/,/g, '')} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  itemStyle={{ color: 'hsl(var(--primary))' }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey="total" name="Expenses" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Expense Distribution</CardTitle>
            <CardDescription>Visual representation of your spending habits.</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px] p-2">
            <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={<RenderActiveShapeWithCurrency />} // Pass formatCurrency to activeShape
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  fill="hsl(var(--primary))" 
                  dataKey="value"
                  onMouseEnter={onPieEnter}
                  labelLine={false}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Wrapper component to pass formatCurrency to renderActiveShape
const RenderActiveShapeWithCurrency = (props: any) => {
  const { formatCurrency: fc } = useCurrency();
  return renderActiveShape({ ...props, formatCurrency: fc });
};
