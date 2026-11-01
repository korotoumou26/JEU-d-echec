"use strict";

/* ---------- Constantes ---------- */
const DIM = 8;
const NOM_COULEUR = { b: "blancs", n: "noirs" };
const adverse = (couleur) => (couleur === "b" ? "n" : "b");
const coord = (l, c) => "abcdefgh"[c] + (DIM - l);

/* ---------- Pièces ---------- */
class Piece {
  constructor(couleur, l, c) {
    this.couleur = couleur; // "b" (blanc) ou "n" (noir)
    this.l = l;             // ligne : 0 = haut (côté des noirs)
    this.c = c;             // colonne
    this.aBouge = false;
  }

  // Cases attaquées (par défaut : identiques aux déplacements)
  attaques(plateau) { return this.coups(plateau); }

  // Déplacement en ligne (tour, fou, dame)
  glisse(plateau, directions) {
    const res = [];
    for (const [dl, dc] of directions) {
      let l = this.l + dl, c = this.c + dc;
      while (plateau.dans(l, c)) {
        const autre = plateau.get(l, c);
        if (!autre) res.push({ l, c });
        else {
          if (autre.couleur !== this.couleur) res.push({ l, c });
          break;
        }
        l += dl; c += dc;
      }
    }
    return res;
  }

  // Déplacement par pas fixes (cavalier, roi)
  saute(plateau, pas) {
    return pas
      .map(([dl, dc]) => ({ l: this.l + dl, c: this.c + dc }))
      .filter((m) => plateau.dans(m.l, m.c) &&
        (!plateau.get(m.l, m.c) || plateau.get(m.l, m.c).couleur !== this.couleur));
  }
}

const DIAGONALES = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
const DROITES = [[1, 0], [-1, 0], [0, 1], [0, -1]];

class Tour extends Piece {
  get symbole() { return "♜"; }
  coups(p) { return this.glisse(p, DROITES); }
}

class Fou extends Piece {
  get symbole() { return "♝"; }
  coups(p) { return this.glisse(p, DIAGONALES); }
}

class Dame extends Piece {
  get symbole() { return "♛"; }
  coups(p) { return this.glisse(p, [...DROITES, ...DIAGONALES]); }
}

class Cavalier extends Piece {
  get symbole() { return "♞"; }
  coups(p) {
    return this.saute(p, [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]]);
  }
}

class Roi extends Piece {
  get symbole() { return "♚"; }
  attaques(p) { return this.saute(p, [...DROITES, ...DIAGONALES]); }

  coups(p) {
    const res = this.attaques(p);
    const adv = adverse(this.couleur);
    // Roque : roi et tour n'ont pas bougé, cases libres et non attaquées
    if (!this.aBouge && !p.estAttaquee(this.l, this.c, adv)) {
      for (const [colTour, sens, nom] of [[7, 1, "petit"], [0, -1, "grand"]]) {
        const tour = p.get(this.l, colTour);
        if (!(tour instanceof Tour) || tour.aBouge || tour.couleur !== this.couleur) continue;
        let libre = true;
        for (let c = this.c + sens; c !== colTour; c += sens) if (p.get(this.l, c)) libre = false;
        const traversees = [this.c + sens, this.c + 2 * sens];
        if (libre && traversees.every((c) => !p.estAttaquee(this.l, c, adv))) {
          res.push({ l: this.l, c: this.c + 2 * sens, roque: nom });
        }
      }
    }
    return res;
  }
}

class Pion extends Piece {
  get symbole() { return "♟\uFE0E"; }
  get sens() { return this.couleur === "b" ? -1 : 1; }

  attaques(p) {
    return [-1, 1]
      .map((d) => ({ l: this.l + this.sens, c: this.c + d }))
      .filter((m) => p.dans(m.l, m.c));
  }

  coups(p) {
    const res = [];
    const l1 = this.l + this.sens;
    if (p.dans(l1, this.c) && !p.get(l1, this.c)) {
      res.push({ l: l1, c: this.c });
      const l2 = l1 + this.sens;
      if (!this.aBouge && !p.get(l2, this.c)) res.push({ l: l2, c: this.c });
    }
    for (const m of this.attaques(p)) {
      const cible = p.get(m.l, m.c);
      if (cible && cible.couleur !== this.couleur) res.push(m);
      else if (!cible && p.enPassant && p.enPassant.couleur !== this.couleur &&
               p.enPassant.l === m.l && p.enPassant.c === m.c) {
        res.push({ ...m, enPassant: true });
      }
    }
    return res;
  }
}

/* ---------- Plateau ---------- */
class Plateau {
  constructor(vide = false) {
    this.cases = Array.from({ length: DIM }, () => Array(DIM).fill(null));
    this.enPassant = null; // case "sautée" par un pion qui vient d'avancer de 2
    if (!vide) this.initialiser();
  }

