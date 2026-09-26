const lerStorage = (chave, padrao) => {
    try { return JSON.parse(localStorage.getItem(chave)) ?? padrao; }
    catch { return padrao; }
};
const gravarStorage = (chave, valor) => {
    try { localStorage.setItem(chave, JSON.stringify(valor)); }
    catch { /* Keep controls usable when the browser blocks storage. */ }
};

let carrinho = lerStorage("oculos-carrinho", []);
let favoritos = lerStorage("oculos-favoritos", []);
if (!Array.isArray(carrinho)) carrinho = [];
if (!Array.isArray(favoritos)) favoritos = [];

const menuDrawerOverlay = document.createElement("div");
menuDrawerOverlay.className = "menu-overlay";
menuDrawerOverlay.setAttribute("aria-hidden", "true");
document.body.append(menuDrawerOverlay);

function fecharMenuLateral() {
    document.querySelectorAll(".toggle-nav").forEach(botao => {
        const menu = botao.parentElement.querySelector(".menu-links");
        menu?.classList.remove("active");
        botao.setAttribute("aria-expanded", "false");
        botao.setAttribute("aria-label", "Abrir menu");
    });
    menuDrawerOverlay.classList.remove("active");
    menuDrawerOverlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("menu-lateral-aberto");
}

document.querySelectorAll(".toggle-nav").forEach(botao => {
    const menu = botao.parentElement.querySelector(".menu-links");
    const fechar = menu?.querySelector(".menu-close");
    botao.addEventListener("click", () => {
        const aberto = !menu?.classList.contains("active");
        fecharMenuLateral();
        if (!aberto || !menu) return;
        menu.classList.add("active");
        botao.setAttribute("aria-expanded", "true");
        botao.setAttribute("aria-label", "Fechar menu");
        menuDrawerOverlay.classList.add("active");
        menuDrawerOverlay.setAttribute("aria-hidden", "false");
        document.body.classList.add("menu-lateral-aberto");
        fechar?.focus();
    });
    fechar?.addEventListener("click", fecharMenuLateral);
    menu?.querySelectorAll("a").forEach(link => link.addEventListener("click", event => {
        if (link.dataset.category) {
            event.preventDefault();
            window.filtrarCategoria?.(link.dataset.category);
            document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        fecharMenuLateral();
    }));
});
menuDrawerOverlay.addEventListener("click", fecharMenuLateral);

document.querySelectorAll(".menu-links").forEach(menu => {
    const linha = document.createElement("span");
    linha.className = "menu-underline";
    linha.setAttribute("aria-hidden", "true");
    menu.append(linha);

    const moverLinha = link => {
        const menuRect = menu.getBoundingClientRect();
        const linkRect = link.getBoundingClientRect();
        linha.style.width = `${linkRect.width}px`;
        linha.style.transform = `translateX(${linkRect.left - menuRect.left}px)`;
        linha.style.opacity = "1";
    };

    menu.querySelectorAll("a").forEach(link => {
        link.addEventListener("pointerenter", () => moverLinha(link));
        link.addEventListener("focus", () => moverLinha(link));
    });
    menu.addEventListener("pointerleave", () => { linha.style.opacity = "0"; });
    menu.addEventListener("focusout", event => {
        if (!menu.contains(event.relatedTarget)) linha.style.opacity = "0";
    });
});

function salvarCarrinho() {
    gravarStorage("oculos-carrinho", carrinho);
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
    document.body.classList.add("carrinho-aberto");
}

function abrirAvisoLogin(motivo = "checkout") {
    const aviso = document.getElementById("loginGate");
    if (!aviso) return;
    const rotulo = motivo === "favoritos" ? "favoritos" : "checkout";
    aviso.hidden = false;
    document.body.classList.add("login-gate-aberto");
    const entrar = document.getElementById("loginGateEnter");
    const criar = document.getElementById("loginGateCreate");
    if (entrar) entrar.href = `/login?next=${rotulo}`;
    if (criar) criar.href = `/criar-conta?next=${rotulo}`;
    document.getElementById("login-gate-title")?.replaceChildren(document.createTextNode(rotulo === "favoritos" ? "Salve seus favoritos" : "Entre na sua conta"));
    document.getElementById("login-gate-description")?.replaceChildren(document.createTextNode(rotulo === "favoritos" ? "Entre ou crie uma conta para guardar seus óculos favoritos." : "Para finalizar sua compra, entre ou crie uma conta Visão Boa."));
    entrar?.focus();
}

function fecharAvisoLogin() {
    const aviso = document.getElementById("loginGate");
    if (!aviso || aviso.hidden) return;
    aviso.hidden = true;
    document.body.classList.remove("login-gate-aberto");
}

document.querySelectorAll("[data-close-login-gate]").forEach(botao => botao.addEventListener("click", fecharAvisoLogin));
document.querySelectorAll(".finalizar").forEach(botao => botao.addEventListener("click", () => abrirAvisoLogin("checkout")));

function fecharCarrinho() {
    document.getElementById("carrinho")?.classList.remove("active");
    document.getElementById("overlay")?.classList.remove("active");
    document.getElementById("carrinho")?.setAttribute("aria-hidden", "true");
    document.body.classList.remove("carrinho-aberto");
}

function abrirPesquisa() {
    const input = document.getElementById("searchBox");
    if (!input) return;
    const aberta = !input.classList.contains("active");
    input.classList.toggle("active", aberta);
    document.querySelectorAll(".search-button").forEach(botao => botao.setAttribute("aria-expanded", String(aberta)));
    if (aberta) input.focus();
    else {
        input.value = "";
        input.dispatchEvent(new Event("input", { bubbles: true }));
    }
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
    const id = String(card.dataset.productId || index + 1);
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
        event.preventDefault();
        abrirAvisoLogin("favoritos");
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

const miniaturasProduto = [...document.querySelectorAll(".detalhe-miniatura")];
miniaturasProduto.forEach((miniatura, index) => {
    miniatura.addEventListener("click", () => {
        const imagemPrincipal = document.getElementById("imagem-principal-produto");
        if (!imagemPrincipal || !miniatura.dataset.image) return;
        imagemPrincipal.classList.add("trocando");
        imagemPrincipal.src = miniatura.dataset.image;
        imagemPrincipal.alt = miniatura.querySelector("img")?.alt || `Foto ${index + 1} do produto`;
        window.setTimeout(() => imagemPrincipal.classList.remove("trocando"), 220);
        miniaturasProduto.forEach(item => {
            const ativa = item === miniatura;
            item.classList.toggle("ativa", ativa);
            item.setAttribute("aria-pressed", String(ativa));
        });
        const legenda = document.querySelector(".detalhe-foto-legenda");
        if (legenda) {
            legenda.textContent = `Foto ${index + 1} de ${miniaturasProduto.length}`;
            legenda.classList.remove("atualizada");
            void legenda.offsetWidth;
            legenda.classList.add("atualizada");
        }
    });
});

const areaImagemProduto = document.querySelector(".detalhe-imagem");
if (areaImagemProduto && miniaturasProduto.length > 1) {
    areaImagemProduto.setAttribute("role", "button");
    areaImagemProduto.setAttribute("tabindex", "0");
    areaImagemProduto.setAttribute("aria-label", "Mostrar próxima foto do produto");
    const proximaFoto = () => {
        const atual = miniaturasProduto.findIndex(item => item.getAttribute("aria-pressed") === "true");
        miniaturasProduto[(atual + 1) % miniaturasProduto.length].click();
    };
    areaImagemProduto.addEventListener("click", proximaFoto);
    areaImagemProduto.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            proximaFoto();
        }
    });
}

