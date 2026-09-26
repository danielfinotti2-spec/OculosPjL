const lerStorage = (chave, padrao) => {
    try { return JSON.parse(localStorage.getItem(chave)) ?? padrao; }
    catch { return padrao; }
};

let carrinho = lerStorage("oculos-carrinho", []);
let favoritos = lerStorage("oculos-favoritos", []);

document.querySelectorAll(".toggle-nav").forEach(botao => {
    const links = botao.parentElement.querySelector(".menu-links");
    botao.addEventListener("click", () => {
        const aberto = links.classList.toggle("active");
        botao.setAttribute("aria-expanded", String(aberto));
        botao.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
    });
});

function salvarCarrinho() {
    localStorage.setItem("oculos-carrinho", JSON.stringify(carrinho));
    renderizarCarrinho();
}

function renderizarCarrinho() {
    const lista = document.querySelector(".produtos");
    const contador = document.querySelector(".cart-count");
    const totalElement = document.querySelector(".total strong");
    if (!lista) return;
    const quantidade = carrinho.reduce((total, item) => total + item.quantidade, 0);
    if (contador) contador.textContent = quantidade;
    lista.innerHTML = carrinho.length ? carrinho.map(item => `
        <div class="produto" data-id="${item.id}">
            <img src="${item.imagem}" alt="${item.nome}">
            <div class="produto-info"><h3>${item.nome}</h3><p>${item.preco}</p>
                <div class="quantidade"><button type="button" data-action="menos" aria-label="Diminuir quantidade">−</button><span>${item.quantidade}</span><button type="button" data-action="mais" aria-label="Aumentar quantidade">+</button></div>
            </div><button type="button" class="remover" data-action="remover" aria-label="Remover ${item.nome}"><i class="fa-solid fa-trash"></i></button>
        </div>`).join("") : '<p class="carrinho-vazio">Seu carrinho está vazio.</p>';
    const centavos = carrinho.reduce((total, item) => total + item.valor * item.quantidade, 0);
    if (totalElement) totalElement.textContent = (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function abrirCarrinho() {
    document.getElementById("carrinho")?.classList.add("active");
    document.getElementById("overlay")?.classList.add("active");
    document.getElementById("carrinho")?.setAttribute("aria-hidden", "false");
}

function fecharCarrinho() {
    document.getElementById("carrinho")?.classList.remove("active");
    document.getElementById("overlay")?.classList.remove("active");
    document.getElementById("carrinho")?.setAttribute("aria-hidden", "true");
}

function abrirPesquisa() {
    const input = document.getElementById("searchBox");
    input?.classList.toggle("active");
    if (input?.classList.contains("active")) input.focus();
}

function adicionarAoCarrinho(dados) {
    const item = carrinho.find(produto => produto.id === dados.id);
    if (item) item.quantidade += 1;
    else carrinho.push({ ...dados, quantidade: 1 });
    salvarCarrinho();
    abrirCarrinho();
}

function dadosDoProduto(id, card) {
    const precoElement = card.querySelector(".product-price");
    const precoAtual = precoElement?.cloneNode(true);
    precoAtual?.querySelector("small")?.remove();
    const preco = precoAtual?.textContent.trim() || document.querySelector(".detalhe-preco")?.textContent.trim() || "R$ 0,00";
    const nome = card.querySelector("h3")?.textContent.trim() || document.querySelector(".detalhe-info h1")?.textContent.trim() || "Óculos";
    const imagem = card.querySelector("img")?.src || document.querySelector(".detalhe-imagem img")?.src || "";
    const numero = Number(preco.replace(/[^0-9,]/g, "").replace(",", ".")) || 0;
    return { id: String(id), nome, preco, imagem, valor: Math.round(numero * 100) };
}

document.querySelectorAll(".product-card").forEach((card, index) => {
    const id = String(index + 1);
    card.dataset.productId = id;
    card.tabIndex = 0;
    card.setAttribute("role", "group");
    card.setAttribute("aria-label", `Ver detalhes de ${card.querySelector("h3")?.textContent.trim() || "produto"}`);
    if (!card.querySelector(".favorite-button")) {
        const favorito = document.createElement("button");
        favorito.className = "favorite-button";
        favorito.type = "button";
        favorito.setAttribute("aria-label", "Favoritar produto");
        favorito.setAttribute("aria-pressed", "false");
        favorito.innerHTML = '<i class="fa-regular fa-heart"></i>';
        card.querySelector(".product-bottom-details")?.append(favorito);
    }
    const botaoFavorito = card.querySelector(".favorite-button");
    botaoFavorito?.addEventListener("click", event => {
        event.stopPropagation();
        const ativo = favoritos.includes(id);
        favoritos = ativo ? favoritos.filter(item => item !== id) : [...favoritos, id];
        localStorage.setItem("oculos-favoritos", JSON.stringify(favoritos));
        atualizarCoracao(botaoFavorito, !ativo);
    });
    if (botaoFavorito) atualizarCoracao(botaoFavorito, favoritos.includes(id));

    card.querySelector(".product-cart")?.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        adicionarAoCarrinho(dadosDoProduto(id, card));
    });
    card.addEventListener("click", event => {
        if (!event.target.closest("button, a")) window.location.href = `/produto/${id}`;
    });
    card.addEventListener("keydown", event => {
        if ((event.key === "Enter" || event.key === " ") && !event.target.closest("button, a")) {
            event.preventDefault();
            window.location.href = `/produto/${id}`;
        }
    });
});

function atualizarCoracao(botao, ativo) {
    const icone = botao.querySelector("i");
    icone?.classList.toggle("fa-solid", ativo);
    icone?.classList.toggle("fa-regular", !ativo);
    botao.classList.toggle("favorito", ativo);
    botao.setAttribute("aria-pressed", String(ativo));
}

document.querySelectorAll(".detalhe-acoes .favorite-button").forEach(botao => {
    const id = document.querySelector(".add-to-cart")?.dataset.productId;
    if (id) atualizarCoracao(botao, favoritos.includes(id));
    botao.addEventListener("click", () => {
        if (!id) return;
        const ativo = favoritos.includes(id);
        favoritos = ativo ? favoritos.filter(item => item !== id) : [...favoritos, id];
        localStorage.setItem("oculos-favoritos", JSON.stringify(favoritos));
        atualizarCoracao(botao, !ativo);
    });
});

document.querySelectorAll(".add-to-cart").forEach(botao => {
    botao.addEventListener("click", () => adicionarAoCarrinho(dadosDoProduto(botao.dataset.productId, document.querySelector(".detalhe-produto"))));
});

document.querySelector(".produtos")?.addEventListener("click", event => {
    const botao = event.target.closest("button[data-action]");
    if (!botao) return;
    const linha = botao.closest(".produto");
    const item = carrinho.find(produto => produto.id === linha.dataset.id);
    if (!item) return;
    if (botao.dataset.action === "mais") item.quantidade += 1;
    if (botao.dataset.action === "menos") item.quantidade -= 1;
    if (botao.dataset.action === "remover" || item.quantidade < 1) carrinho = carrinho.filter(produto => produto.id !== item.id);
    salvarCarrinho();
});

document.getElementById("searchBox")?.addEventListener("input", event => {
    const termo = event.target.value.toLocaleLowerCase("pt-BR");
    document.querySelectorAll(".product-card").forEach(card => {
        card.hidden = !card.textContent.toLocaleLowerCase("pt-BR").includes(termo);
    });
});

document.addEventListener("keydown", event => { if (event.key === "Escape") fecharCarrinho(); });
renderizarCarrinho();