  initialiser() {
    const ordre = [Tour, Cavalier, Fou, Dame, Roi, Fou, Cavalier, Tour];
    ordre.forEach((Type, c) => {
      this.poser(new Type("n", 0, c));
      this.poser(new Type("b", 7, c));
    });
    for (let c = 0; c < DIM; c++) {
      this.poser(new Pion("n", 1, c));
      this.poser(new Pion("b", 6, c));
    }
  }

  poser(piece) { this.cases[piece.l][piece.c] = piece; }
  dans(l, c) { return l >= 0 && l < DIM && c >= 0 && c < DIM; }
  get(l, c) { return this.dans(l, c) ? this.cases[l][c] : null; }

  pieces(couleur) {
    return this.cases.flat().filter((p) => p && p.couleur === couleur);
  }

  clone() {
    const copie = new Plateau(true);
    for (const p of [...this.pieces("b"), ...this.pieces("n")]) {
      copie.poser(Object.assign(Object.create(Object.getPrototypeOf(p)), p));
    }
    copie.enPassant = this.enPassant;
    return copie;
  }

  estAttaquee(l, c, parCouleur) {
    return this.pieces(parCouleur).some((p) =>
      p.attaques(this).some((m) => m.l === l && m.c === c));
  }

  roiEnEchec(couleur) {
    const roi = this.pieces(couleur).find((p) => p instanceof Roi);
    return this.estAttaquee(roi.l, roi.c, adverse(couleur));
  }

  // Coups autorisés : on retire ceux qui laissent son propre roi en échec
  coupsLegaux(piece) {
    return piece.coups(this).filter((coup) => {
      const test = this.clone();
      test.appliquer(test.get(piece.l, piece.c), coup);
      return !test.roiEnEchec(piece.couleur);
    });
  }

  aDesCoups(couleur) {
    return this.pieces(couleur).some((p) => this.coupsLegaux(p).length > 0);
  }

  // Joue un coup ; renvoie la pièce capturée (ou null)
  appliquer(piece, coup, Promotion = Dame) {
    const prise = this.get(coup.l, coup.c) || (coup.enPassant ? this.get(piece.l, coup.c) : null);
    this.cases[piece.l][piece.c] = null;
    if (coup.enPassant) this.cases[piece.l][coup.c] = null;

    if (coup.roque) {
      const sens = coup.roque === "petit" ? 1 : -1;
      const colTour = coup.roque === "petit" ? 7 : 0;
      const tour = this.get(piece.l, colTour);
      this.cases[piece.l][colTour] = null;
      tour.c = piece.c + sens;
      tour.aBouge = true;
      this.poser(tour);
    }

    const avanceDeDeux = piece instanceof Pion && Math.abs(coup.l - piece.l) === 2;
    this.enPassant = avanceDeDeux
      ? { l: (piece.l + coup.l) / 2, c: piece.c, couleur: piece.couleur }
      : null;

    piece.l = coup.l;
    piece.c = coup.c;
    piece.aBouge = true;

    let finale = piece;
    if (piece instanceof Pion && (coup.l === 0 || coup.l === DIM - 1)) {
      finale = new Promotion(piece.couleur, coup.l, coup.c);
      finale.aBouge = true;
    }
    this.poser(finale);
    return prise;
  }
}

/* ---------- Jeu (logique + affichage) ---------- */
class Jeu {
  constructor() {
    this.boutons = [];
    this.construire();
    this.nouvellePartie();
  }

  nouvellePartie() {
    this.plateau = new Plateau();
    this.tour = "b";
    this.selection = null;
    this.coups = [];
    this.fin = false;
    this.promo = null;
    this.dernier = null;
    this.historique = [];
    this.prises = { b: [], n: [] };
    this.message = "Au tour des blancs";
    this.afficher();
  }

  /* Interaction */
  cliquer(l, c) {
    if (this.fin || this.promo) return;
    const piece = this.plateau.get(l, c);
    const coup = this.coups.find((m) => m.l === l && m.c === c);
    if (this.selection && coup) return this.jouer(coup);
    if (piece && piece.couleur === this.tour) {
      this.selection = piece;
      this.coups = this.plateau.coupsLegaux(piece);
    } else {
      this.selection = null;
      this.coups = [];
    }
    this.afficher();
  }

  jouer(coup) {
    const promotion = this.selection instanceof Pion && (coup.l === 0 || coup.l === DIM - 1);
    if (promotion) {
      this.promo = coup;
      this.afficher();
    } else {
      this.executer(coup, Dame);
    }
  }

