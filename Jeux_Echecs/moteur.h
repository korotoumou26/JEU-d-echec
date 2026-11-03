#ifndef MOTEUR_H
#define MOTEUR_H

#define N 8
#define VIDE 0
#define BLANC 1
#define NOIR 2
#define MAX_COUPS 512

typedef struct { int l1, c1, l2, c2; } Coup;

void init_plateau(char p[N][N]);
int  couleur_piece(char piece);
int  joueur_suivant(int joueur);

int  est_coup_valide_tour(char p[N][N], int l1, int c1, int l2, int c2);
int  est_coup_valide_fou(char p[N][N], int l1, int c1, int l2, int c2);
int  est_coup_valide_reine(char p[N][N], int l1, int c1, int l2, int c2);
int  est_coup_valide_cavalier(int l1, int c1, int l2, int c2);
int  est_coup_valide(char p[N][N], int l1, int c1, int l2, int c2, int joueur);

void jouer_coup(char p[N][N], int l1, int c1, int l2, int c2);
int  generer_coups(char p[N][N], int joueur, Coup out[]);  /* pour l'IA (membre 3) */
int  fin_partie(char p[N][N]);  /* 0 = en cours, sinon BLANC ou NOIR = gagnant */
int  coord_vers_indices(const char *s, int *l, int *c);    /* "B1" -> l=0, c=1 */

#endif