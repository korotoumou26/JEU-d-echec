#include <stdio.h>
#include "moteur.h"

int main(void) {
    char plateau[N][N];
    init_plateau(plateau);

    int joueur_actuel = BLANC;
    char saisie_dep[10], saisie_arr[10];
    int l1, c1, l2, c2;

    while (1) {
       // 1. Affichage du plateau (ligne 8 en haut, ligne 1 en bas)
        printf("\n  A B C D E F G H\n");
        for (int l = N - 1; l >= 0; l--) {
            printf("%d ", l + 1);
            for (int c = 0; c < N; c++) {
                printf("%c ", plateau[l][c]);
            }
            printf("%d\n", l + 1);
        }
        printf("  A B C D E F G H\n\n");

        // 2. Vérification de fin de partie (Reine capturée)
        int gagnant = fin_partie(plateau);
        if (gagnant != 0) {
            printf("Fin de partie ! Le joueur %s a gagne !\n", (gagnant == BLANC) ? "BLANC" : "NOIR");
            break;
        }

        // 3. Tour du joueur
        printf("Tour des joueurs : %s\n", (joueur_actuel == BLANC) ? "BLANCS" : "NOIRS");
        printf("Entrez votre coup (ex: A2 A4 ou 'q' pour arreter) : ");
        
        if (scanf("%s", saisie_dep) != 1) break;
        if (saisie_dep[0] == 'q' || saisie_dep[0] == 'Q') break;

        scanf("%s", saisie_arr);

        // 4. Conversion des coordonnées texte en indices de matrice
        if (!coord_vers_indices(saisie_dep, &l1, &c1) || !coord_vers_indices(saisie_arr, &l2, &c2)) {
            printf("Coordonnees invalides ! Essayez de nouveau (ex: A2 A4).\n");
            continue;
        }

        // 5. Validation du coup avec les règles du moteur
        if (est_coup_valide(plateau, l1, c1, l2, c2, joueur_actuel)) {
            jouer_coup(plateau, l1, c1, l2, c2);
            // Changement de joueur
            joueur_actuel = joueur_suivant(joueur_actuel);
        } else {
            printf("Coup interdit ! Reesayez.\n");
        }
    }

    return 0;
}