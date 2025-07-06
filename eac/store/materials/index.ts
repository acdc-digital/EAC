// Materials Store
// /Users/matthewsimon/Projects/EAC/eac/store/materials/index.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MaterialsStore, ManufacturedProduct, MiscMaterial } from './types';

export const useMaterialsStore = create<MaterialsStore>()(
  persist(
    (set, get) => ({
      // Initial state
      manufacturedProducts: [],
      miscMaterials: [],

      // Actions
      addManufacturedProduct: () => {
        const newProduct: ManufacturedProduct = {
          id: `manufactured-${Date.now()}`,
          item: '',
          quantity: 0,
          unit: 0,
          cost: 0,
          invoiced: 0,
          inventory: 0,
          purchaseOrder: 0,
          remaining: 0,
        };
        
        set((state) => ({
          manufacturedProducts: [...state.manufacturedProducts, newProduct]
        }));
      },

      addMiscMaterial: () => {
        const newMaterial: MiscMaterial = {
          id: `misc-${Date.now()}`,
          item: '',
          cost: 0,
          ordered: 0,
          received: 0,
          difference: 0,
        };
        
        set((state) => ({
          miscMaterials: [...state.miscMaterials, newMaterial]
        }));
      },

      updateManufacturedProduct: (id: string, field: keyof Omit<ManufacturedProduct, 'id'>, value: string | number) => {
        set((state) => {
          const updatedProducts = state.manufacturedProducts.map(product => {
            if (product.id === id) {
              const updated = { ...product, [field]: value };
              
              // Auto-calculate cost and remaining
              if (field === 'quantity' || field === 'unit') {
                updated.cost = updated.quantity * updated.unit;
              }
              
              if (field === 'cost' || field === 'invoiced' || field === 'inventory' || field === 'purchaseOrder') {
                updated.remaining = updated.cost - updated.invoiced - updated.inventory - updated.purchaseOrder;
              }
              
              return updated;
            }
            return product;
          });
          
          return { manufacturedProducts: updatedProducts };
        });
      },

      updateMiscMaterial: (id: string, field: keyof Omit<MiscMaterial, 'id'>, value: string | number) => {
        set((state) => {
          const updatedMaterials = state.miscMaterials.map(material => {
            if (material.id === id) {
              const updated = { ...material, [field]: value };
              
              // Auto-calculate difference
              if (field === 'cost' || field === 'ordered' || field === 'received') {
                updated.difference = updated.cost - updated.ordered + updated.received;
              }
              
              return updated;
            }
            return material;
          });
          
          return { miscMaterials: updatedMaterials };
        });
      },

      removeManufacturedProduct: (id: string) => {
        set((state) => ({
          manufacturedProducts: state.manufacturedProducts.filter(product => product.id !== id)
        }));
      },

      removeMiscMaterial: (id: string) => {
        set((state) => ({
          miscMaterials: state.miscMaterials.filter(material => material.id !== id)
        }));
      },

      clearAllMaterials: () => {
        set({
          manufacturedProducts: [],
          miscMaterials: []
        });
      },

      initializeWithBlankRows: () => {
        const { manufacturedProducts, miscMaterials } = get();
        
        // Only add blank rows if there are none
        if (manufacturedProducts.length === 0) {
          for (let i = 0; i < 3; i++) {
            get().addManufacturedProduct();
          }
        }
        
        if (miscMaterials.length === 0) {
          for (let i = 0; i < 3; i++) {
            get().addMiscMaterial();
          }
        }
      }
    }),
    {
      name: 'materials-storage',
      version: 1,
    }
  )
); 