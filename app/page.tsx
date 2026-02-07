"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TabBar, type TabId } from "@/components/layout/TabBar";
import { FAB } from "@/components/layout/FAB";
import { Toast } from "@/components/ui/Toast";
import { HomeScreen } from "@/components/screens/HomeScreen";
import { InventoryScreen } from "@/components/screens/InventoryScreen";
import { MedicineDetail } from "@/components/screens/MedicineDetail";
import { MedicineForm } from "@/components/screens/MedicineForm";
import { FamilyScreen } from "@/components/screens/FamilyScreen";
import { RemindersScreen } from "@/components/screens/RemindersScreen";
import { SearchScreen } from "@/components/screens/SearchScreen";
import { ShoppingListScreen } from "@/components/screens/ShoppingListScreen";
import { SettingsScreen } from "@/components/screens/SettingsScreen";
import { useMedicines } from "@/lib/hooks/useMedicines";
import { useFamily } from "@/lib/hooks/useFamily";
import { useReminders } from "@/lib/hooks/useReminders";
import { useDarkMode } from "@/lib/hooks/useDarkMode";
import { useNotifications } from "@/lib/hooks/useNotifications";
import type { Medicine } from "@/lib/types";

type View = null | "detail" | "add" | "edit" | "shopping" | "settings";

export default function MediCasaApp() {
  const [tab, setTab] = useState<TabId>("home");
  const [view, setView] = useState<View>(null);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [toast, setToast] = useState({ message: "", visible: false });

  const { medicines, addMedicine, updateMedicine, deleteMedicine, updateQuantity } = useMedicines();
  const { members, addMember, removeMember } = useFamily();
  const { reminders, intakeLog, addReminder, toggleReminder, deleteReminder, logIntake } = useReminders();
  const { isDark, toggle: toggleDark } = useDarkMode();
  const { permission: notifPermission, requestPermission: requestNotifPermission } = useNotifications(reminders, members);

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
    if (tabId === "shopping") {
      setView("shopping");
    } else if (tabId === "settings") {
      setView("settings");
    } else {
      setView(null);
      setTab(tabId as TabId);
    }
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
    setSelectedMedicine((prev) => {
      if (!prev || prev.id !== id) return prev;
      return { ...prev, quantita: Math.max(0, prev.quantita + delta) };
    });
  }, [updateQuantity]);

  const handleSave = useCallback(async (data: Partial<Medicine> & { name: string; scadenza: string }) => {
    if (editingMedicine) {
      await updateMedicine(editingMedicine.id, data);
      setSelectedMedicine((prev) => prev ? { ...prev, ...data } : prev);
      setView("detail");
      setEditingMedicine(null);
      showToast("Farmaco aggiornato");
    } else {
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

  // Reminders handlers
  const handleAddReminder = useCallback(async (data: { medicineId: string; medicineName: string; memberId: string; orario: string; frequenza: string; attivo: boolean }) => {
    await addReminder({
      medicineId: data.medicineId,
      medicineName: data.medicineName,
      memberId: data.memberId,
      orario: data.orario,
      frequenza: data.frequenza as "Ogni giorno" | "Ogni 8 ore" | "Ogni 12 ore" | "Al bisogno" | "Lun-Ven" | "1 volta/settimana",
      attivo: data.attivo,
    });
    showToast("Promemoria aggiunto");
  }, [addReminder, showToast]);

  const handleToggleReminder = useCallback(async (id: string) => {
    await toggleReminder(id);
  }, [toggleReminder]);

  const handleDeleteReminder = useCallback(async (id: string) => {
    await deleteReminder(id);
    showToast("Promemoria eliminato");
  }, [deleteReminder, showToast]);

  const handleLogIntake = useCallback(async (reminderId: string, memberId: string, medicineName: string, skipped: boolean) => {
    await logIntake(reminderId, memberId, medicineName, skipped);
    showToast(skipped ? "Assunzione saltata" : "Assunzione registrata");
  }, [logIntake, showToast]);

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

    if (view === "shopping") {
      return <ShoppingListScreen medicines={medicines} onBack={handleBack} />;
    }

    if (view === "settings") {
      return (
        <SettingsScreen
          isDark={isDark}
          onToggleDark={toggleDark}
          onShowToast={showToast}
          notifPermission={notifPermission}
          onRequestNotifPermission={requestNotifPermission}
        />
      );
    }

    switch (tab) {
      case "home":
        return (
          <HomeScreen
            medicines={medicines}
            reminders={reminders}
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
          <RemindersScreen
            reminders={reminders}
            medicines={medicines}
            members={members}
            intakeLog={intakeLog}
            onAddReminder={handleAddReminder}
            onToggleReminder={handleToggleReminder}
            onDeleteReminder={handleDeleteReminder}
            onLogIntake={handleLogIntake}
          />
        );
      case "cerca":
        return (
          <SearchScreen
            medicines={medicines}
            onSelectMedicine={handleSelectMedicine}
          />
        );
      case "famiglia":
        return (
          <FamilyScreen
            members={members}
            reminders={reminders}
            onAddMember={handleAddMember}
            onRemoveMember={handleRemoveMember}
          />
        );
      default:
        return null;
    }
  };

  const showFab = !view && (tab === "inventario" || tab === "home");

  const viewKey = view ?? tab;

  return (
    <div className="max-w-[430px] mx-auto relative min-h-dvh overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={viewKey}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
      <AnimatePresence>
        {showFab && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "backOut" }}
          >
            <FAB onClick={() => setView("add")} />
          </motion.div>
        )}
      </AnimatePresence>
      {!view && <TabBar tab={tab} setTab={setTab} />}
      <Toast message={toast.message} visible={toast.visible} onHide={hideToast} />
    </div>
  );
}
