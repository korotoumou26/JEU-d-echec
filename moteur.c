#include <stdlib.h>
#include <ctype.h>
#include "moteur.h"

void init_plateau(char p[N][N]) {
    const char rang[N] = {'T','C','F','D','.','F','C','T'};
    for (int l = 0; l < N; l++)
        for (int c = 0; c < N; c++)
            p[l][c] = '.';
    for (int c = 0; c < N; c++) {
        p[0][c] = rang[c];
        p[7][c] = (rang[c] == '.') ? '.' : (char)tolower(rang[c]);
    }
}

int couleur_piece(char piece) {
    if (piece == '.') return VIDE;
    return isupper((unsigned char)piece) ? BLANC : NOIR;
}

int joueur_suivant(int joueur) { return 3 - joueur; }

/* Vérifie que toutes les cases STRICTEMENT entre départ et arrivée sont vides */
static int chemin_libre(char p[N][N], int l1, int c1, int l2, int c2) {
    int dl = (l2 > l1) - (l2 < l1);
    int dc = (c2 > c1) - (c2 < c1);
    int l = l1 + dl, c = c1 + dc;
    while (l != l2 || c != c2) {
        if (p[l][c] != '.') return 0;
        l += dl; c += dc;
    }
    return 1;
}

int est_coup_valide_tour(char p[N][N], int l1, int c1, int l2, int c2) {
    if ((l1 == l2) == (c1 == c2)) return 0;  /* ni sur place, ni en diagonale */
    return chemin_libre(p, l1, c1, l2, c2);
}

int est_coup_valide_fou(char p[N][N], int l1, int c1, int l2, int c2) {
    if (abs(l2 - l1) != abs(c2 - c1) || l1 == l2) return 0;
    return chemin_libre(p, l1, c1, l2, c2);
}

int est_coup_valide_reine(char p[N][N], int l1, int c1, int l2, int c2) {
    return est_coup_valide_tour(p, l1, c1, l2, c2)
        || est_coup_valide_fou(p, l1, c1, l2, c2);
}

int est_coup_valide_cavalier(int l1, int c1, int l2, int c2) {
    int dl = abs(l2 - l1), dc = abs(c2 - c1);
    return (dl == 1 && dc == 2) || (dl == 2 && dc == 1);
}

int est_coup_valide(char p[N][N], int l1, int c1, int l2, int c2, int joueur) {
    if (l1 < 0 || l1 >= N || c1 < 0 || c1 >= N ||
        l2 < 0 || l2 >= N || c2 < 0 || c2 >= N) return 0;
    char piece = p[l1][c1];
    if (couleur_piece(piece) != joueur) return 0;          /* pas sa pièce / case vide */
    if (couleur_piece(p[l2][c2]) == joueur) return 0;      /* on ne mange pas ses pièces */
    switch (toupper((unsigned char)piece)) {
        case 'T': return est_coup_valide_tour(p, l1, c1, l2, c2);
        case 'F': return est_coup_valide_fou(p, l1, c1, l2, c2);
        case 'D': return est_coup_valide_reine(p, l1, c1, l2, c2);
        case 'C': return est_coup_valide_cavalier(l1, c1, l2, c2);
    }
    return 0;
}

void jouer_coup(char p[N][N], int l1, int c1, int l2, int c2) {
    p[l2][c2] = p[l1][c1];   /* capture éventuelle = écrasement */
    p[l1][c1] = '.';
}

int generer_coups(char p[N][N], int joueur, Coup out[]) {
    int n = 0;
    for (int l1 = 0; l1 < N; l1++)
        for (int c1 = 0; c1 < N; c1++) {
            if (couleur_piece(p[l1][c1]) != joueur) continue;
            for (int l2 = 0; l2 < N; l2++)
                for (int c2 = 0; c2 < N; c2++)
                    if (est_coup_valide(p, l1, c1, l2, c2, joueur) && n < MAX_COUPS)
                        out[n++] = (Coup){l1, c1, l2, c2};
        }
    return n;
}

int fin_partie(char p[N][N]) {
    int reine_blanche = 0, reine_noire = 0;
    for (int l = 0; l < N; l++)
        for (int c = 0; c < N; c++) {
            if (p[l][c] == 'D') reine_blanche = 1;
            else if (p[l][c] == 'd') reine_noire = 1;
        }
    if (!reine_blanche) return NOIR;   /* reine blanche capturée : les noirs gagnent */
    if (!reine_noire)   return BLANC;  /* reine noire capturée : les blancs gagnent */
    return 0;                          /* partie en cours */
}

int coord_vers_indices(const char *s, int *l, int *c) {
    if (!s || !s[0] || !s[1]) return 0;
    *c = toupper((unsigned char)s[0]) - 'A';
    *l = 7 - (s[1] - '1'); // Inverse pour que '1' soit en bas et '8' en haut
    return (*c >= 0 && *c < N && *l >= 0 && *l < N);
}