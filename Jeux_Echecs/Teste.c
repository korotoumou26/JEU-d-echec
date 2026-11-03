#include <stdio.h>
#include "moteur.h"

static int test(char p[N][N], const char *a, const char *b, int joueur) {
    int l1, c1, l2, c2;
    coord_vers_indices(a, &l1, &c1);
    coord_vers_indices(b, &l2, &c2);
    return est_coup_valide(p, l1, c1, l2, c2, joueur);
}

int main(void) {
    char p[N][N];
    init_plateau(p);
    printf("Cavalier B1->C3 : %d (attendu 1)\n", test(p, "B1", "C3", BLANC));
    printf("Cavalier B1->B3 : %d (attendu 0)\n", test(p, "B1", "B3", BLANC));
    printf("Tour A1->A8     : %d (attendu 1, capture de la tour noire)\n", test(p, "A1", "A8", BLANC));
    printf("Tour A1->B1     : %d (attendu 0, cavalier allié)\n", test(p, "A1", "B1", BLANC));
    printf("Fou C1->A3      : %d (attendu 1)\n", test(p, "C1", "A3", BLANC));
    printf("Fou C1->H6      : %d (attendu 1)\n", test(p, "C1", "H6", BLANC));
    printf("Reine D1->D5    : %d (attendu 1)\n", test(p, "D1", "D5", BLANC));
    printf("Pièce noire jouée par blanc : %d (attendu 0)\n", test(p, "A8", "A5", BLANC));

    int l, c;
    coord_vers_indices("D8", &l, &c);
    p[l][c] = '.';  /* on retire la reine noire */
    printf("fin_partie : %d (attendu %d = BLANC)\n", fin_partie(p), BLANC);
    return 0;
}