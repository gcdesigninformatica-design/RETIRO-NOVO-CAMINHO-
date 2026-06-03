export interface Membro {
  nome: string;
  pagamentos: boolean[];
}

export const VALOR_MENSALIDADE = 15.00;
export const SENHA_ADMIN = "1234";
export const CHAVE_PIX_GERAL = "86995245100";

export const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro"
];

export const MESES_CURTOS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export const INITIAL_MEMBERS: Membro[] = [
  { nome: "ALFREDO ALVES", pagamentos: [true, true, false, false, false, false, false, false, false, false, false, false] },
  { nome: "ANDERSON", pagamentos: [true, true, false, false, false, false, false, false, false, false, false, false] },
  { nome: "EDUARDO RIBEIRO", pagamentos: [true, true, true, false, false, false, false, false, false, false, false, false] },
  { nome: "MATHEUS LAMARTINS", pagamentos: [true, true, false, false, false, false, false, false, false, false, false, false] },
  { nome: "CARLOS HENRIQUE", pagamentos: [true, true, false, false, false, false, false, false, false, false, false, false] },
  { nome: "CAROL", pagamentos: [true, true, false, false, false, false, false, false, false, false, false, false] },
  { nome: "CLÉSIO", pagamentos: [true, true, false, false, false, false, false, false, false, false, false, false] },
  { nome: "DANUSY", pagamentos: [true, true, false, false, false, false, false, false, false, false, false, false] },
  { nome: "LUIS DAVID", pagamentos: [true, true, false, false, false, false, false, false, false, false, false, false] },
  { nome: "LUIS EDUARDO", pagamentos: [true, true, false, false, false, false, false, false, false, false, false, false] },
  { nome: "ELIABIO", pagamentos: [true, true, false, false, false, false, false, false, false, false, false, false] },
  { nome: "EMANUEL FAUSTINO", pagamentos: [true, true, false, false, false, false, false, false, false, false, false, false] },
  { nome: "EMILLY MARIA", pagamentos: [true, true, true, false, false, false, false, false, false, false, false, false] },
  { nome: "STEFANIA", pagamentos: [true, true, true, false, false, false, false, false, false, false, false, false] },
  { nome: "FERNANDO", pagamentos: [true, true, false, false, false, false, false, false, false, false, false, false] },
  { nome: "FLÁVIO", pagamentos: [true, true, false, false, false, false, false, false, false, false, false, false] },
  { nome: "GABRIEL", pagamentos: [true, true, false, false, false, false, false, false, false, false, false, false] },
  { nome: "GABRIEL FELIPE", pagamentos: [true, true, true, false, false, false, false, false, false, false, false, false] },
  { nome: "HELDER FILHO", pagamentos: [true, true, false, false, false, false, false, false, false, false, false, false] },
  { nome: "HIAGO FAUSTINO", pagamentos: [true, true, false, false, false, false, false, false, false, false, false, false] },
  { nome: "HILDINAR", pagamentos: [true, true, false, false, false, false, false, false, false, false, false, false] },
  { nome: "ILANA", pagamentos: [true, true, false, false, false, false, false, false, false, false, false, false] },
  { nome: "JARBAS", pagamentos: [true, true, false, false, false, false, false, false, false, false, false, false] },
  { nome: "JOÃO MARCELO", pagamentos: [true, true, false, false, false, false, false, false, false, false, false, false] },
  { nome: "JOÃO MARCOS", pagamentos: [true, true, false, false, false, false, false, false, false, false, false, false] },
  { nome: "JOÃO PEDRO CRUZ", pagamentos: [true, true, false, false, false, false, false, false, false, false, false, false] },
  { nome: "JOÃO PEDRO SOARES", pagamentos: [true, true, false, false, false, false, false, false, false, false, false, false] },
  { nome: "JOÃO VICTOR ANDRADE", pagamentos: [true, true, false, false, false, false, false, false, false, false, false, false] },
  { nome: "JOÃO VITOR OLIVEIRA", pagamentos: [true, true, false, false, false, false, false, false, false, false, false, false] },
  { nome: "JOÃO VITOR ALVES", pagamentos: [true, true, false, false, false, false, false, false, false, false, false, false] },
  { nome: "JOSIANE", pagamentos: [true, true, false, false, false, false, false, false, false, false, false, false] },
  { nome: "JOYCE", pagamentos: [true, true, false, false, false, false, false, false, false, false, false, false] },
  { nome: "LETICIA", pagamentos: [true, true, false, false, false, false, false, false, false, false, false, false] },
  { nome: "MACYEL", pagamentos: [true, true, false, false, false, false, false, false, false, false, false, false] },
  { nome: "MARCIEL FERSAN", pagamentos: [true, true, false, false, false, false, false, false, false, false, false, false] },
  { nome: "MARIA CLARA", pagamentos: [true, true, true, false, false, false, false, false, false, false, false, false] },
  { nome: "MARIANE AQUINO", pagamentos: [true, true, false, false, false, false, false, false, false, false, false, false] },
  { nome: "MARIA PAULA", pagamentos: [true, true, false, false, false, false, false, false, false, false, false, false] },
  { nome: "MARINA", pagamentos: [true, true, false, false, false, false, false, false, false, false, false, false] },
  { nome: "MIKELLY", pagamentos: [true, true, false, false, false, false, false, false, false, false, false, false] },
  { nome: "NAELLY MORAIS", pagamentos: [true, true, false, false, false, false, false, false, false, false, false, false] },
  { nome: "PRISCILA", pagamentos: [true, true, true, false, false, false, false, false, false, false, false, false] },
  { nome: "RAFAEL", pagamentos: [true, true, false, false, false, false, false, false, false, false, false, false] },
  { nome: "RAUL", pagamentos: [true, true, false, false, false, false, false, false, false, false, false, false] },
  { nome: "REGINA", pagamentos: [true, true, false, false, false, false, false, false, false, false, false, false] },
  { nome: "ROSSELLY", pagamentos: [true, true, false, false, false, false, false, false, false, false, false, false] },
  { nome: "SARA ANDRADE", pagamentos: [true, true, false, false, false, false, false, false, false, false, false, false] },
  { nome: "SARAH DANTAS", pagamentos: [true, true, false, false, false, false, false, false, false, false, false, false] },
  { nome: "SILVIO", pagamentos: [true, true, false, false, false, false, false, false, false, false, false, false] },
  { nome: "TAIANE", pagamentos: [true, true, false, false, false, false, false, false, false, false, false, false] },
  { nome: "THAIS", pagamentos: [true, true, false, false, false, false, false, false, false, false, false, false] },
  { nome: "VALÉRIA", pagamentos: [true, true, false, false, false, false, false, false, false, false, false, false] },
  { nome: "WESLEY SEREJO", pagamentos: [true, true, false, false, false, false, false, false, false, false, false, false] },
  { nome: "FRANCISCO WEVERTON", pagamentos: [true, true, true, false, false, false, false, false, false, false, false, false] },
  { nome: "WILLDECLAY", pagamentos: [true, true, false, false, false, false, false, false, false, false, false, false] },
  { nome: "YLANNA", pagamentos: [true, true, false, false, false, false, false, false, false, false, false, false] },
  { nome: "YÔRHAN", pagamentos: [true, true, false, false, false, false, false, false, false, false, false, false] },
  { nome: "WASHINGTON", pagamentos: [true, true, true, false, false, false, false, false, false, false, false, false] },
  { nome: "THAIZY", pagamentos: [true, true, false, false, false, false, false, false, false, false, false, false] }
];
