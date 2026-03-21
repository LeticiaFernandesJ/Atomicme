export type EmotionType =
  | "alegria"
  | "tristeza"
  | "raiva"
  | "medo"
  | "ansiedade"
  | "nojo"
  | "neutro";

export const EMOTIONS: {
  key: EmotionType;
  label: string;
  emoji: string;
  color: string;
  bg: string;
}[] = [
  { key: "alegria",   label: "Alegria",   emoji: "😊", color: "#f59e0b", bg: "rgba(245,158,11,0.1)"  },
  { key: "tristeza",  label: "Tristeza",  emoji: "😢", color: "#6366f1", bg: "rgba(99,102,241,0.1)"  },
  { key: "raiva",     label: "Raiva",     emoji: "😠", color: "#ef4444", bg: "rgba(239,68,68,0.1)"   },
  { key: "medo",      label: "Medo",      emoji: "😨", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)"  },
  { key: "ansiedade", label: "Ansiedade", emoji: "😰", color: "#f97316", bg: "rgba(249,115,22,0.1)"  },
  { key: "nojo",      label: "Nojo",      emoji: "🤢", color: "#10b981", bg: "rgba(16,185,129,0.1)"  },
];

export const EMOTION_TIPS: Record<EmotionType, string> = {
  alegria:
    "Registrar o que causou alegria fortalece redes neurais positivas. Anote o que contribuiu para esse sentimento.",
  tristeza:
    "A tristeza tem função — ela sinaliza perdas importantes. Permitir-se sentir sem julgamento é o primeiro passo da cura.",
  raiva:
    "A raiva é energia. Antes de agir, pergunte: o que ela está me dizendo sobre meus valores e limites?",
  medo:
    "O medo protege, mas às vezes exagera. Pergunte: qual a probabilidade real disso acontecer?",
  ansiedade:
    "A ansiedade vive no futuro. Traga sua atenção para o que você pode controlar agora, hoje.",
  nojo:
    "O nojo protege seus valores e limites pessoais. Reflita: o que esse sentimento diz sobre o que é importante para você?",
  neutro:
    "Dias neutros também têm valor. A ausência de emoção intensa pode ser descanso ou entorpecimento — observe com curiosidade.",
};

export const SCHEMA_DIMENSIONS = [
  { key: "validacao",          label: "Validação",            description: "Você teve um dia difícil no trabalho e só consegue se sentir melhor depois que alguém confirma que faz sentido você estar chateado." },
  { key: "compreensibilidade", label: "Compreensibilidade",   description: "Você fica ansioso antes de reuniões importantes e entende que é porque se importa com o resultado." },
  { key: "culpa",              label: "Culpa",                description: "Você está triste sem motivo claro e fica se dizendo que não tem direito de se sentir assim." },
  { key: "duracao",            label: "Duração",              description: "Você está ansioso há dias e começa a acreditar que nunca vai se sentir tranquilo de novo." },
  { key: "controle",           label: "Controle",             description: "Você começa a chorar numa conversa simples e sente que não consegue parar, mesmo querendo." },
  { key: "entorpecimento",     label: "Entorpecimento",       description: "Você evita pensar no assunto, se distrai com o celular e percebe que ficou o dia todo no piloto automático." },
  { key: "racionalidade",      label: "Racionalidade",        description: "Você sente raiva numa discussão mas se força a falar só em fatos, achando que demonstrar emoção é fraqueza." },
  { key: "consenso",           label: "Consenso",             description: "Você se sente sozinho numa festa e acha que todo mundo está bem menos você, que algo de errado só existe em você." },
  { key: "aceitacao",          label: "Aceitação",            description: "Você sente ciúme e, em vez de se criticar por isso, reconhece o sentimento e deixa ele passar." },
  { key: "ruminacao",          label: "Ruminação",            description: "Você fica repassando uma discussão de horas atrás, imaginando o que deveria ter dito, sem conseguir parar." },
  { key: "expressao",          label: "Expressão",            description: "Você conta para um amigo que está com medo e não sente que precisa minimizar ou se desculpar por isso." },
  { key: "culpa_sobre_culpa",  label: "Meta-culpa",           description: "Você está triste num dia em que 'não deveria' e fica se repetindo que tem motivos de sobra para ser grato." },
  { key: "valores",            label: "Valores",              description: "Você fica ansioso antes de uma apresentação e percebe que é porque se importa de verdade com aquele projeto." },
  { key: "sentimentos_mistos", label: "Ambivalência",         description: "Você sente alívio e tristeza ao mesmo tempo quando um relacionamento difícil termina, e consegue ficar com os dois sentimentos sem precisar resolver isso." },
];

