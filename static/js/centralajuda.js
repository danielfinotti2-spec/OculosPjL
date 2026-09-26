document.querySelectorAll(".central-ajuda-pergunta").forEach(pergunta => {
    const resposta = document.getElementById(pergunta.getAttribute("aria-controls"));
    if (!resposta) return;

    pergunta.addEventListener("click", () => {
        const abrir = pergunta.getAttribute("aria-expanded") !== "true";
        pergunta.setAttribute("aria-expanded", String(abrir));
        resposta.setAttribute("aria-hidden", String(!abrir));

        if (abrir) {
            resposta.classList.add("aberta");
            resposta.style.maxHeight = `${resposta.scrollHeight}px`;
        } else {
            resposta.style.maxHeight = `${resposta.scrollHeight}px`;
            resposta.classList.remove("aberta");
            void resposta.offsetHeight;
            resposta.style.maxHeight = "0px";
        }
    });

    resposta.addEventListener("transitionend", event => {
        if (event.propertyName === "max-height" && pergunta.getAttribute("aria-expanded") === "true") {
            resposta.style.maxHeight = "none";
        }
    });
});
