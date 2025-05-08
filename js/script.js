function alternarCamposArtigos() {
  const tipo = document.getElementById('tipoLivro').value;
  const artigoDiv = document.getElementById('artigoConfig');
  artigoDiv.style.display = (tipo === 'curadoria' || tipo === 'combinado') ? 'block' : 'none';
  document.getElementById('qtdArtigos').value = '';
  document.getElementById('camposArtigos').innerHTML = '';
  document.getElementById('resultado').classList.add('d-none');
}

function alternarCargaParcial() {
  const parcial = document.getElementById('cargaParcial').checked;
  const campoPercentual = document.getElementById('campoPercentual');
  campoPercentual.style.display = parcial ? 'block' : 'none';
}

function gerarCampos() {
  const qtd = parseInt(document.getElementById('qtdArtigos').value);
  const container = document.getElementById('camposArtigos');
  container.innerHTML = '';
  for (let i = 1; i <= qtd; i++) {
    container.innerHTML += `
      <div class="mb-2">
        <label class="form-label">Quantidade de páginas do artigo ${i} <span class="text-danger">*</span></label>
        <input type="number" class="form-control" id="artigo${i}" min="1">
        <div class="form-error d-none" id="erroArtigo${i}">Informe o número de páginas do artigo ${i}.</div>
      </div>`;
  }
}

document.getElementById('formCargaHoraria').addEventListener('submit', function (e) {
  e.preventDefault();
  const cargaTotal = parseFloat(document.getElementById('cargaHoraria').value);
  const tipo = document.getElementById('tipoLivro').value;
  const qtdArtigos = parseInt(document.getElementById('qtdArtigos').value) || 0;
  const parcial = document.getElementById('cargaParcial').checked;
  const percentualEAD = parcial ? parseFloat(document.getElementById('percentualEAD').value) : 100;

  const erroPercentual = document.getElementById('erroPercentual');
  if (parcial && (isNaN(percentualEAD) || percentualEAD < 1 || percentualEAD > 100)) {
    erroPercentual.classList.remove('d-none');
    return;
  } else {
    erroPercentual.classList.add('d-none');
}

  const cargaEAD = cargaTotal * (percentualEAD / 100);
  const cargaPresencial = cargaTotal - cargaEAD;

  document.getElementById('erroCarga').classList.toggle('d-none', !!cargaTotal);
  document.getElementById('erroTipo').classList.toggle('d-none', !!tipo);
  document.getElementById('erroArtigos').classList.toggle('d-none', tipo === 'autoral' || (qtdArtigos > 0));

  let camposArtigosValidos = true;
  if (tipo !== 'autoral') {
    for (let i = 1; i <= qtdArtigos; i++) {
      const campo = document.getElementById(`artigo${i}`);
      const erro = document.getElementById(`erroArtigo${i}`);
      if (!campo.value || parseInt(campo.value) <= 0) {
        erro.classList.remove('d-none');
        camposArtigosValidos = false;
      } else {
        erro.classList.add('d-none');
      }
    }
  }

  if (!cargaTotal || !tipo || (tipo !== 'autoral' && (!qtdArtigos || !camposArtigosValidos))) return;

  let totalHoras = 0;
  let tabela = [];
  const objetos = [
    { id: 'infograficos', nome: 'Infográficos', qtd: Math.ceil(cargaEAD / 10), tempo: 0.25 },
    { id: 'podcasts', nome: 'Podcasts', qtd: Math.ceil(cargaEAD / 10), tempo: 0.08 },
    { id: 'videos', nome: 'Vídeos curtos', qtd: Math.ceil(cargaEAD / 5), tempo: 0.08 },
    { id: 'flashcards', nome: 'Flashcards', qtd: Math.ceil(cargaEAD / 10), tempo: 0.25 },
    { id: 'atividades', nome: 'Atividades avaliativas', qtd: Math.ceil(cargaEAD / 10), tempo: 1.75 },
    { id: 'encontros', nome: 'Encontros remotos', qtd: Math.floor(cargaEAD / 10), tempo: 1 }
  ];

  objetos.forEach(obj => {
    if (document.getElementById(obj.id).checked) {
      const tempo = obj.qtd * obj.tempo;
      totalHoras += tempo;
      tabela.push(`<tr><td>${obj.nome}</td><td>${obj.qtd}</td><td>${tempo.toFixed(2)} h</td></tr>`);
    }
  });

  let paginasArtigos = 0;
  for (let i = 1; i <= qtdArtigos; i++) {
    paginasArtigos += parseInt(document.getElementById(`artigo${i}`).value) || 0;
  }
  const tempoCuradoria = paginasArtigos / 2;

  if (tipo === 'curadoria') {
    totalHoras += tempoCuradoria;
    tabela.unshift(`<tr><td>Curadoria de artigos</td><td>${paginasArtigos} páginas</td><td>${tempoCuradoria.toFixed(2)} h</td></tr>`);
  } else if (tipo === 'autoral') {
    const tempoLivro = cargaEAD - totalHoras;
    const paginasLivro = tempoLivro * 2;
    totalHoras += tempoLivro;
    tabela.unshift(`<tr><td>Livro autoral</td><td>${paginasLivro.toFixed(0)} páginas</td><td>${tempoLivro.toFixed(2)} h</td></tr>`);
  } else if (tipo === 'combinado') {
    const tempoLivro = tempoCuradoria;
    totalHoras += tempoCuradoria + tempoLivro;
    tabela.unshift(`<tr><td>Livro autoral</td><td>${(tempoLivro * 2).toFixed(0)} páginas (equivalente)</td><td>${tempoLivro.toFixed(2)} h</td></tr>`);
    tabela.unshift(`<tr><td>Curadoria de artigos</td><td>${paginasArtigos} páginas</td><td>${tempoCuradoria.toFixed(2)} h</td></tr>`);
  }

  const pendente = cargaEAD - totalHoras;
  const unidades = Math.ceil(cargaEAD / 10);

  document.getElementById('resultado').innerHTML = `
    <h5>Resumo detalhado:</h5>
    <p><strong>Total da UC:</strong> ${cargaTotal}h — <strong>Presencial:</strong> ${cargaPresencial.toFixed(2)}h | <strong>EAD:</strong> ${cargaEAD.toFixed(2)}h</p>
    <table class="table table-bordered mb-0">
      <thead><tr><th>Recurso</th><th>Quantidade</th><th>Carga horária</th></tr></thead>
      <tbody>${tabela.join('')}</tbody>
    </table>
    <br>
    <strong>Total estimado:</strong> ${totalHoras.toFixed(2)} horas<br>
    <strong>Limite EAD:</strong> ${cargaEAD.toFixed(2)} horas<br>
    <strong>Status:</strong> <span class="${totalHoras > cargaEAD ? 'text-danger' : 'text-success'}">
      ${totalHoras > cargaEAD ? 'Excede o limite' : 'Dentro do limite'}</span><br>
    ${pendente > 0 ? `<strong>Horas pendentes:</strong> <span class="text-danger">${pendente.toFixed(2)} h</span><br>` : ''}
    <strong>Unidades de aprendizagem sugeridas:</strong> ${unidades}
  `;

  document.getElementById('resultado').classList.remove('d-none');
});
