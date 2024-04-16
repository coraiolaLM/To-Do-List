//funcao para atualizar o armazenamento local com as tarefas da lista de tarefas
const atualizarArmazenamentoLocal = () => {
  const listaTarefas = document.getElementById("lista_de_tarefas");
   const tarefas = Array.from(listaTarefas.children).map((item, index) => {
    item.setAttribute('data-id', index); 
    const checkbox = item.querySelector('input[type="checkbox"]');
    return {
      id: index,
      texto: item.innerText,
      oculto: item.style.display === "none", 
      checkboxEstado: checkbox.checked 
    };
  });
  localStorage.setItem("tarefas", JSON.stringify(tarefas));
};

//funcaoo para adicionar uma nova tarefa a lista e exibir tarefas armazenadas localmente
const adicionaTarefaNaLista = () => {
  const novaTarefa = document.getElementById("input_nova_tarefa").value;
  criaNovoItemDaLista(novaTarefa);

  const tarefas = JSON.parse(localStorage.getItem("tarefas")) || []; 
  tarefas.push({ texto: novaTarefa, oculto: false, checkboxEstado: false });
  localStorage.setItem("tarefas", JSON.stringify(tarefas));
};

//funcao para criar novo item da lista
const criaNovoItemDaLista = (textoDaTarefa, oculto = false, checkboxEstado = false) => {
  const listaTarefas = document.getElementById("lista_de_tarefas");
  const novoItem = document.createElement("li");
  novoItem.innerText = textoDaTarefa;
  novoItem.classList.add("tarefa");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.classList.add("checkbox");
  checkbox.checked = checkboxEstado;

  novoItem.addEventListener("click", function (event) {
    if (event.target !== checkbox) {
      checkbox.checked = !checkbox.checked;
      novoItem.classList.toggle("selecionada", checkbox.checked);
      atualizarArmazenamentoLocal();
    }
  });

  checkbox.addEventListener("click", function (event) {
    event.stopPropagation();
    atualizarArmazenamentoLocal();
  });

  novoItem.appendChild(checkbox);
  listaTarefas.appendChild(novoItem);

  if (oculto) {
    novoItem.style.display = "none";
  }
};

//funcao para entrar no modo de edição de um item de lista
const entraModoEdicao = (item) => {
  const textoAtual = item.innerText;
  const divEdicao = document.createElement("div");
  divEdicao.classList.add("caixa-edicao");
  const inputEdicao = document.createElement("input");
  inputEdicao.value = textoAtual;

  const checkbox = item.querySelector('input[type="checkbox"]');
  const checkboxEstado = checkbox.checked;

  divEdicao.appendChild(inputEdicao);
  item.innerHTML = "";
  item.appendChild(divEdicao);
  item.appendChild(checkbox);

  inputEdicao.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      salvaEdicao(item, inputEdicao.value, checkboxEstado);
    }
  });

  inputEdicao.focus();
}

//funcao para salvar a edição de um item de lista
const salvaEdicao = (item, novoTexto, checkboxEstado) => {
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = checkboxEstado;
  checkbox.classList.add("checkbox");

  const texto = document.createTextNode(novoTexto);
  
  while (item.firstChild) {
    item.removeChild(item.firstChild);
  }
  
  item.appendChild(texto);
  item.appendChild(checkbox);

  item.addEventListener("dblclick", function () {
    entraModoEdicao(this);
  });

  checkbox.addEventListener("click", function (event) {
    event.stopPropagation();
    atualizarArmazenamentoLocal();
  });

  item.addEventListener("click", function (event) {
    if (event.target !== checkbox) {
      checkbox.checked = !checkbox.checked;
      item.classList.toggle("selecionada", checkbox.checked);
      atualizarArmazenamentoLocal();
    }
  });

  item.setAttribute('data-id', parseInt(item.getAttribute('data-id')));
  
  atualizarArmazenamentoLocal();
};

//funcao para ocultar os itens selecionados da lista de tarefas
const ocultarItensSelecionados = () => {
  const listaTarefas = document.getElementById("lista_de_tarefas");
  const tarefas = listaTarefas.children;
  const tarefasOcultas = [];

  for (let i = tarefas.length - 1; i >= 0; i--) {
    const tarefa = tarefas[i];
    const checkbox = tarefa.querySelector('input[type="checkbox"]');
    if (checkbox && checkbox.checked) {
      tarefa.style.display = "none";
      tarefasOcultas.push(tarefa.getAttribute('data-id')); 
    }
  }

  localStorage.setItem("tarefasOcultas", JSON.stringify(tarefasOcultas));
  atualizarArmazenamentoLocal();
};

//funcao para revelar todos os itens ocultos da lista de tarefas
const desocultarTodosItens = () => {
  const listaTarefas = document.getElementById("lista_de_tarefas");
  const tarefas = listaTarefas.children;

  for (let i = 0; i < tarefas.length; i++) {
    const tarefa = tarefas[i];
    tarefa.style.display = "";
  }
  atualizarArmazenamentoLocal();
};

//funcao para remover ou apagar itens selecionados
const removerItensSelecionados = () => {
  const listaTarefas = document.getElementById("lista_de_tarefas");
  const tarefas = listaTarefas.children;
  const tarefasOcultas = JSON.parse(localStorage.getItem("tarefasOcultas")) || [];
  const idsARemover = [];

  for (let i = tarefas.length - 1; i >= 0; i--) {
    const tarefa = tarefas[i];
    const checkbox = tarefa.querySelector('input[type="checkbox"]');
    const id = parseInt(tarefa.getAttribute('data-id'));
    // Verifica se o checkbox está marcado e se o item não está oculto
    if (checkbox && checkbox.checked && tarefa.style.display !== "none") {
      listaTarefas.removeChild(tarefa);
      if (!isNaN(id)) {
        idsARemover.push(id);
      }
    }
  }

  const tarefasOcultasAtualizadas = tarefasOcultas.filter(id => !idsARemover.includes(id));

  if (tarefasOcultasAtualizadas.length !== tarefasOcultas.length) {
    localStorage.setItem("tarefasOcultas", JSON.stringify(tarefasOcultasAtualizadas));
  }
  atualizarArmazenamentoLocal();
};

//recupera e exibe tarefas armazenadas localmente quando a pagina e carregada
document.addEventListener("DOMContentLoaded", function () {
  const tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];
  tarefas.forEach(function (tarefa) {
    criaNovoItemDaLista(tarefa.texto, tarefa.oculto, tarefa.checkboxEstado);
  });

  const tarefasOcultas = JSON.parse(localStorage.getItem("tarefasOcultas")) || [];
  tarefasOcultas.forEach(function (idItem) {
    const tarefa = document.querySelector(`li[data-id="${idItem}"]`);
    if (tarefa) {
      tarefa.style.display = "none";
    }
  });
});

//adiciona um ouvinte de eventos de clique dque entra em modo edição, apertando em um item da lista
document.getElementById("lista_de_tarefas")
.addEventListener("dblclick", function (event) {
    const target = event.target;
    if (target.tagName === "LI") {
      entraModoEdicao(target);
    }
  });