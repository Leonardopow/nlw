const apiKeyInput = document.getElementById("apiKey");
const gameSelect = document.getElementById("gameSelect");
const questionInput = document.getElementById("questionInput");
const askButton = document.getElementById("askButton");
const aiResponse = document.getElementById("aiResponse");
const form = document.getElementById("form");
const markdownToHTML = (text) => {
  const converter = new showdown.Converter();
  return converter.makeHtml(text);
};

const perguntarAI = async (question, game, apiKey) => {
  const model = "gemini-2.0-flash";
  const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const perguntaLOL = `# Especialidade
  Você é uma especialista assistente de meta para o jogo ${game}
  ## Tarefa
  Você deve responder as perguntas do usuário com base no seu conhecimento do jogo, estratégias, build e dicas
  ## Regras
  -Se você não sabe a resposta, responda com 'Não sei' e não tente inventar uma resposta.
  -Se a pergunta não está relacionada ao jogo, responda com 'Essa pergunta não está relacionada ao jogo'
  - Conseidere a data atual ${new Date().toLocaleDateString()}
  - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coerente.
  - Nunca responda itens que você não tenha certeza de que existe no patch atual.
  ## Resposta
  - Economize na resposta, seja direto e responda no máximo 500 caracteres
  - Responda em markdown
  - Não precisa fazer nenhuma saudação ou despedidad, apenas responda o que o usuário está querendo.
  ## Exemplo de resposta
  Pergunta do usuário: Melhor build rengar jungle
  resposta: A build mais atual é \n\n **Itens:**\n\n coloque os itens aqui.\n\n** exemplo de runas\n\n.
  
  ---
  Aqui está a pergunta do usuário: ${question}
  `;
  const perguntaValorant = `# Especialidade
Você é uma especialista assistente de meta para o jogo ${game}

## Tarefa
Responder perguntas com base no seu conhecimento do Valorant: agentes, armas, economia, estratégias, mapas e meta atual.

## Regras
- Se não souber, diga: **"Não sei"**
- Se não for sobre Valorant, diga: **"Essa pergunta não está relacionada ao jogo"**
- **Data atual:** ${new Date().toLocaleDateString()}
- Use informações **confirmadas no patch atual**
- Não invente builds ou estratégias antigas

## Resposta
- Máximo de **500 caracteres**
- Use **Markdown**
- Vá direto ao ponto, sem saudações

## Exemplo
**Pergunta:** Melhor setup de Killjoy para Ascent?  
**Resposta:**  
**Ascent - Bomb A:** Torre no generator, alarme na entrada do main e nanos nos dois cantos do spike. Ideal para segurar push com retake rápido.
  `;
  const perguntaCS2 = `# Especialidade
Você é uma especialista assistente de meta para o jogo ${game}

## Tarefa
Responder perguntas com base no CS2: armas, economia, granadas, táticas, mapas e mudanças em relação ao CS:GO.

## Regras
- Se não souber, diga: **"Não sei"**
- Se não for sobre CS2, diga: **"Essa pergunta não está relacionada ao jogo"**
- **Data atual:** ${new Date().toLocaleDateString()}
- Baseie-se apenas no patch atual do CS2

## Resposta
- Respostas com até **1500 caracteres**
- Use **Markdown**
- Foco em clareza e precisão, sem rodeios

## Exemplo
**Pergunta:** Qual a melhor smoke para dominar meio na Mirage?  
**Resposta:**  
**Mirage - Meio:** Smoke da base T para janela é essencial. Posicione-se no canto da parede, mire no canto da moldura e pule ao lançar. Garante controle de meio sem risco da AWP.
  `;
  const perguntaArk = `# Especialidade
Você é uma especialista assistente de meta para o jogo ${game}

## Tarefa
Responder perguntas com base em dinossauros, breeding, farm, PvP/PvE, engramas, sobre bosses, receitas, builds de pvp, melhor spots dos mapas para base com coordenadas, melhor lugares para farmar recursos e estratégias no ARK.

## Regras
- Se não souber, diga: **"Não sei"**
- Se não for sobre ARK, diga: **"Essa pergunta não está relacionada ao jogo"**
- **Data atual:** ${new Date().toLocaleDateString()}
- Não mencione conteúdo de mods, a menos que seja solicitado

## Resposta
- Máximo de **1500 caracteres**
- Use **Markdown**
- Responda direto ao ponto

## Exemplo
**Pergunta:** Melhor dino para farmar metal?  
**Resposta:**  
**Ankylosaurus** é o melhor para farmar metal. Leve um Argentavis para carregar o Anky e transportar o metal com redução de peso.
`;
  let pergunta = "";
  if (game === "ark") {
    pergunta = perguntaArk;
  } else if (game === "valorant") {
    pergunta = perguntaValorant;
  } else if (game === "cs2") {
    pergunta = perguntaCS2;
  } else if (game === "lol") {
    pergunta = perguntaLOL;
  } else {
    return false;
  }
  const contents = [
    {
      role: "user",
      parts: [
        {
          text: pergunta,
        },
      ],
    },
  ];
  const tools = [
    {
      google_search: {},
    },
  ];

  const response = await fetch(geminiURL, {
    method: "POST",
    headers: {
      "content-Type": "application/json",
    },
    body: JSON.stringify({ contents, tools }),
  });
  const data = await response.json();

  return data.candidates[0].content.parts[0].text;
};

const enviarFormulario = async (event) => {
  event.preventDefault();
  const apiKey = apiKeyInput.value;
  const game = gameSelect.value;
  const question = questionInput.value;

  if (apiKey == "" || game == "" || question == "") {
    alert("Por favor, preencha todos os campos");
    return;
  }
  askButton.disabled = true;
  askButton.textContent = "Perguntando...";
  askButton.classList.add("loading");
  try {
    const text = await perguntarAI(question, game, apiKey);
    aiResponse.querySelector(".response-content").innerHTML =
      markdownToHTML(text);
    aiResponse.classList.remove("hidden");
  } catch (error) {
    console.log("Erro: ", error);
  } finally {
    askButton.disabled = false;
    askButton.textContent = "Perguntar";
    askButton.classList.remove("loading");
  }
};

form.addEventListener("submit", enviarFormulario);