  executer(coup, Promotion) {
    const piece = this.selection;
    const de = [piece.l, piece.c];
    const nomDe = coord(piece.l, piece.c);
    const prise = this.plateau.appliquer(piece, coup, Promotion);
    if (prise) this.prises[this.tour].push(prise);

    let notation = coup.roque
      ? (coup.roque === "petit" ? "O-O" : "O-O-O")
      : nomDe + (prise ? "x" : "-") + coord(coup.l, coup.c);
    if (piece instanceof Pion && (coup.l === 0 || coup.l === DIM - 1)) notation += "=" + new Promotion("b", 0, 0).symbole;

    const joueur = this.tour;
    this.tour = adverse(joueur);
    this.dernier = { de, vers: [coup.l, coup.c] };
    this.selection = null;
    this.coups = [];
    this.promo = null;

    const echec = this.plateau.roiEnEchec(this.tour);
    const peutJouer = this.plateau.aDesCoups(this.tour);
    if (!peutJouer) {
      this.fin = true;
      this.message = echec
        ? `Échec et mat : les ${NOM_COULEUR[joueur]} gagnent`
        : "Pat : partie nulle";
      notation += echec ? "#" : "";
    } else {
      this.message = (echec ? "Échec ! " : "") + `Au tour des ${NOM_COULEUR[this.tour]}`;
      notation += echec ? "+" : "";
    }
    this.historique.push(notation);
    this.afficher();
  }

  /* Affichage */
  construire() {
    const plateau = document.getElementById("plateau");
    for (let l = 0; l < DIM; l++) {
      this.boutons.push([]);
      for (let c = 0; c < DIM; c++) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "case " + ((l + c) % 2 ? "sombre" : "clair");
        b.addEventListener("click", () => this.cliquer(l, c));
        plateau.appendChild(b);
        this.boutons[l].push(b);
      }
    }
    document.getElementById("nouvelle").addEventListener("click", () => this.nouvellePartie());
  }

  afficher() {
    const roiEnEchec = this.plateau.roiEnEchec(this.tour)
      ? this.plateau.pieces(this.tour).find((p) => p instanceof Roi) : null;

    for (let l = 0; l < DIM; l++) {
      for (let c = 0; c < DIM; c++) {
        const b = this.boutons[l][c];
        const piece = this.plateau.get(l, c);
        const coup = this.coups.find((m) => m.l === l && m.c === c);
        const classes = ["case", (l + c) % 2 ? "sombre" : "clair"];
        if (coup) classes.push(piece || coup.enPassant ? "prise" : "coup");
        if (this.selection && this.selection.l === l && this.selection.c === c) classes.push("sel");
        if (this.dernier && ((this.dernier.de[0] === l && this.dernier.de[1] === c) ||
            (this.dernier.vers[0] === l && this.dernier.vers[1] === c))) classes.push("dernier");
        if (roiEnEchec && roiEnEchec.l === l && roiEnEchec.c === c) classes.push("echec");
        b.className = classes.join(" ");
        b.innerHTML =
          (c === 0 ? `<span class="rang">${DIM - l}</span>` : "") +
          (l === DIM - 1 ? `<span class="col">${"abcdefgh"[c]}</span>` : "") +
          (piece ? `<span class="piece ${piece.couleur}">${piece.symbole}</span>` : "");
        b.setAttribute("aria-label", piece
          ? `${coord(l, c)}, ${piece.constructor.name} ${NOM_COULEUR[piece.couleur]}`
          : coord(l, c));
      }
    }

    const statut = document.getElementById("statut");
    statut.textContent = this.message;
    statut.classList.toggle("fin", this.fin);

    const symboles = (liste) => liste
      .map((p) => `<span class="${p.couleur}">${p.symbole}</span>`).join("");
    document.getElementById("prises-b").innerHTML = "Blancs : " + symboles(this.prises.b);
    document.getElementById("prises-n").innerHTML = "Noirs : " + symboles(this.prises.n);

    const liste = document.getElementById("historique");
    liste.innerHTML = this.historique.map((m) => `<li>${m}</li>`).join("");
    liste.scrollTop = liste.scrollHeight;

    this.afficherPromotion();
  }

  afficherPromotion() {
    const zone = document.getElementById("promo");
    zone.hidden = !this.promo;
    if (!this.promo) return;
    const choix = document.getElementById("choix-promo");
    choix.innerHTML = "";
    for (const Type of [Dame, Tour, Fou, Cavalier]) {
      const bouton = document.createElement("button");
      bouton.type = "button";
      bouton.innerHTML = `<span class="piece ${this.tour}">${new Type(this.tour, 0, 0).symbole}</span>`;
      bouton.setAttribute("aria-label", Type.name);
      bouton.addEventListener("click", () => this.executer(this.promo, Type));
      choix.appendChild(bouton);
    }
  }
}

new Jeu();
