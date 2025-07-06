// Edit Materials Component
// /Users/matthewsimon/Projects/EAC/eac/app/_components/editMaterials.tsx

"use client";

import React, { useState } from "react";
import { Plus, X, Package, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ManufacturedProduct {
  id: string;
  name: string;
  quantity: number;
  unit: number;
  cost: number;
  invoiced: number;
  inventory: number;
  purchaseOrder: number;
  remaining: number;
}

interface MiscMaterial {
  id: string;
  name: string;
  quantity: number;
  unit: number;
  cost: number;
  ordered: number;
  received: number;
  difference: number;
}

export function EditMaterials() {
  // Analytics State
  const [analytics, setAnalytics] = useState({
    estimatedBudget: 68750,
    totalProjectCost: 50000,
    actualSpend: 50198.41,
  });

  // Manufactured Products State - Start with 3 blank rows
  const [products, setProducts] = useState<ManufacturedProduct[]>([
    { id: "1", name: "", quantity: 0, unit: 0, cost: 0, invoiced: 0, inventory: 0, purchaseOrder: 0, remaining: 0 },
    { id: "2", name: "", quantity: 0, unit: 0, cost: 0, invoiced: 0, inventory: 0, purchaseOrder: 0, remaining: 0 },
    { id: "3", name: "", quantity: 0, unit: 0, cost: 0, invoiced: 0, inventory: 0, purchaseOrder: 0, remaining: 0 },
  ]);

  // Misc Materials State - Start with 3 blank rows
  const [miscMaterials, setMiscMaterials] = useState<MiscMaterial[]>([
    { id: "1", name: "", quantity: 0, unit: 0, cost: 0, ordered: 0, received: 0, difference: 0 },
    { id: "2", name: "", quantity: 0, unit: 0, cost: 0, ordered: 0, received: 0, difference: 0 },
    { id: "3", name: "", quantity: 0, unit: 0, cost: 0, ordered: 0, received: 0, difference: 0 },
  ]);

  // Calculate totals for manufactured products
  const productTotals = {
    cost: products.reduce((sum, p) => sum + p.cost, 0),
    invoiced: products.reduce((sum, p) => sum + p.invoiced, 0),
    inventory: products.reduce((sum, p) => sum + p.inventory, 0),
    purchaseOrder: products.reduce((sum, p) => sum + p.purchaseOrder, 0),
    remaining: products.reduce((sum, p) => sum + p.remaining, 0),
  };

  // Calculate totals for misc materials
  const miscTotals = {
    cost: miscMaterials.reduce((sum, m) => sum + m.cost, 0),
    ordered: miscMaterials.reduce((sum, m) => sum + m.ordered, 0),
    received: miscMaterials.reduce((sum, m) => sum + m.received, 0),
    difference: miscMaterials.reduce((sum, m) => sum + m.difference, 0),
  };

  // Calculate combined totals and analytics
  const totalMaterialCost = productTotals.cost + miscTotals.cost;
  const totalActualSpend = analytics.actualSpend + totalMaterialCost;
  const profitMargin = analytics.totalProjectCost > 0 ? ((analytics.totalProjectCost - totalActualSpend) / analytics.totalProjectCost) * 100 : 0;
  const budgetVariance = analytics.estimatedBudget - totalActualSpend;
  const budgetVariancePercentage = analytics.estimatedBudget > 0 ? (budgetVariance / analytics.estimatedBudget) * 100 : 0;

  // Update analytics
  const updateAnalytics = (field: keyof typeof analytics, value: number) => {
    setAnalytics(prev => ({ ...prev, [field]: value }));
  };

  // Update manufactured product
  const updateProduct = (id: string, field: keyof ManufacturedProduct, value: any) => {
    setProducts(prev =>
      prev.map(product => {
        if (product.id === id) {
          const updated = { ...product, [field]: value };
          
          // Recalculate dependent fields
          if (field === "quantity" || field === "unit") {
            updated.cost = updated.quantity * updated.unit;
          }
          
          // Recalculate remaining
          updated.remaining = updated.cost - updated.invoiced - updated.inventory - updated.purchaseOrder;
          
          return updated;
        }
        return product;
      })
    );
  };

  // Update misc material
  const updateMiscMaterial = (id: string, field: keyof MiscMaterial, value: any) => {
    setMiscMaterials(prev =>
      prev.map(material => {
        if (material.id === id) {
          const updated = { ...material, [field]: value };

          // Recalculate dependent fields
          if (field === "quantity" || field === "unit") {
            updated.cost = updated.quantity * updated.unit;
          }
          
          // Recalculate difference
          updated.difference = updated.cost - updated.ordered + updated.received;
          
          return updated;
        }
        return material;
      })
    );
  };

  // Add new product - directly add blank row
  const addProduct = () => {
    const newProduct: ManufacturedProduct = {
      id: `prod-${Date.now()}`,
      name: "",
      quantity: 0,
      unit: 0,
      cost: 0,
      invoiced: 0,
      inventory: 0,
      purchaseOrder: 0,
      remaining: 0,
    };
    setProducts([...products, newProduct]);
  };

  // Add new misc material - directly add blank row
  const addMiscMaterial = () => {
    const newMisc: MiscMaterial = {
      id: `misc-${Date.now()}`,
      name: "",
      quantity: 0,
      unit: 0,
      cost: 0,
      ordered: 0,
      received: 0,
      difference: 0,
    };
    setMiscMaterials([...miscMaterials, newMisc]);
  };

  // Remove functions
  const removeProduct = (id: string) => setProducts(products.filter(p => p.id !== id));
  const removeMiscMaterial = (id: string) => setMiscMaterials(miscMaterials.filter(m => m.id !== id));

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="h-full bg-[#1a1a1a] text-[#cccccc]">
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-[#cccccc] mb-2">Materials Management</h1>
              <p className="text-sm text-[#858585]">Track manufactured products and miscellaneous materials</p>
            </div>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Estimated Budget Card */}
          <Card className="bg-[#1a1a1a] border-[#2d2d2d]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-[#cccccc]">Estimated Budget</CardTitle>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-[#4ade80] rounded-full"></div>
                  <span className="text-xs text-[#4ade80]">Planned</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-[#cccccc]">
                  {formatCurrency(analytics.estimatedBudget)}
                </div>
                <input
                  type="number"
                  value={analytics.estimatedBudget}
                  onChange={(e) => updateAnalytics('estimatedBudget', parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#2d2d2d] border border-[#454545] rounded px-2 py-1 text-xs text-[#858585] focus:outline-none focus:ring-1 focus:ring-[#007acc] focus:border-[#007acc]"
                  placeholder="Enter estimated budget"
                />
                <p className="text-xs text-[#858585]">Total estimated cost</p>
              </div>
            </CardContent>
          </Card>

          {/* Actual Spend Card */}
          <Card className="bg-[#1a1a1a] border-[#2d2d2d]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-[#cccccc]">Actual Spend</CardTitle>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-[#fbbf24] rounded-full"></div>
                  <span className="text-xs text-[#fbbf24]">In Progress</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-[#cccccc]">
                  {formatCurrency(totalActualSpend)}
                </div>
                <input
                  type="number"
                  value={analytics.actualSpend}
                  onChange={(e) => updateAnalytics('actualSpend', parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#2d2d2d] border border-[#454545] rounded px-2 py-1 text-xs text-[#858585] focus:outline-none focus:ring-1 focus:ring-[#007acc] focus:border-[#007acc]"
                  placeholder="Enter base actual spend"
                />
                <p className="text-xs text-[#858585]">
                  Base: {formatCurrency(analytics.actualSpend)} + Materials: {formatCurrency(totalMaterialCost)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Project Cost Card */}
          <Card className="bg-[#1a1a1a] border-[#2d2d2d]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-[#cccccc]">Project Cost</CardTitle>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-[#8b5cf6] rounded-full"></div>
                  <span className="text-xs text-[#8b5cf6]">Target</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-[#cccccc]">
                  {formatCurrency(analytics.totalProjectCost)}
                </div>
                <input
                  type="number"
                  value={analytics.totalProjectCost}
                  onChange={(e) => updateAnalytics('totalProjectCost', parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#2d2d2d] border border-[#454545] rounded px-2 py-1 text-xs text-[#858585] focus:outline-none focus:ring-1 focus:ring-[#007acc] focus:border-[#007acc]"
                  placeholder="Enter total project cost"
                />
                <p className="text-xs text-[#858585]">Total project revenue</p>
              </div>
            </CardContent>
          </Card>

          {/* Profit Margin Card */}
          <Card className="bg-[#1a1a1a] border-[#2d2d2d]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-[#cccccc]">Profit Margin</CardTitle>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${profitMargin >= 0 ? 'bg-[#4ade80]' : 'bg-[#ef4444]'}`}></div>
                  <span className={`text-xs ${profitMargin >= 0 ? 'text-[#4ade80]' : 'text-[#ef4444]'}`}>
                    {profitMargin >= 0 ? 'Profitable' : 'Loss'}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className={`text-2xl font-bold ${profitMargin >= 0 ? 'text-[#4ade80]' : 'text-[#ef4444]'}`}>
                  {profitMargin.toFixed(1)}%
                </div>
                <div className="text-xs text-[#858585]">
                  {formatCurrency(analytics.totalProjectCost - totalActualSpend)} profit
                </div>
                <p className="text-xs text-[#858585]">
                  Budget variance: {budgetVariancePercentage >= 0 ? '+' : ''}{budgetVariancePercentage.toFixed(1)}%
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Manufactured Products Section */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-[#007acc]" />
            <h2 className="text-lg font-semibold text-[#cccccc]">Manufactured Products</h2>
          </div>
          <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-lg">
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-[#454545]">
                  <thead>
                    <tr className="bg-[#2d2d2d]">
                      <th className="border border-[#454545] p-2 text-left text-sm font-medium text-[#cccccc] min-w-[250px]">
                        <div className="flex items-center gap-2">
                          Materials
                          <button
                            onClick={addProduct}
                            className="w-5 h-5 bg-[#454545] hover:bg-[#007acc] rounded-sm flex items-center justify-center transition-colors"
                            aria-label="Add new material"
                          >
                            <Plus className="w-3 h-3 text-[#cccccc]" />
                          </button>
                        </div>
                      </th>
                      <th className="border border-[#454545] p-2 text-center text-sm font-medium text-[#cccccc] min-w-[80px]">Qty</th>
                      <th className="border border-[#454545] p-2 text-center text-sm font-medium text-[#cccccc] min-w-[60px]">Type</th>
                      <th className="border border-[#454545] p-2 text-center text-sm font-medium text-[#cccccc] min-w-[100px]">Unit</th>
                      <th className="border border-[#454545] p-2 text-center text-sm font-medium text-[#cccccc] min-w-[120px]">Cost</th>
                      <th className="border border-[#454545] p-2 text-center text-sm font-medium text-[#cccccc] min-w-[120px]">Invoiced</th>
                      <th className="border border-[#454545] p-2 text-center text-sm font-medium text-[#cccccc] min-w-[120px]">Inventory</th>
                      <th className="border border-[#454545] p-2 text-center text-sm font-medium text-[#cccccc] min-w-[120px]">Purchase Order</th>
                      <th className="border border-[#454545] p-2 text-center text-sm font-medium text-[#cccccc] min-w-[120px]">Remaining</th>
                      <th className="border border-[#454545] p-2 text-center text-sm font-medium text-[#cccccc] w-[50px]">
                        <button
                          onClick={addProduct}
                          className="w-6 h-6 bg-[#454545] hover:bg-[#007acc] rounded-sm flex items-center justify-center transition-colors mx-auto"
                          aria-label="Add new material"
                        >
                          <Plus className="w-4 h-4 text-[#cccccc]" />
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product.id} className={`hover:bg-[#252525] group ${product.remaining < 0 ? 'bg-red-900/20' : 'bg-[#2a2a2a]'}`}>
                        <td className="border border-[#454545] p-1">
                          <input
                            value={product.name}
                            onChange={(e) => updateProduct(product.id, "name", e.target.value)}
                            className="w-full bg-[#1a1a1a] border border-[#454545] rounded px-2 py-1 text-xs text-[#cccccc] focus:outline-none focus:ring-1 focus:ring-[#007acc] focus:border-[#007acc]"
                            placeholder="Material name"
                            aria-label="Material name"
                          />
                        </td>
                        <td className="border border-[#454545] p-1">
                          <input
                            type="number"
                            value={product.quantity}
                            onChange={(e) => updateProduct(product.id, "quantity", parseFloat(e.target.value) || 0)}
                            className="w-full bg-[#1a1a1a] border border-[#454545] rounded px-2 py-1 text-xs text-[#cccccc] text-center focus:outline-none focus:ring-1 focus:ring-[#007acc] focus:border-[#007acc]"
                            placeholder="Qty"
                            aria-label="Quantity"
                          />
                        </td>
                        <td className="border border-[#454545] p-2 text-center text-sm text-[#cccccc]">$</td>
                        <td className="border border-[#454545] p-1">
                          <input
                            type="number"
                            step="0.01"
                            value={product.unit}
                            onChange={(e) => updateProduct(product.id, "unit", parseFloat(e.target.value) || 0)}
                            className="w-full bg-[#1a1a1a] border border-[#454545] rounded px-2 py-1 text-xs text-[#cccccc] text-center focus:outline-none focus:ring-1 focus:ring-[#007acc] focus:border-[#007acc]"
                            placeholder="Unit price"
                            aria-label="Unit price"
                          />
                        </td>
                        <td className="border border-[#454545] p-2 text-center text-sm text-[#cccccc] bg-[#252525]">
                          {formatCurrency(product.cost)}
                        </td>
                        <td className="border border-[#454545] p-1 bg-orange-900/20">
                          <input
                            type="number"
                            step="0.01"
                            value={product.invoiced}
                            onChange={(e) => updateProduct(product.id, "invoiced", parseFloat(e.target.value) || 0)}
                            className="w-full bg-[#1a1a1a] border border-[#454545] rounded px-2 py-1 text-xs text-[#cccccc] text-center focus:outline-none focus:ring-1 focus:ring-[#007acc] focus:border-[#007acc]"
                            placeholder="Invoiced"
                            aria-label="Invoiced amount"
                          />
                        </td>
                        <td className="border border-[#454545] p-1 bg-blue-900/20">
                          <input
                            type="number"
                            step="0.01"
                            value={product.inventory}
                            onChange={(e) => updateProduct(product.id, "inventory", parseFloat(e.target.value) || 0)}
                            className="w-full bg-[#1a1a1a] border border-[#454545] rounded px-2 py-1 text-xs text-[#cccccc] text-center focus:outline-none focus:ring-1 focus:ring-[#007acc] focus:border-[#007acc]"
                            placeholder="Inventory"
                            aria-label="Inventory amount"
                          />
                        </td>
                        <td className="border border-[#454545] p-1">
                          <input
                            type="number"
                            step="0.01"
                            value={product.purchaseOrder}
                            onChange={(e) => updateProduct(product.id, "purchaseOrder", parseFloat(e.target.value) || 0)}
                            className="w-full bg-[#1a1a1a] border border-[#454545] rounded px-2 py-1 text-xs text-[#cccccc] text-center focus:outline-none focus:ring-1 focus:ring-[#007acc] focus:border-[#007acc]"
                            placeholder="Purchase order"
                            aria-label="Purchase order amount"
                          />
                        </td>
                        <td className={`border border-[#454545] p-2 text-center text-sm font-semibold ${product.remaining < 0 ? 'text-[#ff4444]' : 'text-[#4ec9b0]'}`}>
                          {formatCurrency(product.remaining)}
                        </td>
                        <td className="border border-[#454545] p-1 text-center">
                          <button
                            onClick={() => removeProduct(product.id)}
                            className="w-6 h-6 bg-[#454545] hover:bg-[#ff4444] rounded-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Remove material"
                            title="Remove material"
                          >
                            <X className="w-3 h-3 text-[#cccccc]" />
                          </button>
                        </td>
                      </tr>
                    ))}

                    {/* Totals row */}
                    <tr className="bg-[#2d2d2d]">
                      <td className="border border-[#454545] p-2 text-sm font-medium text-[#cccccc]">Total</td>
                      <td colSpan={3} className="border border-[#454545] p-2"></td>
                      <td className="border border-[#454545] p-2 text-center text-sm font-medium text-[#ff4444]">
                        {formatCurrency(productTotals.cost)}
                      </td>
                      <td className="border border-[#454545] p-2 text-center text-sm text-[#cccccc]">
                        {formatCurrency(productTotals.invoiced)}
                      </td>
                      <td className="border border-[#454545] p-2 text-center text-sm text-[#cccccc]">
                        {formatCurrency(productTotals.inventory)}
                      </td>
                      <td className="border border-[#454545] p-2 text-center text-sm text-[#cccccc]">
                        {formatCurrency(productTotals.purchaseOrder)}
                      </td>
                      <td className="border border-[#454545] p-2 text-center text-sm font-medium text-[#ff4444]">
                        {formatCurrency(productTotals.remaining)}
                      </td>
                      <td className="border border-[#454545] p-2"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Miscellaneous Materials Section */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#007acc]" />
            <h2 className="text-lg font-semibold text-[#cccccc]">Miscellaneous Materials</h2>
          </div>
          <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-lg">
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-[#454545]">
                  <thead>
                    <tr className="bg-[#2d2d2d]">
                      <th className="border border-[#454545] p-2 text-left text-sm font-medium text-[#cccccc] min-w-[250px]">
                        <div className="flex items-center gap-2">
                          Misc. Material
                          <button
                            onClick={addMiscMaterial}
                            className="w-5 h-5 bg-[#454545] hover:bg-[#007acc] rounded-sm flex items-center justify-center transition-colors"
                            aria-label="Add new misc material"
                          >
                            <Plus className="w-3 h-3 text-[#cccccc]" />
                          </button>
                        </div>
                      </th>
                      <th className="border border-[#454545] p-2 text-center text-sm font-medium text-[#cccccc] min-w-[80px]">Qty</th>
                      <th className="border border-[#454545] p-2 text-center text-sm font-medium text-[#cccccc] min-w-[100px]">Unit</th>
                      <th className="border border-[#454545] p-2 text-center text-sm font-medium text-[#cccccc] min-w-[120px]">Cost</th>
                      <th className="border border-[#454545] p-2 text-center text-sm font-medium text-[#cccccc] min-w-[120px]">Ordered</th>
                      <th className="border border-[#454545] p-2 text-center text-sm font-medium text-[#cccccc] min-w-[120px]">Received</th>
                      <th className="border border-[#454545] p-2 text-center text-sm font-medium text-[#cccccc] min-w-[120px]">Difference</th>
                      <th className="border border-[#454545] p-2 text-center text-sm font-medium text-[#cccccc] w-[50px]">
                        <button
                          onClick={addMiscMaterial}
                          className="w-6 h-6 bg-[#454545] hover:bg-[#007acc] rounded-sm flex items-center justify-center transition-colors mx-auto"
                          aria-label="Add new misc material"
                        >
                          <Plus className="w-4 h-4 text-[#cccccc]" />
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {miscMaterials.map(material => (
                      <tr key={material.id} className="hover:bg-[#252525] group bg-[#2a2a2a]">
                        <td className="border border-[#454545] p-1">
                          <input
                            value={material.name}
                            onChange={(e) => updateMiscMaterial(material.id, "name", e.target.value)}
                            className="w-full bg-[#1a1a1a] border border-[#454545] rounded px-2 py-1 text-xs text-[#cccccc] focus:outline-none focus:ring-1 focus:ring-[#007acc] focus:border-[#007acc]"
                            placeholder="Material name"
                            aria-label="Material name"
                          />
                        </td>
                        <td className="border border-[#454545] p-1">
                          <input
                            type="number"
                            step="0.1"
                            value={material.quantity}
                            onChange={(e) => updateMiscMaterial(material.id, "quantity", parseFloat(e.target.value) || 0)}
                            className="w-full bg-[#1a1a1a] border border-[#454545] rounded px-2 py-1 text-xs text-[#cccccc] text-center focus:outline-none focus:ring-1 focus:ring-[#007acc] focus:border-[#007acc]"
                            placeholder="Qty"
                            aria-label="Quantity"
                          />
                        </td>
                        <td className="border border-[#454545] p-1">
                          <input
                            type="number"
                            value={material.unit}
                            onChange={(e) => updateMiscMaterial(material.id, "unit", parseFloat(e.target.value) || 0)}
                            className="w-full bg-[#1a1a1a] border border-[#454545] rounded px-2 py-1 text-xs text-[#cccccc] text-center focus:outline-none focus:ring-1 focus:ring-[#007acc] focus:border-[#007acc]"
                            placeholder="Unit price"
                            aria-label="Unit price"
                          />
                        </td>
                        <td className="border border-[#454545] p-2 text-center text-sm text-[#cccccc] bg-[#252525]">
                          {formatCurrency(material.cost)}
                        </td>
                        <td className="border border-[#454545] p-1 bg-orange-900/20">
                          <input
                            type="number"
                            step="0.01"
                            value={material.ordered}
                            onChange={(e) => updateMiscMaterial(material.id, "ordered", parseFloat(e.target.value) || 0)}
                            className="w-full bg-[#1a1a1a] border border-[#454545] rounded px-2 py-1 text-xs text-[#cccccc] text-center focus:outline-none focus:ring-1 focus:ring-[#007acc] focus:border-[#007acc]"
                            placeholder="Ordered"
                            aria-label="Ordered amount"
                          />
                        </td>
                        <td className="border border-[#454545] p-1 bg-blue-900/20">
                          <input
                            type="number"
                            step="0.01"
                            value={material.received}
                            onChange={(e) => updateMiscMaterial(material.id, "received", parseFloat(e.target.value) || 0)}
                            className="w-full bg-[#1a1a1a] border border-[#454545] rounded px-2 py-1 text-xs text-[#cccccc] text-center focus:outline-none focus:ring-1 focus:ring-[#007acc] focus:border-[#007acc]"
                            placeholder="Received"
                            aria-label="Received amount"
                          />
                        </td>
                        <td className={`border border-[#454545] p-2 text-center text-sm font-semibold ${material.difference < 0 ? 'text-[#ff4444]' : 'text-[#4ec9b0]'}`}>
                          {formatCurrency(material.difference)}
                        </td>
                        <td className="border border-[#454545] p-1 text-center">
                          <button
                            onClick={() => removeMiscMaterial(material.id)}
                            className="w-6 h-6 bg-[#454545] hover:bg-[#ff4444] rounded-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Remove misc material"
                            title="Remove misc material"
                          >
                            <X className="w-3 h-3 text-[#cccccc]" />
                          </button>
                        </td>
                      </tr>
                    ))}

                    {/* Totals row */}
                    <tr className="bg-[#2d2d2d]">
                      <td colSpan={3} className="border border-[#454545] p-2 text-center text-sm font-medium text-[#cccccc]">Total</td>
                      <td className="border border-[#454545] p-2 text-center text-sm font-medium text-[#ff4444]">
                        {formatCurrency(miscTotals.cost)}
                      </td>
                      <td className="border border-[#454545] p-2 text-center text-sm text-[#cccccc]">
                        {formatCurrency(miscTotals.ordered)}
                      </td>
                      <td className="border border-[#454545] p-2 text-center text-sm text-[#cccccc]">
                        {formatCurrency(miscTotals.received)}
                      </td>
                      <td className="border border-[#454545] p-2 text-center text-sm font-medium text-[#ff4444]">
                        {formatCurrency(miscTotals.difference)}
                      </td>
                      <td className="border border-[#454545] p-2"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}