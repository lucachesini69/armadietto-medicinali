"use client";

import { useState, useCallback } from "react";
import { TabBar, type TabId } from "@/components/layout/TabBar";
import { FAB } from "@/components/layout/FAB";
import { Toast } from "@/components/ui/Toast";
import { HomeScreen } from "@/components/screens/HomeScreen";
import { InventoryScreen } from "@/components/screens/InventoryScreen";
import { MedicineDetail } from "@/components/screens/MedicineDetail";
import { MedicineForm } from "@/components/screens/MedicineForm";
import { FamilyScreen } from "@/components/screens/FamilyScreen";
import { useMedicines } from "@/lib/hooks/useMedicines";
import { useFamily } from "@/lib/hooks/useFamily";
import type { Medicine } from "@/lib/types";

type View = null | "detail" | "add" | "edit";

export default function MediCasaApp() {
  const [tab, setTab] = useState<TabId>("home");
  const [view, setView] = useState<View>(null);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [toast, setToast] = useState({ message: "", visible: false });

  const { medicines, addMedicine, updateMedicine, deleteMedicine, updateQuantity } = useMedicines();
  const { members, addMember, removeMember } = useFamily();

  const showToast = useCallback((message: string) => {
    setToast({ message, visible: true });
  }, []);

  const hideToast = useCallback(() => {
    setToast((t) => ({ ...t, visible: false }));
  }, []);

  // Navigation helpers
  const handleSelectMedicine = useCallback((med: Medicine) => {
    setSelectedMedicine(med);
    setView("detail");
  }, []);

  const handleNavigate = useCallback((tabId: string) => {
    setTab(tabId as TabId);
  }, []);

  const handleBack = useCallback(() => {
    setView(null);
    setSelectedMedicine(null);
    setEditingMedicine(null);
  }, []);

  const handleEdit = useCallback((med: Medicine) => {
    setEditingMedicine(med);
    setView("edit");
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    await deleteMedicine(id);
    setView(null);
    setSelectedMedicine(null);
    showToast("Farmaco eliminato");
  }, [deleteMedicine, showToast]);

  const handleUpdateQuantity = useCallback(async (id: string, delta: number) => {
    await updateQuantity(id, delta);
    // Update selected medicine locally for immediate feedback
    setSelectedMedicine((prev) => {
      if (!prev || prev.id !== id) return prev;
      return { ...prev, quantita: Math.max(0, prev.quantita + delta) };
    });
  }, [updateQuantity]);

  const handleSave = useCallback(async (data: Partial<Medicine> & { name: string; scadenza: string }) => {
    if (editingMedicine) {
      // Editing existing
      await updateMedicine(editingMedicine.id, data);
      // Refresh selected medicine
      setSelectedMedicine((prev) => prev ? { ...prev, ...data } : prev);
      setView("detail");
      setEditingMedicine(null);
      showToast("Farmaco aggiornato");
    } else {
      // Adding new
      await addMedicine({
        name: data.name,
        principioAttivo: data.principioAttivo ?? "",
        formato: data.formato ?? "Compresse",
        quantita: data.quantita ?? 0,
        quantitaTotale: data.quantitaTotale ?? 20,
        scadenza: data.scadenza,
        posizione: data.posizione ?? "Ripiano medio",
        sintomi: data.sintomi ?? [],
        note: data.note ?? "",
        foto: data.foto,
        barcode: data.barcode,
      });
      setView(null);
      showToast("Farmaco aggiunto");
    }
  }, [editingMedicine, addMedicine, updateMedicine, showToast]);

  const handleAddMember = useCallback(async (name: string) => {
    await addMember(name);
    showToast("Membro aggiunto");
  }, [addMember, showToast]);

  const handleRemoveMember = useCallback(async (id: string) => {
    await removeMember(id);
    showToast("Membro rimosso");
  }, [removeMember, showToast]);

  // Render content
  const renderContent = () => {
    if (view === "detail" && selectedMedicine) {
      return (
        <MedicineDetail
          medicine={selectedMedicine}
          onBack={handleBack}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onUpdateQuantity={handleUpdateQuantity}
        />
      );
    }

    if (view === "add") {
      return <MedicineForm onSave={handleSave} onCancel={handleBack} />;
    }

    if (view === "edit" && editingMedicine) {
      return (
        <MedicineForm
          medicine={editingMedicine}
          onSave={handleSave}
          onCancel={() => {
            setView("detail");
            setEditingMedicine(null);
          }}
        />
      );
    }

    switch (tab) {
      case "home":
        return (
          <HomeScreen
            medicines={medicines}
            reminders={[]}
            members={members}
            onNavigate={handleNavigate}
            onSelectMedicine={handleSelectMedicine}
          />
        );
      case "inventario":
        return (
          <InventoryScreen
            medicines={medicines}
            onSelectMedicine={handleSelectMedicine}
          />
        );
      case "promemoria":
        return (
          <div className="px-5 pt-20 pb-[100px] text-center text-text-muted">
            <div className="text-5xl mb-3">{"\u23F0"}</div>
            <div className="font-semibold text-base mb-1">Promemoria</div>
            <div className="text-sm">Disponibile nella Fase 2</div>
          </div>
        );
      case "cerca":
        return (
          <div className="px-5 pt-20 pb-[100px] text-center text-text-muted">
            <div className="text-5xl mb-3">{"\u{1F50D}"}</div>
            <div className="font-semibold text-base mb-1">Cerca per sintomo</div>
            <div className="text-sm">Disponibile nella Fase 2</div>
          </div>
        );
      case "famiglia":
        return (
          <FamilyScreen
            members={members}
            onAddMember={handleAddMember}
            onRemoveMember={handleRemoveMember}
          />
        );
      default:
        return null;
    }
  };

  const showFab = !view && (tab === "inventario" || tab === "home");

  return (
    <div className="max-w-[430px] mx-auto relative min-h-dvh overflow-hidden">
      {renderContent()}
      {showFab && <FAB onClick={() => setView("add")} />}
      {!view && <TabBar tab={tab} setTab={setTab} />}
      <Toast message={toast.message} visible={toast.visible} onHide={hideToast} />
    </div>
  );
}
