from flask import Flask, abort, render_template

app = Flask(__name__)

PRODUTOS = [
    {"id": 1, "nome": "Solar classico", "categoria": "Oculos de sol", "preco": "R$ 189,90", "preco_antigo": "R$ 249,90", "imagem": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1000&q=80", "descricao": "Armacao leve e lentes com protecao UV para acompanhar seu dia."},
    {"id": 2, "nome": "Transparencia urbana", "categoria": "Oculos de grau", "preco": "R$ 219,90", "imagem": "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=1000&q=80", "descricao": "Design moderno e confortavel, ideal para usar durante todo o dia."},
    {"id": 3, "nome": "Marrom retro", "categoria": "Oculos de sol", "preco": "R$ 199,90", "imagem": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=1000&q=80", "descricao": "Um toque classico com lentes escuras e armacao marcante."},
    {"id": 4, "nome": "Aviador dourado", "categoria": "Oculos de sol", "preco": "R$ 229,90", "preco_antigo": "R$ 279,90", "imagem": "https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=1000&q=80", "descricao": "Leveza e personalidade em um modelo que nunca sai de moda."},
    {"id": 5, "nome": "Sport movimento", "categoria": "Esportivo", "preco": "R$ 259,90", "imagem": "https://images.unsplash.com/photo-1614715838608-dd527c46231d?auto=format&fit=crop&w=1000&q=80", "descricao": "Ajuste firme e confortavel para seus treinos e passeios ao ar livre."},
    {"id": 6, "nome": "Essencial redondo", "categoria": "Oculos de grau", "preco": "R$ 189,90", "imagem": "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1000&q=80", "descricao": "Armacao versatil para completar seu estilo em qualquer ocasiao."},
]

@app.route("/")
def inicio():
    return render_template("index.html")

@app.route("/produto/<int:produto_id>")
def detalhe_produto(produto_id):
    produto = next((item for item in PRODUTOS if item["id"] == produto_id), None)
    if produto is None:
        abort(404)
    return render_template("produto.html", produto=produto, produtos=PRODUTOS)

@app.route("/login")
def login():
    return render_template("login.html")

if __name__ == "__main__":
    app.run(debug=True)
