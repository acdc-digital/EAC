// Materials Store Types
// /Users/matthewsimon/Projects/EAC/eac/store/materials/types.ts

export interface ManufacturedProduct {
  id: string;
  item: string;
  quantity: number;
  unit: number;
  cost: number;
  invoiced: number;
  inventory: number;
  purchaseOrder: number;
  remaining: number;
}

export interface MiscMaterial {
  id: string;
  item: string;
  cost: number;
  ordered: number;
  received: number;
  difference: number;
}

export interface MaterialsStore {
  // State
  manufacturedProducts: ManufacturedProduct[];
  miscMaterials: MiscMaterial[];
  
  // Actions
  addManufacturedProduct: () => void;
  addMiscMaterial: () => void;
  updateManufacturedProduct: (id: string, field: keyof Omit<ManufacturedProduct, 'id'>, value: string | number) => void;
  updateMiscMaterial: (id: string, field: keyof Omit<MiscMaterial, 'id'>, value: string | number) => void;
  removeManufacturedProduct: (id: string) => void;
  removeMiscMaterial: (id: string) => void;
  clearAllMaterials: () => void;
  initializeWithBlankRows: () => void;
} 