const listaHome = document.querySelector(".catalogo-home .lista-produtos");
if (listaHome) {
    const ordemNovidades = [1, 2, 3, 4, 5, 6];
    const ordemMaisVendidos = [4, 2, 5, 3, 6, 1];
    window.filtrarCategoria = function filtrarCategoria(categoria) {
        const normalizar = texto => texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        const cards = [...listaHome.querySelectorAll(".product-card")];
        let encontrados = 0;
        cards.forEach(card => {
            const textoCategoria = normalizar(card.querySelector(".product-categoria")?.textContent || "");
            const exibir = categoria === "lentes"
                ? normalizar(card.textContent).includes("lente")
                : categoria === "sol" ? textoCategoria.includes("sol")
                : categoria === "grau" ? textoCategoria.includes("grau")
                : categoria === "esportivo" ? textoCategoria.includes("esport")
                : true;
            card.hidden = !exibir;
            if (exibir) encontrados += 1;
        });
        const status = document.querySelector(".catalogo-status");
        if (status) {
            status.hidden = encontrados > 0;
            status.textContent = encontrados ? "" : "Ainda não temos produtos desta categoria. Confira as opções de armações disponíveis.";
        }
        document.querySelectorAll(".catalogo-tab").forEach(tab => {
            tab.classList.remove("active");
            tab.setAttribute("aria-pressed", "false");
        });
    };
    const categoriaInicial = new URLSearchParams(window.location.search).get("categoria");
    if (categoriaInicial) window.filtrarCategoria(categoriaInicial);
    document.querySelectorAll(".catalogo-tab").forEach(tab => tab.addEventListener("click", () => {
        document.querySelectorAll(".catalogo-tab").forEach(item => {
            const ativa = item === tab;
            item.classList.toggle("active", ativa);
            item.setAttribute("aria-pressed", String(ativa));
        });
        const ordem = tab.dataset.sort === "mais-vendidos" ? ordemMaisVendidos : ordemNovidades;
        const cardsPorId = new Map([...listaHome.querySelectorAll(".product-card")].map(card => [Number(card.dataset.productId), card]));
        ordem.forEach(id => { const card = cardsPorId.get(id); if (card) listaHome.append(card); });
        listaHome.querySelectorAll(".product-card").forEach(card => { card.hidden = false; });
        const status = document.querySelector(".catalogo-status");
        if (status) status.hidden = true;
    }));
}

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
        gravarStorage("oculos-favoritos", favoritos);
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
    document.querySelectorAll(".product-card, .related-card").forEach(card => {
        card.hidden = !card.textContent.toLocaleLowerCase("pt-BR").includes(termo);
    });
});

