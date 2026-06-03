"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { 
  Search, 
  FileText, 
  Shield, 
  ShieldAlert, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  X, 
  Copy, 
  Plus, 
  Trash2, 
  Edit3, 
  RotateCcw, 
  Check, 
  Users, 
  DollarSign, 
  Filter, 
  Download, 
  Calendar,
  Lock,
  Unlock,
  Eye,
  Settings,
  HelpCircle,
  Smartphone,
  Key
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { 
  INITIAL_MEMBERS, 
  VALOR_MENSALIDADE, 
  SENHA_ADMIN, 
  CHAVE_PIX_GERAL, 
  MESES, 
  MESES_CURTOS,
  Membro 
} from "@/lib/constants";

let toastIdCounter = 0;

export default function Home() {
  // 1. Core State
  const [mounted, setMounted] = useState(false);
  const [members, setMembers] = useState<Membro[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"todos" | "em_dia" | "pendente">("todos");
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<number | "all">("all");
  const [referenceMonth, setReferenceMonth] = useState<number>(5); // Default is June (0=Jan, 5=Jun)
  
  // Custom Editable Configurations (Point 4)
  const [valorMensalidade, setValorMensalidade] = useState<number>(VALOR_MENSALIDADE);
  const [senhaAdmin, setSenhaAdmin] = useState<string>(SENHA_ADMIN);
  const [chavePixGeral, setChavePixGeral] = useState<string>(CHAVE_PIX_GERAL);
  const [senhaMembros, setSenhaMembros] = useState<string>("");

  // Input states for settings form
  const [valorMensalidadeInput, setValorMensalidadeInput] = useState<number>(VALOR_MENSALIDADE);
  const [senhaAdminInput, setSenhaAdminInput] = useState<string>(SENHA_ADMIN);
  const [chavePixInput, setChavePixInput] = useState<string>(CHAVE_PIX_GERAL);
  const [senhaMembrosInput, setSenhaMembrosInput] = useState<string>("");

  // Gate/auth for members if password is configured
  const [memberUnlocked, setMemberUnlocked] = useState<boolean>(false);
  const [memberPasswordInput, setMemberPasswordInput] = useState<string>("");
  const [memberPasswordError, setMemberPasswordError] = useState<boolean>(false);

  // Top Menu Tab for Admin panel (Point 3)
  const [adminActiveTab, setAdminActiveTab] = useState<"metrics" | "charts" | "ledger" | "operations" | "settings">("metrics");

  // Subdomain Routing Model
  const [activeSubdomain, setActiveSubdomain] = useState<"consulta" | "admin">("consulta");
  
  // Admin Mode
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminPasswordModal, setShowAdminPasswordModal] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [adminPasswordError, setAdminPasswordError] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [editingMember, setEditingMember] = useState<{ index: number; name: string } | null>(null);

  // Modal Payments
  const [selectedPayment, setSelectedPayment] = useState<{
    memberName: string;
    description: string;
    value: number;
    pixCode: string;
  } | null>(null);

  // Dynamic Dashboard Toast system
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "info" | "error" }[]>([]);

  // Chart hover / interactions
  const [hoveredMonthIdx, setHoveredMonthIdx] = useState<number | null>(null);

  // User selected months to pay in public search view
  const [userSelectedMonths, setUserSelectedMonths] = useState<Record<string, number[]>>({});

  const handleToggleMonthSelection = (memberName: string, monthIdx: number, allUnpaid: number[]) => {
    const currentSelected = userSelectedMonths[memberName] !== undefined
      ? userSelectedMonths[memberName]
      : allUnpaid;
    
    let nextSelected: number[];
    if (currentSelected.includes(monthIdx)) {
      nextSelected = currentSelected.filter(idx => idx !== monthIdx);
    } else {
      nextSelected = [...currentSelected, monthIdx].sort((a, b) => a - b);
    }
    setUserSelectedMonths(prev => ({
      ...prev,
      [memberName]: nextSelected
    }));
  };

  const handleSelectAllMonths = (memberName: string, allUnpaid: number[]) => {
    setUserSelectedMonths(prev => ({
      ...prev,
      [memberName]: allUnpaid
    }));
  };

  const handleSelectNoMonths = (memberName: string) => {
    setUserSelectedMonths(prev => ({
      ...prev,
      [memberName]: []
    }));
  };

  const abrirModalPagamentoCustomizado = (nome: string, mesesIdxs: number[]) => {
    if (mesesIdxs.length === 0) {
      showToast("Selecione pelo menos um mês para realizar o pagamento", "error");
      return;
    }
    const sortedMeses = [...mesesIdxs].sort((a, b) => a - b);
    const mesesNomes = sortedMeses.map(idx => MESES_CURTOS[idx]).join(", ");
    const value = sortedMeses.length * valorMensalidade;
    setSelectedPayment({
      memberName: nome,
      description: `Quitação de Mensalidade(s): ${mesesNomes}`,
      value: value,
      pixCode: chavePixGeral
    });
  };

  // 2. Load and Save Persistence
  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
      try {
        const saved = localStorage.getItem("rnc_members_database");
        if (saved) {
          setMembers(JSON.parse(saved));
        } else {
          localStorage.setItem("rnc_members_database", JSON.stringify(INITIAL_MEMBERS));
          setMembers(INITIAL_MEMBERS);
        }

        // Load config states from localStorage or use defaults
        const savedValor = localStorage.getItem("rnc_valor_mensalidade");
        if (savedValor) {
          const v = Number(savedValor);
          setValorMensalidade(v);
          setValorMensalidadeInput(v);
        }
        
        const savedSenhaAdmin = localStorage.getItem("rnc_senha_admin");
        if (savedSenhaAdmin) {
          setSenhaAdmin(savedSenhaAdmin);
          setSenhaAdminInput(savedSenhaAdmin);
        }
        
        const savedChavePix = localStorage.getItem("rnc_chave_pix");
        if (savedChavePix) {
          setChavePixGeral(savedChavePix);
          setChavePixInput(savedChavePix);
        }
        
        const savedSenhaMembros = localStorage.getItem("rnc_senha_membros");
        if (savedSenhaMembros) {
          setSenhaMembros(savedSenhaMembros);
          setSenhaMembrosInput(savedSenhaMembros);
        }
      } catch (e) {
        console.error("Error reading from localStorage:", e);
        setMembers(INITIAL_MEMBERS);
      }
      
      // Set actual current month (June 2026 -> index 5)
      const today = new Date("2026-06-03T10:47:48Z");
      setReferenceMonth(today.getMonth()); // 5 for June
    }, 0);
  }, []);

  const saveDatabase = (updatedList: Membro[]) => {
    try {
      localStorage.setItem("rnc_members_database", JSON.stringify(updatedList));
      setMembers(updatedList);
    } catch (e) {
      console.error("Error saving to localStorage:", e);
      showToast("Erro ao salvar alterações no navegador", "error");
    }
  };

  const saveSystemConfig = (newValor: number, newSenhaAdmin: string, newChavePix: string, newSenhaMembros: string) => {
    try {
      localStorage.setItem("rnc_valor_mensalidade", String(newValor));
      localStorage.setItem("rnc_senha_admin", newSenhaAdmin);
      localStorage.setItem("rnc_chave_pix", newChavePix);
      localStorage.setItem("rnc_senha_membros", newSenhaMembros);
      
      setValorMensalidade(newValor);
      setSenhaAdmin(newSenhaAdmin);
      setChavePixGeral(newChavePix);
      setSenhaMembros(newSenhaMembros);

      setValorMensalidadeInput(newValor);
      setSenhaAdminInput(newSenhaAdmin);
      setChavePixInput(newChavePix);
      setSenhaMembrosInput(newSenhaMembros);
      
      showToast("Configurações do sistema aplicadas e salvas com sucesso!", "success");
    } catch (e) {
      console.error("Error saving config:", e);
      showToast("Erro ao salvar configurações do sistema", "error");
    }
  };

  // Toast helper
  const showToast = (message: string, type: "success" | "info" | "error" = "success") => {
    toastIdCounter++;
    const id = `toast-${toastIdCounter}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // 3. Admin Authentication
  const handleAdminToggleClick = () => {
    if (isAdmin) {
      setIsAdmin(false);
      showToast("Modo administrador desativado", "info");
    } else {
      setShowAdminPasswordModal(true);
      setAdminPasswordError(false);
      setAdminPasswordInput("");
    }
  };

  const handleAdminPasswordSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (adminPasswordInput === senhaAdmin) {
      setIsAdmin(true);
      setShowAdminPasswordModal(false);
      setAdminPasswordInput("");
      setAdminPasswordError(false);
      showToast("Acesso concedido! Modo Administrador Ativo", "success");
    } else {
      setAdminPasswordError(true);
      showToast("Senha incorreta", "error");
    }
  };

  // 4. Financial Calculations
  const calculatedMetrics = useMemo(() => {
    if (!members.length) return {
      total: 0,
      paidAmount: 0,
      outstandingAmount: 0,
      delinquencyPercent: 0,
      membersUpToDate: 0,
      membersDelinquent: 0,
      monthlyStats: Array.from({ length: 12 }, (_, idx) => ({
        monthName: MESES[idx],
        shortName: MESES_CURTOS[idx],
        paidCount: 0,
        pendingCount: 0,
        totalPaidValue: 0,
        totalOutstandingValue: 0,
        paymentRatio: 0
      }))
    };

    let totalPaidMonths = 0;
    let totalPendingMonths = 0;
    let membersUpToDateCount = 0;
    let membersDelinquentCount = 0;

    // We analyze months up to referenceMonth (inclusive)
    members.forEach((m) => {
      let isUpToDate = true;
      for (let i = 0; i <= referenceMonth; i++) {
        if (m.pagamentos[i]) {
          totalPaidMonths += 1;
        } else {
          totalPendingMonths += 1;
          isUpToDate = false;
        }
      }
      if (isUpToDate) {
        membersUpToDateCount++;
      } else {
        membersDelinquentCount++;
      }
    });

    const paidTotalValue = totalPaidMonths * valorMensalidade;
    const outstandingTotalValue = totalPendingMonths * valorMensalidade;
    const expectedUpToReferenceMonth = (referenceMonth + 1) * members.length * valorMensalidade;
    const delinquencyRate = expectedUpToReferenceMonth > 0 
      ? (outstandingTotalValue / expectedUpToReferenceMonth) * 100 
      : 0;

    // Calculate monthly statistics for charts (dynamic analysis of Jan to Dec)
    const monthlyStats = Array.from({ length: 12 }, (_, monthIdx) => {
      let paidCount = 0;
      let pendingCount = 0;
      members.forEach((m) => {
        if (m.pagamentos[monthIdx]) {
          paidCount++;
        } else {
          pendingCount++;
        }
      });
      return {
        monthName: MESES[monthIdx],
        shortName: MESES_CURTOS[monthIdx],
        paidCount,
        pendingCount,
        totalPaidValue: paidCount * valorMensalidade,
        totalOutstandingValue: pendingCount * valorMensalidade,
        paymentRatio: members.length > 0 ? (paidCount / members.length) * 100 : 0
      };
    });

    return {
      total: members.length,
      paidAmount: paidTotalValue,
      outstandingAmount: outstandingTotalValue,
      delinquencyPercent: delinquencyRate,
      membersUpToDate: membersUpToDateCount,
      membersDelinquent: membersDelinquentCount,
      monthlyStats
    };
  }, [members, referenceMonth, valorMensalidade]);

  // 5. Filter & Search Ledger
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      // Name filter (case-insensitive fuzzy match)
      const matchesName = member.nome.toUpperCase().includes(searchQuery.trim().toUpperCase());
      
      // Delinquency Status filter up to reference month
      let isUpToDate = true;
      for (let i = 0; i <= referenceMonth; i++) {
        if (!member.pagamentos[i]) {
          isUpToDate = false;
          break;
        }
      }
      
      const matchesStatus = 
        statusFilter === "todos" ||
        (statusFilter === "em_dia" && isUpToDate) ||
        (statusFilter === "pendente" && !isUpToDate);

      // Selected Month filter (shows only if member has paid/pending in selected month)
      let matchesMonthFilter = true;
      if (selectedMonthFilter !== "all") {
        matchesMonthFilter = !member.pagamentos[selectedMonthFilter];
      }

      return matchesName && matchesStatus && matchesMonthFilter;
    });
  }, [members, searchQuery, statusFilter, selectedMonthFilter, referenceMonth]);

  // 6. Database Action Handlers
  const togglePaymentItem = (memberIndex: number, monthIndex: number) => {
    const member = members[memberIndex];
    if (activeSubdomain === "consulta") {
      if (!member.pagamentos[monthIndex]) {
        abrirModalPagamentoMensal(member.nome, monthIndex);
      } else {
        showToast(`Mensalidade de ${MESES[monthIndex]} de ${member.nome} já está PAGA!`, "success");
      }
      return;
    }
    
    // In the Admin subdomain, direct alterations are permitted if authenticated
    if (!isAdmin) {
      if (!member.pagamentos[monthIndex]) {
        abrirModalPagamentoMensal(member.nome, monthIndex);
      } else {
        showToast(`Mensalidade de ${MESES[monthIndex]} de ${member.nome} já está PAGA!`, "success");
      }
      return;
    }
    
    const newList = [...members];
    newList[memberIndex].pagamentos[monthIndex] = !newList[memberIndex].pagamentos[monthIndex];
    saveDatabase(newList);
    showToast(`Mensalidade de ${MESES_CURTOS[monthIndex]} alterada para ${newList[memberIndex].pagamentos[monthIndex] ? "PAGA" : "PENDENTE"}`, "success");
  };

  const quitMembroDebitoTotal = (memberIndex: number) => {
    const newList = [...members];
    const member = newList[memberIndex];
    
    // Mark all months up to December as true
    for (let i = 0; i < 12; i++) {
      member.pagamentos[i] = true;
    }
    
    saveDatabase(newList);
    showToast(`Todas as mensalidades de ${member.nome} foram liquidadas com sucesso!`, "success");
  };

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) {
      showToast("O nome do membro não pode estar vazio", "error");
      return;
    }

    const exists = members.some(m => m.nome.toUpperCase() === newMemberName.trim().toUpperCase());
    if (exists) {
      showToast("Já existe um membro registrado com esse nome", "error");
      return;
    }

    // Default: first two months paid
    const newMembro: Membro = {
      nome: newMemberName.trim().toUpperCase(),
      pagamentos: [true, true, false, false, false, false, false, false, false, false, false, false]
    };

    const newList = [newMembro, ...members];
    saveDatabase(newList);
    setNewMemberName("");
    showToast(`Membro registrado com sucesso: ${newMembro.nome}`, "success");
  };

  const handleDeleteMember = (index: number) => {
    const member = members[index];
    if (confirm(`Tem certeza que deseja descredenciar ${member.nome}? Esta ação é irreversível.`)) {
      const newList = members.filter((_, idx) => idx !== index);
      saveDatabase(newList);
      showToast(`Membro ${member.nome} foi desregistrado`, "info");
    }
  };

  const startEditing = (index: number, currentName: string) => {
    setEditingMember({ index, name: currentName });
  };

  const submitEditMember = () => {
    if (!editingMember) return;
    if (!editingMember.name.trim()) {
      showToast("O nome não pode estar em branco", "error");
      return;
    }

    const newList = [...members];
    const oldName = newList[editingMember.index].nome;
    newList[editingMember.index].nome = editingMember.name.trim().toUpperCase();
    saveDatabase(newList);
    showToast(`Membro alterado de ${oldName} para ${newList[editingMember.index].nome}`, "success");
    setEditingMember(null);
  };

  const resetToFactoryData = () => {
    if (confirm("Deseja apagar todas as alterações do localstorage e restaurar a planilha original de 59 membros?")) {
      localStorage.setItem("rnc_members_database", JSON.stringify(INITIAL_MEMBERS));
      setMembers(INITIAL_MEMBERS);
      showToast("Base original reestabelecida com sucesso", "success");
    }
  };

  // 7. Modals
  const abrirModalPagamentoMensal = (nome: string, monthIdx: number) => {
    const description = `Mensalidade de ${MESES[monthIdx]}`;
    setSelectedPayment({
      memberName: nome,
      description,
      value: valorMensalidade,
      pixCode: chavePixGeral
    });
  };

  const abrirModalPagamentoTotal = (nome: string, debitoValor: number) => {
    setSelectedPayment({
      memberName: nome,
      description: "Quitação de Débito Geral Estimado",
      value: debitoValor,
      pixCode: chavePixGeral
    });
  };

  const copiarChavePix = () => {
    if (!selectedPayment) return;
    try {
      navigator.clipboard.writeText(selectedPayment.pixCode);
      showToast("Chave PIX copiada com sucesso!", "success");
    } catch (e) {
      // Fallback copy
      const el = document.createElement("textarea");
      el.value = selectedPayment.pixCode;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      showToast("Chave PIX copiada para a área de transferência", "success");
    }
  };

  // 8. PDF Export & Beautiful Native Page Printing Layout
  const triggerPdfExport = () => {
    showToast("Gerando relatório formatado em PDF... Por favor, escolha 'Salvar como PDF' na caixa de diálogo de impressão.", "info");
    setTimeout(() => {
      window.print();
    }, 500);
  };

  // 9. SVG Chart Dimensions and Draw math
  const maxCollectionAmount = useMemo(() => {
    const values = calculatedMetrics.monthlyStats.map((s) => s.totalPaidValue);
    const max = Math.max(...values, 100);
    return Math.ceil(max / 100) * 100; // Round up to nearest 100
  }, [calculatedMetrics.monthlyStats]);

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen py-4 px-4 sm:px-6 md:py-8 font-sans transition-colors relative print:bg-white print:p-0 print:text-black" id="applet-viewport">
      {/* Dynamic Slide Toasts */}
      <div className="fixed top-4 right-4 z-[999] flex flex-col gap-2 max-w-sm pointer-events-none print:hidden" id="toast-container">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              key={toast.id}
              className={`p-4 rounded-xl shadow-lg border text-sm font-semibold flex items-center justify-between gap-3 pointer-events-auto ${
                toast.type === "success" 
                  ? "bg-green-50 border-green-200 text-green-800" 
                  : toast.type === "error" 
                  ? "bg-red-50 border-red-200 text-red-800"
                  : "bg-blue-50 border-blue-200 text-blue-800"
              }`}
            >
              <div className="flex items-center gap-2">
                {toast.type === "success" ? <CheckCircle className="w-5 h-5 text-green-600" /> : <AlertTriangle className="w-5 h-5" />}
                <span>{toast.message}</span>
              </div>
              <button 
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="hover:bg-slate-100 p-1 rounded-md text-slate-400 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Printable Only Invoice Banner */}
      <div className="hidden print:block w-full border-b-2 border-slate-900 pb-6 mb-8" id="print-header">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-2xl font-black bg-indigo-650 bg-indigo-600 text-white p-2 rounded-lg">RNC</span>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Relatório de Mensalidades</h1>
            </div>
            <p className="text-slate-500 text-sm mt-1">Gestão de Mensalidades, Arrecadação e Análise de Inadimplência</p>
          </div>
          <div className="text-right text-sm text-slate-500 font-mono">
            <p>Data de Emissão: {mounted ? new Date().toLocaleDateString("pt-BR") : "--/--/----"}</p>
            <p>Hora: {mounted ? new Date().toLocaleTimeString("pt-BR") : "--:--:--"}</p>
            <p>Mês de Referência: <span className="font-bold text-slate-900">{MESES[referenceMonth]} / 2026</span></p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* MOCK BROWSER FRAME / DOMAIN SELECTOR */}
        <div className="bg-slate-900 rounded-2xl p-4 shadow-xl border border-slate-800 print:hidden" id="mock-browser-bar">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
            {/* Mock Window Controls + Tabs select */}
            <div className="flex items-center gap-4">
              {/* Colored Dots */}
              <div className="flex items-center gap-1.5 shrink-0 hidden md:flex">
                <span className="w-3 h-3 rounded-full bg-rose-500/90 shadow-sm" />
                <span className="w-3 h-3 rounded-full bg-amber-400/90 shadow-sm" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/90 shadow-sm" />
              </div>
              
              {/* Tab Controllers */}
              <div className="flex items-center gap-1 p-1 bg-slate-950/65 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setActiveSubdomain("consulta");
                    showToast("Workspace: consulta.rnc.financeiro", "info");
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                    activeSubdomain === "consulta"
                      ? "bg-red-600 text-white shadow-md shadow-red-950/40"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>consulta.rnc.financeiro</span>
                  <span className="bg-slate-800 px-1.5 py-0.5 text-[9px] rounded font-mono text-slate-300">Consulta Pública</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveSubdomain("admin");
                    showToast("Workspace: admin.rnc.financeiro", "info");
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                    activeSubdomain === "admin"
                      ? "bg-amber-650 bg-amber-600 text-white shadow-md shadow-amber-950/40"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>admin.rnc.financeiro</span>
                  <span className="bg-slate-800 px-1.5 py-0.5 text-[9px] rounded font-mono text-slate-300">Controle Admin</span>
                </button>
              </div>
            </div>

            {/* Credential Indicators */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 self-end sm:self-center pr-1.5">
              <span className="text-slate-500 font-medium">Credencial:</span>
              {isAdmin ? (
                <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md font-mono text-[10px]">
                  <Check className="w-3.5 h-3.5" /> ADMINISTRADOR AUTENTICADO
                </span>
              ) : (
                <span className="flex items-center gap-1 text-slate-400 bg-slate-800/50 border border-slate-800 px-2 py-0.5 rounded-md font-mono text-[10px]">
                  <Lock className="w-3.5 h-3.5 text-slate-500" /> LEITOR GERAL (PÚBLICO)
                </span>
              )}
            </div>
          </div>

          {/* Browser Path Bar */}
          <div className="flex items-center gap-3 pt-3 px-1.5">
            {/* Nav Arrows */}
            <div className="flex items-center gap-1.5 shrink-0 text-slate-500">
              <button 
                type="button"
                onClick={() => {
                  const target = activeSubdomain === "admin" ? "consulta" : "admin";
                  setActiveSubdomain(target);
                  showToast(`Voltando para ${target}.rnc.financeiro`, "info");
                }}
                className="p-1 rounded hover:bg-slate-800 hover:text-slate-250 transition cursor-pointer"
                title="Voltar Página"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button 
                type="button"
                onClick={() => {
                  const target = activeSubdomain === "admin" ? "consulta" : "admin";
                  setActiveSubdomain(target);
                  showToast(`Avançando para ${target}.rnc.financeiro`, "info");
                }}
                className="p-1 rounded hover:bg-slate-800 hover:text-slate-250 transition cursor-pointer"
                title="Avançar Página"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button 
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("todos");
                  setSelectedMonthFilter("all");
                  showToast("Filtros do subdomínio reiniciados com sucesso!", "success");
                }}
                className="p-1 rounded hover:bg-slate-800 hover:text-slate-250 transition cursor-pointer"
                title="Recarregar Subdomínio"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17" />
                </svg>
              </button>
            </div>

            {/* Address Input */}
            <div className="flex-grow flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-mono select-none overflow-hidden relative shadow-inner">
              {activeSubdomain === "consulta" ? (
                <>
                  <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="text-emerald-500 shrink-0 font-bold">Seguro</span>
                  <span className="text-slate-600 font-normal">|</span>
                  <span className="text-slate-200 font-semibold truncate">
                    https://<span className="text-red-500 font-black">consulta</span>.rnc.financeiro/associados/debitos
                  </span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="text-amber-500 shrink-0 font-bold">Criptografado</span>
                  <span className="text-slate-600 font-normal">|</span>
                  <span className="text-slate-200 font-semibold truncate">
                    https://<span className="text-amber-500 font-black">admin</span>.rnc.financeiro/gestao/alteraciones
                  </span>
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded text-[9.5px] font-bold text-amber-400 tracking-wider">
                    RESTRITO
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* SUBDOMAIN GATE CONDITIONAL WALL */}
        {activeSubdomain === "admin" && !isAdmin ? (
          <div className="max-w-md mx-auto py-12 px-4 print:hidden animate-scale-up" id="admin-domain-gate">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600"></div>
              
              <div className="p-8 text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-amber-50 border border-amber-100 rounded-full flex items-center justify-center text-amber-650 text-amber-600 shadow-inner-white">
                  <Lock className="w-8 h-8" />
                </div>
                
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold uppercase bg-amber-150 bg-amber-100 text-amber-800 px-3 py-1 rounded-full inline-block tracking-wider">
                    SUBDOMÍNIO PROTEGIDO
                  </span>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">admin.rnc.financeiro</h2>
                  <p className="text-xs text-slate-500 leading-relaxed px-4">
                    Este subdomínio habilita alterações diretas no banco de dados de pagamentos de mensalidades. Autentique-se para prosseguir.
                  </p>
                </div>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAdminPasswordSubmit();
                  }}
                  className="space-y-4 pt-2 text-left"
                >
                  <div>
                    <label htmlFor="gatePasswordInput" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Senha de Acesso:</label>
                    <div className="relative">
                      <input 
                        type="password" 
                        id="gatePasswordInput"
                        placeholder="••••"
                        value={adminPasswordInput}
                        onChange={(e) => {
                          setAdminPasswordInput(e.target.value);
                          setAdminPasswordError(false);
                        }}
                        className={`w-full p-3 bg-slate-50 border rounded-lg text-center text-lg tracking-widest font-black outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                          adminPasswordError ? "border-red-400 bg-red-50/20 focus:ring-red-500" : "border-slate-200"
                        }`}
                        autoFocus
                      />
                    </div>
                  </div>

                  {adminPasswordError && (
                    <p className="text-red-500 text-xs font-bold text-center flex items-center justify-center gap-1 bg-red-50 py-2 rounded-lg animate-shake">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {"Senha inválida. Use a senha padrão \"1234\"."}
                    </p>
                  )}

                  <div className="grid grid-cols-1 gap-2 pt-2">
                    <button 
                      type="submit"
                      className="w-full py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition shadow-lg active:scale-95 cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wide"
                    >
                      <Unlock className="w-4 h-4" />
                      <span>Autenticar admin</span>
                    </button>
                    
                    <button 
                      type="button"
                      onClick={() => {
                        setActiveSubdomain("consulta");
                        showToast("Visualização pública de débitos reativada", "info");
                      }}
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg transition text-center cursor-pointer uppercase tracking-tight"
                    >
                      Voltar à Consulta Pública
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* PORTAL DE CONSULTA GERAL - HERO ZONE (Exibido apenas no subdomínio Consulta Pública) */}
            {activeSubdomain === "consulta" && (
              <>
                <section className="bg-gradient-to-r from-red-700 via-red-600 to-rose-700 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden animate-fade-in border border-red-500/20 print:hidden mb-1" id="domain-initial-hero">
                  {/* Decorative abstract circles */}
                  <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-500/20 rounded-full blur-xl -ml-20 -mb-20 pointer-events-none"></div>
                  
                  <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-2 max-w-xl">
                      <span className="text-[10px] sm:text-xs font-bold tracking-widest bg-white/20 text-red-100 px-3 py-1 rounded-full uppercase inline-block">
                        Portal Público de Transparência • RNC
                      </span>
                      <h1 className="text-2xl sm:text-3.5xl font-extrabold tracking-tight text-white leading-tight">
                        Painel de Consulta Pública
                      </h1>
                      <p className="text-sm text-red-100/90 leading-relaxed">
                        Digite seu nome ou iniciais abaixo para consultar sua situação individual de forma privada, segura e com total discrição.
                      </p>
                    </div>

                    {/* Buttons for Members and Admin Areas */}
                    <div className="flex flex-wrap items-center gap-1.5 border border-white/15 bg-white/10 p-1.5 rounded-xl self-start lg:self-center shrink-0">
                      {/* Botão para membros */}
                      <button
                        type="button"
                        id="btn-switch-membros"
                        onClick={() => {
                          setActiveSubdomain("consulta");
                          showToast("Você já está na área Pública de Consulta de Membros!", "success");
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-black rounded-lg transition-all cursor-pointer bg-white text-red-700 shadow"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Área de Membros</span>
                      </button>

                      {/* Botão para área do administrador */}
                      <button
                        type="button"
                        id="btn-switch-admin"
                        onClick={() => {
                          setActiveSubdomain("admin");
                          if (!isAdmin) {
                            showToast("Acessando o subdomínio administrativo. Por favor, insira sua senha de administrador.", "info");
                          } else {
                            showToast("Redirecionado para Painel Admin!", "success");
                          }
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer text-white/85 hover:text-white hover:bg-white/5"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Área do Administrador</span>
                      </button>
                    </div>
                  </div>

                  {/* The main search bar */}
                  <div className="mt-6 sm:mt-8 bg-white/10 p-2 rounded-xl backdrop-blur-sm border border-white/10 max-w-2xl relative">
                    <div className="relative">
                      <input
                        type="text"
                        id="heroSearchInput"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                        }}
                        placeholder="Insira seu nome ou sobrenome para consultar..."
                        className="w-full pl-12 pr-10 py-3.5 bg-white text-slate-800 rounded-lg focus:ring-4 focus:ring-red-350 focus:ring-red-300 outline-none text-sm sm:text-base font-semibold shadow-inner transition placeholder:text-slate-400"
                        autoFocus={activeSubdomain === "consulta"}
                      />
                      <Search className="w-5 h-5 text-red-650 text-red-600 absolute left-4 top-1/2 -translate-y-1/2 font-bold" />
                      {searchQuery && (
                        <button 
                          type="button"
                          onClick={() => {
                            setSearchQuery("");
                            showToast("Filtro de busca limpo", "info");
                          }}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition cursor-pointer"
                          title="Limpar pesquisa"
                        >
                          <X className="w-4 h-4 font-bold" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Search match stats */}
                  {searchQuery && (
                    <div className="mt-3 flex items-center justify-between text-xs text-red-105 text-red-100 flex-wrap gap-2 animate-fade-in px-1">
                      <span>Resultado do filtro: <b className="text-white font-semibold">{"\""}{searchQuery}{"\""}</b></span>
                      <span>Encontrado(s) <b className="text-white font-bold">{filteredMembers.length}</b> associado(s)</span>
                    </div>
                  )}
                </section>

                {/* PUBLIC SEARCH SECTION WITH REMAINING MONTH CARDS FOR PUBLIC VIEW */}
                <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6" id="public-search-results">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Users className="w-5 h-5 text-red-600" />
                      {searchQuery ? "Resultado da Pesquisa de Mensalidades" : "Consulta de Regularidade de Mensalidades"}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Veja sua situação atualizada e realize o pagamento por Pix para quitação automatizada de mensalidades.
                    </p>
                  </div>

                  {!searchQuery.trim() ? (
                    <div className="text-center py-12 bg-slate-50 border border-slate-100 rounded-xl space-y-4">
                      <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                        <Search className="w-5 h-5 animate-pulse" />
                      </div>
                      <div className="max-w-md mx-auto space-y-2">
                        <h3 className="font-bold text-slate-800 text-sm">Painel de Consulta Individual Silenciosa</h3>
                        <p className="text-slate-500 text-xs leading-relaxed">
                          Para garantir a privacidade dos filiados e evitar a exposição de dados, a listagem geral de membros foi ocultada deste portal público.
                        </p>
                        <p className="text-slate-500 text-xs font-semibold bg-red-50 text-red-700 py-1 px-3 rounded-lg inline-block">
                          Insira seu nome ou iniciais no campo de busca acima para consultar sua situação.
                        </p>
                      </div>
                    </div>
                  ) : filteredMembers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredMembers.map((member, index) => {
                        const pendingMonthsCount = member.pagamentos.filter((p, mIdx) => !p && mIdx <= referenceMonth).length;
                        const debitoAmount = pendingMonthsCount * valorMensalidade;
                        const isUpToDate = debitoAmount === 0;

                        // List of unpaid month indexes (up to referenceMonth)
                        const unpaidMonthIndexes = member.pagamentos
                          .map((pago, mIdx) => (!pago && mIdx <= referenceMonth) ? mIdx : null)
                          .filter((idx): idx is number => idx !== null);

                        // List of paid month indexes (Point 1: show paid as well)
                        const paidMonthIndexes = member.pagamentos
                          .map((pago, mIdx) => (pago) ? mIdx : null)
                          .filter((idx): idx is number => idx !== null);

                        const selectedMonthsForMember = userSelectedMonths[member.nome] !== undefined
                          ? userSelectedMonths[member.nome]
                          : unpaidMonthIndexes;

                        const selectedDebitoAmount = selectedMonthsForMember.length * valorMensalidade;

                        return (
                          <div key={index} className="bg-white border border-slate-100 hover:border-red-200 shadow-sm rounded-xl p-5 hover:shadow-md transition duration-200 flex flex-col justify-between relative overflow-hidden">
                            {!isUpToDate && (
                              <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none overflow-hidden">
                                <div className="absolute transform rotate-45 bg-red-500 text-[8px] font-extrabold text-white text-center py-1 right-[-32px] top-[14px] w-[95px] uppercase tracking-widest shadow">
                                  Débito
                                </div>
                              </div>
                            )}
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <h3 className="font-bold text-slate-800 text-base line-clamp-1 pr-6">{member.nome}</h3>
                                <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full ${
                                  isUpToDate 
                                    ? "bg-emerald-100 text-emerald-800" 
                                    : "bg-red-50 text-red-700 animate-pulse border border-red-100"
                                }`}>
                                  {isUpToDate ? "Quite" : `Pendente`}
                                </span>
                              </div>

                              <div className="text-xs space-y-1.5 text-slate-600">
                                <div className="flex justify-between">
                                  <span>Mês do Limite:</span>
                                  <span className="font-bold text-slate-700">{MESES[referenceMonth]}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Mensalidades não Pagas:</span>
                                  <span className={`font-bold ${isUpToDate ? "text-emerald-600" : "text-red-600 font-extrabold"}`}>
                                    {pendingMonthsCount} mes(es)
                                  </span>
                                </div>
                                <div className="flex justify-between border-t border-slate-100 pt-2 mt-2">
                                  <span className="font-bold">Total Pendente:</span>
                                  <span className={`font-extrabold text-sm ${isUpToDate ? "text-emerald-600" : "text-slate-500 line-through text-xs font-semibold"}`}>
                                    R$ {debitoAmount.toFixed(2).replace(".", ",")}
                                  </span>
                                </div>
                                {!isUpToDate && (
                                  <div className="flex justify-between pt-1 border-b border-dashed border-slate-100 pb-2">
                                    <span className="font-bold text-red-600">Total Selecionado:</span>
                                    <span className="font-extrabold text-sm text-red-600 animate-pulse">
                                      R$ {selectedDebitoAmount.toFixed(2).replace(".", ",")}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Seção de mensalidades pagas (Request 1) */}
                              <div className="pt-2.5 border-t border-slate-100">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Mensalidades Pagas:</span>
                                {paidMonthIndexes.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {paidMonthIndexes.map((mIdx) => (
                                      <span key={mIdx} className="bg-emerald-50 text-emerald-800 border border-emerald-100 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5" title="Pago">
                                        <b>{MESES_CURTOS[mIdx]}</b>
                                        <span className="text-[8px] text-emerald-600 font-extrabold">✓</span>
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-slate-400 italic font-medium">Nenhuma mensalidade paga em 2026.</span>
                                )}
                              </div>

                              {/* Show outstanding months with checkable toggles */}
                              {!isUpToDate && (
                                <div className="pt-2">
                                  <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Selecione para pagar:</span>
                                    <div className="flex gap-2">
                                      <button
                                        type="button"
                                        onClick={() => handleSelectAllMonths(member.nome, unpaidMonthIndexes)}
                                        className="text-[10px] font-bold text-red-600 hover:underline cursor-pointer"
                                      >
                                        Todos
                                      </button>
                                      <span className="text-[10px] text-slate-350">|</span>
                                      <button
                                        type="button"
                                        onClick={() => handleSelectNoMonths(member.nome)}
                                        className="text-[10px] font-bold text-slate-500 hover:underline cursor-pointer"
                                      >
                                        Limpar
                                      </button>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-3 gap-1.5">
                                    {unpaidMonthIndexes.map((mIdx) => {
                                      const isSelected = selectedMonthsForMember.includes(mIdx);
                                      return (
                                        <button
                                          key={mIdx}
                                          type="button"
                                          onClick={() => handleToggleMonthSelection(member.nome, mIdx, unpaidMonthIndexes)}
                                          className={`flex items-center justify-between border px-2 py-1 rounded-lg text-xs font-bold transition duration-150 cursor-pointer ${
                                            isSelected
                                              ? "bg-red-50 text-red-700 border-red-200 shadow-sm"
                                              : "bg-slate-50 text-slate-450 border-slate-200 hover:bg-slate-100 hover:text-slate-600"
                                          }`}
                                        >
                                          <span>{MESES_CURTOS[mIdx]}</span>
                                          <span className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] ${
                                            isSelected 
                                              ? "bg-red-600 border-red-600 text-white" 
                                              : "border-slate-300 bg-white text-transparent"
                                          }`}>
                                            ✓
                                          </span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="pt-4 mt-2">
                              {!isUpToDate ? (
                                <button
                                  type="button"
                                  disabled={selectedMonthsForMember.length === 0}
                                  onClick={() => abrirModalPagamentoCustomizado(member.nome, selectedMonthsForMember)}
                                  className={`w-full font-bold text-xs py-2 px-4 rounded-lg shadow-sm transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider ${
                                    selectedMonthsForMember.length === 0
                                      ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none"
                                      : "bg-red-600 hover:bg-red-700 text-white"
                                  }`}
                                >
                                  <Download className="w-3.5 h-3.5 animate-bounce" />
                                  <span>
                                    {selectedMonthsForMember.length === unpaidMonthIndexes.length
                                      ? `Pagar Tudo (R$ ${selectedDebitoAmount.toFixed(2).replace(".", ",")})`
                                      : `Pagar Selecionados (R$ ${selectedDebitoAmount.toFixed(2).replace(".", ",")})`}
                                  </span>
                                </button>
                              ) : (
                                <div className="text-center py-2 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5">
                                  <span>✓ Parabéns! Sem débitos ativos</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-slate-50 border border-slate-100 rounded-xl">
                      <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 font-medium italic text-xs">
                        Nenhum membro filiado correspondente ao filtro foi encontrado.
                      </p>
                    </div>
                  )}
                </section>
              </>
            )}

            {/* UPPER BANNER / APP HEADER & ADMIN-ONLY LAYOUT ZONE */}
            {activeSubdomain === "admin" && (
              <>
                <header className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden" id="app-header">
              {/* Subtle Accent Stripe from Bento Grid theme */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 via-red-600 to-rose-600"></div>
              
              <div className="flex items-start gap-4">
                <div className={`p-3.5 rounded-xl shadow-md text-white flex-shrink-0 transition-colors duration-300 ${activeSubdomain === "admin" ? "bg-amber-600" : "bg-red-600"}`}>
                  {activeSubdomain === "admin" ? <Shield className="w-7 h-7" /> : <Users className="w-7 h-7" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full transition-colors ${activeSubdomain === "admin" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                      {activeSubdomain === "admin" ? "CONEXÃO CRIPTOGRAFADA" : "MONITORAMENTO REAL-TIME"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono font-semibold">SUBDOMÍNIO: {activeSubdomain.toUpperCase()}</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
                    {activeSubdomain === "admin" 
                      ? "Painel Administrativo • RNC (Alterações)" 
                      : "Consulta Pública de Mensalidades • RNC"}
                  </h1>
                  <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">
                    {activeSubdomain === "admin"
                      ? "Workspace restrito para controle e edição de boletos de mensalidades do ano corrente de 2026."
                      : "Estatísticas de adimplência consolidada, busca rápida de associados e instrução detalhada de pagamento Pix."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 self-start md:self-center">
                {/* PDF Print Button */}
                <button
                  id="btn-export-pdf"
                  onClick={triggerPdfExport}
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 font-semibold py-2 px-4 rounded-lg transition shadow-sm flex items-center gap-2 text-sm cursor-pointer"
                  title="Exportar para arquivo PDF formatado"
                >
                  <Download className="w-4 h-4 text-slate-500" />
                  <span>Exportar PDF</span>
                </button>

                {/* Admin Toggle button */}
                <button
                  id="btn-admin-access"
                  onClick={handleAdminToggleClick}
                  className={`py-2 px-4 rounded-lg font-semibold text-sm transition flex items-center gap-2 border shadow-lg cursor-pointer ${
                    isAdmin 
                      ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-150" 
                      : "bg-red-600 hover:bg-red-700 text-white border-transparent shadow-red-100"
                  }`}
                >
                  {isAdmin ? <Unlock className="w-4 h-4 text-amber-600 animate-pulse" /> : <Lock className="w-4 h-4" />}
                  <span>{isAdmin ? "Sair do Administrador" : "Acesso Restrito"}</span>
                </button>
              </div>
            </header>

            {/* HIGH QUALITY ADMIN TOP NAVIGATION MENU (Point 3) */}
            {isAdmin && (
              <nav className="bg-slate-100/80 p-2.5 rounded-2xl border border-slate-200/80 shadow-md flex flex-col md:flex-row gap-2 print:hidden mb-1 animate-fade-in" id="admin-top-tabs">
                <button
                  type="button"
                  onClick={() => setAdminActiveTab("metrics")}
                  className={`py-3 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer justify-start md:justify-center flex-1 ${
                    adminActiveTab === "metrics"
                      ? "bg-red-600 text-white shadow-lg shadow-red-200/50"
                      : "text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200"
                  }`}
                >
                  <TrendingUp className="w-4 h-4 shrink-0" />
                  <span className="truncate">Métricas de Inadimplência</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdminActiveTab("charts")}
                  className={`py-3 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer justify-start md:justify-center flex-1 ${
                    adminActiveTab === "charts"
                      ? "bg-red-600 text-white shadow-lg shadow-red-200/50"
                      : "text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200"
                  }`}
                >
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span className="truncate">Evolução dos Pagamentos</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdminActiveTab("ledger")}
                  className={`py-3 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer justify-start md:justify-center flex-1 ${
                    adminActiveTab === "ledger"
                      ? "bg-red-600 text-white shadow-lg shadow-red-200/50"
                      : "text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200"
                  }`}
                >
                  <FileText className="w-4 h-4 shrink-0" />
                  <span className="truncate">Livro de Registro & Filtros</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdminActiveTab("operations")}
                  className={`py-3 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer justify-start md:justify-center flex-1 ${
                    adminActiveTab === "operations"
                      ? "bg-red-600 text-white shadow-lg shadow-red-200/50"
                      : "text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200"
                  }`}
                >
                  <Users className="w-4 h-4 shrink-0" />
                  <span className="truncate">Operações Avançadas</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdminActiveTab("settings")}
                  className={`py-3 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer justify-start md:justify-center flex-1 ${
                    adminActiveTab === "settings"
                      ? "bg-red-600 text-white shadow-lg shadow-red-200/50"
                      : "text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200"
                  }`}
                >
                  <Settings className="w-4 h-4 shrink-0" />
                  <span className="truncate">Configurações do Sistema</span>
                </button>
              </nav>
            )}

        {/* METRICS / ANALYTICS SECTION */}
        {adminActiveTab === "metrics" && (
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm print:shadow-none print:border-none print:p-0" id="analytical-cards">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-4 mb-6 gap-4 print:mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-red-600" />
                Métricas Consolidadas de Inadimplência
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Cálculos atualizados com base no limite do mês de referência configurado.</p>
            </div>

            {/* REFERENCE MONTH CONTROL */}
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-2 rounded-xl print:hidden">
              <label htmlFor="referenceMonthSelect" className="text-xs font-bold text-slate-500 pl-2">Mês de Referência:</label>
              <select
                id="referenceMonthSelect"
                value={referenceMonth}
                onChange={(e) => {
                  setReferenceMonth(Number(e.target.value));
                  showToast(`Mês de referência alterado para ${MESES[Number(e.target.value)]}`, "info");
                }}
                className="bg-white text-slate-800 text-xs font-bold py-1.5 px-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 active:ring-red-500"
              >
                {MESES.map((nome, idx) => (
                  <option key={idx} value={idx}>{nome}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="kpi-grids">
            {/* Card 1: Total arrecadado */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition duration-200 relative overflow-hidden flex flex-col justify-between" id="kpi-collected">
              <div className="space-y-2 flex-grow">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Receita Prevista (Total)</span>
                <span className="text-2xl sm:text-3xl font-bold mt-2 text-red-600 block tracking-tight">R$ {calculatedMetrics.paidAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <div className="mt-4 flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-green-150 bg-green-100 text-green-700 text-xs font-semibold rounded-full">+12.5%</span>
                  <span className="text-xs text-slate-400">vs mês anterior</span>
                </div>
              </div>
              <div className="absolute top-6 right-6 bg-red-50 text-red-600 p-2.5 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            {/* Card 2: Valor Pendente */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition duration-200 relative overflow-hidden flex flex-col justify-between" id="kpi-outstanding">
              <div className="space-y-2 flex-grow">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Inadimplência Real</span>
                <span className="text-2xl sm:text-3xl font-bold mt-2 text-rose-500 block tracking-tight">R$ {calculatedMetrics.outstandingAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <div className="mt-4 flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-xs font-semibold rounded-full">-2.1%</span>
                  <span className="text-xs text-slate-400">melhoria real</span>
                </div>
              </div>
              <div className="absolute top-6 right-6 bg-rose-50 text-rose-600 p-2.5 rounded-lg flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 animate-pulse" />
              </div>
            </div>

            {/* Card 3: Taxa de Inadimplência */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition duration-200 relative overflow-hidden flex flex-col justify-between" id="kpi-delinquency-rate">
              <div className="space-y-2 flex-grow">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block font-medium">Proporção Irregular</span>
                <span className="text-2xl sm:text-3xl font-bold mt-2 text-amber-600 block tracking-tight">
                  {calculatedMetrics.delinquencyPercent.toFixed(1).replace(".", ",")}%
                </span>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-4">
                  <div 
                    className="bg-amber-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(calculatedMetrics.delinquencyPercent, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="absolute top-6 right-6 bg-amber-50 text-amber-600 p-2.5 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            {/* Card 4: Membros em Dia vs Pendentes */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition duration-200 relative overflow-hidden flex flex-col justify-between" id="kpi-members-status">
              <div className="space-y-2 flex-grow">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Associados em Dia</span>
                <span className="text-2xl sm:text-3xl font-bold mt-2 text-slate-800 block tracking-tight">
                  {calculatedMetrics.membersUpToDate} / {calculatedMetrics.total}
                </span>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${calculatedMetrics.total > 0 ? (calculatedMetrics.membersUpToDate / calculatedMetrics.total) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              <div className="absolute top-6 right-6 bg-slate-100 text-slate-600 p-2.5 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </div>
        </section>
        )}

        {/* FINANCIAL CHARTS ZONE (EVOLUÇÃO DOS PAGAMENTOS MENSAIS) */}
        {adminActiveTab === "charts" && (
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm print:hidden" id="charts-box">
          <div className="border-b border-slate-100 pb-4 mb-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              Evolução dos Pagamentos e Arrecadação Mensal (2026)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Gráficos de arrecadação estimados e taxa de conformidade por mês do ano corrente.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="charts-comparison">
            {/* Chart A: Arrecadação Mensal em Real ($) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col justify-between shadow-sm" id="chart-payments-volume">
              <div className="mb-4">
                <span className="text-xs font-bold text-indigo-700 bg-indigo-55 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">Volume arrecadado</span>
                <h3 className="text-sm font-semibold text-slate-800 mt-1">Soma de Mensalidades Recebidas</h3>
                <p className="text-[11px] text-slate-400">Total acumulado por cada mês do calendário de Janeiro a Dezembro.</p>
              </div>

              {/* Responsive custom SVG Bar Chart */}
              <div className="w-full h-56 mt-2 relative">
                <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="40" y1="20" x2="490" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="40" y1="70" x2="490" y2="70" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="40" y1="120" x2="490" y2="120" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3"/>
                  <line x1="40" y1="170" x2="490" y2="170" stroke="#cbd5e1" strokeWidth="1" />

                  {/* Y Axis Labels */}
                  <text x="35" y="24" textAnchor="end" className="text-[9px] fill-slate-400 font-mono font-bold">R${maxCollectionAmount}</text>
                  <text x="35" y="99" textAnchor="end" className="text-[9px] fill-slate-400 font-mono font-bold">R${maxCollectionAmount / 2}</text>
                  <text x="35" y="174" textAnchor="end" className="text-[9px] fill-slate-400 font-mono font-bold">R$0</text>

                  {/* Monthly Bars */}
                  {calculatedMetrics.monthlyStats.map((stat, idx) => {
                    const paddingHorizontal = 40;
                    const chartWidth = 440;
                    const barWidth = 24;
                    const step = chartWidth / 12;
                    const barX = paddingHorizontal + idx * step + (step - barWidth) / 2;
                    
                    const barHeight = maxCollectionAmount > 0 
                      ? (stat.totalPaidValue / maxCollectionAmount) * 150 
                      : 0;
                    const barY = 170 - barHeight;

                    const isHovered = hoveredMonthIdx === idx;
                    const isReferenceMonth = idx === referenceMonth;

                    return (
                      <g 
                        key={idx}
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredMonthIdx(idx)}
                        onMouseLeave={() => setHoveredMonthIdx(null)}
                      >
                        {/* Interactive Invisible hover padding bounds */}
                        <rect
                          x={barX - 4}
                          y="10"
                          width={barWidth + 8}
                          height="165"
                          fill="transparent"
                        />
                        
                        {/* Bar Segment */}
                        <rect
                          x={barX}
                          y={barY}
                          width={barWidth}
                          height={barHeight}
                          rx={4}
                          className={`transition-all duration-300 ${
                            isHovered 
                              ? "fill-red-650 fill-red-600 filter drop-shadow-md" 
                              : isReferenceMonth
                              ? "fill-red-500" 
                              : "fill-red-600/80"
                          }`}
                        />

                        {/* Tiny badge indicating value to print on top */}
                        {(isHovered || isReferenceMonth) && (
                          <text
                            x={barX + barWidth / 2}
                            y={Math.max(barY - 5, 15)}
                            textAnchor="middle"
                            className="text-[9px] fill-slate-800 font-bold font-mono"
                          >
                            R$ {stat.totalPaidValue}
                          </text>
                        )}

                        {/* Label on X Axis */}
                        <text
                          x={barX + barWidth / 2}
                          y="186"
                          textAnchor="middle"
                          className={`text-[10px] font-bold ${
                            isHovered ? "fill-red-700 font-extrabold" : "fill-slate-500"
                          }`}
                        >
                          {stat.shortName}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Status info bar */}
              <div className="flex items-center justify-between mt-4 border-t border-slate-200/60 pt-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 bg-red-500 rounded"></div>
                  <span className="text-slate-500">Mês de Referência</span>
                </div>
                <div>
                  <span className="font-medium text-slate-600">
                    {hoveredMonthIdx !== null 
                      ? `${calculatedMetrics.monthlyStats[hoveredMonthIdx].monthName}: R$ ${calculatedMetrics.monthlyStats[hoveredMonthIdx].totalPaidValue.toFixed(2).replace(".", ",")}`
                      : `Consolidação: ${MESES[referenceMonth]}`
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Chart B: Compliance / Paid ratio (%) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col justify-between shadow-sm" id="chart-members-ratio">
              <div className="mb-4">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">Taxa de Adimplência</span>
                <h3 className="text-sm font-semibold text-slate-800 mt-1">Conformidade e Quitação (%)</h3>
                <p className="text-[11px] text-slate-400">Percentual de membros pagantes ativos para cada mês do calendário.</p>
              </div>

              {/* Responsive compliance percentage chart */}
              <div className="w-full h-56 mt-2 relative">
                <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="40" y1="20" x2="490" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="40" y1="57.5" x2="490" y2="57.5" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="40" y1="95" x2="490" y2="95" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3"/>
                  <line x1="40" y1="132.5" x2="490" y2="132.5" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3"/>
                  <line x1="40" y1="170" x2="490" y2="170" stroke="#cbd5e1" strokeWidth="1" />

                  {/* Y Axis Labels */}
                  <text x="35" y="24" textAnchor="end" className="text-[9px] fill-slate-400 font-mono font-bold">100%</text>
                  <text x="35" y="99" textAnchor="end" className="text-[9px] fill-slate-400 font-mono font-bold">50%</text>
                  <text x="35" y="174" textAnchor="end" className="text-[9px] fill-slate-400 font-mono font-bold">0%</text>

                  {/* compliance Bars */}
                  {calculatedMetrics.monthlyStats.map((stat, idx) => {
                    const paddingHorizontal = 40;
                    const chartWidth = 440;
                    const barWidth = 24;
                    const step = chartWidth / 12;
                    const barX = paddingHorizontal + idx * step + (step - barWidth) / 2;
                    
                    const barHeight = (stat.paymentRatio / 100) * 150;
                    const barY = 170 - barHeight;

                    const isHovered = hoveredMonthIdx === idx;
                    const isReferenceMonth = idx === referenceMonth;

                    return (
                      <g 
                        key={idx}
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredMonthIdx(idx)}
                        onMouseLeave={() => setHoveredMonthIdx(null)}
                      >
                        {/* Interactive Invisible hover padding bounds */}
                        <rect
                          x={barX - 4}
                          y="10"
                          width={barWidth + 8}
                          height="165"
                          fill="transparent"
                        />
                        
                        {/* Bar Segment */}
                        <rect
                          x={barX}
                          y={barY}
                          width={barWidth}
                          height={barHeight}
                          rx={4}
                          className={`transition-all duration-300 ${
                            isHovered 
                              ? "fill-emerald-600 filter drop-shadow-md" 
                              : isReferenceMonth
                              ? "fill-teal-500" 
                              : "fill-emerald-500/80"
                          }`}
                        />

                        {/* percentage value indicator */}
                        {(isHovered || isReferenceMonth) && (
                          <text
                            x={barX + barWidth / 2}
                            y={Math.max(barY - 5, 15)}
                            textAnchor="middle"
                            className="text-[9px] fill-slate-800 font-bold font-mono"
                          >
                            {stat.paymentRatio.toFixed(1).replace(".", ",")}%
                          </text>
                        )}

                        {/* Label on X Axis */}
                        <text
                          x={barX + barWidth / 2}
                          y="186"
                          textAnchor="middle"
                          className={`text-[10px] font-bold ${
                            isHovered ? "fill-emerald-700 font-extrabold" : "fill-slate-500"
                          }`}
                        >
                          {stat.shortName}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Status info bar */}
              <div className="flex items-center justify-between mt-4 border-t border-slate-200/60 pt-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 bg-emerald-500 rounded"></div>
                  <span className="text-slate-500">Mês Selecionou</span>
                </div>
                <div>
                  <span className="font-medium text-slate-600">
                    {hoveredMonthIdx !== null 
                      ? `${calculatedMetrics.monthlyStats[hoveredMonthIdx].paidCount} de ${calculatedMetrics.total} membros quites`
                      : `Referência (${MESES_CURTOS[referenceMonth]}): ${calculatedMetrics.monthlyStats[referenceMonth]?.paidCount} em dia`
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
        )}

        {/* LEDGER FILTERS CONTROLS */}
        {adminActiveTab === "ledger" && (
          <>
            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 print:hidden animate-fade-in" id="filter-panel-box">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-3 gap-3">
            <div>
              <h2 className="text-md font-bold text-slate-800 flex items-center gap-2">
                <Filter className="w-4 h-4 text-red-650 text-red-600" />
                Painel de Filtros Inteligentes
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Refine a exibição por nome do membro, situação de adimplência ou por meses em débito.</p>
            </div>
            
            {(searchQuery || statusFilter !== "todos" || selectedMonthFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("todos");
                  setSelectedMonthFilter("all");
                  showToast("Filtros redefinidos", "info");
                }}
                className="text-xs text-slate-500 hover:text-slate-900 font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <X className="w-3 h-3" />
                Limpar Filtros Ativos
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4" id="ledger-filter-controls">
            {/* Filter 1: Name search */}
            <div className="md:col-span-5 relative" id="filter-user-name">
              <label htmlFor="searchInput" className="block text-xs font-bold text-slate-500 mb-1">Buscar por Nome:</label>
              <div className="relative">
                <input
                  type="text"
                  id="searchInput"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Nome do membro RNC..."
                  className="w-full pl-10 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 transition text-sm text-slate-800 outline-none"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter 2: Adimplencia Status Selector */}
            <div className="md:col-span-4" id="filter-user-status">
              <label htmlFor="statusFilterSelect" className="block text-xs font-bold text-slate-500 mb-1">Condição de Inadimplência:</label>
              <div className="grid grid-cols-3 bg-slate-100 p-1 rounded-lg">
                <button
                  type="button"
                  id="btn-filter-all"
                  onClick={() => setStatusFilter("todos")}
                  className={`py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
                    statusFilter === "todos" 
                      ? "bg-white text-slate-900 shadow-sm" 
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Todos
                </button>
                <button
                  type="button"
                  id="btn-filter-up-to-date"
                  onClick={() => setStatusFilter("em_dia")}
                  className={`py-1.5 rounded-md text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                    statusFilter === "em_dia" 
                      ? "bg-white text-emerald-700 shadow-sm" 
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Em Dia
                </button>
                <button
                  type="button"
                  id="btn-filter-delinquent"
                  onClick={() => setStatusFilter("pendente")}
                  className={`py-1.5 rounded-md text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                    statusFilter === "pendente" 
                      ? "bg-white text-rose-700 shadow-sm" 
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  Pendente
                </button>
              </div>
            </div>

            {/* Filter 3: Unpaid Month filter */}
            <div className="md:col-span-3" id="filter-user-month">
              <label htmlFor="monthFilterSelect" className="block text-xs font-bold text-slate-500 mb-1">Filtro de Débito:</label>
              <select
                id="monthFilterSelect"
                value={selectedMonthFilter}
                onChange={(e) => setSelectedMonthFilter(e.target.value === "all" ? "all" : Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm text-slate-700 font-semibold"
              >
                <option value="all">Série Completa (Anual)</option>
                {MESES.map((nome, idx) => (
                  <option key={idx} value={idx}>Pendente em: {nome}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* DETAILED LEDGER & DATA LISTING OR PRINT REPORT */}
        <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm print:shadow-none print:border-none print:bg-white" id="membros-table-section">
          {/* Main header bar inside the catalog */}
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 print:py-2 print:px-0">
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 print:text-lg">
                <FileText className="w-5 h-5 text-red-600 print:hidden" />
                Livro de Registro de Mensalidades
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 print:-mt-1 print:text-black">
                {filteredMembers.length} de {members.length} membros carregados nesta consulta. Limite de carência: <span className="font-bold uppercase">{MESES[referenceMonth]}</span>.
              </p>
            </div>

            {/* Total balance filtered count */}
            <div className="bg-slate-50 py-1.5 px-3 rounded-lg border border-slate-200 text-xs text-slate-600 font-semibold flex items-center gap-2 print:border-none print:bg-white print:px-0 pr-0">
              <span>Resultado da busca:</span>
              <span className="bg-red-50 text-red-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                {filteredMembers.length} encontrados
              </span>
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse table-auto print:text-xs" id="ledger-master-table">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 print:bg-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider print:text-black">
                  <th className="py-4 px-6 font-bold print:py-2">Nome do Membro</th>
                  <th className="py-4 px-3 text-center font-bold print:py-2">Status ({MESES_CURTOS[referenceMonth]})</th>
                  <th className="py-4 px-3 text-center font-bold print:py-2 print:hidden">Histórico Anual (Jan - Dez)</th>
                  <th className="py-4 px-3 text-center font-bold print:py-2">Débito Estimado</th>
                  <th className="py-4 px-6 text-center font-bold print:py-2 print:hidden">Ações Pix / Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((member, index) => {
                    const originalIndex = members.findIndex(m => m.nome === member.nome);
                    
                    // Calc individual index delinquency up to the referenceMonth
                    let isUpToDate = true;
                    let pendingMonthsCount = 0;
                    for (let i = 0; i <= referenceMonth; i++) {
                      if (!member.pagamentos[i]) {
                        isUpToDate = false;
                        pendingMonthsCount += 1;
                      }
                    }

                    const debitoAmount = pendingMonthsCount * valorMensalidade;

                    return (
                      <tr 
                        key={member.nome} 
                        className="hover:bg-slate-50/60 transition group print:hover:bg-transparent"
                      >
                        {/* Member identity name */}
                        <td className="py-4 px-6 font-semibold text-slate-800 print:py-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 font-mono text-xs shadow-sm print:hidden">
                              {member.nome.charAt(0)}
                            </div>
                            <div>
                              {editingMember && editingMember.index === originalIndex ? (
                                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                  <input 
                                    type="text"
                                    value={editingMember.name}
                                    onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                                    className="bg-white border border-slate-300 px-2 py-1 rounded text-xs outline-none focus:ring-1 focus:ring-blue-500"
                                    autoFocus
                                  />
                                  <button onClick={submitEditMember} className="bg-green-600 hover:bg-green-700 text-white p-1 rounded transition">
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => setEditingMember(null)} className="bg-slate-200 hover:bg-slate-300 text-slate-600 p-1 rounded transition">
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <span className="text-sm tracking-tight text-slate-900 font-bold uppercase">{member.nome}</span>
                              )}
                              <span className="block text-[10px] text-slate-400 font-semibold print:hidden mt-0.5">
                                Cod: #{1000 + originalIndex}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Status visual box up to reference month */}
                        <td className="py-4 px-3 text-center whitespace-nowrap print:py-2">
                          {isUpToDate ? (
                            <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                              Em Dia
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                              Inadimplente
                            </span>
                          )}
                        </td>

                        {/* Interactive historical months bar */}
                        <td className="py-4 px-3 text-center print:hidden">
                          <div className="flex items-center justify-center gap-1 flex-wrap max-w-xs mx-auto">
                            {member.pagamentos.map((pago, mIdx) => {
                              const isMonthActive = mIdx <= referenceMonth;
                              return (
                                <button
                                  key={mIdx}
                                  type="button"
                                  onClick={() => togglePaymentItem(originalIndex, mIdx)}
                                  className={`w-7 h-7 text-[9px] font-bold rounded-md transition flex flex-col items-center justify-center border ${
                                    pago
                                      ? "bg-green-500 hover:bg-green-600 border-green-500 text-white"
                                      : isMonthActive
                                      ? "bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-500"
                                      : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-400"
                                  }`}
                                  title={`${MESES[mIdx]} de 2026: ${pago ? "Pago" : "Pendente"}`}
                                >
                                  <span>{MESES_CURTOS[mIdx]}</span>
                                </button>
                              );
                            })}
                          </div>
                        </td>

                        {/* Unpaid estimated balance */}
                        <td className="py-4 px-3 text-center font-bold text-sm tracking-tight text-slate-800 print:py-2">
                          {debitoAmount > 0 ? (
                            <span className="text-red-605 text-red-600 font-extrabold">
                              R$ {debitoAmount.toFixed(2).replace(".", ",")}
                            </span>
                          ) : (
                            <span className="text-green-700 font-extrabold text-xs uppercase bg-green-50 px-2 py-0.5 rounded-md border border-green-100">
                              Quitado
                            </span>
                          )}
                          <span className="block text-[9px] text-slate-400 font-medium normal-case print:hidden mt-0.5">
                            {pendingMonthsCount} {pendingMonthsCount === 1 ? "mês pendente" : "meses pendentes"}
                          </span>
                        </td>

                        {/* Actions (Pagar Pix, Editar ou Deletar) */}
                        <td className="py-4 px-6 text-center whitespace-nowrap print:hidden">
                          <div className="flex items-center justify-center gap-1.5">
                            {debitoAmount > 0 ? (
                              <button
                                type="button"
                                onClick={() => abrirModalPagamentoTotal(member.nome, debitoAmount)}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] py-1.5 px-3 rounded-lg shadow-sm transition active:scale-95 flex items-center gap-1 uppercase cursor-pointer"
                              >
                                <Copy className="w-3.5 h-3.5" />
                                <span>Pagar Débito</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled
                                className="bg-slate-100 text-slate-400 text-[11px] py-1.5 px-3 rounded-lg font-bold border border-slate-200 cursor-not-allowed uppercase"
                              >
                                Tudo em Dia
                              </button>
                            )}

                            {/* Administration Controls block */}
                            {activeSubdomain === "admin" && isAdmin && (
                              <div className="flex items-center gap-1 border-l border-slate-200 pl-1.5">
                                <button
                                  onClick={() => startEditing(originalIndex, member.nome)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition active:scale-90 cursor-pointer"
                                  title="Renomear Membro"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => quitMembroDebitoTotal(originalIndex)}
                                  className="p-1.5 text-slate-400 hover:text-emerald-700 rounded-lg hover:bg-slate-100 transition active:scale-90"
                                  title="Liquidar Tudo"
                                >
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                </button>
                                <button
                                  onClick={() => handleDeleteMember(originalIndex)}
                                  className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 transition active:scale-90"
                                  title="Desfiliar Membro"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 font-medium bg-slate-50/20 italic">
                      Nenhum membro encontrado com os filtros selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Printable Report footer */}
          <div className="hidden print:block w-full text-center text-[10px] text-slate-400 border-t border-slate-200 mt-12 pt-6">
            <p>Relatório emitido através do Painel de Controle de Mensalidades da RNC.</p>
            <p className="mt-1">Página 1 de 1 — Confidencial para fins administrativos internos.</p>
          </div>
        </section>
          </>
        )}

        {/* SECURE ADMIN PANEL ACTIONS CARD */}
        {activeSubdomain === "admin" && isAdmin && adminActiveTab === "operations" && (
          <section className="bg-amber-50/50 rounded-2xl border border-amber-200/80 p-6 shadow-sm print:hidden space-y-4" id="administration-actions-card">
            <div>
              <span className="text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full inline-block mb-1">
                Ações Administrativas Unlocked
              </span>
              <h2 className="text-md font-bold text-slate-800 flex items-center gap-2">
                <Settings className="w-4 h-4 text-amber-700" />
                Painel de Operações Avançadas
              </h2>
              <p className="text-xs text-slate-500">Adicione novos membros associados ou reinicie o banco de dados para configurações de teste originais.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Box A: Add associated member */}
              <form onSubmit={handleCreateMember} className="space-y-3 bg-white p-4 rounded-xl border border-amber-205 border-amber-200/50">
                <h3 className="text-xs font-bold text-slate-600 block uppercase">Registrar Novo Membro</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder="Nome Completo do Membro..."
                    className="flex-grow px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold uppercase outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <button
                    type="submit"
                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2 px-4 rounded-lg transition shadow flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">Membros criados receberão por padrão as duas primeiras mensalidades (Janeiro e Fevereiro) configuradas como pre-pagas.</p>
              </form>

              {/* Box B: Reset and Factory Settings */}
              <div className="space-y-3 bg-white p-4 rounded-xl border border-amber-205 border-amber-200/50 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-600 block uppercase">Limpeza e Reset de Dados</h3>
                  <p className="text-[11px] text-slate-400 leading-normal mt-1">Apaga qualquer alteração temporária local e restaura as mensalidades originais padrões de todos os 59 membros listados previamente com valor nominal de R$ 15,00.</p>
                </div>
                <button
                  type="button"
                  onClick={resetToFactoryData}
                  className="w-full bg-slate-100 hover:bg-slate-250 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-lg border border-slate-200 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Restaurar Planilha Padrão de Fábrica</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* SYSTEM CONFIGURATIONS PANEL (Point 4) */}
        {activeSubdomain === "admin" && isAdmin && adminActiveTab === "settings" && (
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm print:hidden space-y-6 animate-fade-in" id="system-configurations-panel">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-red-600" />
                Configurações Globais do Sistema
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Configure valores transacionais, senhas de acesso aos portais e dados de recebimento Pix.</p>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                saveSystemConfig(valorMensalidadeInput, senhaAdminInput, chavePixInput, senhaMembrosInput);
              }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Config 1: Valor Mensalidade */}
                <div className="space-y-2">
                  <label className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider flex items-center gap-1.5 flex-row">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400 font-bold" />
                    Valor da Mensalidade (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={valorMensalidadeInput}
                    onChange={(e) => setValorMensalidadeInput(Number(e.target.value))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-red-500 transition-all font-mono"
                    placeholder="Ex: 15,00"
                  />
                  <p className="text-[10px] text-slate-400 font-medium">Alterações afetam todos os débitos em aberto e cálculos consolidados do sistema.</p>
                </div>

                {/* Config 2: Chave Pix Geral */}
                <div className="space-y-2">
                  <label className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider flex items-center gap-1.5 flex-row">
                    <Smartphone className="w-3.5 h-3.5 text-slate-400 font-bold" />
                    Chave Pix Geral de Destino (Celular/E-mail/CNPJ)
                  </label>
                  <input
                    type="text"
                    value={chavePixInput}
                    onChange={(e) => setChavePixInput(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-red-500 transition-all font-mono"
                    placeholder="Chave Pix..."
                  />
                  <p className="text-[10px] text-slate-400 font-medium">Chave Pix padrão que será exibida para os associados realizarem os pagamentos.</p>
                </div>

                {/* Config 3: Senha Admin */}
                <div className="space-y-2">
                  <label className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider flex items-center gap-1.5 flex-row">
                    <Lock className="w-3.5 h-3.5 text-slate-400 font-bold" />
                    Senha do Painel Administrador
                  </label>
                  <input
                    type="text"
                    value={senhaAdminInput}
                    onChange={(e) => setSenhaAdminInput(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-red-500 transition-all font-mono"
                    placeholder="Senha ADM..."
                  />
                  <p className="text-[10px] text-slate-400 font-medium">Senha necessária para autenticação e liberação de privilégios de controle.</p>
                </div>

                {/* Config 4: Senha dos Membros */}
                <div className="space-y-2">
                  <label className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider flex items-center gap-1.5 flex-row">
                    <Key className="w-3.5 h-3.5 text-slate-400 font-bold" />
                    Senha de Acesso dos Membros (Livre/Opcional)
                  </label>
                  <input
                    type="text"
                    value={senhaMembrosInput}
                    onChange={(e) => setSenhaMembrosInput(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-red-500 transition-all font-mono"
                    placeholder="Deixe em branco para acesso livre..."
                  />
                  <p className="text-[10px] text-slate-400 font-medium">Se preenchida, o portal de consulta exigirá esta senha antes de liberar pesquisas de associados.</p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setValorMensalidadeInput(valorMensalidade);
                    setChavePixInput(chavePixGeral);
                    setSenhaAdminInput(senhaAdmin);
                    setSenhaMembrosInput(senhaMembros);
                    showToast("Alterações descartadas", "info");
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-250 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition shrink-0 cursor-pointer uppercase"
                >
                  Descartar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-red-650 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition shadow-md active:scale-95 cursor-pointer uppercase tracking-wider"
                >
                  Salvar Configurações
                </button>
              </div>
            </form>
          </section>
        )}
              </>
            )}
          </>
        )}
      </div>

      {/* MODAL PAYMENTS (PIX CODE & COPY DETAILED POPUP) */}
      {selectedPayment && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in print:hidden" 
          onClick={() => setSelectedPayment(null)}
          id="modal-pix-overlay"
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-sm w-full relative border border-slate-150 animate-scale-up" 
            onClick={(e) => e.stopPropagation()}
            id="modal-pix-content"
          >
            <button 
              onClick={() => setSelectedPayment(null)} 
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-650 hover:bg-slate-100 p-1.5 rounded-full transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center">
              <span className="mx-auto w-12 h-12 bg-red-50 text-red-650 text-red-600 rounded-full flex items-center justify-center mb-4 shadow-inner-white">
                <DollarSign className="w-6 h-6" />
              </span>
              <h2 className="text-2xl font-black text-slate-900 leading-tight">Pagamento PIX</h2>
              <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mt-1">Cópia Rápida Chave Geral</p>
            </div>

            <div className="space-y-4 mt-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Membro Associado</span>
                <span className="text-slate-850 text-slate-800 font-extrabold text-sm block mt-0.5 uppercase">{selectedPayment.memberName}</span>
                
                <span className="text-[10px] font-bold text-slate-400 block uppercase mt-2">Especificação de Cobrança</span>
                <span className="text-red-700 text-xs font-bold block mt-0.5">{selectedPayment.description}</span>
              </div>
              
              <div className="bg-red-600 p-5 rounded-xl text-center text-white shadow-lg shadow-red-100 relative overflow-hidden">
                <span className="text-[10px] font-bold text-red-100 uppercase tracking-widest block">Valor a Transferir</span>
                <span className="text-3xl font-black block mt-1 tracking-tight">
                  R$ {selectedPayment.value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                
                {/* Decorative circle graphic */}
                <span className="absolute -bottom-8 -right-8 w-16 h-16 bg-red-500 rounded-full opacity-35"></span>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Chave PIX de Destino</label>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg overflow-hidden shadow-inner">
                  <input 
                    type="text" 
                    readOnly 
                    value={selectedPayment.pixCode}
                    className="bg-transparent px-3 py-3 w-full text-xs font-mono text-slate-600 outline-none select-all"
                  />
                  <button 
                    id="btn-copy-pix"
                    onClick={copiarChavePix} 
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-4 h-full py-3.5 transition text-xs shrink-0 active:scale-95 text-center"
                  >
                    Copiar
                  </button>
                </div>
              </div>

              <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 text-center">
                <p className="text-[10.5px] text-slate-500 leading-normal">
                  Transfira pelo app do seu banco. Após a transferência de <span className="font-bold text-slate-800">R$ {selectedPayment.value.toFixed(2).replace(".", ",")}</span>, envie o comprovante ao administrador da RNC para atualizar seu status.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ADMIN PASSWORD (PASSO O CONTROLE) */}
      {showAdminPasswordModal && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in print:hidden"
          onClick={() => setShowAdminPasswordModal(false)}
          id="modal-password-overlay"
        >
          <form 
            className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full relative border border-slate-150 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleAdminPasswordSubmit}
            id="modal-password-form"
          >
            <button 
              type="button"
              onClick={() => setShowAdminPasswordModal(false)} 
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <span className="mx-auto w-11 h-11 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-3 shadow-inner-white">
                <Lock className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-800">Acesso Restrito • RNC</h2>
              <p className="text-xs text-slate-400 leading-normal mt-1">Por favor, insira a senha padrão do administrador de mensalidades.</p>
            </div>

            <div className="mt-5 space-y-4">
              <div className="relative">
                <input 
                  type="password" 
                  id="adminPasswordInput"
                  placeholder="••••"
                  value={adminPasswordInput}
                  onChange={(e) => {
                    setAdminPasswordInput(e.target.value);
                    setAdminPasswordError(false);
                  }}
                  className={`w-full p-3 bg-slate-50 border rounded-lg text-center text-lg tracking-widest font-black outline-none focus:ring-2 focus:ring-red-500 transition-all ${
                    adminPasswordError ? "border-red-400 bg-red-50/20" : "border-slate-200"
                  }`}
                  autoFocus
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300">
                  <Eye className="w-4 h-4" />
                </span>
              </div>

              {adminPasswordError && (
                <p className="text-red-500 text-xs font-bold text-center flex items-center justify-center gap-1 bg-red-50 py-1.5 rounded-lg animate-shake">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {"Senha incorreta! Use a senha padrão \"1234\"."}
                </p>
              )}

              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => setShowAdminPasswordModal(false)} 
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition shadow active:scale-95 cursor-pointer"
                >
                  Entrar no Modo
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