export const STRATEGIES = [
  {
    id: "1", name: "Validação emocional",
    description: "Reconhecer e aceitar suas emoções sem julgamento.",
    steps: ["Identifique a emoção pelo nome", "Diga para si: 'Faz sentido sentir isso dado o que passei'", "Não tente mudar ou suprimir o sentimento", "Observe a emoção com curiosidade, como um cientista"],
    category: "aceitacao", emotions: ["tristeza", "raiva", "ansiedade"], level: "iniciante" as const,
  },
  {
    id: "2", name: "Distanciamento cognitivo",
    description: "Questionar se um pensamento é fato ou interpretação.",
    steps: ["Escreva o pensamento perturbador", "Pergunte: 'Isso é um fato ou uma interpretação?'", "Liste evidências a favor e contra", "Formule uma perspectiva mais equilibrada"],
    category: "ruminacao", emotions: ["ansiedade", "medo", "raiva"], level: "intermediario" as const,
  },
  {
    id: "3", name: "Tolerância ao desconforto",
    description: "Aprender a estar com emoções difíceis sem fugir delas.",
    steps: ["Observe a emoção sem tentar mudá-la", "Respire fundo 3 vezes", "Lembre: emoções são temporárias", "Fique com o desconforto por 5 minutos e veja o que acontece"],
    category: "entorpecimento", emotions: ["ansiedade", "medo", "tristeza"], level: "intermediario" as const,
  },
  {
    id: "4", name: "Escrita expressiva",
    description: "Escrever sobre a emoção por 15 minutos sem censura.",
    steps: ["Reserve 15 minutos sem interrupções", "Escreva tudo que sente — sem julgamento", "Não se preocupe com gramática ou coerência", "Ao terminar, releia e observe padrões"],
    category: "expressao", emotions: ["tristeza", "raiva", "ansiedade"], level: "iniciante" as const,
  },
  {
    id: "5", name: "Ativação comportamental",
    description: "Agir apesar da emoção para quebrar ciclos de evitação.",
    steps: ["Escolha uma pequena ação significativa", "Faça mesmo sem vontade", "Observe como se sente depois", "Aumente gradualmente as atividades"],
    category: "aceitacao", emotions: ["tristeza", "medo"], level: "intermediario" as const,
  },
  {
    id: "6", name: "Mindfulness emocional",
    description: "Observar emoções no momento presente sem reagir.",
    steps: ["Sente-se confortavelmente e feche os olhos", "Observe suas sensações corporais", "Nomeie a emoção: 'Estou notando ansiedade'", "Deixe a emoção passar sem se identificar com ela"],
    category: "aceitacao", emotions: ["ansiedade", "raiva", "medo"], level: "iniciante" as const,
  },
  {
    id: "7", name: "Reestruturação de crenças",
    description: "Questionar crenças rígidas sobre como as emoções deveriam ser.",
    steps: ["Identifique a crença: 'Não deveria sentir isso'", "Questione: de onde vem essa regra?", "Formule uma crença mais flexível", "Pratique repetir a nova crença ao sentir a emoção"],
    category: "racionalidade", emotions: ["raiva", "tristeza", "nojo"], level: "avancado" as const,
  },
  {
    id: "8", name: "Aceitação vs. controle",
    description: "Distinguir o que pode ser controlado do que deve ser aceito.",
    steps: ["Liste o que está te incomodando", "Separe em: posso controlar / não posso controlar", "Aja sobre o que pode controlar", "Pratique soltar o que não pode"],
    category: "controle", emotions: ["ansiedade", "raiva"], level: "intermediario" as const,
  },
  {
    id: "9", name: "Respiração diafragmática",
    description: "Usar a respiração para regular o sistema nervoso.",
    steps: ["Inspire pelo nariz por 4 segundos", "Segure por 2 segundos", "Expire pela boca por 6 segundos", "Repita 5 vezes — observe o relaxamento"],
    category: "controle", emotions: ["ansiedade", "raiva", "medo"], level: "iniciante" as const,
  },
  {
    id: "10", name: "Registro de gratidão emocional",
    description: "Reconhecer emoções positivas para equilibrar o viés negativo.",
    steps: ["Ao final do dia, escreva 3 momentos que geraram emoção positiva", "Descreva o que sentiu em cada um", "Note o que esses momentos têm em comum", "Observe como o exercício afeta seu humor"],
    category: "valores", emotions: ["tristeza", "neutro"], level: "iniciante" as const,
  },
  {
    id: "11", name: "Experimento comportamental",
    description: "Testar na prática se um medo ou crença é realista.",
    steps: ["Identifique a previsão catastrófica", "Planeje um pequeno experimento para testá-la", "Realize o experimento", "Registre o resultado real vs. o previsto"],
    category: "controle", emotions: ["medo", "ansiedade"], level: "avancado" as const,
  },
  {
    id: "12", name: "Defusão cognitiva",
    description: "Criar distância entre você e seus pensamentos.",
    steps: ["Quando um pensamento negativo surgir, diga: 'Estou tendo o pensamento de que...'", "Observe o pensamento como uma nuvem passando", "Não tente argumentar nem suprimir", "Deixe o pensamento existir sem agir sobre ele"],
    category: "ruminacao", emotions: ["ansiedade", "raiva", "medo"], level: "intermediario" as const,
  },
  {
    id: "13", name: "Escala de catastrofização",
    description: "Colocar problemas em perspectiva temporal.",
    steps: ["Descreva o problema que parece catastrófico", "Pergunte: em 5 anos isso ainda importará?", "Pergunte: em 1 ano? Em 1 mês?", "Ajuste a resposta emocional à escala real do problema"],
    category: "duracao", emotions: ["ansiedade", "raiva", "tristeza"], level: "intermediario" as const,
  },
  {
    id: "14", name: "Resolução estruturada de problemas",
    description: "Abordar problemas de forma sistemática para reduzir ansiedade.",
    steps: ["Defina o problema claramente", "Liste todas as soluções possíveis sem julgamento", "Avalie prós e contras de cada uma", "Escolha a melhor e planeje os passos concretos"],
    category: "controle", emotions: ["ansiedade", "raiva"], level: "avancado" as const,
  },
  {
    id: "15", name: "Auto-compaixão",
    description: "Tratar a si mesmo com a gentileza que daria a um amigo.",
    steps: ["Imagine que um amigo está passando pelo que você passa", "O que você diria a ele?", "Diga isso para si mesmo com a mesma gentileza", "Repita: 'É normal sofrer. Não estou sozinho nisso'"],
    category: "culpa", emotions: ["tristeza", "culpa", "ansiedade"], level: "iniciante" as const,
  },
];
