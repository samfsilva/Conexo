class ConexoGame {
  constructor() {
    this.words = [];
    this.groups = [];
    this.groupNames = [];
    this.selectedWords = [];
    this.correctGroups = [];
    this.currentCode = null;
    this.setupEventListeners();
    this.checkForSavedGame();
  }

  setupEventListeners() {
    document
      .getElementById("startGame")
      .addEventListener("click", () => this.startGame());
    document
      .getElementById("copyCode")
      .addEventListener("click", () => this.copyShareCode());
    document
      .getElementById("loadGame")
      .addEventListener("click", () => this.loadGame());

    // Adicionar validação em tempo real
    const inputs = document.querySelectorAll(".word-input, .group-name");
    inputs.forEach((input) => {
      input.addEventListener("input", () => {
        this.validateWord(input);
        this.updateShareCode();
      });
    });

    const groupNameInputs = document.querySelectorAll(".group-name");
    groupNameInputs.forEach((input) => {
      input.addEventListener("input", () => {
        this.checkAllFields();
      });
    });
  }

  checkForSavedGame() {
    const urlParams = new URLSearchParams(window.location.search);
    const gameCode = urlParams.get("code");
    if (gameCode) {
      document.querySelector(".game-setup").style.display = "none";
      document.querySelector(".load-game").style.display = "block";
      document.getElementById("gameCode").value = gameCode;
    }
  }

  checkAllFields() {
    const allWords = Array.from(document.querySelectorAll(".word-input")).map(
      (input) => input.value.trim()
    );
    const allNames = Array.from(document.querySelectorAll(".group-name")).map(
      (input) => input.value.trim()
    );
    const allFieldsFilled =
      allWords.every((word) => word !== "") &&
      allNames.every((name) => name !== "");

    if (allFieldsFilled) {
      document.getElementById("copyCodeHint").style.display = "block";
    } else {
      document.getElementById("copyCodeHint").style.display = "none";
    }
  }

  updateShareCode() {
    const allWords = Array.from(document.querySelectorAll(".word-input")).map(
      (input) => input.value.trim()
    );
    const allNames = Array.from(document.querySelectorAll(".group-name")).map(
      (input) => input.value.trim()
    );

    const allFieldsFilled =
      allWords.every((word) => word !== "") &&
      allNames.every((name) => name !== "");
    const uniqueWords = new Set(allWords.map((word) => word.toLowerCase()));
    const hasDuplicates = uniqueWords.size !== allWords.length;

    const statusDot = document.querySelector(".status-dot");
    const statusText = document.querySelector(".status-text");

    if (allFieldsFilled && !hasDuplicates) {
      const gameData = {
        words: allWords,
        groupNames: allNames,
      };
      this.currentCode = btoa(JSON.stringify(gameData));
      document.getElementById("copyCode").style.display = "block";

      statusDot.classList.add("ready");
      statusText.textContent = "Código pronto para compartilhar!";
    } else {
      this.currentCode = null;
      document.getElementById("copyCode").style.display = "none";

      statusDot.classList.remove("ready");
      if (!allFieldsFilled) {
        statusText.textContent = "Aguardando preenchimento dos grupos...";
      } else if (hasDuplicates) {
        statusText.textContent =
          "Remova as palavras duplicadas para gerar o código";
      }
    }
  }

  copyShareCode() {
    if (this.currentCode) {
      navigator.clipboard.writeText(this.currentCode).then(() => {
        alert("Código copiado!");
      });
    }
  }

  loadGame() {
    const code = document.getElementById("gameCode").value.trim();
    try {
      const gameData = JSON.parse(atob(code));

      // Verificar se o código é válido
      if (!this.isValidGameData(gameData)) {
        throw new Error("Código inválido");
      }

      // Preencher os campos com os dados do jogo
      const wordInputs = document.querySelectorAll(".word-input");
      const groupNameInputs = document.querySelectorAll(".group-name");

      gameData.words.forEach((word, index) => {
        wordInputs[index].value = word;
      });

      gameData.groupNames.forEach((name, index) => {
        groupNameInputs[index].value = name;
      });

      // Iniciar o jogo
      this.startGame();
    } catch (error) {
      alert(
        "Código inválido! Por favor, verifique o código e tente novamente."
      );
    }
  }

  isValidGameData(gameData) {
    return (
      gameData &&
      Array.isArray(gameData.words) &&
      Array.isArray(gameData.groupNames) &&
      gameData.words.length === 16 &&
      gameData.groupNames.length === 4 &&
      gameData.words.every(
        (word) => typeof word === "string" && word.trim() !== ""
      ) &&
      gameData.groupNames.every(
        (name) => typeof name === "string" && name.trim() !== ""
      )
    );
  }

  validateWord(input) {
    const currentValue = input.value.trim().toLowerCase();
    if (!currentValue) {
      this.clearDuplicateHighlights();
      return;
    }

    const allInputs = document.querySelectorAll(".word-input");
    const duplicateInputs = Array.from(allInputs).filter(
      (otherInput) =>
        otherInput !== input &&
        otherInput.value.trim().toLowerCase() === currentValue
    );

    // Limpar highlights anteriores
    this.clearDuplicateHighlights();

    if (duplicateInputs.length > 0) {
      // Destacar as palavras duplicadas
      input.classList.add("duplicate");
      duplicateInputs.forEach((dupInput) => {
        dupInput.classList.add("duplicate");
      });

      input.setCustomValidity("Esta palavra já foi usada em outro grupo");
      input.reportValidity();
    } else {
      input.setCustomValidity("");
    }
  }

  clearDuplicateHighlights() {
    const inputs = document.querySelectorAll(".word-input");
    inputs.forEach((input) => {
      input.classList.remove("duplicate");
    });
  }

  startGame() {
    document.querySelector(".load-game").style.display = "none";
    // Coletar todas as palavras dos inputs
    const inputs = document.querySelectorAll(".word-input");
    this.words = Array.from(inputs)
      .map((input) => input.value.trim())
      .filter((word) => word !== "");

    // Verificar palavras duplicadas
    const uniqueWords = new Set(this.words.map((word) => word.toLowerCase()));
    if (uniqueWords.size !== this.words.length) {
      // Destacar todas as palavras duplicadas
      this.highlightAllDuplicates();
      return;
    }

    // Coletar os nomes dos grupos
    const nameInputs = document.querySelectorAll(".group-name");
    this.groupNames = Array.from(nameInputs).map((input) => input.value.trim());

    if (this.words.length !== 16) {
      alert("Por favor, preencha todas as 16 palavras!");
      return;
    }

    if (this.groupNames.some((name) => name === "")) {
      alert("Por favor, preencha o nome de todos os grupos!");
      return;
    }

    // Organizar as palavras em grupos
    this.groups = [];
    for (let i = 0; i < 4; i++) {
      this.groups.push(this.words.slice(i * 4, (i + 1) * 4));
    }

    // Embaralhar as palavras
    this.words = this.shuffleArray([...this.words]);

    // Esconder a configuração e mostrar o tabuleiro
    document.querySelector(".game-setup").style.display = "none";
    document.querySelector(".game-board").style.display = "block";

    // Criar o tabuleiro
    this.createBoard();
  }

  highlightAllDuplicates() {
    const inputs = document.querySelectorAll(".word-card");
    const wordCounts = new Map();

    // Contar ocorrências de cada palavra
    inputs.forEach((input) => {
      const word = input.value.trim().toLowerCase();
      if (word) {
        wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
      }
    });

    // Destacar palavras que aparecem mais de uma vez
    inputs.forEach((input) => {
      const word = input.value.trim().toLowerCase();
      if (word && wordCounts.get(word) > 1) {
        input.classList.add("duplicate");
      }
    });

    alert("Por favor, remova as palavras duplicadas!");
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  createBoard() {
    const gridContainer = document.querySelector(".grid-container");
    gridContainer.innerHTML = "";

    this.words.forEach((word, index) => {
      const card = document.createElement("div");
      card.className = "word-card";
      card.textContent = word;
      card.dataset.word = word;
      card.style.animationDelay = `${index * 0.1}s`;
      card.addEventListener("click", () => this.selectWord(card));
      gridContainer.appendChild(card);
    });
  }

  selectWord(card) {
    if (card.classList.contains("selected")) {
      // Desselecionar a palavra
      card.classList.remove("selected");
      this.selectedWords = this.selectedWords.filter(
        (word) => word !== card.dataset.word
      );
    } else if (this.selectedWords.length < 4) {
      // Selecionar a palavra
      card.classList.add("selected");
      this.selectedWords.push(card.dataset.word);
    }

    if (this.selectedWords.length === 4) {
      this.checkGroup();
    }
  }

  checkGroup() {
    const selectedSet = new Set(this.selectedWords);
    let foundGroup = null;

    for (let i = 0; i < this.groups.length; i++) {
      if (this.groups[i].every((word) => selectedSet.has(word))) {
        foundGroup = i;
        break;
      }
    }

    if (foundGroup !== null && !this.correctGroups.includes(foundGroup)) {
      this.correctGroups.push(foundGroup);
      this.markCorrectGroup(foundGroup);
      this.selectedWords = [];
      this.deselectAllCards();

      if (this.correctGroups.length === 4) {
        setTimeout(() => {
          alert("Parabéns! Você completou o jogo!");
          this.resetGame();
        }, 500);
      }
    } else {
      // Animação de erro
      const cards = document.querySelectorAll(".word-card.selected");
      cards.forEach((card) => {
        card.style.animation = "shake 0.5s";
        setTimeout(() => {
          card.style.animation = "";
        }, 500);
      });

      // Limpar seleção após animação
      setTimeout(() => {
        this.selectedWords = [];
        this.deselectAllCards();
      }, 1000);
    }
  }

  markCorrectGroup(groupIndex) {
    const cards = document.querySelectorAll(".word-card");
    const completedGroupsContainer =
      document.querySelector(".completed-groups");

    // Criar o grupo completado
    const completedGroup = document.createElement("div");
    completedGroup.className = "completed-group";

    const groupName = document.createElement("div");
    groupName.className = "completed-group-name";
    groupName.textContent = this.groupNames[groupIndex];

    const groupWords = document.createElement("div");
    groupWords.className = "completed-group-words";

    // Adicionar as palavras ao grupo completado
    this.groups[groupIndex].forEach((word, index) => {
      const wordElement = document.createElement("div");
      wordElement.className = `completed-word group-${groupIndex + 1}`;
      wordElement.textContent = word;
      wordElement.style.animationDelay = `${index * 0.1}s`;
      groupWords.appendChild(wordElement);
    });

    completedGroup.appendChild(groupName);
    completedGroup.appendChild(groupWords);

    // Inserir o grupo na posição correta (primeiro ou segundo)
    if (this.correctGroups.length <= 2) {
      completedGroupsContainer.insertBefore(
        completedGroup,
        completedGroupsContainer.firstChild
      );
    } else {
      completedGroupsContainer.appendChild(completedGroup);
    }

    // Animação de remoção das palavras do tabuleiro
    cards.forEach((card) => {
      if (this.groups[groupIndex].includes(card.dataset.word)) {
        card.style.animation = "moveToTop 0.5s forwards";
        setTimeout(() => {
          card.remove();
        }, 500);
      }
    });
  }

  deselectAllCards() {
    const cards = document.querySelectorAll(".word-card");
    cards.forEach((card) => {
      card.classList.remove("selected");
      card.style.transform = "scale(1)";
    });
  }

  resetGame() {
    // Limpar todos os campos
    document.querySelectorAll(".word-input, .group-name").forEach((input) => {
      input.value = "";
    });
    this.words = [];
    this.groups = [];
    this.groupNames = [];
    this.selectedWords = [];
    this.correctGroups = [];
    this.currentCode = null;

    // Resetar o status do código
    const statusDot = document.querySelector(".status-dot");
    const statusText = document.querySelector(".status-text");
    statusDot.classList.remove("ready");
    statusText.textContent = "Aguardando preenchimento dos grupos...";

    // Voltar para a tela inicial
    document.querySelector(".game-setup").style.display = "block";
    document.querySelector(".game-board").style.display = "none";
    document.querySelector(".load-game").style.display = "block";
    document.getElementById("copyCode").style.display = "none";
  }
}

// Inicializar o jogo quando a página carregar
window.addEventListener("load", () => {
  new ConexoGame();
});