document.querySelectorAll(".opcao-produto").forEach(opcao => {
    const label = opcao.querySelector("[data-selection-label]");
    opcao.querySelectorAll(".amostra-cor").forEach(amostra => {
        amostra.addEventListener("click", () => {
            opcao.querySelectorAll(".amostra-cor").forEach(item => {
                const selecionado = item === amostra;
                item.classList.toggle("selecionado", selecionado);
                item.setAttribute("aria-pressed", String(selecionado));
            });
            if (label) label.textContent = amostra.dataset.choice;
        });
    });
});

document.querySelectorAll(".product-tabs").forEach(tabs => {
    tabs.querySelectorAll(".product-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.querySelectorAll(".product-tab").forEach(item => {
                const ativo = item === tab;
                item.classList.toggle("ativo", ativo);
                item.setAttribute("aria-selected", String(ativo));
            });
            document.querySelectorAll("[data-tab-panel]").forEach(painel => {
                painel.hidden = painel.dataset.tabPanel !== tab.dataset.tab;
            });
        });
    });
});

const relatedSection = document.querySelector(".relacionados");
if (relatedSection) {
    const relatedTabs = [...relatedSection.querySelectorAll(".related-tab")];
    const panels = [...relatedSection.querySelectorAll(".related-panel")];
    relatedTabs.forEach(tab => tab.addEventListener("click", () => {
        relatedTabs.forEach(item => {
            const active = item === tab;
            item.classList.toggle("active", active);
            item.setAttribute("aria-selected", String(active));
        });
        panels.forEach(panel => { panel.hidden = panel.id !== tab.getAttribute("aria-controls"); });
    }));

    const catalogo = lerStorage("oculos-catalogo", []);
    const produtoAtual = relatedSection.dataset.currentId;
    const vistos = lerStorage("oculos-vistos-recentemente", []).filter(id => String(id) !== produtoAtual);
    const idsVistos = [produtoAtual, ...vistos].filter((id, index, todos) => todos.indexOf(id) === index).slice(0, 8);
    gravarStorage("oculos-vistos-recentemente", idsVistos);
    const catalogoScript = document.getElementById("catalogo-produtos");
    let produtosDisponiveis = [];
    try { produtosDisponiveis = JSON.parse(catalogoScript?.textContent || "[]"); } catch { produtosDisponiveis = []; }
    gravarStorage("oculos-catalogo", produtosDisponiveis);

    const gradeRecentes = relatedSection.querySelector("#vistos-recentemente .related-grid");
    const criarCard = produto => {
        const link = document.createElement("a");
        link.className = "related-card";
        link.href = `/produto/${encodeURIComponent(produto.id)}`;
        const imagemWrap = document.createElement("div");
        imagemWrap.className = "related-card-image";
        const imagem = document.createElement("img");
        imagem.src = produto.imagem;
        imagem.alt = `Óculos ${produto.nome}`;
        imagem.loading = "lazy";
        imagemWrap.append(imagem);
        const info = document.createElement("div");
        info.className = "related-card-info";
        const nome = document.createElement("h3");
        nome.textContent = produto.nome;
        const preco = document.createElement("p");
        preco.className = "related-price";
        preco.textContent = produto.preco;
        info.append(nome, preco);
        const categoria = document.createElement("p");
        categoria.className = "related-category";
        categoria.textContent = produto.categoria;
        link.append(imagemWrap, info, categoria);
        return link;
    };
    const catalogoCompleto = produtosDisponiveis.length ? produtosDisponiveis : catalogo;
    const produtosRecentes = idsVistos.map(id => catalogoCompleto.find(item => String(item.id) === String(id))).filter(Boolean);
    if (gradeRecentes && produtosRecentes.length) gradeRecentes.append(...produtosRecentes.map(criarCard));
    else if (gradeRecentes) {
        const vazio = document.createElement("p");
        vazio.className = "related-empty";
        vazio.textContent = "Os produtos que você visitar aparecerão aqui.";
        gradeRecentes.append(vazio);
    }
}

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        fecharMenuLateral();
        fecharAvisoLogin();
        fecharCarrinho();
    }
});
renderizarCarrinho();
